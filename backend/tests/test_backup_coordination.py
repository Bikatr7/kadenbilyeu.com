import fcntl
import multiprocessing
import os
import sys
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("ADMIN_USER", "admin")
os.environ.setdefault("ACCESS_TOKEN_SECRET", "test_access_secret")
os.environ.setdefault("REFRESH_TOKEN_SECRET", "test_refresh_secret")
os.environ.setdefault("JWT_ISSUER", "test-issuer")
os.environ.setdefault("JWT_AUDIENCE", "test-audience")
os.environ.setdefault("ENCRYPTION_KEY", "test-encryption-key")
os.environ.setdefault("WEBAUTHN_REGISTER_SECRET", "test-webauthn-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_backup_coordination.db")
os.environ.setdefault("ENVIRONMENT", "testing")

import auth
import config
import maintenance
import utils
from auth import create_access_token
from main import app


def _hold_backup_lock(lock_path: str, ready, release) -> None:
    maintenance.BACKUP_LOCK_PATH = Path(lock_path)
    with maintenance.backup_operation_window():
        ready.set()
        if not release.wait(timeout=10):
            raise RuntimeError("Timed out waiting to release backup lock")


def _hold_scheduler_leadership(lock_path: str, ready, release) -> None:
    maintenance.SCHEDULER_LEADER_LOCK_PATH = Path(lock_path)
    maintenance._scheduler_leader_fd = None
    if not maintenance.acquire_scheduler_leadership():
        raise RuntimeError("Could not acquire scheduler leadership")
    ready.set()
    try:
        if not release.wait(timeout=10):
            raise RuntimeError("Timed out waiting to release scheduler leadership")
    finally:
        maintenance.release_scheduler_leadership()


def _backup_environment():
    return (
        "encryption-key",
        "smtp.example.com",
        587,
        "smtp-user",
        "smtp-password",
        "from@example.com",
        "to@example.com",
        True,
    )


def _install_fake_backup_pipeline(monkeypatch, artifact_paths, send_email):
    def export_db(_database_path, export_path):
        artifact_paths.append(Path(export_path))
        Path(export_path).write_bytes(b"sqlite snapshot")
        return export_path

    def compress_file(export_path):
        compressed_path = Path(f"{export_path}.zip")
        artifact_paths.append(compressed_path)
        compressed_path.write_bytes(b"compressed snapshot")
        return str(compressed_path)

    def encrypt_file(compressed_path, _encryption_key):
        encrypted_path = Path(f"{compressed_path}.pgp")
        artifact_paths.append(encrypted_path)
        encrypted_path.write_bytes(b"encrypted snapshot")
        return str(encrypted_path)

    monkeypatch.setattr(utils, "get_envs", _backup_environment)
    monkeypatch.setattr(utils, "export_db", export_db)
    monkeypatch.setattr(utils, "compress_file", compress_file)
    monkeypatch.setattr(utils, "encrypt_file", encrypt_file)
    monkeypatch.setattr(utils, "send_email", send_email)


def test_backup_lock_suppresses_the_second_worker(tmp_path, monkeypatch):
    context = multiprocessing.get_context("fork")
    ready = context.Event()
    release = context.Event()
    lock_path = tmp_path / "backup.lock"
    process = context.Process(
        target=_hold_backup_lock,
        args=(str(lock_path), ready, release),
    )
    process.start()

    try:
        assert ready.wait(timeout=5)
        monkeypatch.setattr(maintenance, "BACKUP_LOCK_PATH", lock_path)
        get_envs_called = False

        def unexpected_get_envs():
            nonlocal get_envs_called
            get_envs_called = True
            return _backup_environment()

        monkeypatch.setattr(utils, "get_envs", unexpected_get_envs)
        utils.perform_backup_scheduled()

        assert get_envs_called is False
    finally:
        release.set()
        process.join(timeout=5)
        if process.is_alive():
            process.terminate()
            process.join(timeout=5)

    assert process.exitcode == 0


def test_backup_releases_database_lock_before_email_and_uses_unique_paths(
    tmp_path,
    monkeypatch,
):
    artifact_paths = []
    attachment_paths = []
    monkeypatch.setattr(maintenance, "BACKUP_LOCK_PATH", tmp_path / "backup.lock")
    monkeypatch.setattr(
        maintenance,
        "DATABASE_ACTIVITY_LOCK_PATH",
        tmp_path / "database.lock",
    )
    monkeypatch.setattr(
        maintenance,
        "MAINTENANCE_MARKER_PATH",
        tmp_path / "maintenance",
    )
    monkeypatch.setattr(config, "DATABASE_PATH", str(tmp_path / "blog.db"))

    def send_email(
        subject,
        body,
        to_email,
        attachment_path,
        from_email,
        smtp_server,
        smtp_port,
        smtp_user,
        smtp_password,
    ):
        attachment = Path(attachment_path)
        attachment_paths.append(attachment)
        assert attachment.is_file()
        assert attachment.name == "blog.db.backup.zip.pgp"
        assert attachment.parent.parent == Path(config.DATABASE_PATH).resolve().parent
        assert attachment.parent.stat().st_mode & 0o777 == 0o700
        assert all(path.stat().st_mode & 0o777 == 0o600 for path in artifact_paths[-3:])
        assert (subject, body) == (
            "Database Backup",
            "Attached is the encrypted database backup.",
        )
        assert (to_email, from_email, smtp_server, smtp_port) == (
            "to@example.com",
            "from@example.com",
            "smtp.example.com",
            587,
        )
        assert (smtp_user, smtp_password) == ("smtp-user", "smtp-password")

        probe_fd = os.open(
            maintenance.DATABASE_ACTIVITY_LOCK_PATH,
            os.O_CREAT | os.O_RDWR,
            0o600,
        )
        try:
            fcntl.flock(probe_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        finally:
            fcntl.flock(probe_fd, fcntl.LOCK_UN)
            os.close(probe_fd)

    _install_fake_backup_pipeline(monkeypatch, artifact_paths, send_email)

    utils.perform_backup()
    utils.perform_backup()

    assert len(attachment_paths) == 2
    assert attachment_paths[0].parent != attachment_paths[1].parent
    assert all(not artifact.exists() for artifact in artifact_paths)
    assert all(not attachment.parent.exists() for attachment in attachment_paths)


def test_backup_cleans_artifacts_and_unlocks_after_email_error(tmp_path, monkeypatch):
    artifact_paths = []
    monkeypatch.setattr(maintenance, "BACKUP_LOCK_PATH", tmp_path / "backup.lock")
    monkeypatch.setattr(
        maintenance,
        "DATABASE_ACTIVITY_LOCK_PATH",
        tmp_path / "database.lock",
    )
    monkeypatch.setattr(
        maintenance,
        "MAINTENANCE_MARKER_PATH",
        tmp_path / "maintenance",
    )
    monkeypatch.setattr(config, "DATABASE_PATH", str(tmp_path / "blog.db"))

    def failing_send_email(*_args):
        raise RuntimeError("SMTP failed")

    _install_fake_backup_pipeline(monkeypatch, artifact_paths, failing_send_email)

    with pytest.raises(RuntimeError, match="SMTP failed"):
        utils.perform_backup()

    assert artifact_paths
    assert all(not artifact.exists() for artifact in artifact_paths)
    assert all(not artifact.parent.exists() for artifact in artifact_paths)
    with maintenance.backup_operation_window():
        pass


def test_only_one_worker_starts_the_persistent_backup_scheduler(tmp_path, monkeypatch):
    context = multiprocessing.get_context("fork")
    ready = context.Event()
    release = context.Event()
    lock_path = tmp_path / "scheduler.lock"
    process = context.Process(
        target=_hold_scheduler_leadership,
        args=(str(lock_path), ready, release),
    )
    process.start()

    try:
        assert ready.wait(timeout=5)
        monkeypatch.setattr(maintenance, "SCHEDULER_LEADER_LOCK_PATH", lock_path)
        monkeypatch.setattr(maintenance, "_scheduler_leader_fd", None)
        scheduler_created = False

        def unexpected_scheduler():
            nonlocal scheduler_created
            scheduler_created = True
            raise AssertionError("Follower worker must not create a scheduler")

        monkeypatch.setattr(utils, "get_envs", _backup_environment)
        monkeypatch.setattr(utils, "BackgroundScheduler", unexpected_scheduler)

        utils.start_scheduler()

        assert scheduler_created is False
    finally:
        release.set()
        process.join(timeout=5)
        if process.is_alive():
            process.terminate()
            process.join(timeout=5)

    assert process.exitcode == 0


def _force_backup(perform_backup, monkeypatch, *, origin="https://kadenbilyeu.com"):
    if perform_backup is not None:
        monkeypatch.setattr(utils, "perform_backup", perform_backup)
    token = create_access_token({"sub": "admin"})
    request_client = TestClient(
        app,
        client=(f"force-backup-{uuid4().hex}", 50000),
    )
    return request_client.post(
        "/force-backup",
        headers={"origin": origin},
        cookies={"access_token": token},
    )


def test_force_backup_reports_success_under_guarded_auth_lock(tmp_path, monkeypatch):
    activity_lock = tmp_path / "database.lock"
    monkeypatch.setattr(maintenance, "DATABASE_ACTIVITY_LOCK_PATH", activity_lock)

    def guarded_blacklist_lookup(_token):
        probe_fd = os.open(activity_lock, os.O_CREAT | os.O_RDWR, 0o600)
        try:
            with pytest.raises(BlockingIOError):
                fcntl.flock(probe_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        finally:
            os.close(probe_fd)
        return False

    monkeypatch.setattr(auth, "is_token_blacklisted", guarded_blacklist_lookup)
    response = _force_backup(lambda: None, monkeypatch)

    assert response.status_code == 200
    assert response.json() == {"message": "Backup completed successfully"}


def test_force_backup_rejects_unapproved_origin(monkeypatch):
    backup_called = False

    def backup():
        nonlocal backup_called
        backup_called = True

    response = _force_backup(
        backup,
        monkeypatch,
        origin="https://attacker.example",
    )

    assert response.status_code == 403
    assert response.json() == {"detail": "Origin not allowed"}
    assert backup_called is False


def test_force_backup_reports_busy(monkeypatch):
    def busy_backup():
        raise maintenance.BackupBusyError("internal lock detail")

    response = _force_backup(busy_backup, monkeypatch)

    assert response.status_code == 409
    assert response.json() == {"detail": "A backup is already in progress"}


def test_force_backup_reports_maintenance(monkeypatch):
    def blocked_backup():
        raise maintenance.MaintenanceBusyError("internal maintenance detail")

    response = _force_backup(blocked_backup, monkeypatch)

    assert response.status_code == 503
    assert response.json() == {"detail": "Database maintenance is in progress"}


def test_force_backup_reports_failure_without_leaking_details(monkeypatch):
    def failed_backup():
        raise RuntimeError("smtp-password=super-secret")

    response = _force_backup(failed_backup, monkeypatch)

    assert response.status_code == 500
    assert response.json() == {"detail": "Database backup failed"}
    assert "super-secret" not in response.text


def test_force_backup_rate_limit_is_conservative(monkeypatch):
    monkeypatch.setattr(utils, "perform_backup", lambda: None)
    token = create_access_token({"sub": "admin"})
    request_client = TestClient(
        app,
        client=(f"force-backup-rate-{uuid4().hex}", 50000),
    )
    responses = [
        request_client.post(
            "/force-backup",
            headers={"origin": "https://kadenbilyeu.com"},
            cookies={"access_token": token},
        )
        for _ in range(4)
    ]

    assert [response.status_code for response in responses[:3]] == [200, 200, 200]
    assert responses[3].status_code == 429


def test_force_backup_releases_http_activity_lock_before_email(tmp_path, monkeypatch):
    artifact_paths = []
    email_called = False
    activity_lock = tmp_path / "database.lock"
    monkeypatch.setattr(maintenance, "BACKUP_LOCK_PATH", tmp_path / "backup.lock")
    monkeypatch.setattr(maintenance, "DATABASE_ACTIVITY_LOCK_PATH", activity_lock)
    monkeypatch.setattr(
        maintenance,
        "MAINTENANCE_MARKER_PATH",
        tmp_path / "maintenance",
    )
    monkeypatch.setattr(config, "DATABASE_PATH", str(tmp_path / "blog.db"))

    def send_email(*_args):
        nonlocal email_called
        probe_fd = os.open(activity_lock, os.O_CREAT | os.O_RDWR, 0o600)
        try:
            fcntl.flock(probe_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        finally:
            fcntl.flock(probe_fd, fcntl.LOCK_UN)
            os.close(probe_fd)
        email_called = True

    _install_fake_backup_pipeline(monkeypatch, artifact_paths, send_email)

    response = _force_backup(None, monkeypatch)

    assert response.status_code == 200
    assert email_called is True
    assert all(not artifact.exists() for artifact in artifact_paths)

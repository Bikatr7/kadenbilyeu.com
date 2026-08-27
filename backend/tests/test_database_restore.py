import os
import shutil
import sqlite3
import subprocess
import sys
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from starlette.requests import Request

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("ADMIN_USER", "admin")
os.environ.setdefault("ACCESS_TOKEN_SECRET", "test_access_secret")
os.environ.setdefault("REFRESH_TOKEN_SECRET", "test_refresh_secret")
os.environ.setdefault("JWT_ISSUER", "test-issuer")
os.environ.setdefault("JWT_AUDIENCE", "test-audience")
os.environ.setdefault("ENCRYPTION_KEY", "test-encryption-key")
os.environ.setdefault("WEBAUTHN_REGISTER_SECRET", "test-webauthn-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_database_restore.db")
os.environ.setdefault("ENVIRONMENT", "testing")

import database
import database_restore
import maintenance
from auth import create_access_token
from main import app
from routes import admin


client = TestClient(app)


def _create_minimum_database(path: Path, title: str = "backup") -> None:
    with sqlite3.connect(path) as connection:
        connection.executescript(
            """
            CREATE TABLE blog_posts (
                id VARCHAR PRIMARY KEY,
                title VARCHAR,
                content TEXT NOT NULL,
                author VARCHAR NOT NULL,
                created_at DATETIME,
                updated_at DATETIME,
                view_count INTEGER DEFAULT 0
            );
            """
        )
        connection.execute(
            "INSERT INTO blog_posts "
            "(id, title, content, author, created_at, updated_at, view_count) "
            "VALUES (?, ?, 'content', 'author', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)",
            (str(uuid4()), title),
        )


def _create_current_database(path: Path, title: str):
    engine = create_engine(f"sqlite:///{path}")
    database.Base.metadata.create_all(engine)
    with engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO blog_posts "
                "(id, title, content, author, created_at, updated_at, view_count) "
                "VALUES (:id, :title, 'content', 'author', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)"
            ),
            {"id": str(uuid4()), "title": title},
        )
    return engine


def _add_admin_credential(
    engine,
    credential_id: str,
    public_key: bytes = b"test-public-key",
    sign_count: int = 0,
) -> None:
    with engine.begin() as connection:
        connection.execute(
            database.WebAuthnCredentialModel.__table__.insert().values(
                credential_id=credential_id,
                public_key=public_key,
                sign_count=sign_count,
                user_id=database_restore.ADMIN_USER,
            )
        )


def _add_blacklisted_token(engine, token: str) -> None:
    now = datetime.now(timezone.utc)
    with engine.begin() as connection:
        connection.execute(
            database.BlacklistedTokenModel.__table__.insert().values(
                token=token,
                blacklisted_at=now,
                expires_at=now + timedelta(hours=2),
            )
        )


def _add_webauthn_challenge(engine, challenge_id: str) -> None:
    now = datetime.now(timezone.utc)
    with engine.begin() as connection:
        connection.execute(
            database.WebAuthnChallengeModel.__table__.insert().values(
                challenge_id=challenge_id,
                challenge="test-challenge",
                purpose="authentication",
                created_at=now,
                expires_at=now + timedelta(minutes=5),
            )
        )


def _blacklisted_tokens(path: Path) -> set[str]:
    with sqlite3.connect(path) as connection:
        return {
            str(row[0])
            for row in connection.execute("SELECT token FROM blacklisted_tokens")
        }


def _challenge_ids(path: Path) -> set[str]:
    with sqlite3.connect(path) as connection:
        return {
            str(row[0])
            for row in connection.execute(
                "SELECT challenge_id FROM webauthn_challenges"
            )
        }


def _credential_sign_count(path: Path, credential_id: str) -> int:
    with sqlite3.connect(path) as connection:
        row = connection.execute(
            "SELECT sign_count FROM webauthn_credentials WHERE credential_id = ?",
            (credential_id,),
        ).fetchone()
        assert row is not None
        return int(row[0])


def _title(path: Path) -> str:
    with sqlite3.connect(path) as connection:
        return connection.execute("SELECT title FROM blog_posts").fetchone()[0]


def _scratch_directory(tmp_path: Path) -> Path:
    scratch = tmp_path / "scratch"
    scratch.mkdir(mode=0o700)
    return scratch


def test_validate_sqlite_backup_accepts_application_schema(tmp_path):
    backup = tmp_path / "valid.db"
    _create_minimum_database(backup)

    database_restore.validate_sqlite_backup(backup)


def test_validate_sqlite_backup_rejects_triggers(tmp_path):
    backup = tmp_path / "trigger.db"
    _create_minimum_database(backup)
    with sqlite3.connect(backup) as connection:
        connection.execute(
            "CREATE TRIGGER unsafe_trigger AFTER INSERT ON blog_posts "
            "BEGIN DELETE FROM blog_posts; END"
        )

    with pytest.raises(database_restore.BackupValidationError, match="unsafe schema"):
        database_restore.validate_sqlite_backup(backup)


def test_archive_extraction_rejects_path_traversal(tmp_path):
    archive_path = tmp_path / "backup.zip"
    scratch = _scratch_directory(tmp_path)
    with zipfile.ZipFile(archive_path, "w") as archive:
        archive.writestr("../../blog.db", b"SQLite format 3\x00invalid")

    with pytest.raises(database_restore.BackupValidationError, match="unsafe path"):
        database_restore.extract_database_payload(archive_path, scratch)


def test_archive_extraction_accepts_single_sqlite_backup(tmp_path):
    backup = tmp_path / "blog.db"
    archive_path = tmp_path / "backup.zip"
    scratch = _scratch_directory(tmp_path)
    _create_minimum_database(backup)
    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.write(backup, "blog.db.backup")

    extracted = database_restore.extract_database_payload(archive_path, scratch)
    try:
        database_restore.validate_sqlite_backup(extracted)
    finally:
        extracted.unlink(missing_ok=True)


@pytest.mark.asyncio
async def test_upload_stream_enforces_size_without_multipart_spooling(
    tmp_path,
    monkeypatch,
):
    chunks = iter(
        [
            {"type": "http.request", "body": b"123", "more_body": True},
            {"type": "http.request", "body": b"456", "more_body": False},
        ]
    )

    async def receive():
        return next(chunks)

    request = Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/replace-database",
            "headers": [(b"content-type", b"application/pgp-encrypted")],
        },
        receive,
    )
    monkeypatch.setattr(database_restore, "MAX_ENCRYPTED_UPLOAD_BYTES", 4)
    scratch = _scratch_directory(tmp_path)

    with pytest.raises(HTTPException) as exc_info:
        await database_restore.save_encrypted_upload(request, scratch)

    assert exc_info.value.status_code == 413


def test_maintenance_window_is_visible_and_serialized(tmp_path, monkeypatch):
    marker = tmp_path / "maintenance"
    lock = tmp_path / "maintenance.lock"
    monkeypatch.setattr(maintenance, "MAINTENANCE_MARKER_PATH", marker)
    monkeypatch.setattr(maintenance, "MAINTENANCE_LOCK_PATH", lock)
    monkeypatch.setattr(
        maintenance,
        "DATABASE_ACTIVITY_LOCK_PATH",
        tmp_path / "database.lock",
    )

    with maintenance.maintenance_window():
        assert maintenance.is_maintenance_active()
        with pytest.raises(maintenance.MaintenanceBusyError):
            with maintenance.maintenance_window():
                pass
        assert marker.is_file()

    assert not maintenance.is_maintenance_active()


def test_stale_maintenance_marker_is_removed(tmp_path, monkeypatch):
    marker = tmp_path / "maintenance"
    marker.write_text("dead-process\n")
    monkeypatch.setattr(maintenance, "MAINTENANCE_MARKER_PATH", marker)
    monkeypatch.setattr(maintenance, "MAINTENANCE_LOCK_PATH", tmp_path / "lock")

    assert maintenance.is_maintenance_active() is False
    assert not marker.exists()


def test_maintenance_middleware_keeps_health_check_available(tmp_path, monkeypatch):
    marker = tmp_path / "maintenance"
    monkeypatch.setattr(maintenance, "MAINTENANCE_MARKER_PATH", marker)
    monkeypatch.setattr(maintenance, "MAINTENANCE_LOCK_PATH", tmp_path / "lock")
    monkeypatch.setattr(
        maintenance,
        "DATABASE_ACTIVITY_LOCK_PATH",
        tmp_path / "database.lock",
    )

    with maintenance.maintenance_window():
        response = client.get("/")
        health = client.get("/healthz")

    assert response.status_code == 503
    assert response.headers["retry-after"] == "5"
    assert health.status_code == 200
    assert health.json() == {"status": "maintenance"}


def test_transactional_restore_keeps_recovery_snapshot(tmp_path, monkeypatch):
    live = tmp_path / "blog.db"
    incoming = tmp_path / "incoming.db"
    live_engine = _create_current_database(live, "old")
    incoming_engine = _create_current_database(incoming, "new")
    incoming_engine.dispose()

    monkeypatch.setattr(database_restore, "DATABASE_PATH", str(live))
    monkeypatch.setattr(database, "engine", live_engine)
    monkeypatch.setattr(maintenance, "MAINTENANCE_MARKER_PATH", tmp_path / "marker")
    monkeypatch.setattr(maintenance, "MAINTENANCE_LOCK_PATH", tmp_path / "lock")
    monkeypatch.setattr(
        maintenance,
        "DATABASE_ACTIVITY_LOCK_PATH",
        tmp_path / "database.lock",
    )

    recovery = database_restore.restore_application_database(incoming)

    assert _title(live) == "new"
    assert _title(recovery) == "old"
    assert stat_mode(recovery) == 0o600


def test_restore_preserves_revocations_clears_challenges_and_monotonic_counters(
    tmp_path,
    monkeypatch,
):
    live = tmp_path / "blog.db"
    incoming = tmp_path / "incoming.db"
    live_engine = _create_current_database(live, "old")
    _add_admin_credential(
        live_engine,
        "shared-admin-credential",
        public_key=b"shared-public-key",
        sign_count=9,
    )
    _add_blacklisted_token(live_engine, "live-revoked-access-token")
    _add_blacklisted_token(live_engine, "live-revoked-refresh-token")

    incoming_engine = _create_current_database(incoming, "new")
    _add_admin_credential(
        incoming_engine,
        "shared-admin-credential",
        public_key=b"shared-public-key",
        sign_count=2,
    )
    _add_blacklisted_token(incoming_engine, "incoming-revoked-token")
    _add_webauthn_challenge(incoming_engine, "restored-stale-challenge")
    incoming_engine.dispose()

    monkeypatch.setattr(database_restore, "DATABASE_PATH", str(live))
    monkeypatch.setattr(database, "engine", live_engine)
    monkeypatch.setattr(maintenance, "MAINTENANCE_MARKER_PATH", tmp_path / "marker")
    monkeypatch.setattr(maintenance, "MAINTENANCE_LOCK_PATH", tmp_path / "lock")
    monkeypatch.setattr(
        maintenance,
        "DATABASE_ACTIVITY_LOCK_PATH",
        tmp_path / "database.lock",
    )

    database_restore.restore_application_database(incoming)

    assert _title(live) == "new"
    assert _blacklisted_tokens(live) == {
        "incoming-revoked-token",
        "live-revoked-access-token",
        "live-revoked-refresh-token",
    }
    assert _challenge_ids(live) == set()
    assert _credential_sign_count(live, "shared-admin-credential") == 9


def test_security_state_merge_failure_restores_original_authentication_state(
    tmp_path,
    monkeypatch,
):
    live = tmp_path / "blog.db"
    incoming = tmp_path / "incoming.db"
    live_engine = _create_current_database(live, "old")
    _add_admin_credential(
        live_engine,
        "shared-admin-credential",
        public_key=b"shared-public-key",
        sign_count=11,
    )
    _add_blacklisted_token(live_engine, "live-revoked-token")
    _add_webauthn_challenge(live_engine, "live-challenge")

    incoming_engine = _create_current_database(incoming, "new")
    _add_admin_credential(
        incoming_engine,
        "shared-admin-credential",
        public_key=b"shared-public-key",
        sign_count=1,
    )
    _add_webauthn_challenge(incoming_engine, "incoming-challenge")
    incoming_engine.dispose()

    monkeypatch.setattr(database_restore, "DATABASE_PATH", str(live))
    monkeypatch.setattr(database, "engine", live_engine)
    monkeypatch.setattr(maintenance, "MAINTENANCE_MARKER_PATH", tmp_path / "marker")
    monkeypatch.setattr(maintenance, "MAINTENANCE_LOCK_PATH", tmp_path / "lock")
    monkeypatch.setattr(
        maintenance,
        "DATABASE_ACTIVITY_LOCK_PATH",
        tmp_path / "database.lock",
    )
    merge_security_state = database_restore._merge_restored_security_state

    def fail_after_security_merge(path, blacklist, sign_counts):
        merge_security_state(path, blacklist, sign_counts)
        raise RuntimeError("security merge verification failed")

    monkeypatch.setattr(
        database_restore,
        "_merge_restored_security_state",
        fail_after_security_merge,
    )

    with pytest.raises(RuntimeError, match="security merge verification failed"):
        database_restore.restore_application_database(incoming)

    assert _title(live) == "old"
    assert _blacklisted_tokens(live) == {"live-revoked-token"}
    assert _challenge_ids(live) == {"live-challenge"}
    assert _credential_sign_count(live, "shared-admin-credential") == 11


def test_failed_post_restore_validation_rolls_back(tmp_path, monkeypatch):
    live = tmp_path / "blog.db"
    incoming = tmp_path / "incoming.db"
    live_engine = _create_current_database(live, "old")
    incoming_engine = _create_current_database(incoming, "new")
    incoming_engine.dispose()

    monkeypatch.setattr(database_restore, "DATABASE_PATH", str(live))
    monkeypatch.setattr(database, "engine", live_engine)
    monkeypatch.setattr(maintenance, "MAINTENANCE_MARKER_PATH", tmp_path / "marker")
    monkeypatch.setattr(maintenance, "MAINTENANCE_LOCK_PATH", tmp_path / "lock")
    monkeypatch.setattr(
        maintenance,
        "DATABASE_ACTIVITY_LOCK_PATH",
        tmp_path / "database.lock",
    )
    monkeypatch.setattr(
        database,
        "migrate_database",
        lambda _engine: (_ for _ in ()).throw(RuntimeError("migration failed")),
    )
    monkeypatch.setattr(database_restore, "RECOVERY_BACKUP_LIMIT", 2)
    backup_directory = tmp_path / "restore-backups"
    backup_directory.mkdir()
    for index in range(3):
        stale_backup = backup_directory / f"blog.pre-restore.stale-{index}.db"
        stale_engine = _create_current_database(stale_backup, f"stale-{index}")
        stale_engine.dispose()
        os.chmod(stale_backup, 0o600)
        os.utime(stale_backup, (index + 1, index + 1))

    with pytest.raises(RuntimeError, match="migration failed"):
        database_restore.restore_application_database(incoming)

    assert _title(live) == "old"
    with database.engine.connect() as connection:
        assert connection.execute(text("SELECT title FROM blog_posts")).scalar_one() == "old"

    retained_backups = list(backup_directory.glob("blog.pre-restore.*.db"))
    assert len(retained_backups) == 2
    recovery_backups = [path for path in retained_backups if _title(path) == "old"]
    assert len(recovery_backups) == 1
    database_restore.validate_sqlite_backup(
        recovery_backups[0],
        require_current_schema=True,
    )
    assert stat_mode(recovery_backups[0]) == 0o600


def test_restore_preflight_rejects_incomplete_schema_without_touching_live(
    tmp_path,
    monkeypatch,
):
    live = tmp_path / "blog.db"
    incoming = tmp_path / "incoming.db"
    live_engine = _create_current_database(live, "old")
    _create_minimum_database(incoming, "new")

    monkeypatch.setattr(database_restore, "DATABASE_PATH", str(live))
    monkeypatch.setattr(database, "engine", live_engine)
    monkeypatch.setattr(maintenance, "MAINTENANCE_MARKER_PATH", tmp_path / "marker")
    monkeypatch.setattr(maintenance, "MAINTENANCE_LOCK_PATH", tmp_path / "lock")

    with pytest.raises(
        database_restore.BackupValidationError,
        match="missing the webauthn_credentials table",
    ):
        database_restore.restore_application_database(incoming)

    assert _title(live) == "old"
    assert not (tmp_path / "restore-backups").exists()
    assert not (tmp_path / "marker").exists()


def test_restore_rejects_admin_credential_lockout_without_touching_live(
    tmp_path,
    monkeypatch,
):
    live = tmp_path / "blog.db"
    incoming = tmp_path / "incoming.db"
    live_engine = _create_current_database(live, "old")
    _add_admin_credential(live_engine, "live-admin-credential")
    incoming_engine = _create_current_database(incoming, "new")
    incoming_engine.dispose()

    monkeypatch.setattr(database_restore, "DATABASE_PATH", str(live))
    monkeypatch.setattr(database, "engine", live_engine)
    monkeypatch.setattr(maintenance, "MAINTENANCE_MARKER_PATH", tmp_path / "marker")
    monkeypatch.setattr(maintenance, "MAINTENANCE_LOCK_PATH", tmp_path / "lock")
    monkeypatch.setattr(
        maintenance,
        "DATABASE_ACTIVITY_LOCK_PATH",
        tmp_path / "database.lock",
    )

    with pytest.raises(
        database_restore.BackupValidationError,
        match="administrator WebAuthn credentials",
    ):
        database_restore.restore_application_database(incoming)

    assert _title(live) == "old"
    assert not (tmp_path / "restore-backups").exists()
    assert not (tmp_path / "marker").exists()


@pytest.mark.parametrize(
    ("incoming_credential_id", "incoming_public_key"),
    [
        ("different-admin-credential", b"test-public-key"),
        ("current-admin-credential", b"different-public-key"),
    ],
    ids=["different-id", "same-id-different-key"],
)
def test_restore_rejects_nonmatching_nonempty_admin_credentials(
    tmp_path,
    monkeypatch,
    incoming_credential_id,
    incoming_public_key,
):
    live = tmp_path / "blog.db"
    incoming = tmp_path / "incoming.db"
    live_engine = _create_current_database(live, "old")
    _add_admin_credential(live_engine, "current-admin-credential")
    incoming_engine = _create_current_database(incoming, "new")
    _add_admin_credential(
        incoming_engine,
        incoming_credential_id,
        incoming_public_key,
    )
    incoming_engine.dispose()

    monkeypatch.setattr(database_restore, "DATABASE_PATH", str(live))
    monkeypatch.setattr(database, "engine", live_engine)
    monkeypatch.setattr(maintenance, "MAINTENANCE_MARKER_PATH", tmp_path / "marker")
    monkeypatch.setattr(maintenance, "MAINTENANCE_LOCK_PATH", tmp_path / "lock")
    monkeypatch.setattr(
        maintenance,
        "DATABASE_ACTIVITY_LOCK_PATH",
        tmp_path / "database.lock",
    )

    with pytest.raises(
        database_restore.BackupValidationError,
        match="administrator WebAuthn credentials",
    ):
        database_restore.restore_application_database(incoming)

    assert _title(live) == "old"
    assert not (tmp_path / "restore-backups").exists()


def stat_mode(path: Path) -> int:
    return path.stat().st_mode & 0o777


def test_restore_scratch_is_private_and_on_database_volume(tmp_path, monkeypatch):
    database_path = tmp_path / "database" / "blog.db"
    monkeypatch.setattr(database_restore, "DATABASE_PATH", str(database_path))

    scratch = database_restore.create_restore_scratch_directory()
    temporary_file = database_restore._new_temp_path(scratch, ".test")
    try:
        assert scratch.parent == database_path.parent.resolve()
        assert stat_mode(scratch) == 0o700
        assert temporary_file.parent == scratch
        assert stat_mode(temporary_file) == 0o600
    finally:
        shutil.rmtree(scratch)


def test_restore_endpoint_rejects_cross_site_request():
    token = create_access_token({"sub": "admin"})
    response = client.post(
        "/replace-database",
        content=b"encrypted",
        headers={
            "origin": "https://attacker.example",
            "content-type": "application/pgp-encrypted",
        },
        cookies={"access_token": token},
    )

    assert response.status_code == 403


def test_restore_endpoint_runs_validated_pipeline(tmp_path, monkeypatch):
    encrypted = tmp_path / "upload.pgp"
    decrypted = tmp_path / "backup.db"
    recovery = tmp_path / "recovery.db"
    _create_minimum_database(decrypted)
    recovery.write_bytes(b"recovery")

    async def fake_save(_request, _scratch):
        encrypted.write_bytes(b"encrypted")
        return encrypted

    async def fake_decrypt(_path, _scratch):
        return decrypted

    monkeypatch.setattr(admin, "save_encrypted_upload", fake_save)
    monkeypatch.setattr(admin, "decrypt_backup", fake_decrypt)
    monkeypatch.setattr(admin, "extract_database_payload", lambda path, _scratch: path)
    monkeypatch.setattr(admin, "restore_application_database", lambda _path: recovery)

    token = create_access_token({"sub": "admin"})
    response = client.post(
        "/replace-database",
        content=b"encrypted",
        headers={
            "origin": "https://kadenbilyeu.com",
            "content-type": "application/pgp-encrypted",
        },
        cookies={"access_token": token},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Database replaced successfully"
    assert response.json()["recovery_backup"] == "recovery.db"


@pytest.mark.asyncio
@pytest.mark.skipif(shutil.which("gpg") is None, reason="gpg is not installed")
async def test_decrypts_the_existing_zipped_backup_format(tmp_path):
    backup = tmp_path / "blog.db.backup"
    archive = tmp_path / "blog.db.backup.zip"
    encrypted = tmp_path / "blog.db.backup.zip.pgp"
    gpg_home = tmp_path / "gpg"
    scratch = _scratch_directory(tmp_path)
    gpg_home.mkdir(mode=0o700)
    _create_minimum_database(backup)
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.write(backup, backup.name)

    subprocess.run(
        [
            shutil.which("gpg"),
            "--no-options",
            "--homedir",
            str(gpg_home),
            "--batch",
            "--yes",
            "--pinentry-mode",
            "loopback",
            "--passphrase-fd",
            "0",
            "--symmetric",
            "--output",
            str(encrypted),
            str(archive),
        ],
        input=os.environ["ENCRYPTION_KEY"].encode("utf-8") + b"\n",
        check=True,
    )
    if gpgconf := shutil.which("gpgconf"):
        subprocess.run(
            [
                gpgconf,
                "--homedir",
                str(gpg_home),
                "--kill",
                "gpg-agent",
            ],
            check=True,
        )

    decrypted = await database_restore.decrypt_backup(encrypted, scratch)
    extracted = database_restore.extract_database_payload(decrypted, scratch)
    try:
        database_restore.validate_sqlite_backup(extracted)
    finally:
        decrypted.unlink(missing_ok=True)
        if extracted != decrypted:
            extracted.unlink(missing_ok=True)

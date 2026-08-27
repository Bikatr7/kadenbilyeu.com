## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import asyncio
import logging
import os
import shutil
import sqlite3
import stat
import tempfile
import zipfile
from contextlib import suppress
from datetime import datetime, timezone
from pathlib import Path
from typing import BinaryIO
from uuid import uuid4

from fastapi import HTTPException, Request, status

import database
from config import ADMIN_USER, DATABASE_PATH, ENCRYPTION_KEY
from maintenance import MaintenanceBusyError, maintenance_window


logger = logging.getLogger(__name__)

MAX_ENCRYPTED_UPLOAD_BYTES = int(
    os.getenv("DATABASE_RESTORE_MAX_UPLOAD_BYTES", str(64 * 1024 * 1024))
)
MAX_DECRYPTED_PAYLOAD_BYTES = int(
    os.getenv("DATABASE_RESTORE_MAX_DECRYPTED_BYTES", str(256 * 1024 * 1024))
)
GPG_TIMEOUT_SECONDS = int(os.getenv("DATABASE_RESTORE_GPG_TIMEOUT_SECONDS", "60"))
RECOVERY_BACKUP_LIMIT = int(os.getenv("DATABASE_RESTORE_RECOVERY_BACKUPS", "5"))
_READ_CHUNK_BYTES = 64 * 1024
_ALLOWED_CONTENT_TYPES = {
    "application/octet-stream",
    "application/pgp",
    "application/pgp-encrypted",
}
_SQLITE_HEADER = b"SQLite format 3\x00"
_MINIMUM_SCHEMA = {
    "blog_posts": {"id", "title", "content", "author", "created_at", "updated_at"},
}


class BackupValidationError(ValueError):
    pass


def create_restore_scratch_directory() -> Path:
    database_directory = Path(DATABASE_PATH).resolve().parent
    database_directory.mkdir(mode=0o750, parents=True, exist_ok=True)
    scratch_directory = Path(
        tempfile.mkdtemp(prefix=".kadenbilyeu-restore-", dir=database_directory)
    )
    os.chmod(scratch_directory, 0o700)
    return scratch_directory


def _new_temp_path(scratch_directory: Path, suffix: str) -> Path:
    fd, path = tempfile.mkstemp(
        prefix="restore-",
        suffix=suffix,
        dir=scratch_directory,
    )
    os.fchmod(fd, 0o600)
    os.close(fd)
    return Path(path)


async def save_encrypted_upload(request: Request, scratch_directory: Path) -> Path:
    content_type = request.headers.get("content-type", "").split(";", 1)[0].lower()
    if content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload an encrypted PGP backup as a raw request body",
        )

    content_length = request.headers.get("content-length")
    if content_length:
        try:
            declared_size = int(content_length)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid Content-Length") from exc
        if declared_size > MAX_ENCRYPTED_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="Encrypted backup is too large")

    upload_path = _new_temp_path(scratch_directory, ".pgp")
    total_bytes = 0
    try:
        with upload_path.open("wb") as destination:
            async for chunk in request.stream():
                total_bytes += len(chunk)
                if total_bytes > MAX_ENCRYPTED_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail="Encrypted backup is too large",
                    )
                destination.write(chunk)
            destination.flush()
            os.fsync(destination.fileno())

        if total_bytes == 0:
            raise HTTPException(status_code=400, detail="Encrypted backup is empty")
        return upload_path
    except Exception:
        upload_path.unlink(missing_ok=True)
        raise


async def _consume_stderr(stream: asyncio.StreamReader) -> bytes:
    captured = bytearray()
    while chunk := await stream.read(4096):
        if len(captured) < 32 * 1024:
            captured.extend(chunk[: 32 * 1024 - len(captured)])
    return bytes(captured)


async def decrypt_backup(encrypted_path: Path, scratch_directory: Path) -> Path:
    gpg_binary = shutil.which("gpg")
    if not gpg_binary:
        raise RuntimeError("GPG is unavailable")
    if not ENCRYPTION_KEY:
        raise RuntimeError("Backup encryption key is unavailable")

    decrypted_path = _new_temp_path(scratch_directory, ".decrypted")
    gpg_home = Path(
        tempfile.mkdtemp(prefix="gpg-", dir=scratch_directory)
    )
    os.chmod(gpg_home, 0o700)
    process = None
    stderr_task = None
    try:
        process = await asyncio.create_subprocess_exec(
            gpg_binary,
            "--no-options",
            "--homedir",
            str(gpg_home),
            "--batch",
            "--yes",
            "--no-tty",
            "--no-symkey-cache",
            "--pinentry-mode",
            "loopback",
            "--passphrase-fd",
            "0",
            "--decrypt",
            str(encrypted_path),
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        assert process.stdin is not None
        assert process.stdout is not None
        assert process.stderr is not None

        process.stdin.write(ENCRYPTION_KEY.encode("utf-8") + b"\n")
        await process.stdin.drain()
        process.stdin.close()

        stderr_task = asyncio.create_task(_consume_stderr(process.stderr))
        total_bytes = 0
        async with asyncio.timeout(GPG_TIMEOUT_SECONDS):
            with decrypted_path.open("wb") as destination:
                while chunk := await process.stdout.read(_READ_CHUNK_BYTES):
                    total_bytes += len(chunk)
                    if total_bytes > MAX_DECRYPTED_PAYLOAD_BYTES:
                        process.kill()
                        raise BackupValidationError("Decrypted backup is too large")
                    destination.write(chunk)
                destination.flush()
                os.fsync(destination.fileno())
            return_code = await process.wait()
            stderr = await stderr_task

        if return_code != 0 or total_bytes == 0:
            logger.warning(
                "Rejected encrypted database backup (gpg exit %s): %s",
                return_code,
                stderr.decode("utf-8", errors="replace")[-500:],
            )
            raise BackupValidationError("Encrypted backup could not be decrypted")
        return decrypted_path
    except TimeoutError as exc:
        if process is not None and process.returncode is None:
            process.kill()
            await process.wait()
        decrypted_path.unlink(missing_ok=True)
        raise BackupValidationError("Encrypted backup decryption timed out") from exc
    except Exception:
        if process is not None and process.returncode is None:
            process.kill()
            await process.wait()
        decrypted_path.unlink(missing_ok=True)
        raise
    finally:
        if stderr_task is not None and not stderr_task.done():
            stderr_task.cancel()
            with suppress(asyncio.CancelledError):
                await stderr_task
        gpgconf_binary = shutil.which("gpgconf")
        if gpgconf_binary:
            with suppress(Exception):
                stop_agent = await asyncio.create_subprocess_exec(
                    gpgconf_binary,
                    "--homedir",
                    str(gpg_home),
                    "--kill",
                    "gpg-agent",
                    stdout=asyncio.subprocess.DEVNULL,
                    stderr=asyncio.subprocess.DEVNULL,
                )
                await asyncio.wait_for(stop_agent.wait(), timeout=5)
        shutil.rmtree(gpg_home, ignore_errors=True)


def _copy_bounded(source: BinaryIO, destination: BinaryIO, byte_limit: int) -> int:
    total_bytes = 0
    while chunk := source.read(_READ_CHUNK_BYTES):
        total_bytes += len(chunk)
        if total_bytes > byte_limit:
            raise BackupValidationError("Database backup is too large")
        destination.write(chunk)
    return total_bytes


def extract_database_payload(
    decrypted_path: Path,
    scratch_directory: Path,
) -> Path:
    with decrypted_path.open("rb") as payload:
        header = payload.read(len(_SQLITE_HEADER))
    if header == _SQLITE_HEADER:
        if decrypted_path.stat().st_size > MAX_DECRYPTED_PAYLOAD_BYTES:
            raise BackupValidationError("Database backup is too large")
        return decrypted_path

    if not zipfile.is_zipfile(decrypted_path):
        raise BackupValidationError("Decrypted backup is not SQLite or ZIP data")

    database_path = _new_temp_path(scratch_directory, ".sqlite3")
    try:
        with zipfile.ZipFile(decrypted_path, "r") as archive:
            files = [member for member in archive.infolist() if not member.is_dir()]
            if len(files) != 1:
                raise BackupValidationError("Backup archive must contain exactly one file")

            member = files[0]
            normalized_name = member.filename.replace("\\", "/")
            name_parts = normalized_name.split("/")
            if normalized_name.startswith("/") or ".." in name_parts:
                raise BackupValidationError("Backup archive contains an unsafe path")
            file_type = (member.external_attr >> 16) & 0o170000
            if file_type == stat.S_IFLNK or member.flag_bits & 0x1:
                raise BackupValidationError("Backup archive contains an unsupported entry")
            if member.compress_type not in {zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED}:
                raise BackupValidationError("Backup archive uses unsupported compression")
            if member.file_size <= 0 or member.file_size > MAX_DECRYPTED_PAYLOAD_BYTES:
                raise BackupValidationError("Database backup is too large")
            if member.compress_size and member.file_size / member.compress_size > 200:
                raise BackupValidationError("Backup archive compression ratio is unsafe")

            with archive.open(member, "r") as source, database_path.open("wb") as destination:
                copied = _copy_bounded(
                    source,
                    destination,
                    MAX_DECRYPTED_PAYLOAD_BYTES,
                )
                destination.flush()
                os.fsync(destination.fileno())
            if copied != member.file_size:
                raise BackupValidationError("Backup archive is truncated")
        return database_path
    except (BackupValidationError, zipfile.BadZipFile, OSError) as exc:
        database_path.unlink(missing_ok=True)
        if isinstance(exc, BackupValidationError):
            raise
        raise BackupValidationError("Backup archive is invalid") from exc


def _read_only_connection(
    path: Path,
    *,
    immutable: bool = True,
) -> sqlite3.Connection:
    query = "mode=ro&immutable=1" if immutable else "mode=ro"
    return sqlite3.connect(
        f"{path.resolve().as_uri()}?{query}",
        uri=True,
        timeout=30,
    )


def validate_sqlite_backup(path: Path, *, require_current_schema: bool = False) -> None:
    try:
        if path.stat().st_size > MAX_DECRYPTED_PAYLOAD_BYTES:
            raise BackupValidationError("Database backup is too large")
        with path.open("rb") as backup:
            if backup.read(len(_SQLITE_HEADER)) != _SQLITE_HEADER:
                raise BackupValidationError("Database backup has an invalid header")

        with _read_only_connection(path) as connection:
            connection.execute("PRAGMA query_only=ON")
            integrity = connection.execute("PRAGMA integrity_check").fetchall()
            if integrity != [("ok",)]:
                raise BackupValidationError("Database backup failed its integrity check")
            if connection.execute("PRAGMA foreign_key_check").fetchone() is not None:
                raise BackupValidationError("Database backup has invalid foreign keys")

            schema_objects = connection.execute(
                "SELECT type, name FROM sqlite_master "
                "WHERE type IN ('table', 'view', 'trigger')"
            ).fetchall()
            object_types = {name: object_type for object_type, name in schema_objects}
            if any(object_type in {"view", "trigger"} for object_type, _ in schema_objects):
                raise BackupValidationError("Database backup contains unsafe schema objects")

            required_schema = dict(_MINIMUM_SCHEMA)
            if require_current_schema:
                required_schema = {
                    table_name: {column.name for column in table.columns}
                    for table_name, table in database.Base.metadata.tables.items()
                }

            for table_name, required_columns in required_schema.items():
                if object_types.get(table_name) != "table":
                    raise BackupValidationError(
                        f"Database backup is missing the {table_name} table"
                    )
                columns = {
                    row[1]
                    for row in connection.execute(
                        f'PRAGMA table_info("{table_name}")'
                    ).fetchall()
                }
                if not required_columns.issubset(columns):
                    raise BackupValidationError(
                        f"Database backup has an incompatible {table_name} table"
                    )
    except BackupValidationError:
        raise
    except (OSError, sqlite3.DatabaseError) as exc:
        raise BackupValidationError("Database backup is not a valid SQLite database") from exc


def _admin_credential_fingerprints(path: Path) -> set[tuple[str, bytes]]:
    try:
        with _read_only_connection(path) as connection:
            connection.execute("PRAGMA query_only=ON")
            rows = connection.execute(
                "SELECT credential_id, public_key FROM webauthn_credentials "
                "WHERE user_id = ?",
                (ADMIN_USER,),
            ).fetchall()
            return {(str(row[0]), bytes(row[1])) for row in rows}
    except (TypeError, sqlite3.DatabaseError) as exc:
        raise BackupValidationError(
            "Database backup has an incompatible webauthn_credentials table"
        ) from exc


def _capture_live_security_state(
    path: Path,
) -> tuple[
    list[tuple[str, str, str, str]],
    dict[tuple[str, bytes], int],
]:
    try:
        with _read_only_connection(path, immutable=False) as connection:
            connection.execute("PRAGMA query_only=ON")
            blacklist_rows = connection.execute(
                "SELECT id, token, blacklisted_at, expires_at "
                "FROM blacklisted_tokens "
                "WHERE julianday(expires_at) > julianday('now')"
            ).fetchall()
            credential_rows = connection.execute(
                "SELECT credential_id, public_key, sign_count "
                "FROM webauthn_credentials WHERE user_id = ?",
                (ADMIN_USER,),
            ).fetchall()

        blacklist = [
            (str(row[0]), str(row[1]), str(row[2]), str(row[3]))
            for row in blacklist_rows
        ]
        sign_counts = {
            (str(row[0]), bytes(row[1])): max(0, int(row[2] or 0))
            for row in credential_rows
        }
        return blacklist, sign_counts
    except (TypeError, ValueError, sqlite3.DatabaseError) as exc:
        raise BackupValidationError("Live authentication state is invalid") from exc


def _merge_restored_security_state(
    path: Path,
    blacklist: list[tuple[str, str, str, str]],
    admin_sign_counts: dict[tuple[str, bytes], int],
) -> None:
    with sqlite3.connect(str(path), timeout=30) as connection:
        connection.execute("PRAGMA busy_timeout=30000")
        connection.execute("PRAGMA foreign_keys=ON")
        connection.execute("DELETE FROM webauthn_challenges")

        for row_id, token, blacklisted_at, expires_at in blacklist:
            existing = connection.execute(
                "SELECT 1 FROM blacklisted_tokens WHERE token = ?",
                (token,),
            ).fetchone()
            if existing is None:
                connection.execute(
                    "INSERT INTO blacklisted_tokens "
                    "(id, token, blacklisted_at, expires_at) VALUES (?, ?, ?, ?)",
                    (row_id, token, blacklisted_at, expires_at),
                )
                continue

            connection.execute(
                "UPDATE blacklisted_tokens SET "
                "blacklisted_at = CASE "
                "WHEN julianday(blacklisted_at) <= julianday(?) "
                "THEN blacklisted_at ELSE ? END, "
                "expires_at = CASE "
                "WHEN julianday(expires_at) >= julianday(?) "
                "THEN expires_at ELSE ? END "
                "WHERE token = ?",
                (
                    blacklisted_at,
                    blacklisted_at,
                    expires_at,
                    expires_at,
                    token,
                ),
            )

        for (credential_id, public_key), live_sign_count in admin_sign_counts.items():
            connection.execute(
                "UPDATE webauthn_credentials "
                "SET sign_count = MAX(COALESCE(CAST(sign_count AS INTEGER), 0), ?) "
                "WHERE user_id = ? AND credential_id = ? AND public_key = ?",
                (live_sign_count, ADMIN_USER, credential_id, public_key),
            )

    with path.open("rb") as restored:
        os.fsync(restored.fileno())


def _sqlite_backup(source_path: Path, destination_path: Path) -> None:
    with sqlite3.connect(str(source_path), timeout=30) as source:
        source.execute("PRAGMA busy_timeout=30000")
        with sqlite3.connect(str(destination_path), timeout=30) as destination:
            destination.execute("PRAGMA busy_timeout=30000")
            source.backup(destination)
    os.chmod(destination_path, 0o600)
    with destination_path.open("rb") as restored:
        os.fsync(restored.fileno())


def _prune_recovery_backups(backup_directory: Path) -> None:
    if RECOVERY_BACKUP_LIMIT < 1:
        return
    backups = sorted(
        backup_directory.glob("blog.pre-restore.*.db"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    for old_backup in backups[RECOVERY_BACKUP_LIMIT:]:
        with suppress(OSError):
            old_backup.unlink()


def restore_application_database(source_path: Path) -> Path:
    # Reject incompatible backups before entering maintenance or writing live state.
    validate_sqlite_backup(source_path, require_current_schema=True)

    live_path = Path(DATABASE_PATH)
    if not live_path.is_file():
        raise RuntimeError("Live database is unavailable")

    with maintenance_window():
        live_blacklist, live_admin_sign_counts = _capture_live_security_state(
            live_path
        )
        live_admin_credentials = set(live_admin_sign_counts)
        incoming_admin_credentials = _admin_credential_fingerprints(source_path)
        if live_admin_credentials and live_admin_credentials.isdisjoint(
            incoming_admin_credentials
        ):
            raise BackupValidationError(
                "Database backup would remove all current administrator WebAuthn credentials"
            )

        backup_directory = live_path.parent / "restore-backups"
        backup_directory.mkdir(mode=0o700, parents=True, exist_ok=True)
        os.chmod(backup_directory, 0o700)
        recovery_path = backup_directory / (
            "blog.pre-restore."
            f"{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}."
            f"{uuid4().hex[:8]}.db"
        )

        database.close_all_sessions()
        database.engine.dispose()
        _sqlite_backup(live_path, recovery_path)

        prune_recovery_backups = False
        try:
            _sqlite_backup(source_path, live_path)
            _merge_restored_security_state(
                live_path,
                live_blacklist,
                live_admin_sign_counts,
            )
            database.migrate_database(database.engine)
            validate_sqlite_backup(live_path, require_current_schema=True)
            prune_recovery_backups = True
        except Exception:
            logger.exception("Database restore failed; restoring the recovery snapshot")
            database.engine.dispose()
            _sqlite_backup(recovery_path, live_path)
            validate_sqlite_backup(live_path, require_current_schema=True)
            prune_recovery_backups = True
            raise
        finally:
            database.engine.dispose()
            if prune_recovery_backups:
                _prune_recovery_backups(backup_directory)

    return recovery_path


def maintenance_conflict_to_http(exc: MaintenanceBusyError) -> HTTPException:
    return HTTPException(status_code=409, detail=str(exc))

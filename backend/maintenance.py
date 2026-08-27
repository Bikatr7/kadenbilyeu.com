## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import fcntl
import logging
import os
from contextlib import contextmanager, suppress
from pathlib import Path
from typing import Iterator


logger = logging.getLogger(__name__)

MAINTENANCE_MARKER_PATH = Path(
    os.getenv("MAINTENANCE_MARKER_PATH", "/tmp/kadenbilyeu-maintenance")
)
MAINTENANCE_LOCK_PATH = Path(
    os.getenv("MAINTENANCE_LOCK_PATH", "/tmp/kadenbilyeu-maintenance.lock")
)
DATABASE_ACTIVITY_LOCK_PATH = Path(
    os.getenv("DATABASE_ACTIVITY_LOCK_PATH", "/tmp/kadenbilyeu-database.lock")
)
BACKUP_LOCK_PATH = Path(
    os.getenv("BACKUP_LOCK_PATH", "/tmp/kadenbilyeu-backup.lock")
)
SCHEDULER_LEADER_LOCK_PATH = Path(
    os.getenv(
        "SCHEDULER_LEADER_LOCK_PATH",
        "/tmp/kadenbilyeu-backup-scheduler.lock",
    )
)
_scheduler_leader_fd: int | None = None


class MaintenanceBusyError(RuntimeError):
    pass


class BackupBusyError(RuntimeError):
    pass


def is_maintenance_active() -> bool:
    if not MAINTENANCE_MARKER_PATH.is_file():
        return False

    lock_fd = os.open(MAINTENANCE_LOCK_PATH, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return True

        # A crashed restore releases its flock but can leave the marker behind.
        with suppress(FileNotFoundError):
            MAINTENANCE_MARKER_PATH.unlink()
        logger.warning("Removed stale database maintenance marker")
        return False
    finally:
        with suppress(OSError):
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)


@contextmanager
def database_activity_window() -> Iterator[None]:
    """Hold a shared lock while a request may access the live database."""
    lock_fd = os.open(DATABASE_ACTIVITY_LOCK_PATH, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_SH | fcntl.LOCK_NB)
        except BlockingIOError as exc:
            raise MaintenanceBusyError("Database maintenance is in progress") from exc
        yield
    finally:
        with suppress(OSError):
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)


@contextmanager
def backup_operation_window() -> Iterator[None]:
    """Allow only one scheduler worker to produce and send a backup."""
    lock_fd = os.open(BACKUP_LOCK_PATH, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as exc:
            raise BackupBusyError("A database backup is already in progress") from exc
        yield
    finally:
        with suppress(OSError):
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)


def acquire_scheduler_leadership() -> bool:
    """Hold scheduler leadership until this process exits."""
    global _scheduler_leader_fd
    if _scheduler_leader_fd is not None:
        return False

    lock_fd = os.open(SCHEDULER_LEADER_LOCK_PATH, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        os.close(lock_fd)
        return False

    _scheduler_leader_fd = lock_fd
    return True


def release_scheduler_leadership() -> None:
    """Release leadership when scheduler startup fails or the process shuts down."""
    global _scheduler_leader_fd
    if _scheduler_leader_fd is None:
        return
    with suppress(OSError):
        fcntl.flock(_scheduler_leader_fd, fcntl.LOCK_UN)
    os.close(_scheduler_leader_fd)
    _scheduler_leader_fd = None


@contextmanager
def maintenance_window() -> Iterator[None]:
    """Advertise maintenance mode and serialize destructive work across workers."""
    lock_fd = os.open(MAINTENANCE_LOCK_PATH, os.O_CREAT | os.O_RDWR, 0o600)
    marker_fd = None
    owns_marker = False
    activity_fd = None
    try:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as exc:
            raise MaintenanceBusyError("Maintenance is already in progress") from exc

        marker_fd = os.open(
            MAINTENANCE_MARKER_PATH,
            os.O_CREAT | os.O_WRONLY | os.O_TRUNC,
            0o600,
        )
        owns_marker = True
        os.write(marker_fd, f"{os.getpid()}\n".encode("ascii"))
        os.fsync(marker_fd)
        os.close(marker_fd)
        marker_fd = None

        activity_fd = os.open(
            DATABASE_ACTIVITY_LOCK_PATH,
            os.O_CREAT | os.O_RDWR,
            0o600,
        )
        fcntl.flock(activity_fd, fcntl.LOCK_EX)
        yield
    finally:
        if marker_fd is not None:
            os.close(marker_fd)
        if owns_marker:
            with suppress(FileNotFoundError):
                MAINTENANCE_MARKER_PATH.unlink()
        if activity_fd is not None:
            with suppress(OSError):
                fcntl.flock(activity_fd, fcntl.LOCK_UN)
            os.close(activity_fd)
        with suppress(OSError):
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)

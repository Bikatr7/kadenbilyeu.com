## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import asyncio
import logging
import shutil
import typing

from fastapi import APIRouter, HTTPException, Request, Depends

from auth import get_current_active_user
from database import (
    SiteSettingsRead,
    SiteSettingsUpdate,
    get_db,
    func_get_site_settings,
    func_update_site_settings,
)
from config import limiter
from sqlalchemy.orm import Session

from database_restore import (
    BackupValidationError,
    create_restore_scratch_directory,
    decrypt_backup,
    extract_database_payload,
    restore_application_database,
    save_encrypted_upload,
)
from maintenance import BackupBusyError, MaintenanceBusyError
from origins import is_admin_origin_allowed

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/site-settings", response_model=SiteSettingsRead)
async def read_site_settings(db:Session = Depends(get_db)) -> SiteSettingsRead:
    """
    Read public site settings.
    """

    return func_get_site_settings(db)

@router.patch("/site-settings", response_model=SiteSettingsRead)
async def update_site_settings(
    site_settings:SiteSettingsUpdate,
    db:Session = Depends(get_db),
    current_user:str = Depends(get_current_active_user),
) -> SiteSettingsRead:
    """
    Update site settings.
    """

    return func_update_site_settings(db, site_settings)


@router.post("/replace-database")
@limiter.limit("3/hour")
async def upload_backup(
    request: Request,
    current_user: str = Depends(get_current_active_user),
) -> typing.Dict[str, str]:
    """Validate and transactionally restore an encrypted SQLite backup."""
    if not is_admin_origin_allowed(
        request.headers.get("origin", ""),
        "DATABASE_RESTORE_ALLOWED_ORIGINS",
    ):
        raise HTTPException(status_code=403, detail="Origin not allowed")

    scratch_directory = create_restore_scratch_directory()
    try:
        encrypted_path = await save_encrypted_upload(request, scratch_directory)

        decrypted_path = await decrypt_backup(encrypted_path, scratch_directory)

        database_path = await asyncio.to_thread(
            extract_database_payload,
            decrypted_path,
            scratch_directory,
        )

        recovery_path = await asyncio.to_thread(
            restore_application_database,
            database_path,
        )
        logger.info("Database restored; recovery snapshot: %s", recovery_path.name)
        return {
            "message": "Database replaced successfully",
            "recovery_backup": recovery_path.name,
        }
    except BackupValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except MaintenanceBusyError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    finally:
        shutil.rmtree(scratch_directory, ignore_errors=True)

@router.post('/force-backup')
@limiter.limit("3/hour")
async def force_backup(request: Request, current_user:str = Depends(get_current_active_user)) -> typing.Dict[str, str]:

    """
    Force a backup

    Args:
    request (Request): The request object
    csrf_protect (CsrfProtect): CSRF protection
    current_user (str): The current user

    Returns:
    typing.Dict[str, str]: The result of the operation
    """
    from utils import BackupDisabledError, perform_backup

    if not is_admin_origin_allowed(
        request.headers.get("origin", ""),
        "DATABASE_BACKUP_ALLOWED_ORIGINS",
    ):
        raise HTTPException(status_code=403, detail="Origin not allowed")

    try:
        await asyncio.to_thread(perform_backup)
    except BackupBusyError as exc:
        raise HTTPException(status_code=409, detail="A backup is already in progress") from exc
    except MaintenanceBusyError as exc:
        raise HTTPException(status_code=503, detail="Database maintenance is in progress") from exc
    except BackupDisabledError as exc:
        raise HTTPException(status_code=503, detail="Database backups are disabled") from exc
    except Exception as exc:
        logger.error("Manual database backup failed")
        raise HTTPException(status_code=500, detail="Database backup failed") from exc

    return {"message": "Backup completed successfully"}

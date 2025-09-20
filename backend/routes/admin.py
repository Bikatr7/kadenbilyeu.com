## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import typing
from fastapi import APIRouter, File, UploadFile, Request, Depends
from fastapi_csrf_protect import CsrfProtect

from auth import get_current_active_user
from database import get_envs, replace_sqlite_db
from config import maintenance_mode, maintenance_lock

router = APIRouter()

@router.post("/replace-database")
@router.post("/replace-database/")
@router.post("/replace-database/")
async def upload_backup(request: Request, file: UploadFile = File(...), csrf_protect: CsrfProtect = Depends(), current_user:str = Depends(get_current_active_user)) -> typing.Dict[str, str]:

    """
    Replace the database with a backup

    Args:
    request (Request): The request object
    file (UploadFile): The backup file
    csrf_protect (CsrfProtect): CSRF protection
    current_user (str): The current user

    Returns:
    typing.Dict[str, str]: The result of the operation
    """
    import os
    import zipfile
    import gnupg
    import shutil

    try:
        await csrf_protect.validate_csrf(request)
    except:
        pass

    try:
        global maintenance_mode
        with maintenance_lock:
            maintenance_mode = True

        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        ENCRYPTION_KEY, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, TO_EMAIL, enable_emails = get_envs()

        gpg = gnupg.GPG()
        with open(temp_path, "rb") as f:
            decrypted_data = gpg.decrypt_file(f, passphrase=ENCRYPTION_KEY)

        extracted_db_path = "/tmp/blog_restored.db"
        with open(extracted_db_path, "wb") as f:
            f.write(decrypted_data.data)

        from config import DATABASE_PATH
        replace_sqlite_db(extracted_db_path, DATABASE_PATH)

        os.remove(temp_path)
        os.remove(extracted_db_path)

        return {"message": "Database replaced successfully"}

    finally:
        with maintenance_lock:
            maintenance_mode = False

@router.post('/force-backup')
async def force_backup(request: Request, csrf_protect: CsrfProtect = Depends(), current_user:str = Depends(get_current_active_user)) -> typing.Dict[str, str]:

    """
    Force a backup

    Args:
    request (Request): The request object
    csrf_protect (CsrfProtect): CSRF protection
    current_user (str): The current user

    Returns:
    typing.Dict[str, str]: The result of the operation
    """
    from utils import perform_backup

    try:
        await csrf_protect.validate_csrf(request)
    except:
        pass

    perform_backup()

    return {"message": "Backup started"}

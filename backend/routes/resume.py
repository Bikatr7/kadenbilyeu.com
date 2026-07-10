## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## maintain allman bracket style for consistency

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import func_get_site_settings, get_db

router = APIRouter()

RESUME_FILENAME = "Kaden_Truett_Bilyeu_Resume_July_2025.pdf"
RESUME_PATH = Path(__file__).resolve().parent.parent / "assets" / RESUME_FILENAME

@router.get("/resume.pdf")
async def read_resume(db:Session = Depends(get_db)) -> FileResponse:
    """
    Serve the resume only when minimal mode is disabled.
    """

    site_settings = func_get_site_settings(db)

    if site_settings.minimal_mode:
        raise HTTPException(status_code=404, detail="Resume not found")

    if not RESUME_PATH.is_file():
        raise HTTPException(status_code=404, detail="Resume not found")

    return FileResponse(
        path=RESUME_PATH,
        media_type="application/pdf",
        filename=RESUME_FILENAME,
        headers={"Cache-Control": "no-store, no-cache, must-revalidate"}
    )

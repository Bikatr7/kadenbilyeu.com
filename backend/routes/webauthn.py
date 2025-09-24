# Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
# Use of this source code is governed by an GNU Affero General Public License v3.0
# license that can be found in the LICENSE file.

from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from webauthn_auth import (
    generate_webauthn_authentication_options,
    generate_webauthn_registration_options,
    verify_webauthn_authentication,
    verify_webauthn_registration,
    store_challenge,
    get_challenge,
)
from database import get_db, func_get_webauthn_credentials
from config import WEBAUTHN_REGISTER_SECRET
import uuid
import json

router = APIRouter()

@router.get("/webauthn/status")
async def get_webauthn_status(db: Session = Depends(get_db)):
    """
    Get information about the configured WebAuthn credentials.

    Returns:
        JSONResponse: Status of configured credentials
    """
    try:
        credentials = func_get_webauthn_credentials(db, "admin")
        return JSONResponse(content={
            "configured_keys": len(credentials),
            "keys": [
                {
                    "credential_id": cred.credential_id[:16] + "...",
                    "sign_count": cred.sign_count,
                    "created_at": cred.created_at.isoformat()
                } for cred in credentials
            ]
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webauthn/register/start")
async def start_webauthn_registration(request: Request):
    """
    Start WebAuthn registration process with password protection.

    Returns:
        JSONResponse: Registration options
    """
    try:
        data = await request.json()
        password = data.get("password", "")

        if password != WEBAUTHN_REGISTER_SECRET:
            raise HTTPException(status_code=403, detail="Invalid registration password")

        print("Starting WebAuthn registration...")
        challenge_id = str(uuid.uuid4())
        print(f"Generated challenge_id: {challenge_id}")

        options_json, challenge_bytes = generate_webauthn_registration_options("admin")
        print(f"Generated registration options")

        options_dict = json.loads(options_json)

        from webauthn.helpers import bytes_to_base64url
        challenge_b64 = bytes_to_base64url(challenge_bytes)
        store_challenge(challenge_id, challenge_b64)

        print(f"Stored challenge for challenge_id: {challenge_id}")

        return JSONResponse(content={
            "challenge_id": challenge_id,
            "options": options_dict
        })
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in start_webauthn_registration: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webauthn/register/complete")
async def complete_webauthn_registration(request: Request):
    """
    Complete WebAuthn registration process.

    Args:
        request: The request containing credential data

    Returns:
        JSONResponse: Success message
    """
    try:
        data = await request.json()
        challenge_id = data["challenge_id"]
        credential = data["credential"]

        print(f"Received registration challenge_id: {challenge_id}")
        print(f"Received credential data: {credential[:100] if isinstance(credential, str) else str(credential)[:100]}...")

        challenge_b64 = get_challenge(challenge_id)
        if not challenge_b64:
            raise HTTPException(status_code=400, detail="Invalid or expired challenge")

        from webauthn.helpers import base64url_to_bytes
        challenge = base64url_to_bytes(challenge_b64)
        print(f"Retrieved challenge: {challenge}")

        success = verify_webauthn_registration({
            "credential": credential
        }, challenge, "admin")

        if not success:
            raise HTTPException(status_code=400, detail="WebAuthn registration failed")

        return JSONResponse(content={
            "message": "WebAuthn credential registered successfully"
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in complete_webauthn_registration: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webauthn/authenticate/start")
async def start_webauthn_authentication():
    """
    Start WebAuthn authentication process with database credentials.

    Returns:
        JSONResponse: Authentication options
    """
    try:
        print("Starting WebAuthn authentication...")
        challenge_id = str(uuid.uuid4())
        print(f"Generated challenge_id: {challenge_id}")

        options_json, challenge_bytes = generate_webauthn_authentication_options("admin")
        print(f"Generated authentication options")

        options_dict = json.loads(options_json)

        from webauthn.helpers import bytes_to_base64url
        challenge_b64 = bytes_to_base64url(challenge_bytes)
        store_challenge(challenge_id, challenge_b64)

        print(f"Stored challenge for challenge_id: {challenge_id}")

        return JSONResponse(content={
            "challenge_id": challenge_id,
            "options": options_dict
        })
    except Exception as e:
        print(f"Error in start_webauthn_authentication: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webauthn/authenticate/complete")
async def complete_webauthn_authentication(request: Request):
    """
    Complete WebAuthn authentication process.

    Args:
        request: The request containing credential data

    Returns:
        JSONResponse: Success message with tokens
    """
    try:
        data = await request.json()
        challenge_id = data["challenge_id"]
        credential = data["credential"]

        print(f"Received challenge_id: {challenge_id}")
        print(f"Received credential data: {credential[:100] if isinstance(credential, str) else str(credential)[:100]}...")

        challenge_b64 = get_challenge(challenge_id)
        if not challenge_b64:
            raise HTTPException(status_code=400, detail="Invalid or expired challenge")

        from webauthn.helpers import base64url_to_bytes
        challenge = base64url_to_bytes(challenge_b64)
        print(f"Retrieved challenge: {challenge}")

        success = verify_webauthn_authentication({
            "credential": credential
        }, challenge, "admin")

        if not success:
            raise HTTPException(status_code=401, detail="WebAuthn authentication failed")

        from auth import create_access_token, create_refresh_token
        from config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES
        from datetime import timedelta

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": "admin"}, expires_delta=access_token_expires
        )
        refresh_token_expires = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
        refresh_token = create_refresh_token(
            data={"sub": "admin"}, expires_delta=refresh_token_expires
        )

        response = JSONResponse(content={
            "message": "WebAuthn authentication successful",
            "token_type": "bearer"
        })

        from config import SECURE_COOKIES
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=SECURE_COOKIES,
            samesite="Lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=SECURE_COOKIES,
            samesite="Lax",
            max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
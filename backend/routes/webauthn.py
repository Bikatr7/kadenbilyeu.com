# Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
# Use of this source code is governed by an GNU Affero General Public License v3.0
# license that can be found in the LICENSE file.

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi_csrf_protect import CsrfProtect

from webauthn_auth import (
    generate_webauthn_authentication_options,
    verify_webauthn_authentication,
    store_challenge,
    get_challenge,
    get_public_credentials
)
import uuid
import json

router = APIRouter()

@router.get("/webauthn/status")
async def get_webauthn_status():
    """
    Get information about the hardcoded WebAuthn credentials.

    Returns:
        JSONResponse: Status of configured credentials
    """
    try:
        credentials = get_public_credentials()
        return JSONResponse(content={
            "configured_keys": len(credentials),
            "keys": [
                {
                    "credential_id": cred["credential_id"][:16] + "...",
                    "sign_count": cred["sign_count"]
                } for cred in credentials
            ]
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webauthn/authenticate/start")
async def start_webauthn_authentication():
    """
    Start WebAuthn authentication process with hardcoded credentials.

    Returns:
        JSONResponse: Authentication options
    """

    try:
        print("Starting WebAuthn authentication...")
        challenge_id = str(uuid.uuid4())
        print(f"Generated challenge_id: {challenge_id}")

        options_json, challenge_bytes = generate_webauthn_authentication_options()
        print(f"Generated options_json: {options_json}")
        print(f"Challenge bytes: {challenge_bytes}")

        options_dict = json.loads(options_json)
        print(f"Parsed options_dict: {options_dict}")

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
async def complete_webauthn_authentication(request: Request, csrf_protect: CsrfProtect = Depends()):
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
        print(f"Received credential data: {credential[:100]}...")

        challenge_b64 = get_challenge(challenge_id)
        if not challenge_b64:
            raise HTTPException(status_code=400, detail="Invalid or expired challenge")

        from webauthn.helpers import base64url_to_bytes
        challenge = base64url_to_bytes(challenge_b64)
        print(f"Retrieved challenge: {challenge}")

        try:
            await csrf_protect.validate_csrf(request)
        except:
            pass



        success = verify_webauthn_authentication({
            "credential": credential
        }, challenge)

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
## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

from fastapi import APIRouter, Request, Cookie
from fastapi.responses import JSONResponse

from config import limiter, token_blacklist, SECURE_COOKIES
from auth import (
    verify_credentials,
    verify_totp,
    create_access_token,
    create_refresh_token,
    verify_token,
    verify_refresh_token,
    is_token_blacklisted
)
from database import LoginModel

router = APIRouter()


@router.get("/auth/check")
async def check_auth(request: Request, access_token: str = Cookie(None, alias="access_token")):
    """
    Check if the current user is authenticated

    Args:
    request (Request): The request object
    access_token (str): The access token from cookie

    Returns:
    dict: Authentication status
    """
    if not access_token:
        return {"authenticated": False}

    if is_token_blacklisted(access_token):
        return {"authenticated": False}

    try:
        token_data = verify_token(access_token)
        return {"authenticated": True, "user": token_data.username}
    except:
        return {"authenticated": False}


@router.post("/login")
@limiter.limit("5/minute")  # Stricter limit for login attempts
async def login(data:LoginModel, request: Request) -> JSONResponse:
    """
    Login endpoint for the API

    Args:
    data (LoginModel): The data required to login
    request (Request): The request object
    csrf_protect (CsrfProtect): CSRF protection

    Returns:
    JSONResponse: Success message with tokens set as HttpOnly cookies
    """
    from config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES
    from datetime import timedelta

    from fastapi.security import HTTPBasicCredentials
    credentials = HTTPBasicCredentials(username=data.username, password=data.password)
    verify_credentials(credentials)
    verify_totp(data.totp)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": data.username}, expires_delta=access_token_expires
    )
    refresh_token_expires = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    refresh_token = create_refresh_token(
        data={"sub": data.username}, expires_delta=refresh_token_expires
    )

    response = JSONResponse(content={"message": "Login successful", "token_type": "bearer"})
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

@router.post("/logout")
async def logout(request: Request, access_token: str = Cookie(None, alias="access_token"), refresh_token: str = Cookie(None, alias="refresh_token")) -> JSONResponse:
    """
    Logout endpoint - clears authentication cookies and blacklists tokens

    Args:
    request (Request): The request object
    access_token (str): The access token to blacklist
    refresh_token (str): The refresh token to blacklist

    Returns:
    JSONResponse: Success message with cleared cookies
    """

    # Add tokens to blacklist if they exist
    if access_token:
        token_blacklist.add(access_token)
    if refresh_token:
        token_blacklist.add(refresh_token)

    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=SECURE_COOKIES,
        httponly=True,
        samesite="Lax"
    )
    response.delete_cookie(
        key="refresh_token",
        path="/",
        secure=SECURE_COOKIES,
        httponly=True,
        samesite="Lax"
    )
    return response

@router.post("/refresh")
async def refresh_token(request: Request, refresh_token: str = Cookie(None, alias="refresh_token")) -> JSONResponse:
    """
    Refresh the access token using the refresh token

    Args:
    request (Request): The request object
    refresh_token (str): The refresh token from cookie
    csrf_protect (CsrfProtect): CSRF protection

    Returns:
    JSONResponse: Success message with new tokens set as HttpOnly cookies
    """
    from config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES
    from datetime import timedelta

    if(refresh_token is None):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No refresh token provided")

    if is_token_blacklisted(refresh_token):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")

    token_data = verify_refresh_token(refresh_token)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": token_data.username}, expires_delta=access_token_expires
    )
    refresh_token_expires = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    new_refresh_token = create_refresh_token(
        data={"sub": token_data.username}, expires_delta=refresh_token_expires
    )

    response = JSONResponse(content={"message": "Token refreshed", "token_type": "bearer"})
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
        value=new_refresh_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="Lax",
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60
    )
    return response
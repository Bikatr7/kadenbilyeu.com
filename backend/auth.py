## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import typing
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status, Cookie, Depends

import jwt
from jwt import PyJWTError

from config import (
    ADMIN_USER,
    ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET,
    TOKEN_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_MINUTES, token_blacklist,
    JWT_ISSUER, JWT_AUDIENCE
)
from database import TokenData

def is_token_blacklisted(token: str) -> bool:
    """
    Check if a token is in the blacklist

    Args:
    token (str): The token to check

    Returns:
    bool: True if token is blacklisted
    """
    return token in token_blacklist

def get_token_from_cookie(access_token: str = Cookie(None, alias="access_token")):
    """
    Extract access token from HttpOnly cookie

    Args:
    access_token (str): The access token from cookie

    Returns:
    str: The access token

    Raises:
    HTTPException: If no token is provided
    """
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if is_token_blacklisted(access_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return access_token

def create_access_token(data:dict, expires_delta:typing.Optional[timedelta] = None) -> str:
    """
    Create an access token with the given data and expiration time

    Args:
    data (dict): The data to encode into the token
    expires_delta (timedelta): The time until the token expires

    Returns:
    encoded_jwt (str): The encoded JWT token
    """

    to_encode = data.copy()

    if(expires_delta):
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    issued_at = datetime.now(timezone.utc)
    to_encode.update({
        "exp": expire,
        "iat": issued_at,
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "token_type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, ACCESS_TOKEN_SECRET, algorithm=TOKEN_ALGORITHM) # type: ignore
    return encoded_jwt

def create_refresh_token(data:dict, expires_delta:typing.Optional[timedelta] = None) -> str:
    """
    Create a refresh token with the given data and expiration time

    Args:
    data (dict): The data to encode into the token
    expires_delta (timedelta): The time until the token expires

    Returns:
    encoded_jwt (str): The encoded JWT token
    """

    to_encode = data.copy()

    if(expires_delta):
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=1)

    issued_at = datetime.now(timezone.utc)
    to_encode.update({
        "exp": expire,
        "iat": issued_at,
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "token_type": "refresh"
    })
    encoded_jwt = jwt.encode(to_encode, REFRESH_TOKEN_SECRET, algorithm=TOKEN_ALGORITHM) # type: ignore
    return encoded_jwt

def _decode_token(token:str, secret:str, expected_type:str) -> TokenData:
    """
    Verify the given token and return the data

    Args:
    token (str): The token to verify

    Returns:
    TokenData: The data from the token
    """

    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=[TOKEN_ALGORITHM],
            audience=JWT_AUDIENCE,
            issuer=JWT_ISSUER
        ) # type: ignore
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    username:str = payload.get("sub")
    token_type = payload.get("token_type")

    if username is None or token_type != expected_type:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return TokenData(username=username)

def verify_token(token:str) -> TokenData:
    """Verify an access token."""
    return _decode_token(token, ACCESS_TOKEN_SECRET, "access")

def verify_refresh_token(token:str) -> TokenData:
    """Verify a refresh token."""
    return _decode_token(token, REFRESH_TOKEN_SECRET, "refresh")

def get_current_user(token:str = Depends(get_token_from_cookie)):
    """
    Get the current user from the given token

    Args:
    token (str): The token to get the user from

    Returns:
    str: The username of the user
    """

    try:
        token_data = verify_token(token)
        return token_data.username
    except HTTPException as e:
        raise e

def get_current_active_user(current_user:str = Depends(get_current_user)):
    """
    Get the current active user

    Args:
    current_user (str): The current user

    Returns:
    str: The username of the user
    """

    if(current_user != ADMIN_USER):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return current_user

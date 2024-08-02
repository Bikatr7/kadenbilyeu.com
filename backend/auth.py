## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## built-in libraries
import typing

from datetime import datetime, timedelta, timezone

## third-party libraries
from pydantic import BaseModel

from fastapi import HTTPException, status, Depends
from fastapi.security import  HTTPBasicCredentials, OAuth2PasswordBearer

import pyotp

from passlib.context import CryptContext

import jwt
from jwt import PyJWTError

## custom modules
from constants import ADMIN_USER, ADMIN_PASS_HASH, TOTP_SECRET, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, TOKEN_ALGORITHM

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

##--- Model Definitions ---##

class TokenData(BaseModel):
    username: str

##-- Function Definitions --##

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

    to_encode.update({"exp": expire})
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

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, REFRESH_TOKEN_SECRET, algorithm=TOKEN_ALGORITHM) # type: ignore
    return encoded_jwt

def verify_token(token:str) -> TokenData:
    
        """

        Verify the given token and return the data

        Args:    
        token (str): The token to verify

        Returns:
        TokenData: The data from the token

        """

        try:
            payload = jwt.decode(token, ACCESS_TOKEN_SECRET, algorithms=[TOKEN_ALGORITHM]) # type: ignore
            username:str = payload.get("sub")

            if(username is None):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
            
            return TokenData(username=username)
        
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        
        except PyJWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def verify_credentials(credentials:HTTPBasicCredentials) -> None:

    """
    
    Verify the given credentials

    Args:
    credentials (HTTPBasicCredentials): The credentials to verify

    """

    if(not(credentials.username == ADMIN_USER and pwd_context.verify(credentials.password, ADMIN_PASS_HASH))):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Basic"},
        )

def verify_totp(totp_code:str) -> None:

    """

    Verify the given TOTP code

    Args:
    totp_code (str): The TOTP code to verify

    """

    totp = pyotp.TOTP(TOTP_SECRET) # type: ignore

    if(not totp.verify(totp_code)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
def get_current_user(token:str = Depends(oauth2_scheme)):

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
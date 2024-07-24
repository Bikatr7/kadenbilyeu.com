## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import os
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import  HTTPBasicCredentials, HTTPBasic
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel
import pyotp

##-----------------------------------------start-of-utility-functions----------------------------------------------------------------------------------------------------------------------------------------------------------

def get_url() -> str:
    if(ENVIRONMENT == "development"):
        return "http://api.localhost:5000"
    
    return "https://api.kadenbilyeu.com"

def get_env_variables() -> None:

    """

    Only used in development. This function reads the .env file and sets the environment variables.

    """

    with open(".env") as f:
        for line in f:
            key, value = line.strip().split("=")
            os.environ[key] = value

##-----------------------------------------start-of-pydantic-models----------------------------------------------------------------------------------------------------------------------------------------------------------

class TOTPVerify(BaseModel):
    code:str

##-----------------------------------------start-of-main----------------------------------------------------------------------------------------------------------------------------------------------------------

app = FastAPI()

## CORS setup
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TURNSTILE_SECRET_KEY = os.environ.get("TURNSTILE_SECRET_KEY")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

ADMIN_USER = os.environ.get("ADMIN_USER")
ADMIN_PASS_HASH = os.environ.get("ADMIN_PASS_HASH")
TOTP_SECRET = os.environ.get("TOTP_SECRET")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

security = HTTPBasic()

## Turnstile verification endpoint won't be used if the secret key is not set
## but for the other endpoints, we need to make sure the root keys are set
if(not any([ADMIN_USER, ADMIN_PASS_HASH])):
    get_env_variables()
    ADMIN_USER = os.environ.get("ADMIN_USER")
    ADMIN_PASS_HASH = os.environ.get("ADMIN_PASS_HASH")
    TOTP_SECRET = os.environ.get("TOTP_SECRET")

assert ADMIN_USER, "ADMIN_USER environment variable not set"
assert ADMIN_PASS_HASH, "ADMIN_PASS_HASH environment variable not set"
assert TOTP_SECRET, "TOTP_SECRET environment variable not set"

def verify_credentials(credentials:HTTPBasicCredentials):
    if(not(credentials.username == ADMIN_USER and pwd_context.verify(credentials.password, ADMIN_PASS_HASH))):
        print(credentials.username)
        print(ADMIN_USER)
        print(credentials.password)
        print(ADMIN_PASS_HASH)
        print(pwd_context.verify(credentials.password, ADMIN_PASS_HASH))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )

def get_current_user(credentials:HTTPBasicCredentials = Depends(security)):
    verify_credentials(credentials)
    return credentials.username

def verify_totp(data:TOTPVerify, user:str = Depends(get_current_user)):
    totp = pyotp.TOTP(TOTP_SECRET) # type: ignore
    if(not totp.verify(data.code)):
        raise HTTPException(status_code=400, detail="Invalid TOTP code")
    return {"message": "TOTP code is valid"}

@app.post("/verify-credentials")
def verify_user_credentials(credentials:HTTPBasicCredentials = Depends(security)):
    verify_credentials(credentials)
    return {"message": "Credentials are valid"}
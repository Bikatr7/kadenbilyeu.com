## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from fastapi_csrf_protect.exceptions import CsrfProtectError

from config import limiter, maintenance_mode, maintenance_lock, get_csrf_config
from utils import start_scheduler, get_url

from routes.auth import router as auth_router
from routes.blog import router as blog_router
from routes.admin import router as admin_router

app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

@app.exception_handler(CsrfProtectError)
def csrf_protect_exception_handler(request: Request, exc: CsrfProtectError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )

@app.on_event("startup")
async def startup_event():
    start_scheduler()

## Middleware
@app.middleware("http")
async def maintenance_middleware(request:Request, call_next):
    global maintenance_mode
    if(maintenance_mode):
        return JSONResponse(status_code=503, content={"message": "Server is in maintenance mode"})

    response = await call_next(request)

    return response

## CORS setup
origins = [
    "https://bikatr7.com",
    "https://kadenbilyeu.com",
    "http://localhost:5173",
    "https://kadenbilyeu-com.pages.dev",
    "https://*.kadenbilyeu-com.pages.dev",
    "https://*.bikatr7.com",
    "https://bikatr7.pages.dev",
    "https://*.bikatr7.pages.dev"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https://([a-z0-9-]\.)?(kadenbilyeu-com\.pages\.dev|bikatr7\.pages\.dev)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

## Include routers
app.include_router(auth_router)
app.include_router(blog_router)
app.include_router(admin_router)

## Root endpoint
@app.get("/")
async def api_home():
    return {"message": "API is running"}

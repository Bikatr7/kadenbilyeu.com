## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware


from config import limiter, SECURE_COOKIES
from database import get_db
from maintenance import (
    MaintenanceBusyError,
    database_activity_window,
    is_maintenance_active,
)
from utils import start_scheduler, get_url

from routes.auth import router as auth_router
from routes.blog import router as blog_router
from routes.admin import router as admin_router
from routes.webauthn import router as webauthn_router
from routes.terminal import router as terminal_router
from routes.resume import router as resume_router

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

## Logging configuration
import logging
from config import ENVIRONMENT
logging.basicConfig(
    level=logging.DEBUG if ENVIRONMENT == "development" else logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


@app.on_event("startup")
async def startup_event():
    from config import ENVIRONMENT
    if ENVIRONMENT != "testing":
        start_scheduler()

## Middleware
@app.middleware("http")
async def maintenance_middleware(request:Request, call_next):
    def maintenance_response():
        if request.url.path == "/healthz":
            return JSONResponse(status_code=200, content={"status": "maintenance"})
        return JSONResponse(
            status_code=503,
            content={"message": "Server is in maintenance mode"},
            headers={"Retry-After": "5"},
        )

    if is_maintenance_active():
        return maintenance_response()

    # These endpoints acquire the database lock only around snapshot work.
    if request.url.path in {"/replace-database", "/force-backup"}:
        return await call_next(request)

    try:
        with database_activity_window():
            if is_maintenance_active():
                return maintenance_response()
            response = await call_next(request)
    except MaintenanceBusyError:
        return maintenance_response()

    return response

@app.middleware("http")
async def security_headers_middleware(request:Request, call_next):
    response = await call_next(request)

    # Clickjacking protection
    response.headers["X-Frame-Options"] = "DENY"
    # MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Referrer policy
    response.headers["Referrer-Policy"] = "no-referrer"
    # Lock down powerful APIs by default
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    # Cache control for API responses
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    # Basic CSP to mitigate XSS; adjust as needed for frontend
    # Allow same-origin resources; images and fonts from self/data; WS same-origin
    csp = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "font-src 'self' data:; "
        "connect-src 'self'; "
        "frame-ancestors 'none'"
    )
    response.headers["Content-Security-Policy"] = csp
    # Enforce HTTPS for a year in production
    if SECURE_COOKIES:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

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
app.include_router(webauthn_router)
app.include_router(terminal_router)
app.include_router(resume_router)

## Root endpoint
@app.get("/")
async def api_home():
    return {"message": "API is running"}


@app.get("/healthz", include_in_schema=False)
async def health_check(db:Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}

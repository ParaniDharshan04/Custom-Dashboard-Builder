from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import get_settings
from app.api.routes import orders, dashboard, widgets, data, auth, ai
import os

settings = get_settings()

app = FastAPI(title="Custom Dashboard Builder API", version="1.0.0")

# CORS - allow specific origins based on settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")] if settings.ALLOWED_ORIGINS and settings.ALLOWED_ORIGINS != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(orders.router)
app.include_router(dashboard.router)
app.include_router(widgets.router)
app.include_router(data.router)
app.include_router(auth.router)
app.include_router(ai.router)


@app.get("/")
async def root():
    return {"message": "Custom Dashboard Builder API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}


# Mount static files for production (when frontend is built into static folder)
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

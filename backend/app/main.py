from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.routes import orders, dashboard, widgets, data, auth, ai

settings = get_settings()

app = FastAPI(title="Custom Dashboard Builder API", version="1.0.0")

# CORS - allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

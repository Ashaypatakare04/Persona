import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.services.seed_service import seed_database

# Routers
from app.api.v1.contacts import router as contacts_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.calls import router as calls_router
from app.api.v1.approvals import router as approvals_router
from app.api.v1.settings import router as settings_router
from app.api.v1.knowledge import router as knowledge_router
from app.api.v1.audit import router as audit_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.simulate import router as simulate_router
from app.api.websocket import router as websocket_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure data directory exists
    os.makedirs("data", exist_ok=True)
    
    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed initial Ashay profile, contacts, knowledge, and settings
    async with AsyncSessionLocal() as session:
        await seed_database(session)

    yield

    # Cleanup
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Persona - Personal AI Representative Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permissive for local dev across ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
api_prefix = "/api/v1"
app.include_router(dashboard_router, prefix=api_prefix)
app.include_router(contacts_router, prefix=api_prefix)
app.include_router(conversations_router, prefix=api_prefix)
app.include_router(calls_router, prefix=api_prefix)
app.include_router(approvals_router, prefix=api_prefix)
app.include_router(settings_router, prefix=api_prefix)
app.include_router(knowledge_router, prefix=api_prefix)
app.include_router(audit_router, prefix=api_prefix)
app.include_router(simulate_router, prefix=api_prefix)

# Mount WebSockets
app.include_router(websocket_router)

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "online",
        "representative_for": settings.USER_NAME,
        "docs": "/docs"
    }

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy"}

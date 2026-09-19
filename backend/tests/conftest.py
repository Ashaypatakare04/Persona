import asyncio
import os
import pytest
from app.core.database import engine, Base, AsyncSessionLocal
from app.services.seed_service import seed_database

async def _init_db():
    os.makedirs("data", exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_database(session)

def pytest_sessionstart(session):
    """Run database initialization synchronously before tests begin."""
    asyncio.run(_init_db())

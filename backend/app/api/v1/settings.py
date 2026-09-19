from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings as app_settings
from app.models.policy import SystemSetting, PermissionPolicy
from app.models.user import User
from app.schemas.common import (
    AutonomySettings, PermissionSettings,
    LLMProviderSettings, LLMProviderUpdate,
    UserRead, UserUpdate
)

router = APIRouter(prefix="/settings", tags=["Settings"])

# Profile
@router.get("/profile", response_model=UserRead)
async def get_profile(db: AsyncSession = Depends(get_db)):
    stmt = select(User).limit(1)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return user

@router.put("/profile", response_model=UserRead)
async def update_profile(data: UserUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(User).limit(1)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(user, k, v)

    await db.commit()
    await db.refresh(user)
    return user

# Autonomy Settings
@router.get("/autonomy", response_model=AutonomySettings)
async def get_autonomy_settings(db: AsyncSession = Depends(get_db)):
    stmt = select(SystemSetting).where(SystemSetting.key == "global_autonomy_level")
    res = await db.execute(stmt)
    setting = res.scalar_one_or_none()
    level = int(setting.value) if setting else 2
    return AutonomySettings(global_autonomy_level=level)

@router.put("/autonomy", response_model=AutonomySettings)
async def update_autonomy_settings(data: AutonomySettings, db: AsyncSession = Depends(get_db)):
    stmt = select(SystemSetting).where(SystemSetting.key == "global_autonomy_level")
    res = await db.execute(stmt)
    setting = res.scalar_one_or_none()
    if not setting:
        setting = SystemSetting(key="global_autonomy_level", value=str(data.global_autonomy_level))
        db.add(setting)
    else:
        setting.value = str(data.global_autonomy_level)

    await db.commit()
    return data

# Permission Settings
@router.get("/permissions", response_model=PermissionSettings)
async def get_permissions(db: AsyncSession = Depends(get_db)):
    stmt = select(PermissionPolicy)
    res = await db.execute(stmt)
    policies = {p.resource_name: p.access_level for p in res.scalars().all()}
    return PermissionSettings(
        calendar=policies.get("calendar", "ALLOW"),
        notes=policies.get("notes", "DENY"),
        tasks=policies.get("tasks", "ALLOW"),
        financial=policies.get("financial", "DENY")
    )

@router.put("/permissions", response_model=PermissionSettings)
async def update_permissions(data: PermissionSettings, db: AsyncSession = Depends(get_db)):
    items = data.model_dump()
    for res_name, access in items.items():
        stmt = select(PermissionPolicy).where(PermissionPolicy.resource_name == res_name)
        res = await db.execute(stmt)
        pol = res.scalar_one_or_none()
        if pol:
            pol.access_level = access
        else:
            db.add(PermissionPolicy(resource_name=res_name, access_level=access))

    await db.commit()
    return data

# LLM Provider Settings
@router.get("/llm", response_model=LLMProviderSettings)
async def get_llm_settings(db: AsyncSession = Depends(get_db)):
    stmt = select(SystemSetting).where(SystemSetting.key == "active_llm_provider")
    res = await db.execute(stmt)
    setting = res.scalar_one_or_none()
    provider = setting.value if setting else app_settings.DEFAULT_LLM_PROVIDER

    return LLMProviderSettings(
        provider=provider,
        gemini_api_key_set=bool(app_settings.GEMINI_API_KEY),
        gemini_model=app_settings.GEMINI_MODEL,
        openai_api_key_set=bool(app_settings.OPENAI_API_KEY),
        openai_model=app_settings.OPENAI_MODEL,
        openai_base_url=app_settings.OPENAI_BASE_URL
    )

@router.put("/llm", response_model=LLMProviderSettings)
async def update_llm_settings(data: LLMProviderUpdate, db: AsyncSession = Depends(get_db)):
    if data.provider:
        stmt = select(SystemSetting).where(SystemSetting.key == "active_llm_provider")
        res = await db.execute(stmt)
        setting = res.scalar_one_or_none()
        if setting:
            setting.value = data.provider
        else:
            db.add(SystemSetting(key="active_llm_provider", value=data.provider))
        app_settings.DEFAULT_LLM_PROVIDER = data.provider

    if data.gemini_api_key is not None:
        app_settings.GEMINI_API_KEY = data.gemini_api_key
    if data.gemini_model:
        app_settings.GEMINI_MODEL = data.gemini_model
    if data.openai_api_key is not None:
        app_settings.OPENAI_API_KEY = data.openai_api_key
    if data.openai_model:
        app_settings.OPENAI_MODEL = data.openai_model
    if data.openai_base_url:
        app_settings.OPENAI_BASE_URL = data.openai_base_url

    await db.commit()

    return LLMProviderSettings(
        provider=app_settings.DEFAULT_LLM_PROVIDER,
        gemini_api_key_set=bool(app_settings.GEMINI_API_KEY),
        gemini_model=app_settings.GEMINI_MODEL,
        openai_api_key_set=bool(app_settings.OPENAI_API_KEY),
        openai_model=app_settings.OPENAI_MODEL,
        openai_base_url=app_settings.OPENAI_BASE_URL
    )

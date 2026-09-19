from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.contact import Contact, ContactGroup
from app.models.policy import ContactRule
from app.schemas.common import (
    ContactRead, ContactCreate, ContactUpdate,
    ContactRuleRead, ContactRuleUpdate
)

router = APIRouter(prefix="/contacts", tags=["Contacts"])

@router.get("", response_model=List[ContactRead])
async def list_contacts(
    relationship: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Contact).options(selectinload(Contact.rule))
    if relationship:
        query = query.where(Contact.relationship_type == relationship)
    if search:
        query = query.where(Contact.name.ilike(f"%{search}%"))
    
    res = await db.execute(query)
    return res.scalars().all()

@router.post("", response_model=ContactRead)
async def create_contact(
    data: ContactCreate,
    db: AsyncSession = Depends(get_db)
):
    contact = Contact(
        name=data.name,
        phone=data.phone,
        email=data.email,
        relationship_type=data.relationship_type,
        company=data.company,
        notes=data.notes,
        is_vip=data.is_vip,
        is_blocked=data.is_blocked
    )
    db.add(contact)
    await db.flush()

    rule_data = data.rule
    rule = ContactRule(
        contact_id=contact.id,
        auto_reply_allowed=rule_data.auto_reply_allowed if rule_data else True,
        calendar_access=rule_data.calendar_access if rule_data else False,
        notes_access=rule_data.notes_access if rule_data else False,
        financial_actions_allowed=rule_data.financial_actions_allowed if rule_data else False,
        message_style=rule_data.message_style if rule_data else "neutral",
        max_autonomy_level=rule_data.max_autonomy_level if rule_data else 3,
        require_approval_always=rule_data.require_approval_always if rule_data else False,
        custom_instructions=rule_data.custom_instructions if rule_data else None
    )
    db.add(rule)
    await db.commit()
    await db.refresh(contact)
    return contact

@router.get("/{contact_id}", response_model=ContactRead)
async def get_contact(contact_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Contact).options(selectinload(Contact.rule)).where(Contact.id == contact_id)
    res = await db.execute(stmt)
    contact = res.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.put("/{contact_id}", response_model=ContactRead)
async def update_contact(
    contact_id: int,
    data: ContactUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Contact).options(selectinload(Contact.rule)).where(Contact.id == contact_id)
    res = await db.execute(stmt)
    contact = res.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(contact, k, v)

    await db.commit()
    await db.refresh(contact)
    return contact

@router.put("/{contact_id}/rules", response_model=ContactRuleRead)
async def update_contact_rules(
    contact_id: int,
    data: ContactRuleUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ContactRule).where(ContactRule.contact_id == contact_id)
    res = await db.execute(stmt)
    rule = res.scalar_one_or_none()
    if not rule:
        rule = ContactRule(contact_id=contact_id)
        db.add(rule)

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(rule, k, v)

    await db.commit()
    await db.refresh(rule)
    return rule

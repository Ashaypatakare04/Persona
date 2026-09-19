from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.contact import Contact, ContactGroup
from app.models.policy import ContactRule, SystemSetting, PermissionPolicy
from app.models.knowledge import KnowledgeItem
from app.models.conversation import Conversation
from app.models.message import Message

async def seed_database(db: AsyncSession):
    # 1. User
    user_stmt = select(User).limit(1)
    res = await db.execute(user_stmt)
    user = res.scalar_one_or_none()
    if not user:
        user = User(
            name="Ashay",
            email="ashay@example.com",
            phone="+91 98765 43210",
            role="Student & Software Developer",
            bio="Building Personal AI Representative and autonomous agent architectures."
        )
        db.add(user)
        await db.flush()

    # 2. System Settings (Autonomy Level, LLM Provider)
    settings_data = [
        ("global_autonomy_level", "2", "Global Autonomy Level (0 to 4)"),
        ("require_approval_for_scheduling", "true", "Always ask before finalizing meetings"),
        ("active_llm_provider", "mock", "Default LLM Provider: mock, gemini, openai")
    ]
    for key, val, desc in settings_data:
        s_stmt = select(SystemSetting).where(SystemSetting.key == key)
        s_res = await db.execute(s_stmt)
        if not s_res.scalar_one_or_none():
            db.add(SystemSetting(key=key, value=val, description=desc))

    # 3. Global Permissions
    perms_data = [
        ("calendar", "ALLOW", "Access to schedule and availability"),
        ("notes", "DENY", "Access to personal notes and private records"),
        ("tasks", "ALLOW", "Access to task status and to-dos"),
        ("financial", "DENY", "Strictly forbidden for autonomous execution")
    ]
    for res_name, access, desc in perms_data:
        p_stmt = select(PermissionPolicy).where(PermissionPolicy.resource_name == res_name)
        p_res = await db.execute(p_stmt)
        if not p_res.scalar_one_or_none():
            db.add(PermissionPolicy(resource_name=res_name, access_level=access, description=desc))

    # 4. Contacts & Rules
    contacts_data = [
        {
            "name": "Rohan Sharma",
            "phone": "+91 98230 12345",
            "email": "rohan.sharma@example.com",
            "relationship_type": "friend",
            "is_vip": False,
            "rule": {
                "auto_reply_allowed": True,
                "calendar_access": False,
                "notes_access": False,
                "message_style": "casual",
                "max_autonomy_level": 3,
                "require_approval_always": False
            }
        },
        {
            "name": "Prof. Sanjeev Rao",
            "phone": "+91 98111 22334",
            "email": "sanjeev.rao@university.edu",
            "relationship_type": "professor",
            "company": "Department of Computer Science",
            "is_vip": True,
            "rule": {
                "auto_reply_allowed": True,
                "calendar_access": True,
                "notes_access": False,
                "message_style": "formal",
                "max_autonomy_level": 2,
                "require_approval_always": False
            }
        },
        {
            "name": "Sarah Jenkins",
            "phone": "+1 415 555 0199",
            "email": "sarah.j@acmeventures.com",
            "relationship_type": "client",
            "company": "Acme Ventures",
            "is_vip": True,
            "rule": {
                "auto_reply_allowed": True,
                "calendar_access": True,
                "notes_access": False,
                "message_style": "professional",
                "max_autonomy_level": 2,
                "require_approval_always": False
            }
        },
        {
            "name": "Unknown Inquirer",
            "phone": "+91 99999 88888",
            "email": "stranger@unknown.org",
            "relationship_type": "unknown",
            "is_vip": False,
            "rule": {
                "auto_reply_allowed": True,
                "calendar_access": False,
                "notes_access": False,
                "message_style": "neutral",
                "max_autonomy_level": 1,
                "require_approval_always": True
            }
        }
    ]

    for c in contacts_data:
        c_stmt = select(Contact).where(Contact.name == c["name"])
        c_res = await db.execute(c_stmt)
        existing_contact = c_res.scalar_one_or_none()
        if not existing_contact:
            contact = Contact(
                name=c["name"],
                phone=c.get("phone"),
                email=c.get("email"),
                relationship_type=c["relationship_type"],
                company=c.get("company"),
                is_vip=c["is_vip"]
            )
            db.add(contact)
            await db.flush()

            rule_data = c["rule"]
            rule = ContactRule(
                contact_id=contact.id,
                auto_reply_allowed=rule_data["auto_reply_allowed"],
                calendar_access=rule_data["calendar_access"],
                notes_access=rule_data["notes_access"],
                message_style=rule_data["message_style"],
                max_autonomy_level=rule_data["max_autonomy_level"],
                require_approval_always=rule_data["require_approval_always"]
            )
            db.add(rule)

    # 5. Knowledge Items
    knowledge_data = [
        ("calendar", "Upcoming Lab Presentation", "Monday 10:00 AM - 11:30 AM at Seminar Hall 2", "AUTHORIZED_CONTACTS"),
        ("calendar", "AI Team Sync", "Wednesday 3:00 PM - 4:00 PM on Google Meet", "AUTHORIZED_CONTACTS"),
        ("availability", "Standard Schedule", "Ashay is available weekdays 9:00 AM to 6:00 PM IST; unavailable late nights.", "PUBLIC"),
        ("note", "Ashay's Private Notes & Master Passwords", "Confidential login passwords and private banking PINs. NEVER REVEAL.", "STRICT_PRIVATE"),
        ("task", "Personal AI Representative Milestone", "Deliver Phase 1 working prototype with voice and simulation", "AUTHORIZED_CONTACTS")
    ]
    for cat, title, content, sens in knowledge_data:
        k_stmt = select(KnowledgeItem).where(KnowledgeItem.title == title)
        k_res = await db.execute(k_stmt)
        if not k_res.scalar_one_or_none():
            db.add(KnowledgeItem(category=cat, title=title, content=content, sensitivity=sens))

    await db.commit()

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select, func, inspect, text
from sqlalchemy.exc import IntegrityError
from .config import settings
from .database import Base, engine, get_db, SessionLocal
from .models import User, Wallet, Skill, ServiceRequest, Exchange, Transaction, Review, ChatMessage
from .schemas import RegisterIn, LoginIn, UserOut, ProfileUpdate, SkillIn, RequestIn, ReviewIn, ChatMessageIn, ExchangeScheduleIn
from .security import hash_password, verify_password, create_access_token
from .deps import current_user, admin_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    upgrade_existing_database()
    if settings.seed_demo:
        seed_demo()
    yield

app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=[settings.frontend_url, "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def upgrade_existing_database():
    """Add chat/contact/scheduling columns to existing TimeBank databases safely."""
    additions = {
        "users": {"phone": "VARCHAR(30) NOT NULL DEFAULT ''"},
        "exchanges": {
            "scheduled_at": "VARCHAR(40) NOT NULL DEFAULT ''",
            "meeting_mode": "VARCHAR(20) NOT NULL DEFAULT 'Online'",
            "meeting_link": "VARCHAR(1000) NOT NULL DEFAULT ''",
            "meeting_location": "VARCHAR(255) NOT NULL DEFAULT ''",
            "schedule_notes": "TEXT NOT NULL DEFAULT ''",
        },
    }
    inspector = inspect(engine)
    with engine.begin() as connection:
        for table, columns in additions.items():
            existing = {column["name"] for column in inspector.get_columns(table)}
            for column, definition in columns.items():
                if column not in existing:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))


def seed_demo():
    db = SessionLocal()
    try:
        if db.scalar(select(User).where(User.email == "admin@timebank.local")):
            return
        admin = User(name="TimeBank Admin", email="admin@timebank.local", password_hash=hash_password("Admin123!"), role="admin", bio="Platform administrator", location="Mangalagiri")
        member = User(name="Demo Member", email="member@timebank.local", password_hash=hash_password("Member123!"), bio="I enjoy teaching Python and helping my community.", location="Vijayawada")
        db.add_all([admin, member]); db.flush()
        db.add_all([Wallet(user_id=admin.id, balance=2), Wallet(user_id=member.id, balance=2)])
        db.add(Skill(owner_id=member.id, title="Python basics", description="Learn Python fundamentals in a friendly one-hour session.", category="Education", mode="Online", duration_hours=1))
        db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "TimeBank API is running", "docs": "/docs"}

@app.post("/api/auth/register")
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "An account with this email already exists")
    user = User(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password), location=payload.location.strip(), phone=payload.phone.strip())
    db.add(user); db.flush()
    db.add(Wallet(user_id=user.id, balance=2))
    db.add(Transaction(user_id=user.id, amount=2, entry_type="CREDIT", reference=f"welcome-{user.id}", description="One-time starter allowance"))
    db.commit()
    return {"access_token": create_access_token(user.id), "token_type": "bearer", "user": UserOut.model_validate(user)}

@app.post("/api/auth/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    if not user.is_active:
        raise HTTPException(403, "This account is suspended")
    return {"access_token": create_access_token(user.id), "token_type": "bearer", "user": UserOut.model_validate(user)}

@app.get("/api/users/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user

@app.put("/api/users/me", response_model=UserOut)
def update_me(payload: ProfileUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit(); db.refresh(user)
    return user

@app.get("/api/users")
def list_users(q: str = "", db: Session = Depends(get_db), user: User = Depends(current_user)):
    stmt = select(User).where(User.is_active == True, User.id != user.id)
    if q:
        stmt = stmt.where(User.name.ilike(f"%{q}%") | User.location.ilike(f"%{q}%"))
    return [{"id": u.id, "name": u.name, "bio": u.bio, "location": u.location, "skills": [s.title for s in u.skills if s.active]} for u in db.scalars(stmt.order_by(User.name).limit(100)).all()]

@app.post("/api/skills")
def create_skill(payload: SkillIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    skill = Skill(owner_id=user.id, **payload.model_dump())
    db.add(skill); db.commit(); db.refresh(skill)
    return skill_out(skill)

def skill_out(s):
    return {"id": s.id, "owner_id": s.owner_id, "owner_name": s.owner.name, "title": s.title, "description": s.description, "category": s.category, "mode": s.mode, "duration_hours": s.duration_hours}

@app.get("/api/skills")
def list_skills(q: str = "", category: str = "", db: Session = Depends(get_db), user: User = Depends(current_user)):
    stmt = select(Skill).join(User).where(Skill.active == True, User.is_active == True)
    if q: stmt = stmt.where(Skill.title.ilike(f"%{q}%") | Skill.description.ilike(f"%{q}%"))
    if category: stmt = stmt.where(Skill.category == category)
    return [skill_out(s) for s in db.scalars(stmt.order_by(Skill.created_at.desc()).limit(100)).all()]

@app.delete("/api/skills/{skill_id}")
def delete_skill(skill_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    skill = db.get(Skill, skill_id)
    if not skill: raise HTTPException(404, "Skill not found")
    if skill.owner_id != user.id and user.role != "admin": raise HTTPException(403, "Not allowed")
    skill.active = False; db.commit()
    return {"message": "Skill removed"}

@app.post("/api/requests")
def create_request(payload: RequestIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    skill = db.get(Skill, payload.skill_id)
    if not skill or not skill.active: raise HTTPException(404, "Skill not found")
    if skill.owner_id == user.id: raise HTTPException(400, "You cannot request your own skill")
    req = ServiceRequest(skill_id=skill.id, requester_id=user.id, provider_id=skill.owner_id, message=payload.message, preferred_date=payload.preferred_date)
    db.add(req); db.commit(); db.refresh(req)
    return request_out(req)

def request_out(r):
    return {"id": r.id, "skill_id": r.skill_id, "skill_title": r.skill.title, "requester_id": r.requester_id, "requester_name": r.skill.owner.name if r.requester_id == r.provider_id else "", "provider_id": r.provider_id, "provider_name": r.skill.owner.name, "message": r.message, "preferred_date": r.preferred_date, "status": r.status}

@app.get("/api/requests")
def my_requests(user: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(ServiceRequest).where((ServiceRequest.requester_id == user.id) | (ServiceRequest.provider_id == user.id)).order_by(ServiceRequest.created_at.desc())).all()
    return [request_out(r) for r in rows]

@app.patch("/api/requests/{request_id}/{action}")
def request_action(request_id: int, action: str, user: User = Depends(current_user), db: Session = Depends(get_db)):
    req = db.get(ServiceRequest, request_id)
    if not req: raise HTTPException(404, "Request not found")
    if req.provider_id != user.id: raise HTTPException(403, "Only the provider can respond")
    if req.status != "PENDING": raise HTTPException(409, "Request is no longer pending")
    if action == "decline":
        req.status = "DECLINED"; db.commit(); return {"status": req.status}
    if action != "accept": raise HTTPException(400, "Action must be accept or decline")
    hours = req.skill.duration_hours
    requester_wallet = db.scalar(select(Wallet).where(Wallet.user_id == req.requester_id))
    if not requester_wallet or requester_wallet.balance < hours: raise HTTPException(400, "Requester has insufficient credits")
    req.status = "ACCEPTED"
    exchange = Exchange(request_id=req.id, requester_id=req.requester_id, provider_id=req.provider_id, credits=hours, status="SCHEDULED")
    db.add(exchange); db.commit()
    return {"status": req.status, "exchange_id": exchange.id}

@app.get("/api/exchanges")
def exchanges(user: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Exchange).where((Exchange.requester_id == user.id) | (Exchange.provider_id == user.id)).order_by(Exchange.created_at.desc())).all()
    result = []
    for e in rows:
        requester = db.get(User, e.requester_id)
        provider = db.get(User, e.provider_id)
        request = db.get(ServiceRequest, e.request_id)
        partner = provider if user.id == e.requester_id else requester
        result.append({
            "id": e.id, "request_id": e.request_id, "requester_id": e.requester_id, "provider_id": e.provider_id,
            "requester_name": requester.name, "provider_name": provider.name, "requester_phone": requester.phone,
            "provider_phone": provider.phone, "requester_location": requester.location, "provider_location": provider.location,
            "partner_name": partner.name, "partner_phone": partner.phone, "partner_location": partner.location,
            "skill_title": request.skill.title, "credits": e.credits, "status": e.status,
            "requester_confirmed": e.requester_confirmed, "provider_confirmed": e.provider_confirmed, "credits_settled": e.credits_settled,
            "scheduled_at": e.scheduled_at, "meeting_mode": e.meeting_mode, "meeting_link": e.meeting_link,
            "meeting_location": e.meeting_location, "schedule_notes": e.schedule_notes,
        })
    return result


def get_exchange_for_member(exchange_id: int, user: User, db: Session) -> Exchange:
    exchange = db.get(Exchange, exchange_id)
    if not exchange:
        raise HTTPException(404, "Exchange not found")
    if user.id not in (exchange.requester_id, exchange.provider_id):
        raise HTTPException(403, "You are not a participant in this exchange")
    return exchange


@app.get("/api/exchanges/{exchange_id}/messages")
def list_exchange_messages(exchange_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    get_exchange_for_member(exchange_id, user, db)
    rows = db.scalars(select(ChatMessage).where(ChatMessage.exchange_id == exchange_id).order_by(ChatMessage.created_at.asc()).limit(300)).all()
    return [{"id": m.id, "exchange_id": m.exchange_id, "sender_id": m.sender_id, "sender_name": m.sender.name, "body": m.body, "created_at": m.created_at.isoformat()} for m in rows]


@app.post("/api/exchanges/{exchange_id}/messages")
def send_exchange_message(exchange_id: int, payload: ChatMessageIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    exchange = get_exchange_for_member(exchange_id, user, db)
    if exchange.status == "CANCELLED":
        raise HTTPException(409, "Chat is unavailable for a cancelled exchange")
    body = payload.body.strip()
    if not body:
        raise HTTPException(400, "Message cannot be empty")
    message = ChatMessage(exchange_id=exchange.id, sender_id=user.id, body=body)
    db.add(message); db.commit(); db.refresh(message)
    return {"id": message.id, "exchange_id": message.exchange_id, "sender_id": message.sender_id, "sender_name": user.name, "body": message.body, "created_at": message.created_at.isoformat()}


@app.patch("/api/exchanges/{exchange_id}/schedule")
def update_exchange_schedule(exchange_id: int, payload: ExchangeScheduleIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    exchange = get_exchange_for_member(exchange_id, user, db)
    if exchange.status == "COMPLETED":
        raise HTTPException(409, "A completed exchange can no longer be rescheduled")
    link = payload.meeting_link.strip()
    if link and payload.meeting_mode == "Online" and not link.startswith(("https://", "http://")):
        raise HTTPException(400, "Meeting link must start with http:// or https://")
    if payload.meeting_mode == "In-person" and not payload.meeting_location.strip():
        raise HTTPException(400, "Please provide a public meeting location for an in-person session")
    exchange.scheduled_at = payload.scheduled_at.strip()
    exchange.meeting_mode = payload.meeting_mode
    exchange.meeting_link = link if payload.meeting_mode == "Online" else ""
    exchange.meeting_location = payload.meeting_location.strip() if payload.meeting_mode == "In-person" else ""
    exchange.schedule_notes = payload.schedule_notes.strip()
    db.commit(); db.refresh(exchange)
    return {"message": "Schedule updated for both participants", "scheduled_at": exchange.scheduled_at, "meeting_mode": exchange.meeting_mode, "meeting_link": exchange.meeting_link, "meeting_location": exchange.meeting_location, "schedule_notes": exchange.schedule_notes}

@app.patch("/api/exchanges/{exchange_id}/confirm")
def confirm_exchange(exchange_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        ex = db.scalar(select(Exchange).where(Exchange.id == exchange_id).with_for_update())
        if not ex: raise HTTPException(404, "Exchange not found")
        if user.id not in (ex.requester_id, ex.provider_id): raise HTTPException(403, "Not part of this exchange")
        if ex.credits_settled: raise HTTPException(409, "Credits already settled")
        if user.id == ex.requester_id: ex.requester_confirmed = True
        else: ex.provider_confirmed = True
        ex.status = "AWAITING_CONFIRMATION"
        if ex.requester_confirmed and ex.provider_confirmed:
            wallets = db.scalars(select(Wallet).where(Wallet.user_id.in_([ex.requester_id, ex.provider_id])).order_by(Wallet.user_id).with_for_update()).all()
            by_user = {w.user_id: w for w in wallets}
            if ex.requester_id not in by_user or ex.provider_id not in by_user:
                raise HTTPException(409, "Wallet record missing")
            debit, credit = by_user[ex.requester_id], by_user[ex.provider_id]
            if debit.balance < ex.credits: raise HTTPException(400, "Insufficient credits at settlement")
            debit.balance -= ex.credits; credit.balance += ex.credits
            ref = f"exchange-{ex.id}"
            db.add_all([
                Transaction(user_id=ex.requester_id, amount=-ex.credits, entry_type="DEBIT", reference=ref, description=f"Service exchange #{ex.id}"),
                Transaction(user_id=ex.provider_id, amount=ex.credits, entry_type="CREDIT", reference=ref, description=f"Service exchange #{ex.id}")
            ])
            ex.credits_settled = True; ex.status = "COMPLETED"
        db.commit()
        return {"status": ex.status, "credits_settled": ex.credits_settled}
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "This exchange was already settled")
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

@app.get("/api/wallet")
def wallet(user: User = Depends(current_user), db: Session = Depends(get_db)):
    w = db.scalar(select(Wallet).where(Wallet.user_id == user.id))
    if not w:
        w = Wallet(user_id=user.id, balance=0); db.add(w); db.commit(); db.refresh(w)
    return {"balance": w.balance}

@app.get("/api/wallet/transactions")
def ledger(user: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Transaction).where(Transaction.user_id == user.id).order_by(Transaction.created_at.desc()).limit(100)).all()
    return [{"id": t.id, "amount": t.amount, "entry_type": t.entry_type, "reference": t.reference, "description": t.description, "created_at": t.created_at.isoformat()} for t in rows]

@app.post("/api/reviews")
def create_review(payload: ReviewIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    ex = db.get(Exchange, payload.exchange_id)
    if not ex or ex.status != "COMPLETED": raise HTTPException(400, "Reviews require a completed exchange")
    if user.id not in (ex.requester_id, ex.provider_id): raise HTTPException(403, "Not part of this exchange")
    target = ex.provider_id if user.id == ex.requester_id else ex.requester_id
    review = Review(exchange_id=ex.id, reviewer_id=user.id, target_id=target, rating=payload.rating, comment=payload.comment)
    db.add(review)
    try: db.commit()
    except IntegrityError: db.rollback(); raise HTTPException(409, "You already reviewed this exchange")
    return {"message": "Review submitted"}

@app.get("/api/admin/dashboard")
def admin_dashboard(user: User = Depends(admin_user), db: Session = Depends(get_db)):
    return {"users": db.scalar(select(func.count(User.id))) or 0, "skills": db.scalar(select(func.count(Skill.id)).where(Skill.active == True)) or 0, "requests": db.scalar(select(func.count(ServiceRequest.id))) or 0, "completed_exchanges": db.scalar(select(func.count(Exchange.id)).where(Exchange.status == "COMPLETED")) or 0}

@app.get("/api/admin/users")
def admin_users(user: User = Depends(admin_user), db: Session = Depends(get_db)):
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "is_active": u.is_active} for u in db.scalars(select(User).order_by(User.created_at.desc()).limit(200)).all()]

@app.patch("/api/admin/users/{user_id}/suspend")
def suspend_user(user_id: int, user: User = Depends(admin_user), db: Session = Depends(get_db)):
    target = db.get(User, user_id)
    if not target: raise HTTPException(404, "User not found")
    if target.id == user.id: raise HTTPException(400, "You cannot suspend your own account")
    target.is_active = not target.is_active; db.commit()
    return {"is_active": target.is_active}
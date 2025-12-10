from sqlalchemy.orm import Session
from .models import User, PromptSession, PromptVersion, PromptTemplate

def create_user(db: Session, username: str, email: str, role: str):
    db_user = User(username=username, email=email, role=role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_prompt_session(db: Session, user_id: int, domain: str, task_type: str, raw_prompt: str, quality_score: float):
    db_prompt_session = PromptSession(user_id=user_id, domain=domain, task_type=task_type, raw_prompt=raw_prompt, quality_score=quality_score)
    db.add(db_prompt_session)
    db.commit()
    db.refresh(db_prompt_session)
    return db_prompt_session

def get_prompt_session(db: Session, session_id: int):
    return db.query(PromptSession).filter(PromptSession.id == session_id).first()

def create_prompt_version(db: Session, session_id: int, label: str, optimized_prompt: str, was_copied: bool, rating: int):
    db_prompt_version = PromptVersion(session_id=session_id, label=label, optimized_prompt=optimized_prompt, was_copied=was_copied, rating=rating)
    db.add(db_prompt_version)
    db.commit()
    db.refresh(db_prompt_version)
    return db_prompt_version

def get_prompt_versions(db: Session, session_id: int):
    return db.query(PromptVersion).filter(PromptVersion.session_id == session_id).all()

def get_prompt_templates(db: Session):
    return db.query(PromptTemplate).all()
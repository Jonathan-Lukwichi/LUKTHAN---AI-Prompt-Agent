from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from services.prompt_agent import process_message, optimize_prompt
from database import get_db
from database.crud import (
    create_prompt_session,
    create_prompt_version,
    get_recent_sessions,
    get_session_with_versions,
    delete_session,
    clear_all_sessions
)

router = APIRouter()


class ThinkingStep(BaseModel):
    step: str
    thought: str
    icon: str


class MessageRequest(BaseModel):
    user_input: str
    file_content: Optional[str] = None
    file_type: Optional[str] = None
    settings: dict = {}


class MessageResponse(BaseModel):
    # Core response
    response: Optional[str] = None
    response_type: str  # conversation, question, prompt_optimization, hybrid, smart, wisdom
    intent: str  # What the agent detected: conversation, question, prompt_optimization, hybrid

    # Thinking process (visible to user)
    thinking: List[ThinkingStep]

    # Prompt optimization specific (only present if intent is prompt_optimization)
    optimized_prompt: Optional[str] = None
    task_type: Optional[str] = None

    # Common fields
    quality_score: int
    domain: str
    suggestions: List[str]
    metadata: Dict[str, Any]


# Legacy endpoint for backward compatibility
class OptimizePromptRequest(BaseModel):
    user_input: str
    file_content: Optional[str] = None
    file_type: Optional[str] = None
    settings: dict


class OptimizePromptResponse(BaseModel):
    optimized_prompt: str
    quality_score: int
    domain: str
    task_type: str
    suggestions: List[str]
    metadata: dict


@router.post("/chat", response_model=MessageResponse)
async def chat_endpoint(request: MessageRequest, db: Session = Depends(get_db)):
    """
    Main intelligent chat endpoint.
    Automatically detects intent and responds appropriately:
    - Conversations: Natural, friendly responses
    - Questions: Thoughtful, wise answers
    - Prompt requests: Optimized AI prompts
    """
    try:
        result = await process_message(
            request.user_input,
            request.file_content,
            request.file_type,
            request.settings
        )

        # Save to database if it's a prompt optimization
        if result.get("intent") == "prompt_optimization" and result.get("optimized_prompt"):
            try:
                # Create a session (user_id=1 for anonymous users)
                session = create_prompt_session(
                    db=db,
                    user_id=1,
                    domain=result.get("domain", "general"),
                    task_type=result.get("task_type", "general_query"),
                    raw_prompt=request.user_input,
                    quality_score=result.get("quality_score", 0)
                )

                # Create the optimized version
                create_prompt_version(
                    db=db,
                    session_id=session.id,
                    label="v1",
                    optimized_prompt=result.get("optimized_prompt", ""),
                    was_copied=False,
                    rating=0
                )

                # Add session_id to result for frontend
                result["session_id"] = session.id
            except Exception as db_error:
                # Don't fail the request if DB save fails
                print(f"[LUKTHAN] DB save error (non-fatal): {db_error}")
                result["session_id"] = None  # Ensure session_id is always present

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/optimize", response_model=OptimizePromptResponse)
async def optimize_prompt_endpoint(request: OptimizePromptRequest):
    """Legacy endpoint for prompt optimization only."""
    try:
        result = await optimize_prompt(
            request.user_input,
            request.file_content,
            request.file_type,
            request.settings
        )
        # Extract only the fields needed for legacy response
        return {
            "optimized_prompt": result.get("optimized_prompt", result.get("response", "")),
            "quality_score": result.get("quality_score", 80),
            "domain": result.get("domain", "general"),
            "task_type": result.get("task_type", "general_query"),
            "suggestions": result.get("suggestions", []),
            "metadata": result.get("metadata", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# History Response Models
class HistoryItem(BaseModel):
    id: int
    raw_prompt: str
    domain: str
    task_type: str
    quality_score: float
    created_at: str

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    sessions: List[HistoryItem]
    total: int


@router.get("/history", response_model=HistoryResponse)
async def get_history(limit: int = 20, db: Session = Depends(get_db)):
    """Get recent prompt history."""
    try:
        sessions = get_recent_sessions(db, limit)
        return {
            "sessions": [
                {
                    "id": s.id,
                    "raw_prompt": s.raw_prompt[:100] + "..." if len(s.raw_prompt) > 100 else s.raw_prompt,
                    "domain": s.domain,
                    "task_type": s.task_type,
                    "quality_score": s.quality_score,
                    "created_at": s.created_at.isoformat()
                }
                for s in sessions
            ],
            "total": len(sessions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}")
async def get_session_detail(session_id: int, db: Session = Depends(get_db)):
    """Get a specific session with its versions."""
    try:
        result = get_session_with_versions(db, session_id)
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")

        session = result["session"]
        versions = result["versions"]

        return {
            "id": session.id,
            "raw_prompt": session.raw_prompt,
            "domain": session.domain,
            "task_type": session.task_type,
            "quality_score": session.quality_score,
            "created_at": session.created_at.isoformat(),
            "versions": [
                {
                    "id": v.id,
                    "label": v.label,
                    "optimized_prompt": v.optimized_prompt,
                    "was_copied": v.was_copied,
                    "rating": v.rating,
                    "created_at": v.created_at.isoformat()
                }
                for v in versions
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history/{session_id}")
async def delete_session_endpoint(session_id: int, db: Session = Depends(get_db)):
    """Delete a specific session."""
    try:
        delete_session(db, session_id)
        return {"success": True, "message": "Session deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history")
async def clear_history(db: Session = Depends(get_db)):
    """Clear all history."""
    try:
        clear_all_sessions(db)
        return {"success": True, "message": "All history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

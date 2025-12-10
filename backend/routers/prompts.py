from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.prompt_agent import process_message, optimize_prompt

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
async def chat_endpoint(request: MessageRequest):
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

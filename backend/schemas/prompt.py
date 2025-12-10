from pydantic import BaseModel
from typing import Optional, List

class PromptRequest(BaseModel):
    user_input: str
    file_content: Optional[str] = None
    file_type: Optional[str] = None
    settings: dict

class PromptResponse(BaseModel):
    optimized_prompt: str
    quality_score: int
    domain: str
    task_type: str
    suggestions: List[str]
    metadata: dict
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Union
from services.file_processor import process_file

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    try:
        content, file_type = await process_file(file)
        return {"content": content, "file_type": file_type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from typing import Union, Tuple
import os
import tempfile
import io
from fastapi import UploadFile

# Conditional imports for optional dependencies
try:
    from PyPDF2 import PdfReader
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    from docx import Document
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False

try:
    from PIL import Image
    import pytesseract
    IMAGE_OCR_SUPPORT = True
except ImportError:
    IMAGE_OCR_SUPPORT = False


# File type categorization
FILE_TYPE_MAPPING = {
    # Documents
    "application/pdf": ("documents", "pdf"),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ("documents", "docx"),
    "application/msword": ("documents", "doc"),
    "text/plain": ("documents", "txt"),
    "text/markdown": ("documents", "md"),

    # Code files
    "text/x-python": ("code", "python"),
    "application/javascript": ("code", "javascript"),
    "text/javascript": ("code", "javascript"),
    "application/typescript": ("code", "typescript"),
    "text/x-java": ("code", "java"),
    "text/x-c": ("code", "c"),
    "text/x-c++": ("code", "cpp"),
    "text/css": ("code", "css"),
    "text/html": ("code", "html"),
    "application/json": ("code", "json"),
    "application/xml": ("code", "xml"),
    "text/xml": ("code", "xml"),

    # Images
    "image/png": ("images", "png"),
    "image/jpeg": ("images", "jpg"),
    "image/jpg": ("images", "jpg"),
    "image/gif": ("images", "gif"),
    "image/webp": ("images", "webp"),

    # Audio
    "audio/wav": ("audio", "wav"),
    "audio/wave": ("audio", "wav"),
    "audio/x-wav": ("audio", "wav"),
    "audio/mpeg": ("audio", "mp3"),
    "audio/mp3": ("audio", "mp3"),
}

# Extension-based fallback mapping
EXTENSION_MAPPING = {
    ".pdf": ("documents", "pdf"),
    ".docx": ("documents", "docx"),
    ".doc": ("documents", "doc"),
    ".txt": ("documents", "txt"),
    ".md": ("documents", "md"),
    ".py": ("code", "python"),
    ".js": ("code", "javascript"),
    ".ts": ("code", "typescript"),
    ".tsx": ("code", "typescript"),
    ".jsx": ("code", "javascript"),
    ".java": ("code", "java"),
    ".c": ("code", "c"),
    ".cpp": ("code", "cpp"),
    ".h": ("code", "c"),
    ".hpp": ("code", "cpp"),
    ".css": ("code", "css"),
    ".html": ("code", "html"),
    ".json": ("code", "json"),
    ".xml": ("code", "xml"),
    ".sql": ("code", "sql"),
    ".sh": ("code", "shell"),
    ".yaml": ("code", "yaml"),
    ".yml": ("code", "yaml"),
    ".png": ("images", "png"),
    ".jpg": ("images", "jpg"),
    ".jpeg": ("images", "jpg"),
    ".gif": ("images", "gif"),
    ".webp": ("images", "webp"),
    ".wav": ("audio", "wav"),
    ".mp3": ("audio", "mp3"),
}


async def process_file(file: UploadFile) -> Tuple[str, str]:
    """
    Process an uploaded file and extract its content.
    Returns: Tuple of (extracted_content, file_type_category)
    """
    # Get file type info
    content_type = file.content_type or ""
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    # Determine file category and specific type
    if content_type in FILE_TYPE_MAPPING:
        category, specific_type = FILE_TYPE_MAPPING[content_type]
    elif ext in EXTENSION_MAPPING:
        category, specific_type = EXTENSION_MAPPING[ext]
    else:
        # Default to documents/text for unknown types
        category, specific_type = "documents", "txt"

    # Read file content
    file_content = await file.read()

    # Extract text based on file type
    extracted_text = ""

    if specific_type == "pdf":
        extracted_text = extract_text_from_pdf(file_content)
    elif specific_type == "docx":
        extracted_text = extract_text_from_docx(file_content)
    elif specific_type in ["png", "jpg", "gif", "webp"]:
        extracted_text = extract_text_from_image(file_content, specific_type)
    elif category == "code" or specific_type in ["txt", "md"]:
        # For code and text files, decode directly
        try:
            extracted_text = file_content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                extracted_text = file_content.decode("latin-1")
            except (UnicodeDecodeError, LookupError) as e:
                extracted_text = f"[Unable to decode file content: {type(e).__name__}]"
    elif category == "audio":
        extracted_text = "[Audio file - use voice transcription endpoint]"
    else:
        extracted_text = "[Unsupported file type]"

    return extracted_text, category


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file content."""
    if not PDF_SUPPORT:
        return "[PDF support not available - install PyPDF2]"

    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n".join(text_parts)
    except Exception as e:
        return f"[Error extracting PDF text: {str(e)}]"


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file content."""
    if not DOCX_SUPPORT:
        return "[DOCX support not available - install python-docx]"

    try:
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        return f"[Error extracting DOCX text: {str(e)}]"


def extract_text_from_image(file_content: bytes, image_type: str) -> str:
    """Extract text from image using OCR."""
    if not IMAGE_OCR_SUPPORT:
        return "[Image OCR not available - install Pillow and pytesseract]"

    try:
        image_file = io.BytesIO(file_content)
        image = Image.open(image_file)
        text = pytesseract.image_to_string(image)
        return text.strip() if text.strip() else "[No text detected in image]"
    except Exception as e:
        return f"[Error extracting image text: {str(e)}]"


class FileProcessor:
    """Legacy class for backward compatibility."""

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        with open(file_path, "rb") as f:
            return extract_text_from_pdf(f.read())

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        with open(file_path, "rb") as f:
            return extract_text_from_docx(f.read())

    @staticmethod
    def extract_text_from_image(file_path: str) -> str:
        with open(file_path, "rb") as f:
            ext = os.path.splitext(file_path)[1].lower().replace(".", "")
            return extract_text_from_image(f.read(), ext)

    @staticmethod
    def extract_text(file_path: str, file_type: str) -> Union[str, None]:
        if file_type == "pdf":
            return FileProcessor.extract_text_from_pdf(file_path)
        elif file_type == "docx":
            return FileProcessor.extract_text_from_docx(file_path)
        elif file_type in ["png", "jpg", "jpeg"]:
            return FileProcessor.extract_text_from_image(file_path)
        return None

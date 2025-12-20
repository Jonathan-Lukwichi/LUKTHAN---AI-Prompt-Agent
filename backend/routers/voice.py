from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os
import subprocess

# Get ffmpeg path from imageio-ffmpeg package
FFMPEG_PATH = None
try:
    import imageio_ffmpeg
    FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"[LUKTHAN Voice] Using ffmpeg from imageio: {FFMPEG_PATH}")
except ImportError:
    print("[LUKTHAN Voice] imageio-ffmpeg not installed, checking system ffmpeg...")
    # Check if ffmpeg is in PATH
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, timeout=5)
        if result.returncode == 0:
            FFMPEG_PATH = 'ffmpeg'
            print("[LUKTHAN Voice] Using system ffmpeg")
    except:
        pass

if FFMPEG_PATH is None:
    print("[LUKTHAN Voice] WARNING: No ffmpeg found! Audio conversion will fail.")

router = APIRouter()


def convert_to_wav(input_path: str, output_path: str) -> bool:
    """Convert audio file to WAV using ffmpeg directly."""
    if not FFMPEG_PATH:
        return False

    try:
        cmd = [
            FFMPEG_PATH,
            '-y',  # Overwrite output
            '-i', input_path,  # Input file
            '-ar', '16000',  # Sample rate
            '-ac', '1',  # Mono
            '-f', 'wav',  # WAV format
            output_path
        ]
        result = subprocess.run(cmd, capture_output=True, timeout=30)
        if result.returncode == 0:
            print(f"[LUKTHAN Voice] Converted to WAV: {output_path}")
            return True
        else:
            print(f"[LUKTHAN Voice] FFmpeg error: {result.stderr.decode()}")
            return False
    except Exception as e:
        print(f"[LUKTHAN Voice] Conversion error: {e}")
        return False


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Transcribe audio file to text using Google Speech Recognition.
    Accepts: WAV, MP3, WebM, OGG, MP4 audio formats.
    """
    # Accept various audio formats including browser-recorded formats
    allowed_types = [
        "audio/wav", "audio/wave", "audio/x-wav",
        "audio/mpeg", "audio/mp3",
        "audio/webm", "audio/ogg", "audio/mp4",
        "audio/webm;codecs=opus", "audio/ogg;codecs=opus",
        "video/webm",  # Some browsers send webm as video
        "application/octet-stream",  # Fallback for unknown types
    ]

    # Get content type and normalize it
    content_type = file.content_type or "application/octet-stream"
    base_content_type = content_type.split(";")[0].strip()

    print(f"[LUKTHAN Voice] Received file: {file.filename}, content_type: {content_type}")

    # Be lenient with content types - check filename extension too
    is_allowed = base_content_type in [t.split(";")[0] for t in allowed_types]

    # Also allow based on filename extension
    if file.filename:
        ext = file.filename.lower().split('.')[-1] if '.' in file.filename else ''
        if ext in ['wav', 'mp3', 'webm', 'ogg', 'mp4', 'm4a']:
            is_allowed = True

    if not is_allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Accepted types: WAV, MP3, WebM, OGG. Got: {content_type}"
        )

    temp_files = []

    try:
        # Read audio data
        audio_data = await file.read()
        print(f"[LUKTHAN Voice] Read {len(audio_data)} bytes")

        if len(audio_data) < 1000:
            return {"transcription": "Recording too short. Please speak for at least 1 second.", "success": False}

        # Determine file extension from content type or filename
        ext_map = {
            "audio/wav": ".wav", "audio/wave": ".wav", "audio/x-wav": ".wav",
            "audio/mpeg": ".mp3", "audio/mp3": ".mp3",
            "audio/webm": ".webm", "video/webm": ".webm",
            "audio/ogg": ".ogg",
            "audio/mp4": ".mp4", "audio/m4a": ".m4a",
        }
        suffix = ext_map.get(base_content_type, ".webm")

        # Also check filename extension
        if file.filename:
            if file.filename.endswith(".webm"):
                suffix = ".webm"
            elif file.filename.endswith(".ogg"):
                suffix = ".ogg"
            elif file.filename.endswith(".mp3"):
                suffix = ".mp3"
            elif file.filename.endswith(".wav"):
                suffix = ".wav"

        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(audio_data)
            tmp_path = tmp_file.name
        temp_files.append(tmp_path)
        print(f"[LUKTHAN Voice] Saved temp file: {tmp_path}")

        try:
            # Import speech recognition
            import speech_recognition as sr
            recognizer = sr.Recognizer()

            wav_path = tmp_path

            # Convert non-WAV formats to WAV using ffmpeg
            if suffix != ".wav":
                print(f"[LUKTHAN Voice] Converting {suffix} to WAV...")
                wav_path = tmp_path.replace(suffix, ".wav")
                temp_files.append(wav_path)

                if not convert_to_wav(tmp_path, wav_path):
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to convert audio format. FFmpeg may not be installed or configured correctly."
                    )

            # Transcribe using Google Speech Recognition
            print(f"[LUKTHAN Voice] Transcribing from: {wav_path}")
            with sr.AudioFile(wav_path) as source:
                audio = recognizer.record(source)
                transcription = recognizer.recognize_google(audio)
                print(f"[LUKTHAN Voice] Transcription: {transcription[:50] if len(transcription) > 50 else transcription}...")

            return {"transcription": transcription, "success": True}

        except sr.UnknownValueError:
            print("[LUKTHAN Voice] Could not understand audio")
            return {"transcription": "Could not understand audio. Please speak clearly and try again.", "success": False}
        except sr.RequestError as e:
            print(f"[LUKTHAN Voice] Google API error: {e}")
            raise HTTPException(status_code=503, detail=f"Speech recognition service unavailable: {str(e)}")
        except ImportError as e:
            print(f"[LUKTHAN Voice] Missing dependency: {e}")
            raise HTTPException(
                status_code=500,
                detail="Voice transcription requires speech_recognition package. Please install it."
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[LUKTHAN Voice] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up all temp files
        for file_path in temp_files:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass  # Ignore cleanup errors

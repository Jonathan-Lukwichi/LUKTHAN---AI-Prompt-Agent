from fastapi import APIRouter, UploadFile, File, HTTPException
import io
import tempfile
import os

router = APIRouter()


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Accept various audio formats
    allowed_types = ["audio/wav", "audio/wave", "audio/x-wav", "audio/mpeg", "audio/mp3"]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Accepted types: WAV, MP3. Got: {file.content_type}"
        )

    try:
        # Read audio data
        audio_data = await file.read()

        # Save to temporary file for processing
        suffix = ".wav" if "wav" in file.content_type else ".mp3"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(audio_data)
            tmp_path = tmp_file.name

        # Track all temp files for cleanup
        temp_files = [tmp_path]

        try:
            # Import here to avoid issues if dependencies aren't installed
            import speech_recognition as sr

            recognizer = sr.Recognizer()

            # Convert to wav if needed using pydub
            if suffix == ".mp3":
                from pydub import AudioSegment
                audio = AudioSegment.from_mp3(tmp_path)
                wav_path = tmp_path.replace(".mp3", ".wav")
                audio.export(wav_path, format="wav")
                temp_files.append(wav_path)
                tmp_path = wav_path

            # Transcribe
            with sr.AudioFile(tmp_path) as source:
                audio_data = recognizer.record(source)
                transcription = recognizer.recognize_google(audio_data)

            return {"transcription": transcription, "success": True}

        finally:
            # Clean up all temp files
            for file_path in temp_files:
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass  # Ignore cleanup errors

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

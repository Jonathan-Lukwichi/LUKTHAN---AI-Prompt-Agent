from pydub import AudioSegment
import speech_recognition as sr

class VoiceProcessor:
    def __init__(self):
        self.recognizer = sr.Recognizer()

    def transcribe_audio(self, audio_file_path: str) -> dict:
        try:
            audio = AudioSegment.from_wav(audio_file_path)
            with sr.AudioFile(audio_file_path) as source:
                audio_data = self.recognizer.record(source)
                transcription = self.recognizer.recognize_google(audio_data)
            return {"transcription": transcription, "success": True}
        except Exception as e:
            return {"transcription": str(e), "success": False}
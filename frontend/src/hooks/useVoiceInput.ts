import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeVoice } from '../api/client';
import toast from 'react-hot-toast';

interface UseVoiceInputOptions {
  onTranscription: (transcription: string) => void;
  onError?: (error: string) => void;
}

// Helper to get the best supported audio format
const getSupportedMimeType = (): { mimeType: string; extension: string } => {
  const formats = [
    { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
    { mimeType: 'audio/webm', extension: 'webm' },
    { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
    { mimeType: 'audio/ogg', extension: 'ogg' },
    { mimeType: 'audio/mp4', extension: 'mp4' },
    { mimeType: 'audio/wav', extension: 'wav' },
  ];

  for (const format of formats) {
    if (MediaRecorder.isTypeSupported(format.mimeType)) {
      return format;
    }
  }
  return { mimeType: 'audio/webm', extension: 'webm' };
};

export const useVoiceInput = ({ onTranscription, onError }: UseVoiceInputOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<{ mimeType: string; extension: string }>({ mimeType: 'audio/webm', extension: 'webm' });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get the best supported format
      const format = getSupportedMimeType();
      mimeTypeRef.current = format;
      console.log('[Voice] Using audio format:', format.mimeType);

      const recorder = new MediaRecorder(stream, { mimeType: format.mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        try {
          // Use the actual recorded MIME type
          const format = mimeTypeRef.current;
          const audioBlob = new Blob(chunksRef.current, { type: format.mimeType });
          console.log('[Voice] Sending audio blob:', audioBlob.size, 'bytes, type:', format.mimeType);

          const response = await transcribeVoice(audioBlob, format.extension);

          if (response.success && response.transcription) {
            onTranscription(response.transcription);
            toast.success('Voice transcribed successfully!');
          } else {
            throw new Error(response.transcription || 'Transcription failed');
          }
        } catch (err: any) {
          console.error('[Voice] Transcription error:', err);
          const errorMsg = err.message || 'Failed to transcribe voice. Please try again.';
          onError?.(errorMsg);
          toast.error(errorMsg);
        } finally {
          setIsProcessing(false);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      toast('Recording started...', { icon: '🎤' });
    } catch (err: any) {
      console.error('[Voice] Recording error:', err);
      const errorMsg = err.name === 'NotAllowedError'
        ? 'Microphone access denied. Please allow microphone access.'
        : 'Failed to start recording.';
      onError?.(errorMsg);
      toast.error(errorMsg);
    }
  }, [onTranscription, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast('Processing audio...', { icon: '⏳' });
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};

export default useVoiceInput;

import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeVoice } from '../api/client';
import toast from 'react-hot-toast';

interface UseVoiceInputOptions {
  onTranscription: (transcription: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceInput = ({ onTranscription, onError }: UseVoiceInputOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try to use WAV format if supported, fallback to webm
      const mimeType = MediaRecorder.isTypeSupported('audio/wav')
        ? 'audio/wav'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
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
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
          const response = await transcribeVoice(audioBlob);

          if (response.success && response.transcription) {
            onTranscription(response.transcription);
            toast.success('Voice transcribed successfully!');
          } else {
            throw new Error('Transcription failed');
          }
        } catch (err: any) {
          const errorMsg = 'Failed to transcribe voice. Please try again.';
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

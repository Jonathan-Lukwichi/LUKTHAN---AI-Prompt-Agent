import axios from 'axios';
import type { Settings, AgentResponse } from '../stores/chatStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Types
export interface ChatRequest {
  user_input: string;
  file_content?: string | null;
  file_type?: string | null;
  settings: Settings;
}

export interface FileUploadResponse {
  content: string;
  file_type: string;
}

export interface VoiceTranscriptionResponse {
  transcription: string;
  success: boolean;
}

// Main chat function - uses the intelligent endpoint
export const sendMessage = async (request: ChatRequest): Promise<AgentResponse> => {
  const response = await apiClient.post<AgentResponse>('/prompts/chat', request);
  return response.data;
};

// Legacy optimize function (for backward compatibility)
export const optimizePrompt = async (request: ChatRequest): Promise<AgentResponse> => {
  const response = await apiClient.post<AgentResponse>('/prompts/optimize', request);
  // Map legacy response to new format
  return {
    ...response.data,
    response: response.data.optimized_prompt || '',
    response_type: 'prompt_optimization',
    intent: 'prompt_optimization',
    thinking: [],
  };
};

export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<FileUploadResponse>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const transcribeVoice = async (audioBlob: Blob): Promise<VoiceTranscriptionResponse> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');

  const response = await apiClient.post<VoiceTranscriptionResponse>('/voice/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default apiClient;

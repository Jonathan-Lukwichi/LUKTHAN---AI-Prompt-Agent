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
  guided_context?: Record<string, any>;
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

export const transcribeVoice = async (audioBlob: Blob, extension: string = 'webm'): Promise<VoiceTranscriptionResponse> => {
  const formData = new FormData();
  formData.append('file', audioBlob, `recording.${extension}`);

  const response = await apiClient.post<VoiceTranscriptionResponse>('/voice/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// History Types
export interface HistoryItem {
  id: number;
  raw_prompt: string;
  domain: string;
  task_type: string;
  quality_score: number;
  created_at: string;
}

export interface HistoryResponse {
  sessions: HistoryItem[];
  total: number;
}

export interface SessionDetail {
  id: number;
  raw_prompt: string;
  domain: string;
  task_type: string;
  quality_score: number;
  created_at: string;
  versions: {
    id: number;
    label: string;
    optimized_prompt: string;
    was_copied: boolean;
    rating: number;
    created_at: string;
  }[];
}

// History API functions
export const getHistory = async (limit: number = 20): Promise<HistoryResponse> => {
  const response = await apiClient.get<HistoryResponse>(`/prompts/history?limit=${limit}`);
  return response.data;
};

export const getSessionDetail = async (sessionId: number): Promise<SessionDetail> => {
  const response = await apiClient.get<SessionDetail>(`/prompts/history/${sessionId}`);
  return response.data;
};

export const deleteSession = async (sessionId: number): Promise<void> => {
  await apiClient.delete(`/prompts/history/${sessionId}`);
};

export const clearHistory = async (): Promise<void> => {
  await apiClient.delete('/prompts/history');
};

export const resetConversation = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>('/prompts/reset-conversation');
  return response.data;
};

export default apiClient;

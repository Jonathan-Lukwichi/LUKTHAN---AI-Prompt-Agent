export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface PromptSession {
  id: number;
  user_id: number;
  domain: string;
  task_type: string;
  raw_prompt: string;
  quality_score: number;
  created_at: string;
}

export interface PromptVersion {
  id: number;
  session_id: number;
  label: string;
  optimized_prompt: string;
  was_copied: boolean;
  rating: number | null;
}

export interface PromptTemplate {
  id: number;
  name: string;
  description: string;
  domain: string;
  task_type: string;
  base_prompt: string;
  tags: string[];
}

export interface OptimizedPromptResponse {
  optimized_prompt: string;
  quality_score: number;
  domain: string;
  task_type: string;
  suggestions: string[];
  metadata: {
    complexity: string;
    confidence: number;
    key_topics: string[];
    detected_language: string;
  };
}

export interface FileUploadResponse {
  content: string;
  file_type: string;
}

export interface VoiceTranscriptionResponse {
  transcription: string;
  success: boolean;
}
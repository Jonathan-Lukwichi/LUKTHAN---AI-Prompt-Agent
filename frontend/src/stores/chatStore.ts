import { create } from 'zustand';

// Thinking step from the agent's reasoning process
export interface ThinkingStep {
  step: string;
  thought: string;
  icon: string;
}

// Response from the intelligent agent
export interface AgentResponse {
  // Core response
  response?: string;
  response_type: 'conversation' | 'question' | 'prompt_optimization' | 'hybrid' | 'smart' | 'wisdom' | 'guided';
  intent: 'conversation' | 'question' | 'prompt_optimization' | 'hybrid' | 'guided';

  // Thinking process (visible to user)
  thinking: ThinkingStep[];

  // Prompt optimization specific
  optimized_prompt?: string;
  task_type?: string;

  // Common fields
  quality_score: number;
  domain: string;
  suggestions: string[];
  metadata: {
    complexity?: string;
    confidence?: number;
    key_topics?: string[];
    detected_language?: string;
    mood?: string;
    conversation_length?: number;
    topic?: string;
    depth?: string;
    approach?: string;
    error?: string;
  };
}

// Legacy type for backward compatibility
export interface OptimizedResponse {
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

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  // User message specific
  fileName?: string;
  fileContent?: string;
  fileType?: string;
  // Agent response specific
  response?: AgentResponse;
  // Thinking state
  isThinking?: boolean;
  thinkingSteps?: ThinkingStep[];
  currentThinkingStep?: number;
}

export interface Settings {
  domain: 'coding' | 'data_science' | 'ai_builder' | 'research';
  mode: 'direct' | 'guided';  // Direct optimizer or Guided expert
  target_ai: string;  // Dynamic: ChatGPT (GPT-4), Claude, Claude (Opus), Gemini, etc.
  expertise_level: 'Beginner' | 'Intermediate' | 'Professional' | 'Expert';
  language: string;
}

// Guided session state for multi-turn conversations
export interface GuidedSession {
  isActive: boolean;
  domain: string;
  step: number;
  collectedInfo: Record<string, string>;
  questions: string[];
}

interface ChatState {
  messages: ChatMessage[];
  settings: Settings;
  guidedSession: GuidedSession;
  isLoading: boolean;
  isThinking: boolean;
  currentThinkingMessage: string | null;
  error: string | null;

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addAgentThinkingMessage: () => string; // Returns the message ID
  updateAgentThinking: (messageId: string, step: number) => void;
  updateAgentResponse: (messageId: string, response: AgentResponse) => void;
  updateLastAgentMessage: (response: AgentResponse) => void;
  clearMessages: () => void;
  setSettings: (settings: Partial<Settings>) => void;
  setLoading: (loading: boolean) => void;
  setThinking: (thinking: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  startGuidedSession: (domain: string) => void;
  updateGuidedSession: (info: Record<string, string>) => void;
  endGuidedSession: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  settings: {
    domain: 'coding',
    mode: 'direct',
    target_ai: 'ChatGPT (GPT-4)',
    expertise_level: 'Professional',
    language: 'English',
  },
  guidedSession: {
    isActive: false,
    domain: '',
    step: 0,
    collectedInfo: {},
    questions: [],
  },
  isLoading: false,
  isThinking: false,
  currentThinkingMessage: null,
  error: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        },
      ],
    })),

  addAgentThinkingMessage: () => {
    const id = generateId();
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id,
          type: 'agent',
          content: '',
          timestamp: new Date(),
          isThinking: true,
          thinkingSteps: [],
          currentThinkingStep: 0,
        },
      ],
    }));
    return id;
  },

  updateAgentThinking: (messageId, step) =>
    set((state) => {
      const messages = state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, currentThinkingStep: step } : msg
      );
      return { messages };
    }),

  updateAgentResponse: (messageId, response) =>
    set((state) => {
      const messages = state.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: response.response || response.optimized_prompt || '',
              response,
              isThinking: false,
              thinkingSteps: response.thinking,
            }
          : msg
      );
      return { messages, isThinking: false };
    }),

  updateLastAgentMessage: (response) =>
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;
      if (lastIndex >= 0 && messages[lastIndex].type === 'agent') {
        messages[lastIndex] = {
          ...messages[lastIndex],
          content: response.response || response.optimized_prompt || '',
          response,
          isThinking: false,
          thinkingSteps: response.thinking,
        };
      }
      return { messages, isThinking: false };
    }),

  clearMessages: () => set({ messages: [] }),

  setSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setThinking: (isThinking, message = null) =>
    set({ isThinking, currentThinkingMessage: message }),

  setError: (error) => set({ error }),

  startGuidedSession: (domain) =>
    set({
      guidedSession: {
        isActive: true,
        domain,
        step: 0,
        collectedInfo: {},
        questions: [],
      },
    }),

  updateGuidedSession: (info) =>
    set((state) => ({
      guidedSession: {
        ...state.guidedSession,
        step: state.guidedSession.step + 1,
        collectedInfo: { ...state.guidedSession.collectedInfo, ...info },
      },
    })),

  endGuidedSession: () =>
    set({
      guidedSession: {
        isActive: false,
        domain: '',
        step: 0,
        collectedInfo: {},
        questions: [],
      },
    }),
}));

export default useChatStore;

import { useCallback } from 'react';
import { sendMessage, uploadFile } from '../api/client';
import { useChatStore, type AgentResponse } from '../stores/chatStore';
import toast from 'react-hot-toast';

export const usePromptAgent = () => {
  const {
    settings,
    addMessage,
    addAgentThinkingMessage,
    updateAgentResponse,
    setLoading,
    setThinking,
    setError,
    isLoading,
    isThinking,
    error,
  } = useChatStore();

  const chat = useCallback(
    async (
      userInput: string,
      fileContent?: string | null,
      fileType?: string | null,
      fileName?: string
    ): Promise<AgentResponse | null> => {
      setLoading(true);
      setThinking(true, 'Processing your message...');
      setError(null);

      try {
        // Add user message
        addMessage({
          type: 'user',
          content: userInput,
          fileContent: fileContent || undefined,
          fileType: fileType || undefined,
          fileName: fileName || undefined,
        });

        // Add placeholder agent message with thinking state
        const agentMessageId = addAgentThinkingMessage();

        // Make API call
        const response = await sendMessage({
          user_input: userInput,
          file_content: fileContent,
          file_type: fileType,
          settings,
        });

        // Update the agent message with response
        updateAgentResponse(agentMessageId, response);

        // Show appropriate toast based on intent
        const toastMessage: Record<string, string> = {
          conversation: 'Message received!',
          question: 'Thoughtful response ready!',
          prompt_optimization: 'Prompt optimized successfully!',
          hybrid: 'Response generated!',
          guided: 'Expert guidance ready!',
        };
        toast.success(toastMessage[response.intent] || 'Response ready!');

        return response;
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Failed to process message. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);

        // Remove the placeholder agent message on error
        const messages = useChatStore.getState().messages;
        if (messages.length > 0 && messages[messages.length - 1].type === 'agent') {
          useChatStore.setState({
            messages: messages.slice(0, -1),
          });
        }

        return null;
      } finally {
        setLoading(false);
        setThinking(false);
      }
    },
    [settings, addMessage, addAgentThinkingMessage, updateAgentResponse, setLoading, setThinking, setError]
  );

  // Legacy function name for backward compatibility
  const optimizePrompt = chat;

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setLoading(true);
      const response = await uploadFile(file);
      toast.success(`File "${file.name}" processed successfully!`);
      return {
        content: response.content,
        type: response.file_type,
        name: file.name,
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to process file.';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const regenerate = useCallback(
    async (userInput: string, fileContent?: string | null, fileType?: string | null) => {
      // Remove last agent message before regenerating
      const messages = useChatStore.getState().messages;
      if (messages.length > 0 && messages[messages.length - 1].type === 'agent') {
        useChatStore.setState({
          messages: messages.slice(0, -1),
        });
      }

      return chat(userInput, fileContent, fileType);
    },
    [chat]
  );

  // Guided wizard prompt - sends structured data from wizard
  const sendGuidedPrompt = useCallback(
    async (prompt: string, context: Record<string, any>) => {
      setLoading(true);
      setThinking(true, 'Generating your optimized prompt...');
      setError(null);

      try {
        // Add user message showing the wizard selections
        const userMessage = `[Guided Mode]\n${prompt}`;
        addMessage({
          type: 'user',
          content: userMessage,
        });

        // Add placeholder agent message
        const agentMessageId = addAgentThinkingMessage();

        // Build enhanced prompt with context
        const enhancedInput = buildEnhancedPrompt(prompt, context, settings.domain);

        // Make API call with guided context
        const response = await sendMessage({
          user_input: enhancedInput,
          settings: {
            ...settings,
            mode: 'direct', // Use direct mode for final generation
          },
          guided_context: context,
        });

        // Update the agent message with response
        updateAgentResponse(agentMessageId, response);
        toast.success('Optimized prompt generated!');

        return response;
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Failed to generate prompt.';
        setError(errorMessage);
        toast.error(errorMessage);

        // Remove placeholder on error
        const messages = useChatStore.getState().messages;
        if (messages.length > 0 && messages[messages.length - 1].type === 'agent') {
          useChatStore.setState({
            messages: messages.slice(0, -1),
          });
        }

        return null;
      } finally {
        setLoading(false);
        setThinking(false);
      }
    },
    [settings, addMessage, addAgentThinkingMessage, updateAgentResponse, setLoading, setThinking, setError]
  );

  // Legacy function name
  const regeneratePrompt = regenerate;

  return {
    isLoading,
    isThinking,
    error,
    chat,
    optimizePrompt, // Legacy
    handleFileUpload,
    regenerate,
    regeneratePrompt, // Legacy
    sendGuidedPrompt,
    settings,
  };
};

// Helper function to build enhanced prompt from wizard context
function buildEnhancedPrompt(basePrompt: string, context: Record<string, any>, domain: string): string {
  const domainLabels: Record<string, string> = {
    coding: 'software development',
    data_science: 'data science and analytics',
    ai_builder: 'AI and machine learning',
    research: 'research and academic writing',
  };

  const domainContext = domainLabels[domain] || domain;

  return `Create a comprehensive, professional prompt for ${domainContext}.

User Requirements:
- Project Type: ${context.projectType || 'Not specified'}
- Tools/Technology: ${context.tools || 'Not specified'}
- Complexity Level: ${context.complexity || 'Not specified'}

Detailed Description:
${context.description || basePrompt}

Generate an optimized, detailed prompt that includes:
1. Clear role definition for the AI
2. Specific task breakdown
3. Expected output format
4. Quality requirements
5. Any relevant constraints or best practices`;
}

export default usePromptAgent;

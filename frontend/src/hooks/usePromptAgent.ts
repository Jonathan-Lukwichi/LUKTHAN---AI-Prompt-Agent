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
        const toastMessage = {
          conversation: 'Message received!',
          question: 'Thoughtful response ready!',
          prompt_optimization: 'Prompt optimized successfully!',
          hybrid: 'Response generated!',
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
    settings,
  };
};

export default usePromptAgent;

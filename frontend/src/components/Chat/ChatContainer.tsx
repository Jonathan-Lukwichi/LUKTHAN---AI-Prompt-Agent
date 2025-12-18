import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserMessage from './UserMessage';
import AgentResponse from './AgentResponse';
import InputBar from './InputBar';
import { useChatStore } from '../../stores/chatStore';
import { usePromptAgent } from '../../hooks/usePromptAgent';

const ChatContainer = () => {
  const { messages, isThinking } = useChatStore();
  const { regenerate } = usePromptAgent();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Find the user message before an agent message for regeneration
  const getRegenerateHandler = useCallback((messageIndex: number) => {
    // Find the previous user message
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].type === 'user') {
        const userMessage = messages[i];
        return () => {
          regenerate(
            userMessage.content,
            userMessage.fileContent || null,
            userMessage.fileType || null
          );
        };
      }
    }
    return undefined;
  }, [messages, regenerate]);

  return (
    <div className="flex flex-col h-full bg-[#030014] relative">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {message.type === 'user' ? (
                  <UserMessage
                    content={message.content}
                    timestamp={message.timestamp}
                    fileName={message.fileName}
                  />
                ) : (
                  <AgentResponse
                    content={message.content}
                    response={message.response}
                    timestamp={message.timestamp}
                    isThinking={message.isThinking}
                    thinkingSteps={message.thinkingSteps}
                    currentThinkingStep={message.currentThinkingStep}
                    onRegenerate={getRegenerateHandler(index)}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="relative z-10">
        <InputBar />
      </div>
    </div>
  );
};

export default ChatContainer;

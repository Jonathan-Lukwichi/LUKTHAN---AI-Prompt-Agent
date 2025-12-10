import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserMessage from './UserMessage';
import AgentResponse from './AgentResponse';
import InputBar from './InputBar';
import { useChatStore } from '../../stores/chatStore';

const ChatContainer = () => {
  const { messages, isLoading, isThinking } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
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
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <InputBar />
    </div>
  );
};

export default ChatContainer;

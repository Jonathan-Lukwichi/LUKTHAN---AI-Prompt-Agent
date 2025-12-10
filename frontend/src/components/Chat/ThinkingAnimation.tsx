import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Target, BarChart3, MessageCircle, Lightbulb, Sparkles } from 'lucide-react';
import type { ThinkingStep } from '../../stores/chatStore';

interface ThinkingAnimationProps {
  steps: ThinkingStep[];
  currentStep: number;
  isComplete: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  '🧠': <Brain className="w-4 h-4" />,
  '🔍': <Search className="w-4 h-4" />,
  '🎯': <Target className="w-4 h-4" />,
  '📊': <BarChart3 className="w-4 h-4" />,
  '💬': <MessageCircle className="w-4 h-4" />,
  '💭': <Lightbulb className="w-4 h-4" />,
  '✨': <Sparkles className="w-4 h-4" />,
};

export default function ThinkingAnimation({ steps, currentStep, isComplete }: ThinkingAnimationProps) {
  if (steps.length === 0 && !isComplete) {
    // Initial thinking state - show loading animation
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-dark-800/50 border border-neon-purple/20"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-neon-purple animate-pulse" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-neon-purple/50"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white mb-1">LUKTHAN is thinking...</div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-neon-cyan"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2 mb-4"
    >
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <Brain className="w-3 h-3 text-neon-purple" />
        <span>Thinking Process</span>
      </div>

      <div className="relative pl-4 border-l-2 border-neon-purple/30">
        <AnimatePresence mode="sync">
          {steps.map((step, index) => {
            const isActive = index === currentStep && !isComplete;
            const isCompleted = index < currentStep || isComplete;

            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative py-2 ${index < steps.length - 1 ? 'mb-2' : ''}`}
              >
                {/* Step indicator */}
                <div
                  className={`absolute -left-[21px] w-4 h-4 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-neon-purple' : isActive ? 'bg-neon-cyan animate-pulse' : 'bg-dark-700'}
                    border-2 ${isCompleted ? 'border-neon-purple' : isActive ? 'border-neon-cyan' : 'border-dark-500'}`}
                >
                  {isCompleted && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 text-white"
                      viewBox="0 0 12 12"
                    >
                      <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                    </motion.svg>
                  )}
                </div>

                {/* Step content */}
                <div className={`ml-2 ${isActive ? 'opacity-100' : isCompleted ? 'opacity-70' : 'opacity-40'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${isActive ? 'text-neon-cyan' : isCompleted ? 'text-neon-purple' : 'text-gray-400'}`}>
                      {iconMap[step.icon] || step.icon} {step.step}
                    </span>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-gray-400"
                  >
                    {step.thought}
                  </motion.p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Compact version for showing completed thinking
export function ThinkingSummary({ steps }: { steps: ThinkingStep[] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <motion.details
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group mb-3"
    >
      <summary className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition-colors">
        <Brain className="w-3 h-3" />
        <span>View thinking process ({steps.length} steps)</span>
        <motion.span
          className="ml-auto"
          animate={{ rotate: 0 }}
          whileHover={{ rotate: 90 }}
        >
          &rsaquo;
        </motion.span>
      </summary>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        className="mt-2 pl-4 border-l border-dark-600 space-y-1"
      >
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-2 text-xs">
            <span className="text-neon-purple">{step.icon}</span>
            <div>
              <span className="text-gray-400 font-medium">{step.step}:</span>{' '}
              <span className="text-gray-500">{step.thought}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.details>
  );
}

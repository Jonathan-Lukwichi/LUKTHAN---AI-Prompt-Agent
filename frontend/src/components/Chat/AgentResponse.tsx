import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Code,
  BookOpen,
  BarChart3,
  MessageSquare,
  Lightbulb,
  Heart,
  MessageCircle,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { AgentResponse as AgentResponseType, ThinkingStep } from '../../stores/chatStore';
import ThinkingAnimation, { ThinkingSummary } from './ThinkingAnimation';

interface AgentResponseProps {
  content: string;
  response?: AgentResponseType;
  timestamp: Date;
  isThinking?: boolean;
  thinkingSteps?: ThinkingStep[];
  currentThinkingStep?: number;
}

const domainIcons: Record<string, typeof Code> = {
  coding: Code,
  research: BookOpen,
  data_science: BarChart3,
  general: MessageSquare,
  conversation: MessageCircle,
  life_wisdom: Heart,
};

const domainColors: Record<string, string> = {
  coding: 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10',
  research: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
  data_science: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
  general: 'text-text-secondary border-text-muted/30 bg-text-muted/10',
  conversation: 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10',
  life_wisdom: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
};

const intentLabels: Record<string, { label: string; icon: typeof Sparkles; color: string }> = {
  prompt_optimization: { label: 'Optimized', icon: Sparkles, color: 'text-neon-purple' },
  conversation: { label: 'Friendly', icon: MessageCircle, color: 'text-neon-cyan' },
  question: { label: 'Thoughtful', icon: Heart, color: 'text-neon-pink' },
  hybrid: { label: 'Smart', icon: Zap, color: 'text-warning' },
};

const AgentResponse = ({
  content,
  response,
  timestamp,
  isThinking,
  thinkingSteps = [],
  currentThinkingStep = 0,
}: AgentResponseProps) => {
  const [copied, setCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = async () => {
    const textToCopy = response?.optimized_prompt || response?.response || content;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const getQualityLabel = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-success bg-success/20 border-success/30' };
    if (score >= 70) return { label: 'Good', color: 'text-neon-cyan bg-neon-cyan/20 border-neon-cyan/30' };
    if (score >= 50) return { label: 'Fair', color: 'text-warning bg-warning/20 border-warning/30' };
    return { label: 'Needs Work', color: 'text-error bg-error/20 border-error/30' };
  };

  const isPromptOptimization = response?.intent === 'prompt_optimization' || response?.optimized_prompt;
  const isConversation = response?.intent === 'conversation' || response?.response_type === 'conversation';
  const isWisdom = response?.intent === 'question' || response?.response_type === 'wisdom';

  const DomainIcon = response?.domain ? domainIcons[response.domain] || MessageSquare : MessageSquare;
  const domainColorClass = response?.domain ? domainColors[response.domain] || domainColors.general : domainColors.general;
  const qualityInfo = response?.quality_score ? getQualityLabel(response.quality_score) : null;
  const intentInfo = response?.intent ? intentLabels[response.intent] : null;

  // Show thinking animation while loading
  if (isThinking && !response) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="max-w-[90%] md:max-w-[85%]">
          <ThinkingAnimation
            steps={thinkingSteps}
            currentStep={currentThinkingStep}
            isComplete={false}
          />
        </div>
      </motion.div>
    );
  }

  // Conversational response (friendly chat)
  if (isConversation && !isPromptOptimization) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="max-w-[90%] md:max-w-[85%]">
          {/* Show thinking summary */}
          {response?.thinking && response.thinking.length > 0 && (
            <ThinkingSummary steps={response.thinking} />
          )}

          <div className="bg-bg-card border border-neon-cyan/30 rounded-2xl overflow-hidden shadow-glow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neon-cyan/20">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-text-primary">LUKTHAN</h3>
                <p className="text-xs text-neon-cyan">Friendly Mode</p>
              </div>
            </div>

            {/* Message content */}
            <div className="p-4">
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                {response?.response || content}
              </p>
            </div>

            {/* Suggestions */}
            {response?.suggestions && response.suggestions.length > 0 && (
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {response.suggestions.map((suggestion, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 rounded-full"
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-neon-cyan/20 bg-bg-elevated/30">
              <span className="text-xs text-text-muted">{formatTime(timestamp)}</span>
              <button
                onClick={handleCopy}
                className="text-xs text-text-muted hover:text-neon-cyan transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Wisdom/thoughtful response
  if (isWisdom && !isPromptOptimization) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="max-w-[90%] md:max-w-[85%]">
          {/* Show thinking summary */}
          {response?.thinking && response.thinking.length > 0 && (
            <ThinkingSummary steps={response.thinking} />
          )}

          <div className="bg-gradient-to-br from-bg-card to-bg-elevated border border-neon-purple/30 rounded-2xl overflow-hidden shadow-glow">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neon-purple/20 bg-neon-purple/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-text-primary">LUKTHAN</h3>
                <p className="text-xs text-neon-purple">Thoughtful Response</p>
              </div>
              <Lightbulb className="w-5 h-5 text-neon-purple animate-pulse" />
            </div>

            {/* Message content */}
            <div className="p-5">
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap text-base">
                {response?.response || content}
              </p>
            </div>

            {/* Suggestions */}
            {response?.suggestions && response.suggestions.length > 0 && (
              <div className="px-5 pb-4">
                <div className="flex flex-wrap gap-2">
                  {response.suggestions.map((suggestion, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs text-neon-purple bg-neon-purple/10 border border-neon-purple/20 rounded-full"
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-neon-purple/20 bg-bg-elevated/30">
              <span className="text-xs text-text-muted">{formatTime(timestamp)}</span>
              <button
                onClick={handleCopy}
                className="text-xs text-text-muted hover:text-neon-purple transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Prompt optimization response (default/original style)
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] md:max-w-[85%]">
        {/* Show thinking summary */}
        {response?.thinking && response.thinking.length > 0 && (
          <ThinkingSummary steps={response.thinking} />
        )}

        {/* Main card */}
        <div className="bg-bg-card border border-neon-purple/30 rounded-2xl overflow-hidden shadow-glow">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neon-purple/20 bg-bg-elevated/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-text-primary">LUKTHAN Agent</h3>
                <p className="text-xs text-text-muted">
                  {response?.response_type === 'hybrid' ? 'Smart Response' : 'AI-Optimized Prompt'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {intentInfo && (
                <>
                  <intentInfo.icon className={`w-4 h-4 ${intentInfo.color}`} />
                  <span className={`text-xs font-medium ${intentInfo.color}`}>{intentInfo.label}</span>
                </>
              )}
            </div>
          </div>

          {/* Badges */}
          {response && (
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-neon-purple/20">
              {/* Domain badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${domainColorClass}`}>
                <DomainIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium capitalize">{response.domain.replace('_', ' ')}</span>
              </div>

              {/* Quality badge */}
              {qualityInfo && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${qualityInfo.color}`}>
                  <span className="text-xs font-bold">{response.quality_score}%</span>
                  <span className="text-xs font-medium">{qualityInfo.label}</span>
                </div>
              )}

              {/* Key topics */}
              {response.metadata?.key_topics?.slice(0, 3).map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs text-text-muted bg-bg-elevated rounded-full"
                >
                  #{topic}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            {/* Show conversational response if present */}
            {response?.response && response.response_type !== 'prompt_optimization' && (
              <div className="mb-4 p-3 bg-bg-elevated/50 rounded-lg border border-dark-600">
                <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                  {response.response}
                </p>
              </div>
            )}

            {/* Prompt content */}
            {(response?.optimized_prompt || (!response?.response && content)) && (
              <>
                <div className="flex items-center gap-2 mb-3 text-text-secondary">
                  <span className="text-sm font-semibold uppercase tracking-wider">Your Optimized Prompt</span>
                </div>

                <div className="bg-bg-deep rounded-xl p-4 border border-neon-cyan/20">
                  <pre className="whitespace-pre-wrap text-sm text-text-primary font-mono leading-relaxed">
                    {response?.optimized_prompt || content}
                  </pre>
                </div>
              </>
            )}

            {/* Suggestions */}
            {response?.suggestions && response.suggestions.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2 text-text-secondary">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Suggestions</span>
                </div>
                <ul className="space-y-1.5">
                  {response.suggestions.map((suggestion, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-text-muted"
                    >
                      <span className="text-neon-cyan mt-0.5">*</span>
                      <span>{suggestion}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neon-purple/20 bg-bg-elevated/30">
            <span className="text-xs text-text-muted">{formatTime(timestamp)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-neon-cyan border border-text-muted/30 hover:border-neon-cyan/50 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-success">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-neon-purple border border-text-muted/30 hover:border-neon-purple/50 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentResponse;

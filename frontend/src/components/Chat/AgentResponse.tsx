import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Code,
  BookOpen,
  BarChart3,
  MessageSquare,
  Lightbulb,
  Heart,
  MessageCircle,
  Zap,
  Download,
  Bot,
  GraduationCap,
  Database,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { AgentResponse as AgentResponseType, ThinkingStep } from '../../stores/chatStore';

interface AgentResponseProps {
  content: string;
  response?: AgentResponseType;
  timestamp: Date;
  isThinking?: boolean;
  thinkingSteps?: ThinkingStep[];
  currentThinkingStep?: number;
  onRegenerate?: () => void;
}

const domainIcons: Record<string, typeof Code> = {
  coding: Code,
  research: BookOpen,
  data_science: BarChart3,
  ai_builder: Bot,
  general: MessageSquare,
  conversation: MessageCircle,
  life_wisdom: Heart,
};

const expertRoleLabels: Record<string, string> = {
  coding: 'Software Architect',
  data_science: 'Data Scientist',
  ai_builder: 'AI Expert',
  research: 'Research Advisor',
};

const AgentResponse = ({
  content,
  response,
  timestamp,
  isThinking,
  thinkingSteps = [],
  onRegenerate,
}: AgentResponseProps) => {
  const [copied, setCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);

  const handleExport = () => {
    const textToExport = response?.optimized_prompt || response?.response || content;
    const domain = response?.domain || 'general';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `lukthan-${domain}-${timestamp}.txt`;

    const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Exported successfully!');
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    } else {
      toast.error('Regenerate not available');
    }
  };

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

  const isPromptOptimization = response?.intent === 'prompt_optimization' || response?.optimized_prompt;
  const isConversation = response?.intent === 'conversation' || response?.response_type === 'conversation';
  const isWisdom = response?.intent === 'question' || response?.response_type === 'wisdom';
  const isGuided = response?.intent === 'guided' || response?.response_type === 'guided';

  const DomainIcon = response?.domain ? domainIcons[response.domain] || MessageSquare : MessageSquare;
  const finalThinkingSteps = response?.thinking || thinkingSteps;
  const expertRole = response?.domain ? expertRoleLabels[response.domain] || 'Expert' : 'Expert';

  // Thinking Animation State
  if (isThinking && !response) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="text-sm font-medium text-text-primary">LUKTHAN</span>
              <span className="text-xs text-accent ml-2">Thinking...</span>
            </div>
          </div>

          {/* Thinking Steps Animation */}
          <div className="space-y-2">
            {thinkingSteps.length > 0 ? (
              thinkingSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-2 rounded-lg bg-bg-tertiary/50"
                >
                  <span className="text-lg">{step.icon}</span>
                  <div>
                    <span className="text-xs font-medium text-accent">{step.step}</span>
                    <p className="text-sm text-text-secondary">{step.thought}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-text-muted">
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="text-sm">Analyzing your request...</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Conversation Response - Clean and minimal
  if (isConversation && !isPromptOptimization) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
          {/* Minimal Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border-subtle">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-medium text-text-primary">LUKTHAN</span>
            <span className="text-xs text-text-muted ml-auto">{formatTime(timestamp)}</span>
          </div>

          {/* Content - Clean */}
          <div className="px-3 py-3">
            <p className="text-sm text-text-primary leading-relaxed">
              {response?.response || content}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Guided Expert Response - Q&A Mode
  if (isGuided && !isPromptOptimization) {
    const conversationStep = response?.metadata?.conversation_step || 1;
    const isReadyToGenerate = response?.metadata?.ready_to_generate || conversationStep >= 4;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        <div className="bg-bg-secondary border border-violet-500/30 rounded-xl overflow-hidden">
          {/* Expert Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-cyan-500/5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <HelpCircle className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-text-primary">LUKTHAN</span>
              <span className="text-[10px] text-violet-400 ml-2">{expertRole}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                Step {conversationStep}/4
              </span>
              <span className="text-[10px] text-text-muted">{formatTime(timestamp)}</span>
            </div>
          </div>

          {/* Expert Question/Guidance */}
          <div className="px-4 py-3">
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {response?.response || content}
            </p>
          </div>

          {/* Guided Mode Indicator */}
          <div className="px-4 py-2 border-t border-violet-500/10 bg-violet-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-violet-400">
                <MessageSquare className="w-3 h-3" />
                <span>
                  {isReadyToGenerate
                    ? 'Ready! Type "generate" to create your optimized prompt'
                    : `Question ${conversationStep} of 4 • Answer to continue`}
                </span>
              </div>
              {/* Progress dots */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      step <= conversationStep
                        ? 'bg-violet-400'
                        : 'bg-violet-400/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Wisdom/Thoughtful Response
  if (isWisdom && !isPromptOptimization) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        {/* Thinking Toggle */}
        {finalThinkingSteps.length > 0 && (
          <ThinkingToggle
            steps={finalThinkingSteps}
            showThinking={showThinking}
            setShowThinking={setShowThinking}
          />
        )}

        <div className="bg-bg-secondary border border-accent/20 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-accent/10 bg-accent-subtle/30">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-text-primary">LUKTHAN</span>
              <span className="text-xs text-accent ml-2">Thoughtful Response</span>
            </div>
            <Lightbulb className="w-4 h-4 text-accent animate-pulse-slow" />
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
              {response?.response || content}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-accent/10 bg-bg-tertiary/30">
            <span className="text-xs text-text-muted">{formatTime(timestamp)}</span>
            <button
              onClick={handleCopy}
              className="btn btn-ghost btn-sm text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Prompt Optimization Response (Main)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl"
    >
      {/* Thinking Toggle */}
      {finalThinkingSteps.length > 0 && (
        <ThinkingToggle
          steps={finalThinkingSteps}
          showThinking={showThinking}
          setShowThinking={setShowThinking}
        />
      )}

      <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-text-primary">LUKTHAN</span>
          </div>
          <span className="text-xs text-text-muted">{formatTime(timestamp)}</span>
        </div>

        {/* Response Text */}
        {response?.response && (
          <div className="px-4 py-3 border-b border-border-subtle">
            <p className="text-sm text-text-secondary leading-relaxed">
              {response.response}
            </p>
          </div>
        )}

        {/* Optimized Prompt Card */}
        {(response?.optimized_prompt || content) && (
          <div className="m-4">
            <div className="bg-bg-tertiary border border-border-subtle rounded-xl overflow-hidden">
              {/* Prompt Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-bg-hover/50 border-b border-border-subtle">
                <span className="text-xs font-medium text-accent uppercase tracking-wider">
                  Optimized Prompt
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-bg-hover transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-text-muted hover:text-text-primary" />
                    )}
                  </button>
                </div>
              </div>

              {/* Prompt Content */}
              <div className={`p-4 ${!promptExpanded ? 'max-h-64 overflow-hidden relative' : ''}`}>
                <pre className="prompt-content text-text-primary">
                  {response?.optimized_prompt || content}
                </pre>
                {!promptExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg-tertiary to-transparent pointer-events-none" />
                )}
              </div>

              {/* Expand Toggle */}
              <button
                onClick={() => setPromptExpanded(!promptExpanded)}
                className="w-full py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors flex items-center justify-center gap-1 border-t border-border-subtle"
              >
                {promptExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Expand Full Prompt
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Metadata Bar */}
        {response && (
          <div className="px-4 py-3 border-t border-border-subtle bg-bg-tertiary/30 flex flex-wrap items-center gap-2">
            {/* Domain Badge */}
            <span className="badge">
              <DomainIcon className="w-3 h-3" />
              {response.domain?.replace('_', ' ')}
            </span>

            {/* Quality Score */}
            {response.quality_score && (
              <span className={`badge ${response.quality_score >= 80 ? 'badge-success' : 'badge-accent'}`}>
                {response.quality_score}/100
              </span>
            )}

            {/* Key Topics */}
            {response.metadata?.key_topics?.slice(0, 2).map((topic, i) => (
              <span key={i} className="badge text-xs">
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {response?.suggestions && response.suggestions.length > 0 && (
          <div className="px-4 py-3 border-t border-border-subtle">
            <div className="flex items-center gap-2 mb-2 text-text-muted">
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Suggestions</span>
            </div>
            <ul className="space-y-1">
              {response.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="text-sm text-text-secondary flex items-start gap-2"
                >
                  <span className="text-accent mt-0.5">-</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border-subtle">
          <button onClick={handleCopy} className="btn btn-secondary btn-sm">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleExport} className="btn btn-secondary btn-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={handleRegenerate} className="btn btn-ghost btn-sm">
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Thinking Toggle Component
const ThinkingToggle = ({
  steps,
  showThinking,
  setShowThinking,
}: {
  steps: ThinkingStep[];
  showThinking: boolean;
  setShowThinking: (show: boolean) => void;
}) => (
  <div className="mb-3">
    <button
      onClick={() => setShowThinking(!showThinking)}
      className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
    >
      {showThinking ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
      <span className="font-medium">View thinking process</span>
      <span className="text-text-muted">({steps.length} steps)</span>
    </button>

    {showThinking && (
      <div className="mt-2 pl-4 border-l-2 border-accent/30 space-y-2 animate-fade-in">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-2 rounded-lg bg-bg-secondary/50"
          >
            <span className="text-lg">{step.icon}</span>
            <div>
              <span className="text-xs font-medium text-accent">{step.step}</span>
              <p className="text-sm text-text-secondary">{step.thought}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default AgentResponse;

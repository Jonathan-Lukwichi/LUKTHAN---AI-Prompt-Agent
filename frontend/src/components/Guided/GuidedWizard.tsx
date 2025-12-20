import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Code,
  Database,
  Bot,
  GraduationCap,
  Target,
  Wrench,
  FileText,
  BarChart3,
  MessageSquare,
  Zap,
  Check,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { usePromptAgent } from '../../hooks/usePromptAgent';

// Domain-specific questions configuration
const domainQuestions = {
  coding: {
    title: 'Coding Assistant',
    icon: Code,
    color: 'from-cyan-400 to-blue-500',
    steps: [
      {
        question: "What type of project are you building?",
        options: [
          { id: 'api', label: 'REST API', icon: Target },
          { id: 'frontend', label: 'Frontend/UI', icon: FileText },
          { id: 'backend', label: 'Backend Logic', icon: Database },
          { id: 'fullstack', label: 'Full Stack', icon: Code },
          { id: 'script', label: 'Script/Automation', icon: Wrench },
          { id: 'other', label: 'Other', icon: MessageSquare },
        ]
      },
      {
        question: "Which language or framework?",
        options: [
          { id: 'python', label: 'Python', icon: Code },
          { id: 'javascript', label: 'JavaScript/TS', icon: Code },
          { id: 'react', label: 'React', icon: Code },
          { id: 'nodejs', label: 'Node.js', icon: Code },
          { id: 'java', label: 'Java/Kotlin', icon: Code },
          { id: 'other', label: 'Other', icon: MessageSquare },
        ]
      },
      {
        question: "What's the complexity level?",
        options: [
          { id: 'simple', label: 'Simple/Basic', icon: Target },
          { id: 'medium', label: 'Intermediate', icon: Wrench },
          { id: 'complex', label: 'Complex/Advanced', icon: Sparkles },
          { id: 'production', label: 'Production-ready', icon: Check },
        ]
      }
    ]
  },
  data_science: {
    title: 'Data Science',
    icon: Database,
    color: 'from-violet-500 to-purple-500',
    steps: [
      {
        question: "What's your main goal?",
        options: [
          { id: 'analysis', label: 'Data Analysis', icon: BarChart3 },
          { id: 'prediction', label: 'Build ML Model', icon: Bot },
          { id: 'visualization', label: 'Visualization', icon: FileText },
          { id: 'cleaning', label: 'Data Cleaning', icon: Wrench },
          { id: 'report', label: 'Create Report', icon: FileText },
          { id: 'other', label: 'Other', icon: MessageSquare },
        ]
      },
      {
        question: "Which tools will you use?",
        options: [
          { id: 'python_pandas', label: 'Python/Pandas', icon: Code },
          { id: 'r', label: 'R', icon: Code },
          { id: 'sql', label: 'SQL', icon: Database },
          { id: 'excel', label: 'Excel', icon: FileText },
          { id: 'tableau', label: 'Tableau/BI', icon: BarChart3 },
          { id: 'other', label: 'Other', icon: MessageSquare },
        ]
      },
      {
        question: "What type of data do you have?",
        options: [
          { id: 'tabular', label: 'Tabular/CSV', icon: Database },
          { id: 'timeseries', label: 'Time Series', icon: BarChart3 },
          { id: 'text', label: 'Text/NLP', icon: FileText },
          { id: 'images', label: 'Images', icon: FileText },
          { id: 'mixed', label: 'Mixed Types', icon: Wrench },
        ]
      }
    ]
  },
  ai_builder: {
    title: 'AI Builder',
    icon: Bot,
    color: 'from-pink-500 to-rose-500',
    steps: [
      {
        question: "What type of AI are you building?",
        options: [
          { id: 'chatbot', label: 'Chatbot', icon: MessageSquare },
          { id: 'agent', label: 'AI Agent', icon: Bot },
          { id: 'classifier', label: 'Classifier', icon: Target },
          { id: 'generator', label: 'Content Generator', icon: FileText },
          { id: 'assistant', label: 'Virtual Assistant', icon: Sparkles },
          { id: 'other', label: 'Other', icon: MessageSquare },
        ]
      },
      {
        question: "Which platform or API?",
        options: [
          { id: 'openai', label: 'OpenAI/GPT', icon: Bot },
          { id: 'claude', label: 'Claude/Anthropic', icon: Bot },
          { id: 'langchain', label: 'LangChain', icon: Code },
          { id: 'huggingface', label: 'Hugging Face', icon: Bot },
          { id: 'custom', label: 'Custom Model', icon: Wrench },
          { id: 'other', label: 'Other', icon: MessageSquare },
        ]
      },
      {
        question: "What's the deployment target?",
        options: [
          { id: 'web', label: 'Web App', icon: Code },
          { id: 'api', label: 'API Service', icon: Target },
          { id: 'mobile', label: 'Mobile App', icon: FileText },
          { id: 'slack', label: 'Slack/Discord', icon: MessageSquare },
          { id: 'standalone', label: 'Standalone', icon: Wrench },
        ]
      }
    ]
  },
  research: {
    title: 'Research Assistant',
    icon: GraduationCap,
    color: 'from-green-400 to-emerald-500',
    steps: [
      {
        question: "What type of research task?",
        options: [
          { id: 'literature', label: 'Literature Review', icon: FileText },
          { id: 'analysis', label: 'Data Analysis', icon: BarChart3 },
          { id: 'summary', label: 'Summarization', icon: FileText },
          { id: 'comparison', label: 'Comparison Study', icon: Target },
          { id: 'proposal', label: 'Research Proposal', icon: GraduationCap },
          { id: 'other', label: 'Other', icon: MessageSquare },
        ]
      },
      {
        question: "Which field or domain?",
        options: [
          { id: 'science', label: 'Science/Tech', icon: Code },
          { id: 'business', label: 'Business/Finance', icon: BarChart3 },
          { id: 'medical', label: 'Medical/Health', icon: Target },
          { id: 'social', label: 'Social Sciences', icon: MessageSquare },
          { id: 'humanities', label: 'Humanities', icon: FileText },
          { id: 'other', label: 'Other', icon: MessageSquare },
        ]
      },
      {
        question: "What output format do you need?",
        options: [
          { id: 'academic', label: 'Academic Paper', icon: GraduationCap },
          { id: 'report', label: 'Report', icon: FileText },
          { id: 'presentation', label: 'Presentation', icon: FileText },
          { id: 'summary', label: 'Brief Summary', icon: Target },
          { id: 'outline', label: 'Outline/Structure', icon: Wrench },
        ]
      }
    ]
  }
};

interface GuidedWizardProps {
  onComplete?: (prompt: string) => void;
}

const GuidedWizard = ({ onComplete }: GuidedWizardProps) => {
  const { settings } = useChatStore();
  const { sendGuidedPrompt, isLoading } = usePromptAgent();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [description, setDescription] = useState('');

  const domain = settings.domain as keyof typeof domainQuestions;
  const config = domainQuestions[domain] || domainQuestions.coding;
  const DomainIcon = config.icon;

  const totalSteps = config.steps.length + 1; // +1 for description step
  const isDescriptionStep = currentStep === config.steps.length;
  const isComplete = currentStep >= totalSteps;

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: optionId }));
    // Auto-advance to next step
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = async () => {
    // Build context from answers
    const context = {
      domain: domain,
      projectType: answers[0],
      tools: answers[1],
      complexity: answers[2],
      description: description
    };

    // Generate the prompt
    const prompt = buildPromptFromContext(context, config);

    // Send to the AI agent
    await sendGuidedPrompt(prompt, context);

    if (onComplete) {
      onComplete(prompt);
    }
  };

  const buildPromptFromContext = (context: any, config: any) => {
    const step1 = config.steps[0]?.options.find((o: any) => o.id === context.projectType)?.label || '';
    const step2 = config.steps[1]?.options.find((o: any) => o.id === context.tools)?.label || '';
    const step3 = config.steps[2]?.options.find((o: any) => o.id === context.complexity)?.label || '';

    return `Create a ${step1} using ${step2} with ${step3} complexity. ${context.description}`;
  };

  const currentStepData = config.steps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.color} bg-opacity-20 border border-white/10 mb-3`}>
          <DomainIcon className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">{config.title} Wizard</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">
          Let's build your perfect prompt
        </h2>
        <p className="text-sm text-gray-400">
          Answer a few questions to get started
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${config.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {!isDescriptionStep && currentStepData ? (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white text-center">
              {currentStepData.question}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentStepData.options.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = answers[currentStep] === option.id;

                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`relative p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? `bg-gradient-to-br ${config.color} border-transparent text-white shadow-lg`
                        : 'bg-white/5 border-white/10 hover:border-cyan-500/30 hover:bg-white/10'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    <OptionIcon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : isDescriptionStep ? (
          <motion.div
            key="description-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white text-center">
              Describe your specific requirements
            </h3>
            <p className="text-sm text-gray-400 text-center">
              Add any details, constraints, or specific features you need
            </p>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., I need to analyze sales data from the last 2 years, identify seasonal trends, and create visualizations for a presentation..."
              className="w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none text-white placeholder-gray-500 resize-none transition-all"
            />

            {/* Summary of selections */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Your Selections</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(answers).map(([stepIdx, answerId]) => {
                  const step = config.steps[parseInt(stepIdx)];
                  const option = step?.options.find((o: any) => o.id === answerId);
                  return option ? (
                    <span
                      key={stepIdx}
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${config.color} text-white`}
                    >
                      {option.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {isDescriptionStep ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isLoading || !description.trim()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r ${config.color} hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Prompt
              </>
            )}
          </motion.button>
        ) : (
          <div className="text-xs text-gray-500">
            Select an option to continue
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidedWizard;

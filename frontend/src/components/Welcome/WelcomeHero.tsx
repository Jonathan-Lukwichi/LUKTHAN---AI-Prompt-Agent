import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Code,
  Database,
  FileText,
  FlaskConical,
  Wand2,
  ArrowRight,
  Zap,
  MessageSquare,
  Image,
  Bot
} from 'lucide-react';
import InputBar from '../Chat/InputBar';
import GuidedWizard from '../Guided/GuidedWizard';
import { useChatStore } from '../../stores/chatStore';

const quickStartCategories = [
  {
    icon: Code,
    label: 'Code',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    icon: Database,
    label: 'Data',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: FileText,
    label: 'Writing',
    gradient: 'from-orange-500 to-pink-500',
  },
  {
    icon: FlaskConical,
    label: 'Research',
    gradient: 'from-green-400 to-cyan-400',
  },
  {
    icon: Image,
    label: 'Creative',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Bot,
    label: 'Assistant',
    gradient: 'from-blue-500 to-violet-500',
  },
];

const suggestions = [
  'Write a Python function to sort data',
  'Create a marketing email template',
  'Explain machine learning simply',
  'Generate SQL query for user analytics',
];

const WelcomeHero = () => {
  const { settings } = useChatStore();
  const isGuidedMode = settings.mode === 'guided';

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#030014]">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.4) 0%, transparent 70%)',
          }}
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isGuidedMode ? (
            /* Guided Wizard Mode */
            <motion.div
              key="guided"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl px-4"
            >
              <GuidedWizard />
            </motion.div>
          ) : (
            /* Direct Mode - Original UI */
            <motion.div
              key="direct"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center w-full max-w-3xl"
            >
              {/* Compact Logo + Title Row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-3 mb-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 blur-lg opacity-40" />
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 p-[2px]">
                    <div className="w-full h-full rounded-xl bg-[#030014] flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  What would you like to <span className="text-gradient-animated">create?</span>
                </h1>
              </motion.div>

              {/* Subtitle - Very compact */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-400 text-sm mb-4 max-w-md mx-auto"
              >
                Describe your idea and get the <span className="text-cyan-400">perfect AI prompt</span> instantly.
              </motion.p>

              {/* Quick Categories - Horizontal compact chips */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-2 mb-5"
              >
                {quickStartCategories.map((category, index) => (
                  <motion.button
                    key={category.label}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all group"
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                      <category.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white">{category.label}</span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Suggestions - Compact inline */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-2 mb-4"
              >
                <span className="text-xs text-gray-600">Try:</span>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="px-2.5 py-1 text-xs text-gray-500 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/20 hover:text-cyan-400 transition-all truncate max-w-[180px]"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar - Only show in direct mode */}
      {!isGuidedMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10"
        >
          <InputBar />
        </motion.div>
      )}
    </div>
  );
};

export default WelcomeHero;

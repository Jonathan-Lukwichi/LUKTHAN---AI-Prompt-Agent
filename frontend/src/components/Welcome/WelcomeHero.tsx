import { motion } from 'framer-motion';
import { Brain, FlaskConical, Code, BarChart3, MessageCircle, Sparkles, Heart, Lightbulb } from 'lucide-react';
import InputBar from '../Chat/InputBar';

const domainChips = [
  { icon: MessageCircle, label: 'Chat', color: 'from-neon-cyan to-blue-500', hoverBg: 'hover:bg-neon-cyan/20' },
  { icon: Code, label: 'Coding', color: 'from-neon-purple to-neon-pink', hoverBg: 'hover:bg-neon-purple/20' },
  { icon: FlaskConical, label: 'Research', color: 'from-neon-pink to-orange-500', hoverBg: 'hover:bg-neon-pink/20' },
  { icon: Heart, label: 'Life Advice', color: 'from-success to-emerald-500', hoverBg: 'hover:bg-success/20' },
];

const WelcomeHero = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-1/4 w-64 h-64 bg-neon-purple/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-1/4 w-80 h-80 bg-neon-cyan/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink p-0.5 shadow-glow"
          >
            <div className="w-full h-full rounded-2xl bg-bg-deep flex items-center justify-center">
              <Brain className="w-10 h-10 text-neon-cyan" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              Hey, I'm LUKTHAN
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-text-secondary text-lg md:text-xl mb-8"
          >
            Your intelligent AI companion. I can{' '}
            <span className="text-neon-cyan font-medium">chat with you</span>,{' '}
            <span className="text-neon-purple font-medium">answer questions</span>, and{' '}
            <span className="text-neon-pink font-medium">optimize your prompts</span>
          </motion.p>

          {/* Domain chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {domainChips.map((chip, index) => (
              <motion.button
                key={chip.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border border-text-muted/30 ${chip.hoverBg} transition-colors group`}
              >
                <chip.icon className={`w-4 h-4 bg-gradient-to-r ${chip.color} bg-clip-text`} style={{ color: 'inherit' }} />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  {chip.label}
                </span>
              </motion.button>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-text-muted"
          >
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-neon-cyan" />
              <span>Thinks before responding</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-neon-purple" />
              <span>Auto-detects intent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-neon-pink" />
              <span>Friendly conversations</span>
            </div>
          </motion.div>

          {/* Example prompts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex flex-wrap justify-center gap-2"
          >
            <span className="text-xs text-text-muted">Try saying:</span>
            <span className="text-xs px-2 py-1 bg-bg-card rounded-full text-neon-cyan border border-neon-cyan/20">
              "Hello!"
            </span>
            <span className="text-xs px-2 py-1 bg-bg-card rounded-full text-neon-purple border border-neon-purple/20">
              "Help me write a Python function"
            </span>
            <span className="text-xs px-2 py-1 bg-bg-card rounded-full text-neon-pink border border-neon-pink/20">
              "What is the meaning of life?"
            </span>
          </motion.div>
        </div>
      </div>

      {/* Input bar at bottom */}
      <InputBar />
    </div>
  );
};

export default WelcomeHero;

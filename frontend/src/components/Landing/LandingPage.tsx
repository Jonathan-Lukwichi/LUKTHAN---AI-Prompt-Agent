import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Target,
  Brain,
  Rocket,
  Shield,
  Globe,
  ArrowRight,
  Star,
  CheckCircle2,
  Wand2,
  MessageSquare,
  FileCode,
  Lightbulb,
  Cpu,
  TrendingUp,
  Lock,
  Layers
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const features = [
  {
    icon: Brain,
    title: 'AI Intelligence',
    description: 'Advanced Claude AI understands context and crafts perfect prompts.',
    gradient: 'from-[#00ffff] to-[#3b82f6]',
    shadowColor: 'shadow-[0_0_30px_rgba(0,255,255,0.3)]',
    iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-500',
  },
  {
    icon: Target,
    title: 'Multi-AI Ready',
    description: 'Optimized for ChatGPT, Claude, Gemini, and more.',
    gradient: 'from-[#8b5cf6] to-[#ec4899]',
    shadowColor: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    iconBg: 'bg-gradient-to-br from-violet-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Transform ideas into prompts in seconds.',
    gradient: 'from-[#ff6b35] to-[#ff00ff]',
    shadowColor: 'shadow-[0_0_30px_rgba(255,107,53,0.3)]',
    iconBg: 'bg-gradient-to-br from-orange-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'Every prompt scored and optimized for results.',
    gradient: 'from-[#00ff88] to-[#00ffff]',
    shadowColor: 'shadow-[0_0_30px_rgba(0,255,136,0.3)]',
    iconBg: 'bg-gradient-to-br from-green-400 to-cyan-400',
  },
];

const stats = [
  { value: '10x', label: 'Faster', icon: TrendingUp },
  { value: '99%', label: 'Accuracy', icon: Target },
  { value: '24/7', label: 'Available', icon: Cpu },
  { value: '100%', label: 'Secure', icon: Lock },
];

const capabilities = [
  { icon: FileCode, text: 'Code Generation', color: 'text-cyan-400' },
  { icon: MessageSquare, text: 'Conversations', color: 'text-violet-400' },
  { icon: Lightbulb, text: 'Brainstorming', color: 'text-orange-400' },
  { icon: Globe, text: 'Multi-language', color: 'text-pink-400' },
  { icon: Layers, text: 'Complex Tasks', color: 'text-green-400' },
];

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen overflow-hidden relative bg-[#030014]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute -bottom-60 -left-60 w-[700px] h-[700px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.3, 1, 1.3],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#8b5cf6' : '#ec4899',
              boxShadow: i % 3 === 0 ? '0 0 10px #00ffff' : i % 3 === 1 ? '0 0 10px #8b5cf6' : '0 0 10px #ec4899',
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Horizontal neon lines */}
        <motion.div
          className="absolute top-1/4 left-0 w-full h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.5), transparent)',
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-3/4 left-0 w-full h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)',
          }}
          animate={{ opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="px-6 py-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              {/* Glow behind logo */}
              <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 blur-xl opacity-50" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 p-[2px]">
                <div className="w-full h-full rounded-2xl bg-[#030014] flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-animated">LUKTHAN</h1>
              <p className="text-xs text-gray-400">AI Prompt Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              >
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </div>
        </motion.header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 mb-8 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Wand2 className="w-4 h-4 text-cyan-400" />
              </motion.div>
              <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Powered by Claude AI
              </span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#00ff88]" />
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight"
            >
              <span className="text-white">Transform Ideas</span>
              <br />
              <span className="text-gradient-animated">Into Perfect Prompts</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Stop struggling with prompt engineering. Our AI understands your intent and
              crafts <span className="text-cyan-400 font-semibold">optimized prompts</span> that get
              <span className="text-violet-400 font-semibold"> better results</span> from any AI model.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6 mb-10"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <stat.icon className="w-5 h-5 text-cyan-400" />
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-12"
            >
              <motion.button
                onClick={onStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-4 px-10 py-5 text-lg font-bold text-white rounded-2xl overflow-hidden"
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #00ffff, #8b5cf6, #ec4899, #00ffff)',
                    backgroundSize: '300% 300%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-50 blur-xl bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500" />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut',
                  }}
                />

                <span className="relative flex items-center gap-3">
                  <Rocket className="w-6 h-6" />
                  Start Creating
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-5 text-sm text-gray-500 flex items-center justify-center gap-4"
              >
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  No sign-up
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Free to use
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Instant results
                </span>
              </motion.p>
            </motion.div>

            {/* Capabilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-16"
            >
              {capabilities.map((cap, index) => (
                <motion.div
                  key={cap.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors"
                >
                  <cap.icon className={`w-4 h-4 ${cap.color}`} />
                  <span className="text-sm text-gray-300">{cap.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="w-full max-w-6xl mx-auto px-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.15 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`group relative p-6 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-500 ${feature.shadowColor} hover:shadow-2xl`}
                >
                  {/* Gradient glow on hover */}
                  <motion.div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`relative w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bottom gradient line */}
                  <div className={`absolute bottom-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="px-6 py-8 text-center border-t border-white/5"
        >
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-green-400" />
              <span>Privacy First</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>No Data Stored</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-violet-400" />
              <span>Open Source</span>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default LandingPage;

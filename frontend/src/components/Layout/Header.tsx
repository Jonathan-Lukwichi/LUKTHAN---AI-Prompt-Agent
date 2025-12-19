import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  Settings,
  PanelRightClose,
  PanelRightOpen,
  Menu,
  Zap,
  Home,
  ArrowLeft,
  Code,
  Database,
  Bot,
  GraduationCap,
  Target,
  MessageSquare
} from 'lucide-react';
import { useChatStore, type Settings as SettingsType } from '../../stores/chatStore';
import { resetConversation } from '../../api/client';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleContextPanel: () => void;
  sidebarOpen: boolean;
  contextPanelOpen: boolean;
  onBackToLanding?: () => void;
}

// Domain options with icons
const domainOptions = [
  { id: 'coding', label: 'Coding', icon: Code, color: 'from-cyan-400 to-blue-500' },
  { id: 'data_science', label: 'Data', icon: Database, color: 'from-violet-500 to-purple-500' },
  { id: 'ai_builder', label: 'AI Builder', icon: Bot, color: 'from-pink-500 to-rose-500' },
  { id: 'research', label: 'Research', icon: GraduationCap, color: 'from-green-400 to-emerald-500' },
] as const;

// Mode options
const modeOptions = [
  { id: 'direct', label: 'Direct', icon: Target, description: 'Instant optimized prompt' },
  { id: 'guided', label: 'Guided', icon: MessageSquare, description: 'Expert Q&A builder' },
] as const;

const Header = ({
  onToggleSidebar,
  onToggleContextPanel,
  sidebarOpen,
  contextPanelOpen,
  onBackToLanding
}: HeaderProps) => {
  const { settings, setSettings } = useChatStore();
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);

  const targetAIOptions = [
    { group: 'OpenAI', options: ['ChatGPT (GPT-4)', 'ChatGPT (GPT-3.5)'] },
    { group: 'Anthropic', options: ['Claude', 'Claude (Opus)'] },
    { group: 'Google', options: ['Gemini', 'Gemini Pro'] },
    { group: 'Open Source', options: ['Llama', 'Mistral'] },
  ];

  const currentDomain = domainOptions.find(d => d.id === settings.domain) || domainOptions[0];
  const DomainIcon = currentDomain.icon;

  return (
    <header className="h-12 bg-[#0a0a1a]/95 backdrop-blur-sm border-b border-violet-500/20 flex items-center justify-between px-3 flex-shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Back to Landing */}
        {onBackToLanding && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToLanding}
            className="p-2 rounded-lg bg-white/5 border border-violet-500/20 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <Home className="w-3.5 h-3.5" />
          </motion.button>
        )}

        {/* Sidebar Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-white/5 border border-violet-500/20 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
        >
          <Menu className="w-4 h-4" />
        </motion.button>

        {/* Logo - Compact */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 blur-md opacity-30" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 p-[1.5px]">
              <div className="w-full h-full rounded-lg bg-[#030014] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
          </div>
          <span className="font-bold text-base text-gradient-animated hidden sm:block">LUKTHAN</span>
        </div>
      </div>

      {/* Center Section - Domain, Mode & AI Selection */}
      <div className="flex items-center gap-2">
        {/* Domain Selector */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDomainDropdownOpen(!domainDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-violet-500/20 hover:border-cyan-500/30 rounded-lg transition-all text-xs"
          >
            <div className={`w-4 h-4 rounded bg-gradient-to-br ${currentDomain.color} flex items-center justify-center`}>
              <DomainIcon className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-white font-medium hidden sm:inline">{currentDomain.label}</span>
            <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${domainDropdownOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {domainDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDomainDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute top-full left-0 mt-1 w-44 bg-[#0a0a1a] border border-violet-500/30 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.15)] z-50 py-1 overflow-hidden"
                >
                  <div className="px-3 py-1 text-[10px] font-semibold text-violet-400 uppercase">Select Domain</div>
                  {domainOptions.map((domain) => {
                    const Icon = domain.icon;
                    return (
                      <button
                        key={domain.id}
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          // Reset conversation when domain changes in guided mode
                          if (settings.mode === 'guided' && settings.domain !== domain.id) {
                            try { await resetConversation(); } catch (err) { console.log('Reset error:', err); }
                          }
                          setSettings({ domain: domain.id });
                          setDomainDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all ${
                          settings.domain === domain.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded bg-gradient-to-br ${domain.color} flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        {domain.label}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Mode Toggle (Direct / Guided) */}
        <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-violet-500/20">
          {modeOptions.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  // Reset conversation when switching modes
                  if (settings.mode !== mode.id) {
                    try { await resetConversation(); } catch (err) { console.log('Reset error:', err); }
                  }
                  setSettings({ mode: mode.id });
                }}
                title={mode.description}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${
                  settings.mode === mode.id
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Target AI Dropdown */}
        <div className="relative hidden md:block">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-violet-500/20 hover:border-cyan-500/30 rounded-lg transition-all text-xs"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-white font-medium">{settings.target_ai.split(' ')[0]}</span>
            <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {modelDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setModelDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute top-full left-0 mt-1 w-48 bg-[#0a0a1a] border border-violet-500/30 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.15)] z-50 py-1 overflow-hidden"
                >
                  {targetAIOptions.map((group) => (
                    <div key={group.group}>
                      <div className="px-3 py-1 text-[10px] font-semibold text-violet-400 uppercase">{group.group}</div>
                      {group.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSettings({ target_ai: option });
                            setModelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs transition-all ${
                            settings.target_ai === option ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-white/5 border border-violet-500/20 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
        >
          <Settings className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleContextPanel}
          className="p-2 rounded-lg bg-white/5 border border-violet-500/20 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all hidden lg:flex"
        >
          {contextPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </motion.button>
      </div>
    </header>
  );
};

export default Header;

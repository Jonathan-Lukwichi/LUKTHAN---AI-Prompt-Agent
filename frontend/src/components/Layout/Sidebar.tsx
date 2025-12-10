import { useChatStore, type Settings } from '../../stores/chatStore';
import { Brain, Settings as SettingsIcon, Lightbulb, X, Sparkles } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { settings, setSettings, clearMessages } = useChatStore();

  const handleSettingChange = (key: keyof Settings, value: string) => {
    setSettings({ [key]: value } as Partial<Settings>);
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-bg-card border-r border-neon-purple/20 flex flex-col z-40">
      {/* Header */}
      <div className="p-6 border-b border-neon-purple/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                LUKTHAN
              </h1>
              <p className="text-xs text-text-muted">AI Prompt Agent</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 text-text-secondary">
            <SettingsIcon className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Settings</span>
          </div>

          <div className="space-y-4">
            {/* Domain */}
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Domain</label>
              <select
                value={settings.domain}
                onChange={(e) => handleSettingChange('domain', e.target.value)}
                className="w-full bg-bg-elevated border border-neon-cyan/30 rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-neon-cyan transition-colors cursor-pointer"
              >
                <option value="auto">Auto Detect</option>
                <option value="research">Research</option>
                <option value="coding">Coding</option>
                <option value="data_science">Data Science</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Target AI */}
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Target AI</label>
              <select
                value={settings.target_ai}
                onChange={(e) => handleSettingChange('target_ai', e.target.value)}
                className="w-full bg-bg-elevated border border-neon-cyan/30 rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-neon-cyan transition-colors cursor-pointer"
              >
                <optgroup label="OpenAI">
                  <option value="ChatGPT (GPT-4)">ChatGPT (GPT-4)</option>
                  <option value="ChatGPT (GPT-3.5)">ChatGPT (GPT-3.5)</option>
                </optgroup>
                <optgroup label="Anthropic">
                  <option value="Claude">Claude (Sonnet)</option>
                  <option value="Claude (Opus)">Claude (Opus)</option>
                </optgroup>
                <optgroup label="Google">
                  <option value="Gemini">Gemini</option>
                  <option value="Gemini Pro">Gemini Pro</option>
                </optgroup>
                <optgroup label="Open Source">
                  <option value="Llama">Llama</option>
                  <option value="Mistral">Mistral</option>
                </optgroup>
                <optgroup label="Code Assistants">
                  <option value="Copilot">GitHub Copilot</option>
                </optgroup>
              </select>
            </div>

            {/* Expertise Level */}
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Expertise Level</label>
              <select
                value={settings.expertise_level}
                onChange={(e) => handleSettingChange('expertise_level', e.target.value)}
                className="w-full bg-bg-elevated border border-neon-cyan/30 rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-neon-cyan transition-colors cursor-pointer"
              >
                <option value="Beginner">Beginner - Simple explanations</option>
                <option value="Intermediate">Intermediate - Some knowledge</option>
                <option value="Professional">Professional - Industry standard</option>
                <option value="Expert">Expert - Advanced & in-depth</option>
              </select>
            </div>

            {/* Output Language */}
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Output Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full bg-bg-elevated border border-neon-cyan/30 rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-neon-cyan transition-colors cursor-pointer"
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Arabic">Arabic</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-text-secondary">
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Pro Tips</span>
          </div>
          <ul className="space-y-2 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
              <span>Be specific about your requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-neon-purple mt-0.5 flex-shrink-0" />
              <span>Add context for better results</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-neon-pink mt-0.5 flex-shrink-0" />
              <span>Upload files to include code or docs</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <span>Use voice input for quick prompts</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neon-purple/20">
        <button
          onClick={clearMessages}
          className="w-full py-2.5 px-4 text-sm text-text-secondary hover:text-error border border-text-muted/30 hover:border-error/50 rounded-lg transition-colors"
        >
          Clear Conversation
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

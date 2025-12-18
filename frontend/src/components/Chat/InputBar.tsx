import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Mic, MicOff, X, FileText, Loader2, Sparkles } from 'lucide-react';
import { usePromptAgent } from '../../hooks/usePromptAgent';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useChatStore } from '../../stores/chatStore';

interface AttachedFile {
  name: string;
  content: string;
  type: string;
}

const InputBar = () => {
  const [inputValue, setInputValue] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { chat, handleFileUpload, isLoading, isThinking } = usePromptAgent();
  const { isLoading: storeLoading, isThinking: storeThinking } = useChatStore();

  const loading = isLoading || storeLoading;
  const thinking = isThinking || storeThinking;

  const { isRecording, isProcessing, toggleRecording } = useVoiceInput({
    onTranscription: (text) => setInputValue((prev) => (prev ? `${prev} ${text}` : text)),
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSend = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || loading) return;
    await chat(trimmedInput, attachedFile?.content || null, attachedFile?.type || null, attachedFile?.name);
    setInputValue('');
    setAttachedFile(null);
  }, [inputValue, attachedFile, loading, chat]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!loading && !thinking) handleSend();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await handleFileUpload(file);
    if (result) setAttachedFile({ name: result.name, content: result.content, type: result.type });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="border-t border-violet-500/20 bg-gradient-to-t from-[#030014] to-[#0a0a1a]/80 px-4 py-3">
      {/* Thinking indicator - Compact */}
      {thinking && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2 flex items-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </motion.div>
          <span className="text-xs text-cyan-400">Thinking...</span>
          <div className="thinking-dots"><span></span><span></span><span></span></div>
        </motion.div>
      )}

      {/* Attached file - Compact */}
      {attachedFile && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-2 flex items-center gap-2 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 max-w-fit">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-white truncate max-w-[150px]">{attachedFile.name}</span>
          <button onClick={() => setAttachedFile(null)} className="p-1 hover:bg-red-500/20 rounded">
            <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
          </button>
        </motion.div>
      )}

      {/* Input container - Compact */}
      <motion.div
        animate={{ boxShadow: isFocused ? '0 0 20px rgba(0, 255, 255, 0.1)' : '0 0 10px rgba(139, 92, 246, 0.05)' }}
        className={`flex items-end gap-2 rounded-xl border p-2.5 transition-all ${
          isFocused ? 'bg-white/5 border-cyan-500/40' : 'bg-white/[0.02] border-violet-500/20'
        }`}
      >
        {/* File attach */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all disabled:opacity-50"
        >
          <Paperclip className="w-4 h-4" />
        </motion.button>
        <input ref={fileInputRef} type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.md,.py,.js,.ts,.tsx,.jsx,.java,.c,.cpp,.css,.html,.json,.xml,.png,.jpg,.jpeg" className="hidden" />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Describe what you want to create..."
          disabled={loading}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none min-h-[32px] max-h-[120px] py-1.5 text-sm leading-relaxed disabled:opacity-50"
        />

        {/* Voice */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleRecording}
          disabled={loading || isProcessing}
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
            isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:text-cyan-400 hover:border-cyan-500/30'
          } disabled:opacity-50`}
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </motion.button>

        {/* Send */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!inputValue.trim() || loading}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all relative overflow-hidden disabled:opacity-30"
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 ${!inputValue.trim() || loading ? 'opacity-30' : 'opacity-100'}`} />
          {loading ? <Loader2 className="w-4 h-4 animate-spin relative text-white" /> : <Send className="w-4 h-4 relative text-white" />}
        </motion.button>
      </motion.div>

      {/* Helper - Very compact */}
      <div className="mt-1.5 flex items-center justify-center gap-3 text-[10px] text-gray-600">
        <span><kbd className="px-1 py-0.5 bg-white/5 rounded border border-violet-500/20 text-[9px]">Enter</kbd> send</span>
        <span><kbd className="px-1 py-0.5 bg-white/5 rounded border border-violet-500/20 text-[9px]">Shift+Enter</kbd> new line</span>
      </div>
    </div>
  );
};

export default InputBar;

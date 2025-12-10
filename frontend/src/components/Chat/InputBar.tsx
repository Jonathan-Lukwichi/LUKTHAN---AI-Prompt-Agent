import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff, X, FileText, Loader2, Brain } from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { chat, handleFileUpload, isLoading, isThinking } = usePromptAgent();
  const { isLoading: storeLoading, isThinking: storeThinking } = useChatStore();

  const loading = isLoading || storeLoading;
  const thinking = isThinking || storeThinking;

  // Voice input
  const { isRecording, isProcessing, toggleRecording } = useVoiceInput({
    onTranscription: (text) => {
      setInputValue((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleSend = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || loading) return;

    await chat(
      trimmedInput,
      attachedFile?.content || null,
      attachedFile?.type || null,
      attachedFile?.name
    );

    setInputValue('');
    setAttachedFile(null);
  }, [inputValue, attachedFile, loading, chat]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await handleFileUpload(file);
    if (result) {
      setAttachedFile({
        name: result.name,
        content: result.content,
        type: result.type,
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  return (
    <div className="border-t border-neon-purple/20 bg-bg-deep p-4">
      {/* Thinking indicator */}
      {thinking && (
        <div className="mb-3 flex items-center gap-2 text-neon-purple text-sm animate-pulse">
          <Brain className="w-4 h-4" />
          <span>LUKTHAN is thinking...</span>
        </div>
      )}

      {/* Attached file preview */}
      {attachedFile && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-bg-card rounded-lg border border-neon-cyan/30 max-w-fit">
          <FileText className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm text-text-primary truncate max-w-[200px]">
            {attachedFile.name}
          </span>
          <button
            onClick={removeAttachedFile}
            className="p-1 hover:bg-bg-elevated rounded transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4 text-text-muted hover:text-error" />
          </button>
        </div>
      )}

      {/* Input container */}
      <div className="flex items-end gap-3 bg-bg-card rounded-2xl border border-neon-cyan/30 p-3 shadow-glow transition-all focus-within:border-neon-cyan">
        {/* File attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated hover:bg-neon-cyan/20 text-text-secondary hover:text-neon-cyan transition-colors disabled:opacity-50"
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.md,.py,.js,.ts,.tsx,.jsx,.java,.c,.cpp,.css,.html,.json,.xml,.png,.jpg,.jpeg"
          className="hidden"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Say hello or describe what you need..."
          disabled={loading}
          rows={1}
          className="flex-1 bg-transparent text-text-primary placeholder-text-muted resize-none outline-none min-h-[40px] max-h-[200px] py-2 text-sm leading-relaxed disabled:opacity-50"
        />

        {/* Voice button */}
        <button
          onClick={toggleRecording}
          disabled={loading || isProcessing}
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            isRecording
              ? 'bg-error text-white animate-pulse'
              : 'bg-bg-elevated hover:bg-neon-purple/20 text-text-secondary hover:text-neon-purple'
          } disabled:opacity-50`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || loading}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-glow hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          aria-label="Send message"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Helper text */}
      <p className="mt-2 text-xs text-text-muted text-center">
        Chat naturally or ask for prompt optimization - Press Enter to send
      </p>
    </div>
  );
};

export default InputBar;

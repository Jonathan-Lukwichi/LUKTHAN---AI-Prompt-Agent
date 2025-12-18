import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../stores/chatStore';
import {
  getHistory,
  clearHistory as clearHistoryApi,
  type HistoryItem
} from '../../api/client';
import toast from 'react-hot-toast';
import {
  Plus,
  Clock,
  MessageSquare,
  Trash2,
  ChevronRight,
  Loader2,
  Zap
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  collapsed?: boolean;
}

const Sidebar = ({ isOpen, collapsed = false }: SidebarProps) => {
  const { messages, clearMessages, addMessage } = useChatStore();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const data = await getHistory(10);
        setHistory(data.sessions);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [messages.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const groupedHistory = history.reduce((acc, item) => {
    const dateLabel = formatDate(item.created_at);
    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  const handleClearHistory = async () => {
    try {
      await clearHistoryApi();
      setHistory([]);
      clearMessages();
      toast.success('History cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const handleHistoryClick = (item: HistoryItem) => {
    addMessage({ type: 'user', content: item.raw_prompt });
    toast.success('Loaded from history');
  };

  if (!isOpen) return null;

  if (collapsed) {
    return (
      <aside className="w-14 bg-[#0a0a1a] border-r border-violet-500/20 flex flex-col h-full py-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearMessages}
          className="mx-auto p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </aside>
    );
  }

  return (
    <aside className="w-52 bg-gradient-to-b from-[#0a0a1a] to-[#030014] border-r border-violet-500/20 flex flex-col h-full">
      {/* New Chat Button - Compact */}
      <div className="p-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={clearMessages}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-white text-sm transition-all relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 opacity-90" />
          <span className="relative flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Chat
          </span>
        </motion.button>
      </div>

      {/* History - Compact */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="flex items-center gap-1.5 px-2 py-2 text-gray-500">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">History</span>
          {isLoadingHistory && <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />}
        </div>

        {history.length > 0 ? (
          <div className="space-y-2">
            {Object.entries(groupedHistory).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <div className="px-2 py-1 text-[10px] text-gray-600">{dateLabel}</div>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 2 }}
                      onClick={() => handleHistoryClick(item)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg transition-all group hover:bg-white/5"
                    >
                      <MessageSquare className="w-3 h-3 flex-shrink-0 text-violet-400" />
                      <span className="truncate flex-1 text-left text-[11px]">{item.raw_prompt}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-2 py-4 text-center">
            <MessageSquare className="w-5 h-5 text-violet-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500">No history yet</p>
          </div>
        )}

        {/* Pro Tip - Very Compact */}
        <div className="mt-3 rounded-xl p-2.5 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 border border-violet-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-semibold text-white">Pro Tip</span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Be specific for <span className="text-cyan-400">better results</span>.
          </p>
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="p-2 border-t border-violet-500/10">
        <button
          onClick={handleClearHistory}
          disabled={history.length === 0 && messages.length === 0}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] text-gray-500 hover:text-red-400 rounded-lg transition-all hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3 h-3" />
          Clear History
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

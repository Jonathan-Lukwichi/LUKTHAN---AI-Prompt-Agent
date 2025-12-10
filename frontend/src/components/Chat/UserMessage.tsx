import { FileText, User } from 'lucide-react';

interface UserMessageProps {
  content: string;
  timestamp: Date;
  fileName?: string;
}

const UserMessage = ({ content, timestamp, fileName }: UserMessageProps) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] md:max-w-[70%]">
        {/* File attachment indicator */}
        {fileName && (
          <div className="flex items-center justify-end gap-2 mb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg">
              <FileText className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm text-neon-cyan truncate max-w-[200px]">
                {fileName}
              </span>
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div className="relative">
          <div className="bg-gradient-to-br from-neon-cyan/15 to-neon-purple/15 border border-neon-cyan/30 rounded-[20px] rounded-br-[4px] px-4 py-3">
            <p className="text-text-primary text-sm whitespace-pre-wrap break-words">
              {content}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-end gap-1.5 mt-1.5 text-text-muted">
            <User className="w-3 h-3" />
            <span className="text-xs">You</span>
            <span className="text-xs">•</span>
            <span className="text-xs">{formatTime(timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMessage;

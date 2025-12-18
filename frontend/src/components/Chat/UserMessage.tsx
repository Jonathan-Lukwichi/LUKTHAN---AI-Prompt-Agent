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
            <div className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary border border-border-subtle rounded-lg">
              <div className="w-6 h-6 rounded bg-info/20 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-info" />
              </div>
              <span className="text-sm text-text-secondary truncate max-w-[200px]">
                {fileName}
              </span>
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div className="relative">
          <div className="bg-accent/10 border border-accent/20 rounded-xl rounded-br-sm px-4 py-3">
            <p className="text-text-primary text-sm whitespace-pre-wrap break-words leading-relaxed">
              {content}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-end gap-1.5 mt-1.5 text-text-muted">
            <div className="w-4 h-4 rounded bg-bg-tertiary flex items-center justify-center">
              <User className="w-2.5 h-2.5" />
            </div>
            <span className="text-xs font-medium">You</span>
            <span className="text-xs opacity-50">•</span>
            <span className="text-xs">{formatTime(timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMessage;

import React from 'react';

interface BadgeProps {
  text: string;
  color?: 'success' | 'warning' | 'error' | 'info';
}

const Badge: React.FC<BadgeProps> = ({ text, color = 'info' }) => {
  const colorClasses = {
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${colorClasses[color]}`}>
      {text}
    </span>
  );
};

export default Badge;
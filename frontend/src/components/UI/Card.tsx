import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-bg-card border border-transparent rounded-2xl p-4 shadow-lg ${className}`}>
      <h2 className="text-text-primary font-bold text-lg mb-2">{title}</h2>
      <div className="text-text-secondary">{children}</div>
    </div>
  );
};

export default Card;
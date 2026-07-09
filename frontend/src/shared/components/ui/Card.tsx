import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white rounded-md border border-neutral-100 shadow-card p-6 ${className}`}
    >
      {children}
    </div>
  );
}

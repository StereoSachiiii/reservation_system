import React from 'react';

interface PillProps {
    icon?: React.ReactNode;
    children: React.ReactNode;
    variant?: 'neutral' | 'success' | 'brand';
    className?: string;
    onClick?: () => void;
}

export function Pill({ icon, children, variant = 'neutral', className = '', onClick }: PillProps) {
    const baseClasses = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all';
    
    const variants = {
        success: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        neutral: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
        brand: 'bg-brand-500 text-white shadow-md shadow-brand-200 hover:bg-brand-600'
    };

    return (
        <div 
            className={`${baseClasses} ${variants[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {icon}
            {children}
        </div>
    );
}

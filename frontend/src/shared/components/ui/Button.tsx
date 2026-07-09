import React from 'react';


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    icon?: React.ReactNode;
}

export function Button({ variant = 'primary', icon, children, className = '', ...props }: ButtonProps) {
    const baseStyle = "px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-200 hover:shadow-md',
        secondary: 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50',
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {icon}
            {children}
        </button>
    );
}

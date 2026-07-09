import React from 'react';

export function SegmentedControl({ value, onChange, options }: any) {
    return (
        <div className="flex bg-slate-100/80 backdrop-blur p-1 rounded-xl shadow-inner border border-slate-200 inline-flex">
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                        value === opt.value
                            ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/50'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

import React from 'react';
import { User, Event } from '@/shared/types/api';

interface EmployeeHeaderProps {
    user: User | null;
    activeTab: 'SCAN' | 'DASHBOARD' | 'SEARCH';
    setActiveTab: (tab: 'SCAN' | 'DASHBOARD' | 'SEARCH') => void;
    onExport: () => void;
    events: Event[];
    selectedEventId: number | null;
    setSelectedEventId: (id: number) => void;
}

import { Shield, QrCode, Activity, Search, Download } from 'lucide-react';

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
    user, activeTab, setActiveTab, onExport,
    events, selectedEventId, setSelectedEventId
}) => {
    return (
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/80">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <Shield size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black tracking-tight text-slate-900 italic">OPS HUB</h1>
                            {events && events.length > 0 && (
                                <select
                                    className="bg-slate-50 border-2 border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-slate-500 focus:border-slate-500 block px-3 py-1.5 outline-none"
                                    value={selectedEventId || ''}
                                    onChange={(e) => setSelectedEventId(Number(e.target.value))}
                                >
                                    {events.map((evt: Event) => (
                                        <option key={evt.id} value={evt.id}>{evt.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Operator: {user?.username}
                        </p>
                    </div>
                </div>

                <nav className="flex bg-slate-50 p-1.5 rounded-[1.25rem] border border-slate-100 shadow-inner">
                    {[
                        { id: 'SCAN', label: 'Scanner', icon: QrCode },
                        { id: 'DASHBOARD', label: 'Monitor', icon: Activity },
                        { id: 'SEARCH', label: 'Directory', icon: Search }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'SCAN' | 'DASHBOARD' | 'SEARCH')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${activeTab === tab.id
                                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200 border border-slate-100'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Icon size={14} strokeWidth={3} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                <button
                    onClick={onExport}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-slate-200 active:scale-95"
                >
                    <Download size={14} />
                    Export Batch
                </button>
            </div>
        </header >
    );
};

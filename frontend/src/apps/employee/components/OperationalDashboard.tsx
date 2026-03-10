import React from 'react';
import { DashboardStats } from '@/shared/types/api';
import { Building2, ClipboardCheck, Users, Activity } from 'lucide-react';

interface OperationalDashboardProps {
    stats: DashboardStats | null;
    loadingStats: boolean;
}

export const OperationalDashboard: React.FC<OperationalDashboardProps> = ({ stats, loadingStats }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Total Stalls', val: stats?.totalStalls, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50' },
                    { title: 'Reserved', val: stats?.reservedStalls, icon: ClipboardCheck, color: 'text-slate-600', bg: 'bg-slate-50' },
                    { title: 'Checked In', val: stats?.checkedInCount || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all">
                            <div className="flex items-center gap-5 mb-6">
                                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.title}</h3>
                            </div>
                            <div className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums flex items-end gap-2">
                                {loadingStats ? (
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse"></div>
                                ) : stat.val}
                                <span className="text-xs text-slate-300 font-bold uppercase tracking-widest mb-2">Units</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-200 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-600/20 transition-colors duration-1000"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-10 flex items-center gap-4 italic italic">
                        <Activity className="text-blue-500" size={28} />
                        REAL-TIME FLOW
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold text-slate-400">
                                <span>Vendor Check-in Progress</span>
                                <span>{stats?.reservedStalls ? Math.round(((stats?.checkedInCount || 0) / stats.reservedStalls) * 100) : 0}%</span>
                            </div>
                            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-1000"
                                    style={{ width: `${stats?.reservedStalls ? Math.min(100, ((stats?.checkedInCount || 0) / stats.reservedStalls) * 100) : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

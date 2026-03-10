import React from 'react';
import { PageEnvelope, Reservation } from '@/shared/types/api';

interface DirectorySearchProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    searchResults: PageEnvelope<Reservation> | null;
    handleSearch: (e: React.FormEvent) => void;
}

import { Search, Hash, LayoutGrid, AlertCircle, Building2 } from 'lucide-react';

export const DirectorySearch: React.FC<DirectorySearchProps> = ({ searchQuery, setSearchQuery, searchResults, handleSearch }) => {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-10">
                <div className="flex-1 relative group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Business or ID..."
                        className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white focus:ring-0 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={20} />
                </div>
                <button type="submit" className="px-10 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                    EXECUTE SEARCH
                </button>
            </form>

            <div className="space-y-4">
                {searchResults?.content.map((res: Reservation) => (
                    <div key={res.id} className="p-6 border border-slate-50 bg-slate-50/30 rounded-3xl flex justify-between items-center hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors shadow-sm border border-slate-100">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Hash size={12} className="text-slate-300" />
                                    <span className="font-black text-slate-900 tracking-tight">{res.id}</span>
                                    <span className="text-slate-300 mx-1">•</span>
                                    <span className="font-black text-slate-900 tracking-tight">{res.vendor}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                    <LayoutGrid size={10} />
                                    {res.stalls.join(', ')}
                                </div>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${res.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                            {res.status}
                        </div>
                    </div>
                ))}
                
                {searchQuery && searchResults?.content.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm border border-slate-50">
                            <AlertCircle size={32} />
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero Records Found</p>
                        <p className="text-slate-400 text-xs font-bold mt-2 italic">Try a broader keyword or ID</p>
                    </div>
                )}
                
                {!searchQuery && (
                    <div className="text-center py-20 text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] italic">
                        SYSTEM READY FOR QUERY
                    </div>
                )}
            </div>
        </div>
    );
};

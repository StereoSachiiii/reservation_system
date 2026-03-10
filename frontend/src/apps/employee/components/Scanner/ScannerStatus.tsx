interface AdmitSuccessViewProps {
    businessName: string;
    handleReset: () => void;
}



interface AdmitSuccessViewProps {
    businessName: string;
    handleReset: () => void;
}

interface LookupErrorViewProps {
    error: Error | null;
    handleReset: () => void;
}

import { Check, X, RefreshCcw, ChevronRight } from 'lucide-react';

export const AdmitSuccessView = ({ businessName, handleReset }: AdmitSuccessViewProps) => (
    <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-[2.5rem] p-10 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-emerald-200">
            <Check size={48} strokeWidth={3} />
        </div>
        <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-3">ACCESS GRANTED</h3>
        <p className="text-3xl font-black text-emerald-900 tracking-tight mb-8">{businessName}</p>
        
        <div className="flex items-center justify-center gap-6 p-4 bg-emerald-100/30 rounded-2xl mb-10">
            <div className="text-left">
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Entry Time</p>
                <p className="text-sm font-black text-emerald-800 tabular-nums">{new Date().toLocaleTimeString()}</p>
            </div>
            <div className="w-px h-8 bg-emerald-200"></div>
            <div className="text-left">
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Digital Pass</p>
                <p className="text-sm font-black text-emerald-800">Verified</p>
            </div>
        </div>

        <button
            onClick={handleReset}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
            NEXT IN LINE
            <ChevronRight size={14} />
        </button>
    </div>
);

export const LookupErrorView = ({ error, handleReset }: LookupErrorViewProps) => (
    <div className="bg-rose-50/50 border-2 border-rose-100 rounded-[2.5rem] p-10 text-center animate-in shake-in duration-500">
        <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-rose-200">
            <X size={48} strokeWidth={3} />
        </div>
        <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] mb-3">SYSTEM DENIAL</h3>
        <p className="text-xl font-black text-rose-900 tracking-tight mb-10 leading-relaxed uppercase">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(error as any)?.response?.data?.message || error?.message || "Internal Access Error"}
        </p>

        <button
            onClick={handleReset}
            className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3"
        >
            <RefreshCcw size={14} />
            REBOOT LOOKUP
        </button>
    </div>
);

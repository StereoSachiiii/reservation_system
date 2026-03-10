import { Layout, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReservationEmptyState = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-24 px-10 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner rotate-3 transition-transform">
                <Layout size={40} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 italic">Clean Slate</h3>
            <p className="text-slate-400 font-medium max-w-sm mb-10 text-sm leading-relaxed">
                You haven't made any reservations yet. Secure your spot at the next big event and start reaching more readers.
            </p>
            <button
                onClick={() => navigate('/events')}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-3"
            >
                Start Booking
                <ArrowRight size={14} />
            </button>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Reservation } from '@/shared/types/api';
import { vendorApi } from '@/shared/api/vendorApi';
import { StatusBadge } from './StatusBadge';
import { formatTimeLeft } from '@/shared/utils/format';
import { Trash2, Download } from 'lucide-react';

interface ReservationRowProps {
    res: Reservation;
    onCancel: (id: number) => void;
    isGrouped?: boolean;
}

export const ReservationRow = ({ res, onCancel, isGrouped }: ReservationRowProps) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await vendorApi.downloadTicket(res.id);
        } catch (e) {
            console.error('Download error', e);
        } finally {
            setIsDownloading(false);
        }
    }

    useEffect(() => {
        if (res.status !== 'PENDING_PAYMENT' || !res.expiresAt) return;

        const timer = setInterval(() => {
            const display = formatTimeLeft(res.expiresAt);
            setTimeLeft(display);
            if (display === 'Expired') clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [res.status, res.expiresAt]);

    return (
        <tr
            onClick={() => navigate(`/vendor/reservations/${res.id}`)}
            className="hover:bg-slate-50/80 transition-all cursor-pointer group border-b border-slate-50 last:border-0"
        >
            <td className="px-10 py-4">
                <span className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-500 transition-colors">
                    #{res.id}
                </span>
            </td>

            {!isGrouped && (
                <td className="px-6 py-4">
                    <div className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                        {res.event?.name || 'Colombo Book Fair 2026'}
                    </div>
                </td>
            )}

            <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                    {res.stalls.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded shadow-sm">
                            #{s}
                        </span>
                    ))}
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center">
                    <StatusBadge status={res.status} />
                    {res.status === 'PENDING_PAYMENT' && timeLeft && (
                        <span className="text-[8px] text-rose-500 font-black mt-1 animate-pulse">
                            {timeLeft}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="flex justify-end gap-3" onClick={e => e.stopPropagation()}>
                    {(res.status === 'PENDING_PAYMENT' || res.status === 'PAID') && (
                        <button
                            onClick={() => onCancel(res.id)}
                            className="text-rose-600 hover:text-white hover:bg-rose-600 p-2 rounded-xl transition-all active:scale-95 border-2 border-transparent hover:border-rose-100"
                            title={res.status === 'PAID' ? 'Request Refund' : 'Cancel Booking'}
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    {res.status === 'PAID' && (
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="text-indigo-600 hover:text-white hover:bg-indigo-600 p-2 rounded-xl transition-all active:scale-95 border-2 border-transparent hover:border-indigo-100"
                            title="Download Ticket"
                        >
                            <Download size={20} />
                        </button>
                    )}
                    {res.status === 'PENDING_REFUND' && <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest italic">Reviewing Refund</span>}
                </div>
            </td>
        </tr>
    );
};

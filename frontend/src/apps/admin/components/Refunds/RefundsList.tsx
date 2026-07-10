import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Reservation } from '@/shared/types/api';

const STATUS_COLORS: Record<string, string> = {
    PAID: 'bg-emerald-100 text-emerald-700',
    PENDING_REFUND: 'bg-amber-100 text-amber-700',
    PENDING_PAYMENT: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
    EXPIRED: 'bg-red-100 text-red-600',
};

interface RefundsListProps {
    refundable: Reservation[];
    isLoading: boolean;
    reasons: Record<number, string>;
    onReasonChange: (id: number, reason: string) => void;
    onRefundClick: (reservation: Reservation) => void;
    isRefunding: (id: number) => boolean;
}

export const RefundsList: React.FC<RefundsListProps> = ({
    refundable,
    isLoading,
    reasons,
    onReasonChange,
    onRefundClick,
    isRefunding
}) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-xs font-bold uppercase text-gray-700">Refund Queue</h3>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${refundable.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {isLoading ? '...' : `${refundable.length} pending`}
                </span>
            </div>

            {isLoading ? (
                <div className="py-16 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Loading...</p>
                </div>
            ) : refundable.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-sm font-bold text-gray-400">No pending refund requests</p>
                    <p className="text-[10px] text-gray-300 uppercase mt-1 font-semibold">Use the search bar above to look up a specific reservation</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                <th className="text-left px-6 py-3">Reservation</th>
                                <th className="text-left px-6 py-3">Vendor</th>
                                <th className="text-left px-6 py-3">Stall</th>
                                <th className="text-left px-6 py-3">Amount</th>
                                <th className="text-left px-6 py-3">Status</th>
                                <th className="text-left px-6 py-3">Reason</th>
                                <th className="text-left px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {refundable.map(res => (
                                <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-gray-900">RES-{res.id}</span>
                                            <button
                                                onClick={() => navigate(`/admin/reservations/${res.id}`)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                title="View details"
                                            >
                                                <ExternalLink size={12} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                            {res.createdAt ? new Date(res.createdAt).toLocaleDateString() : ''}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 text-xs">{res.user?.businessName || '—'}</p>
                                        <p className="text-[10px] text-gray-400 font-semibold">{res.user?.email || res.user?.username}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 text-xs">{(res.stalls || []).join(', ') || '—'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-black text-gray-900">
                                            LKR {((res.totalPriceCents || 0) / 100).toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${STATUS_COLORS[res.status] || 'bg-gray-100 text-gray-500'}`}>
                                            {res.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 min-w-[220px]">
                                        <input
                                            type="text"
                                            placeholder="Enter refund reason..."
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:border-red-400 focus:bg-white outline-none transition-all"
                                            value={reasons[res.id] || ''}
                                            onChange={e => onReasonChange(res.id, e.target.value)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onRefundClick(res)}
                                            disabled={isRefunding(res.id) || !reasons[res.id]?.trim()}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {isRefunding(res.id) ? 'Processing...' : 'Issue Refund'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

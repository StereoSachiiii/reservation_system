import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/adminApi';
import { Reservation } from '@/shared/types/api';
import { Undo2, CheckCircle2, AlertCircle, ExternalLink, Search, RefreshCw } from 'lucide-react';
import { RefundForm } from '../components/Refunds/RefundForm';

const STATUS_COLORS: Record<string, string> = {
    PAID: 'bg-emerald-100 text-emerald-700',
    PENDING_REFUND: 'bg-amber-100 text-amber-700',
    PENDING_PAYMENT: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
    EXPIRED: 'bg-red-100 text-red-600',
};

export default function RefundsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchId, setSearchId] = useState('');
    const [manualReservations, setManualReservations] = useState<Reservation[]>([]);
    const [reasons, setReasons] = useState<Record<number, string>>({});
    const [confirmModal, setConfirmModal] = useState<Reservation | null>(null);
    const [localError, setLocalError] = useState('');

    const refundsQuery = useQuery({
        queryKey: ['pending-refunds'],
        queryFn: adminApi.getPendingRefunds,
    });

    const searchMutation = useMutation({
        mutationFn: (id: string) => adminApi.getReservationById(id),
        onSuccess: (data) => {
            if (data.status === 'CANCELLED') {
                setLocalError(`RES-${data.id} is already cancelled.`);
                return;
            }
            if (data.status === 'PENDING_PAYMENT' || data.status === 'EXPIRED') {
                setLocalError(`RES-${data.id} has status "${data.status}" — only PAID or PENDING_REFUND reservations are eligible.`);
                return;
            }
            setManualReservations(prev =>
                prev.find(r => r.id === data.id) ? prev : [data, ...prev]
            );
            setSearchId('');
        },
        onError: (err: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const status = (err as any).response?.status;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any).response?.data?.message;
            setLocalError(status === 404
                ? `No reservation found with ID: ${searchId}`
                : message || 'Lookup failed.');
        }
    });

    const refundMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number, reason: string }) => adminApi.refundReservation(id, reason),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['pending-refunds'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setManualReservations(prev => prev.filter(r => r.id !== res.id));
            setReasons(prev => { const n = { ...prev }; delete n[res.id]; return n; });
            setConfirmModal(null);
            setTimeout(() => refundMutation.reset(), 5000);
        },
    });

    const handleSearch = () => {
        if (!searchId.trim()) return;
        setLocalError('');
        const numericId = searchId.toUpperCase().replace('RES-', '');
        if (!/^\d+$/.test(numericId)) {
            setLocalError('Invalid ID. Use a number or RES-XXX format.');
            return;
        }
        searchMutation.mutate(numericId);
    };

    const handleRefundSubmit = (reservation: Reservation, reasonOverride?: string) => {
        const reason = reasonOverride || reasons[reservation.id] || '';
        if (!reason.trim()) {
            setLocalError(`Please provide a reason before refunding RES-${reservation.id}.`);
            return;
        }
        refundMutation.mutate({ id: reservation.id, reason });
    };

    const refundable = useMemo(() => {
        const pending = refundsQuery.data || [];
        const combined = [...pending];
        manualReservations.forEach(manual => {
            if (!combined.find(r => r.id === manual.id)) {
                combined.unshift(manual);
            }
        });
        return combined;
    }, [refundsQuery.data, manualReservations]);

    const globalError = localError || 
                       (refundsQuery.error instanceof Error ? refundsQuery.error.message : '') || 
                       (refundMutation.error instanceof Error ? refundMutation.error.message : '');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-900 p-3 rounded-lg shadow-sm">
                        <Undo2 size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Refunds</h1>
                        <p className="text-gray-500 font-semibold uppercase text-[10px] mt-1">Transaction Reversal Management</p>
                    </div>
                </div>
                <button
                    onClick={() => refundsQuery.refetch()}
                    disabled={refundsQuery.isFetching}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-bold text-[10px] uppercase hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                >
                    <RefreshCw size={13} className={refundsQuery.isFetching ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Success Banner */}
            {refundMutation.isSuccess && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                        <p className="text-xs font-semibold text-green-800">
                            Refund for <span className="font-black">RES-{refundMutation.data.id}</span> issued successfully.
                        </p>
                    </div>
                    <div className="text-[10px] bg-white border border-green-200 text-green-800 px-3 py-1.5 rounded-md font-mono shrink-0 font-bold shadow-sm">
                        Txn ID: {refundMutation.data.refundTxId}
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {globalError && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg flex items-center gap-3">
                    <AlertCircle size={18} className="text-rose-600 shrink-0" />
                    <p className="text-xs font-semibold text-rose-700 flex-1">{globalError}</p>
                    <button onClick={() => setLocalError('')} className="text-rose-400 hover:text-rose-700 font-black text-xs">✕</button>
                </div>
            )}

            {/* Lookup bar */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex gap-3 items-center">
                <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Look up by Reservation ID (e.g. 57 or RES-57)"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-sm text-gray-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                        value={searchId}
                        onChange={e => setSearchId(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={searchMutation.isPending || !searchId.trim()}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-bold text-xs uppercase hover:bg-gray-700 transition-colors disabled:opacity-40"
                >
                    {searchMutation.isPending ? 'Searching...' : 'Search'}
                </button>
                <p className="text-[10px] font-semibold text-gray-400 uppercase whitespace-nowrap">
                    Eligible: <span className="text-blue-600">PAID</span> or <span className="text-amber-600">PENDING_REFUND</span>
                </p>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xs font-bold uppercase text-gray-700">Refund Queue</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${refundable.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                        {refundsQuery.isLoading ? '...' : `${refundable.length} pending`}
                    </span>
                </div>

                {refundsQuery.isLoading ? (
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
                                                onChange={e => setReasons(prev => ({ ...prev, [res.id]: e.target.value }))}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setConfirmModal(res)}
                                                disabled={refundMutation.isPending && refundMutation.variables?.id === res.id || !reasons[res.id]?.trim()}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                            >
                                                {refundMutation.isPending && refundMutation.variables?.id === res.id ? 'Processing...' : 'Issue Refund'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="max-w-md w-full animate-in zoom-in-95 duration-200 relative">
                        <button 
                            onClick={() => setConfirmModal(null)}
                            className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase text-[10px]"
                        >
                            Cancel
                            <AlertCircle size={18} />
                        </button>
                        <RefundForm 
                            reservation={confirmModal}
                            onRefund={(reason) => handleRefundSubmit(confirmModal, reason)}
                            loading={refundMutation.isPending && refundMutation.variables?.id === confirmModal.id}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

import { Reservation } from '@/shared/types/api';
import { ReservationRow } from './ReservationRow';
import { ReservationEmptyState } from './ReservationEmptyState';

interface ReservationsTableProps {
    reservations: Reservation[];
    onCancel: (id: number) => void;
}

export const ReservationsTable = ({ reservations, onCancel }: ReservationsTableProps) => {
    return (
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Reservations</h2>
                <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {reservations.length} Bookings
                </div>
            </div>

            <div className="overflow-x-auto">
                {reservations.length === 0 ? (
                    <ReservationEmptyState />
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Event Details</th>
                                <th className="px-6 py-4">Allocated Stalls</th>
                                <th className="px-6 py-4 text-center">Current Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 relative">
                            {reservations.map((res) => (
                                <ReservationRow key={res.id} res={res} onCancel={onCancel} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

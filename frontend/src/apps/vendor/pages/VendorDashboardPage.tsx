import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/useAuth';
import { useVendorDashboard } from '../hooks/useVendorDashboard';

// Sub-components
import { DashboardHeader } from '../components/Dashboard/DashboardHeader';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { ReservationsTable } from '../components/Dashboard/ReservationsTable';
import { CancelConfirmModal } from '../components/Dashboard/CancelConfirmModal';
import { AlertCircle, X } from 'lucide-react';

export const VendorDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const {
        reservations,
        limits,
        selectedRes,
        showCancelModal,
        setShowCancelModal,
        error,
        setLocalError,
        loading,
        handleCancelRequest,
        handleConfirmCancel,
        isCancelling
    } = useVendorDashboard();

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] pulse">Loading Assets...</p>
        </div>
    );

    return (
        <div className="container mx-auto p-6 md:p-12 max-w-7xl animate-in fade-in duration-500">
            <DashboardHeader
                businessName={user?.businessName}
                username={user?.username || ''}
                canBook={limits.remaining > 0}
                onBookClick={() => navigate('/events')}
            />

            {error && (
                <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 p-6 rounded-[2rem] mb-10 flex items-center gap-4 animate-in slide-in-from-top-4">
                    <div className="bg-rose-600 text-white p-2 rounded-xl">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="font-black uppercase text-[10px] tracking-widest leading-none mb-1">Service Alert</p>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                    <button onClick={() => setLocalError(null)} className="ml-auto text-rose-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>
            )}

            <DashboardStats
                limit={limits.limit}
                used={limits.used}
                remaining={limits.remaining}
            />

            <ReservationsTable
                reservations={reservations}
                onCancel={handleCancelRequest}
            />

            <CancelConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
                isLoading={isCancelling}
                status={selectedRes?.status}
            />
        </div>
    );
}

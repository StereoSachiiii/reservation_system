import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useVendorReservationDetail } from '../hooks/useVendorReservationDetail';
import { paymentApi } from '@/shared/api/paymentApi';

// Sub-components
import { StallAllocation } from '../components/VendorReservationDetail/StallAllocation';
import { EntryPass } from '../components/VendorReservationDetail/EntryPass';
import { PaymentSummary } from '../components/VendorReservationDetail/PaymentSummary';
import { GenreEditModal } from '../components/VendorReservationDetail/GenreEditModal';
import { CancelReservationModal } from '../components/VendorReservationDetail/CancelReservationModal';
import { QrFullscreenModal } from '../components/VendorReservationDetail/QrFullscreenModal';
import { ReservationDetailTour } from '../components/VendorReservationDetail/ReservationDetailTour';
import { Loader2, AlertCircle, ChevronLeft, CreditCard, Trash2, ShieldCheck, RefreshCw, Calendar, Tag } from 'lucide-react';

const AVAILABLE_CATEGORIES = [
    { id: 'FICTION', label: 'Fiction' },
    { id: 'NON_FICTION', label: 'Non-Fiction' },
    { id: 'CHILDREN', label: 'Children\'s Books' },
    { id: 'COMICS', label: 'Comics & Manga' },
    { id: 'TEXTBOOKS', label: 'Textbooks' },
    { id: 'RELIGION', label: 'Religion' },
    { id: 'STATIONERY', label: 'Stationery' }
];

export const VendorReservationDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const reservationId = Number(id);

    const {
        reservation, isLoading, error,
        showQrFullscreen, setShowQrFullscreen,
        showCancelConfirm, setShowCancelConfirm,
        showEditInfo, setShowEditInfo,
        selectedCategories, setSelectedCategories,
        cancelMutation, updateProfileMutation,
        handleDownloadTicket, openEditModal
    } = useVendorReservationDetail(reservationId);

    const location = useLocation();

    // Catch Stripe Redirect to confirm payment intent coupling
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const paymentIntent = query.get('payment_intent');
        const redirectStatus = query.get('redirect_status');

        if (paymentIntent && redirectStatus === 'succeeded') {
            paymentApi.confirmPayment(reservationId, paymentIntent)
                .then(() => {
                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                })
                .catch(err => console.error("Stripe confirm sync failed:", err));
        }
    }, [location.search, reservationId]);

    if (isLoading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest animate-pulse">Loading Reservation...</p>
        </div>
    );

    if (error || !reservation) {
        return (
            <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                    <AlertCircle size={40} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Booking Not Found</h3>
                <p className="text-slate-500 mt-2 mb-8 font-medium max-w-sm">
                    We were unable to retrieve the reservation details. It may have been deleted or moved.
                </p>
                <button
                    onClick={() => navigate('/vendor/dashboard')}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-2"
                >
                    <ChevronLeft size={16} />
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const { status, event } = reservation;
    const isCancelled = status === 'CANCELLED';
    const isPaid = status === 'PAID';

    // Safely parse date
    let formattedDate = 'TBA';
    if ((event as any)?.startDate) {
        const d = new Date((event as any).startDate);
        if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    return (
        <div className="animate-in fade-in duration-500 bg-white min-h-screen pb-32">
            <ReservationDetailTour />

            {/* Hero Header */}
            <div className="tour-hero bg-slate-900 text-white pt-12 pb-20 px-6 md:px-12 relative overflow-hidden border-b-8 border-indigo-500">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <button
                        onClick={() => navigate('/home')}
                        className="text-slate-400 hover:text-white flex items-center gap-2 mb-8 font-bold text-sm transition-colors"
                    >
                        <ChevronLeft size={16} strokeWidth={2.5} />
                        Back to Dashboard
                    </button>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ${
                            isPaid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                            isCancelled ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' :
                            'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                        }`}>
                            {status.replace('_', ' ')}
                        </span>
                        <span className="text-indigo-300 font-bold text-xs uppercase tracking-widest">
                            Booking #{reservation.id}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
                        {event?.name || 'Unknown Event'}
                    </h1>
                </div>
            </div>

            {/* Linear Content Flow */}
            <div className="max-w-4xl mx-auto px-6 md:px-12 mt-16 space-y-24">
                
                {/* 1. Event Schedule */}
                <section className="tour-datetime flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Event Schedule</h2>
                        <p className="text-xl font-medium text-indigo-600 mb-4">{formattedDate}</p>
                        <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
                            This is the date your stall is strictly reserved for. The gates will open to vendors at 6:00 AM. 
                            Please ensure you arrive at least 2 hours prior to the official event start time to complete your stall setup.
                        </p>
                    </div>
                </section>

                <hr className="border-slate-100" />

                {/* 2. Official Ticket */}
                <section className="tour-ticket">
                    <EntryPass
                        qrCode={reservation.qrCode}
                        isCancelled={isCancelled}
                        onShowFullscreen={() => setShowQrFullscreen(true)}
                        onDownloadTicket={handleDownloadTicket}
                    />
                </section>

                <hr className="border-slate-100" />

                {/* 3. Stall Specs */}
                <section className="tour-location">
                    <div className="mb-12">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Stall Specs & Location</h2>
                        <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
                            Here is the physical location and dimensions of your stall. Make sure to review the hall specifications carefully to plan your physical setup.
                        </p>
                    </div>
                    <StallAllocation reservation={reservation} />
                </section>

                <hr className="border-slate-100" />

                {/* 4. Billing & Management */}
                <section className="tour-payment flex flex-col lg:flex-row gap-16 items-start">
                    <div className="flex-1 w-full">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Billing & Receipt</h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-8">
                            A breakdown of the costs for this reservation.
                        </p>
                        <PaymentSummary reservation={reservation} />
                    </div>

                    <div className="flex-1 w-full lg:border-l lg:border-slate-100 lg:pl-16">
                         <h2 className="text-3xl font-black text-slate-900 mb-2">Management</h2>
                         <p className="text-slate-500 text-lg leading-relaxed mb-8">
                            Update your public profile or discard this booking.
                        </p>

                        {!isCancelled ? (
                            <div className="space-y-4">
                                <button onClick={openEditModal} className="w-full group bg-slate-50 hover:bg-indigo-50 transition-colors rounded-2xl p-6 text-left flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Tag className="w-4 h-4 text-indigo-500" />
                                            <h4 className="font-bold text-slate-900">Update Publisher Genre</h4>
                                        </div>
                                        <p className="text-sm text-slate-500">Change the categories shown for your stall on the map</p>
                                    </div>
                                    <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </button>

                                {status === 'PENDING_PAYMENT' && (
                                    <button
                                        onClick={() => navigate(`/checkout/${reservation.id}`)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-2xl transition-all shadow-xl shadow-emerald-200/50 uppercase text-sm tracking-widest active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        <CreditCard size={20} />
                                        Complete Payment
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowCancelConfirm(true)}
                                    disabled={status === 'PENDING_REFUND'}
                                    className={`w-full font-black py-5 rounded-2xl transition-all uppercase text-xs tracking-widest active:scale-[0.98] flex items-center justify-center gap-2 ${status === 'PENDING_REFUND'
                                        ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                                        : 'bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200'
                                        }`}
                                >
                                    {status === 'PAID' ? <ShieldCheck size={16} /> : status === 'PENDING_REFUND' ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    {status === 'PAID' ? 'Request Refund' : status === 'PENDING_REFUND' ? 'Refund in Progress' : 'Discard Booking'}
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 font-medium text-sm">
                                No actions available for cancelled bookings.
                            </div>
                        )}
                    </div>
                </section>

            </div>

            {/* Modals */}
            <QrFullscreenModal
                isOpen={showQrFullscreen}
                onClose={() => setShowQrFullscreen(false)}
                qrCode={reservation.qrCode || ''}
                onDownload={handleDownloadTicket}
            />

            <GenreEditModal
                isOpen={showEditInfo}
                onClose={() => setShowEditInfo(false)}
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                onSave={() => updateProfileMutation.mutate(selectedCategories)}
                isPending={updateProfileMutation.isPending}
                categories={AVAILABLE_CATEGORIES}
            />

            <CancelReservationModal
                isOpen={showCancelConfirm}
                onClose={() => setShowCancelConfirm(false)}
                onConfirm={() => cancelMutation.mutate()}
                isPending={cancelMutation.isPending}
                error={cancelMutation.error as any}
                status={status}
            />
        </div>
    );
};

export default VendorReservationDetailPage;

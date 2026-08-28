import { Reservation } from '@/shared/types/api';

interface StallAllocationProps {
    reservation: Reservation;
}

export const StallAllocation = ({ reservation }: StallAllocationProps) => {
    const { stallDetails } = reservation;

    let geo = { w: 0, h: 0 };
    if (stallDetails?.geometry) {
        try {
            geo = JSON.parse(stallDetails.geometry);
        } catch {
            // ignore
        }
    }

    if (!stallDetails) {
        return <p className="text-slate-500 text-lg italic">Basic stall reserved, detailed map data is unavailable at this time.</p>;
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
                <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Stall ID</p>
                    <p className="text-4xl font-black text-slate-900">{stallDetails.name}</p>
                </div>
                
                <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</p>
                    <p className="text-2xl font-bold text-slate-900 capitalize">{stallDetails.size.replace('_', ' ').toLowerCase()}</p>
                </div>

                <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Building</p>
                    <p className="text-xl font-bold text-slate-900">{stallDetails.buildingName || 'N/A'}</p>
                </div>

                <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Hall & Floor</p>
                    <p className="text-xl font-bold text-slate-900">
                        {stallDetails.hallName || 'N/A'} <span className="text-slate-400 font-medium">/ Lvl {stallDetails.floorLevel !== undefined ? stallDetails.floorLevel : 'N/A'}</span>
                    </p>
                </div>

                <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Business Category</p>
                    <p className="text-xl font-bold text-indigo-600 truncate">
                        {reservation.businessCategory ? reservation.businessCategory.replace(/_/g, ' ') : (reservation.user?.categories?.length ? reservation.user.categories.join(', ').replace(/_/g, ' ') : 'General')}
                    </p>
                </div>

                <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Stall Type</p>
                    <p className="text-xl font-bold text-slate-900">
                        {reservation.stallType || stallDetails.size || 'STANDARD'}
                    </p>
                </div>

                <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Reservation Date</p>
                    <p className="text-xl font-bold text-slate-900">
                        {reservation.reservationDate || 'Standard Booking'}
                    </p>
                </div>

                {reservation.specialRequirements && (
                    <div className="col-span-2 md:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Special Requirements / Notes</p>
                        <p className="text-sm font-medium text-slate-700">{reservation.specialRequirements}</p>
                    </div>
                )}

                {geo.w > 0 && (
                    <>
                        <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Dimensions</p>
                            <p className="text-2xl font-bold text-slate-900">{geo.w}m <span className="text-slate-300 mx-1 font-normal">×</span> {geo.h}m</p>
                        </div>
                        <div>
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Space</p>
                             <p className="text-2xl font-bold text-slate-900">{geo.w * geo.h} <span className="text-slate-400 text-lg font-medium">sqm</span></p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

import { Reservation } from '@/shared/types/api';

interface PaymentSummaryProps {
    reservation: Reservation;
}

export const PaymentSummary = ({ reservation }: PaymentSummaryProps) => {
    const { stallDetails, totalPriceCents } = reservation;

    return (
        <div className="w-full">
            <div className="space-y-6">
                {stallDetails && (
                    <>
                        <div className="flex justify-between items-center text-slate-600 text-lg">
                            <span>Base Rate</span>
                            <span className="font-medium">LKR {(stallDetails.baseRateCents / 100).toLocaleString()}</span>
                        </div>
                        {stallDetails.multiplier > 1 && (
                            <div className="flex justify-between items-center text-emerald-600 text-lg">
                                <span>Premium Location Multiplier</span>
                                <span className="font-bold">x{stallDetails.multiplier}</span>
                            </div>
                        )}
                        <hr className="border-slate-200 border-dashed" />
                    </>
                )}
                <div className="flex justify-between items-end">
                    <span className="text-slate-900 font-bold text-xl">Total Settled</span>
                    <span className="text-4xl font-black text-slate-900">LKR {((totalPriceCents || 0) / 100).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

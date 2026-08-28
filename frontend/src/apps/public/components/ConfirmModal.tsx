import { useState } from 'react'
import { MapStall, formatPrice } from '@/shared/types/stallMap.utils'
import { StallType, StallSize } from '@/shared/types/api'
import { Calendar, Tag, Layers, MessageSquare, Briefcase, Hash } from 'lucide-react'

interface ConfirmModalProps {
    selectedStalls: MapStall[]
    eventName: string
    totalCents: number
    isPending: boolean
    onConfirm: (details: {
        reservationDate: string,
        businessCategory: string,
        specialRequirements: string,
        stallType: StallType,
        preferredSize: StallSize,
        eventName: string
    }) => void
    onClose: () => void
}

const BUSINESS_CATEGORIES = [
    { value: 'FOOD_AND_BEVERAGE', label: 'Food & Beverage' },
    { value: 'CLOTHING', label: 'Clothing' },
    { value: 'ELECTRONICS', label: 'Electronics' },
    { value: 'HANDICRAFTS', label: 'Handicrafts' },
    { value: 'SERVICES', label: 'Services' },
    { value: 'FICTION', label: 'Fiction' },
    { value: 'NON_FICTION', label: 'Non-Fiction' },
    { value: 'ACADEMIC', label: 'Academic & Educational' },
    { value: 'CHILDREN', label: 'Children & Comics' },
    { value: 'STATIONERY', label: 'Stationery' },
    { value: 'OTHER', label: 'Other' }
];

export function ConfirmModal({
    selectedStalls,
    eventName,
    totalCents,
    isPending,
    onConfirm,
    onClose,
}: ConfirmModalProps) {
    const today = new Date().toISOString().split('T')[0];
    
    // Form fields for Assessment 2
    const [reservationDate, setReservationDate] = useState(today);
    const [businessCategory, setBusinessCategory] = useState('FICTION');
    const [stallType, setStallType] = useState<StallType>(selectedStalls[0]?.type || 'STANDARD');
    const [preferredSize, setPreferredSize] = useState<StallSize>(selectedStalls[0]?.size || 'MEDIUM');
    const [specialRequirements, setSpecialRequirements] = useState('');

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            reservationDate,
            businessCategory,
            specialRequirements,
            stallType,
            preferredSize,
            eventName
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]
                    flex items-center justify-center p-4">

            <div className="bg-white border border-slate-200 rounded-3xl
                      shadow-2xl z-10 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 block mb-1">
                        Stall Reservation Request
                    </span>
                    <h2 className="font-black text-slate-900 text-2xl tracking-tight">Configure Your Booking</h2>
                    <p className="text-slate-500 text-xs mt-1">Exhibition: <span className="font-bold text-slate-800">{eventName}</span></p>
                </div>

                {/* Form Body */}
                <form onSubmit={handleFormSubmit} className="overflow-y-auto p-8 space-y-6">
                    
                    {/* Selected Stalls Overview */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                            <span className="flex items-center gap-1.5"><Hash size={14} /> Selected Stalls ({selectedStalls.length})</span>
                            <span>Total Price</span>
                        </div>
                        <div className="space-y-1.5 max-h-28 overflow-y-auto">
                            {selectedStalls.map(s => (
                                <div key={s.id} className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-800">{s.templateName} <span className="text-xs font-normal text-slate-400">({s.size})</span></span>
                                    <span className="font-semibold text-slate-900">{formatPrice(s.priceCents)} LKR</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reservation Date (Calendar selection >= today) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Calendar size={14} className="text-indigo-600" /> Reservation Date (on or after today)
                        </label>
                        <input
                            type="date"
                            min={today}
                            value={reservationDate}
                            onChange={(e) => setReservationDate(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none transition"
                        />
                    </div>

                    {/* Stall Type & Preferred Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Tag size={14} className="text-indigo-600" /> Stall Type
                            </label>
                            <select
                                value={stallType}
                                onChange={(e) => setStallType(e.target.value as StallType)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none transition"
                            >
                                <option value="STANDARD">Standard</option>
                                <option value="PREMIUM">Premium</option>
                                <option value="CORNER">Corner Stall</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Layers size={14} className="text-indigo-600" /> Preferred Stall Size
                            </label>
                            <select
                                value={preferredSize}
                                onChange={(e) => setPreferredSize(e.target.value as StallSize)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none transition"
                            >
                                <option value="SMALL">Small</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LARGE">Large</option>
                            </select>
                        </div>
                    </div>

                    {/* Business Category */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Briefcase size={14} className="text-indigo-600" /> Business Category
                        </label>
                        <select
                            value={businessCategory}
                            onChange={(e) => setBusinessCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-indigo-600 focus:bg-white focus:outline-none transition"
                        >
                            {BUSINESS_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Special Requirements / Comments */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-indigo-600" /> Special Requirements or Comments
                        </label>
                        <textarea
                            rows={3}
                            value={specialRequirements}
                            onChange={(e) => setSpecialRequirements(e.target.value)}
                            placeholder="e.g., High-voltage power outlet, double display racks, near main aisle entrance..."
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none transition resize-none text-sm"
                        />
                    </div>

                    {/* Total & Footer Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Total Payable</span>
                            <span className="font-black text-slate-900 text-2xl tabular-nums">
                                {formatPrice(totalCents)}{' '}
                                <span className="text-xs text-slate-400 font-normal">LKR</span>
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700
                               rounded-xl font-bold text-xs uppercase tracking-wider transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                               text-white rounded-xl font-black text-xs uppercase
                               tracking-wider shadow-lg shadow-indigo-200 transition active:scale-95 flex items-center gap-2"
                            >
                                {isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : null}
                                {isPending ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

import React from 'react';
import { PublisherCategory } from '@/shared/types/api';
import { HALL_TIERS, PUBLISHER_GENRES, NOISE_LEVELS } from '@/shared/constants';
import { HallFormData } from './HallDetailsModal';

interface HallFormFieldsProps {
    formData: HallFormData;
    onChange: (field: string, value: string | number | boolean) => void;
}

export const HallFormFields: React.FC<HallFormFieldsProps> = ({ formData, onChange }) => {
    return (
        <>
            <div className="space-y-4">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-2">Core Info</h3>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Hall Name *</label>
                    <input
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. Hall A"
                        value={formData.name}
                        onChange={e => onChange('name', e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tier</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.tier}
                            onChange={e => onChange('tier', e.target.value)}
                        >
                            {HALL_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Floor Level</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.floorLevel}
                            onChange={e => onChange('floorLevel', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Total Sq Ft</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.totalSqFt}
                            onChange={e => onChange('totalSqFt', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Capacity</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.capacity}
                            onChange={e => onChange('capacity', e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Main Category</label>
                    <select
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.mainCategory}
                        onChange={e => onChange('mainCategory', e.target.value as PublisherCategory)}
                    >
                        {PUBLISHER_GENRES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-2">Environment & Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Expected Footfall</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.expectedFootfall}
                            onChange={e => onChange('expectedFootfall', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Noise Level</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.noiseLevel}
                            onChange={e => onChange('noiseLevel', e.target.value)}
                        >
                            {NOISE_LEVELS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Distance from Entrance (m)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.distanceFromEntrance}
                            onChange={e => onChange('distanceFromEntrance', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Distance from Parking (m)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.distanceFromParking}
                            onChange={e => onChange('distanceFromParking', e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nearby Facilities</label>
                    <input
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. Restrooms, Food Court, ATM"
                        value={formData.nearbyFacilities}
                        onChange={e => onChange('nearbyFacilities', e.target.value)}
                    />
                </div>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.isIndoor} onChange={e => onChange('isIndoor', e.target.checked)} className="rounded" />
                        <span className="text-xs font-bold text-gray-600 uppercase">Indoor</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.isAirConditioned} onChange={e => onChange('isAirConditioned', e.target.checked)} className="rounded" />
                        <span className="text-xs font-bold text-gray-600 uppercase">Air Conditioned</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.isGroundFloor} onChange={e => onChange('isGroundFloor', e.target.checked)} className="rounded" />
                        <span className="text-xs font-bold text-gray-600 uppercase">Ground Floor</span>
                    </label>
                </div>
            </div>
        </>
    );
};

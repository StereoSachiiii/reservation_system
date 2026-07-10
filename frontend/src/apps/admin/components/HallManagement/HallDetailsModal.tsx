import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Hall, Venue, Building, PublisherCategory } from '@/shared/types/api';

import { HallFormFields } from './HallFormFields';

export interface HallFormData {
    name: string;
    tier: string;
    floorLevel: string;
    totalSqFt: string;
    capacity: string;
    mainCategory: PublisherCategory;
    isIndoor: boolean;
    isAirConditioned: boolean;
    isGroundFloor: boolean;
    expectedFootfall: string;
    noiseLevel: string;
    distanceFromEntrance: string;
    distanceFromParking: string;
    nearbyFacilities: string;
}

interface HallDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingHall: Hall | null;
    selectedVenue: Venue | null;
    selectedBuilding: Building | null;
    onSave: (data: HallFormData) => Promise<void>;
    isSaving: boolean;
    error: string | null;
}

export const HallDetailsModal: React.FC<HallDetailsModalProps> = ({
    isOpen,
    onClose,
    editingHall,
    selectedVenue,
    selectedBuilding,
    onSave,
    isSaving,
    error
}) => {
    const [formData, setFormData] = useState<HallFormData>({
        name: '',
        tier: 'STANDARD',
        floorLevel: '1',
        totalSqFt: '0',
        capacity: '0',
        mainCategory: 'FICTION' as PublisherCategory,
        isIndoor: true,
        isAirConditioned: true,
        isGroundFloor: true,
        expectedFootfall: '0',
        noiseLevel: 'LOW',
        distanceFromEntrance: '0',
        distanceFromParking: '0',
        nearbyFacilities: ''
    });

    const [prevHallId, setPrevHallId] = useState<number | string | null>(null);
    const currentId = editingHall?.id || 'new';

    if (isOpen && currentId !== prevHallId) {
        setPrevHallId(currentId);
        if (editingHall) {
            setFormData({
                name: editingHall.name || '',
                tier: editingHall.tier || 'STANDARD',
                floorLevel: editingHall.floorLevel?.toString() || '1',
                totalSqFt: editingHall.totalSqFt?.toString() || '0',
                capacity: editingHall.capacity?.toString() || '0',
                mainCategory: editingHall.mainCategory || 'FICTION',
                isIndoor: editingHall.isIndoor ?? true,
                isAirConditioned: editingHall.isAirConditioned ?? true,
                isGroundFloor: editingHall.isGroundFloor ?? true,
                expectedFootfall: editingHall.expectedFootfall?.toString() || '0',
                noiseLevel: editingHall.noiseLevel || 'LOW',
                distanceFromEntrance: editingHall.distanceFromEntrance?.toString() || '0',
                distanceFromParking: editingHall.distanceFromParking?.toString() || '0',
                nearbyFacilities: editingHall.nearbyFacilities || ''
            });
        } else {
            setFormData({
                name: '',
                tier: 'STANDARD',
                floorLevel: '1',
                totalSqFt: '0',
                capacity: '0',
                mainCategory: 'FICTION',
                isIndoor: true,
                isAirConditioned: true,
                isGroundFloor: true,
                expectedFootfall: '0',
                noiseLevel: 'LOW',
                distanceFromEntrance: '0',
                distanceFromParking: '0',
                nearbyFacilities: ''
            });
        }
    }

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave(formData);
    };

    const handleChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                <div className="bg-gray-900 text-white p-6 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="font-bold text-sm uppercase tracking-wider">
                            {editingHall ? 'Edit Hall' : 'Create New Hall'}
                        </h2>
                        <p className="text-gray-400 text-[10px] mt-1 uppercase">
                            {selectedVenue?.name} / {selectedBuilding?.name}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-lg flex gap-2 items-center">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <HallFormFields formData={formData} onChange={handleChange} />

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs uppercase hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : editingHall ? 'Update Hall' : 'Create Hall'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

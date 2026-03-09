import React, { useState, ReactNode } from 'react';
import { Event, Hall } from '@/shared/types/api';
import { DesignerStall, DesignerZone, DesignerInfluence, DesignerDrawMode } from './types';
import { usePriceCalculation } from './hooks/usePriceCalculation';
import { DesignerContext } from './DesignerContext';

export function DesignerProvider({
    children,
    event,
    hall,
    initialStalls,
    initialZones = [],
    initialInfluences = []
}: {
    children: ReactNode;
    event: Event;
    hall: Hall;
    initialStalls: DesignerStall[];
    initialZones?: DesignerZone[];
    initialInfluences?: DesignerInfluence[];
}) {
    const [stalls, setStalls] = useState<DesignerStall[]>(initialStalls);
    const [zones, setZones] = useState<DesignerZone[]>(initialZones);
    const [influences, setInfluences] = useState<DesignerInfluence[]>(initialInfluences);
    const [drawMode, setDrawMode] = useState<DesignerDrawMode>('STALL');
    const [zoneType, setZoneType] = useState<DesignerZone['type']>('WALKWAY');
    const [influenceType, setInfluenceType] = useState<DesignerInfluence['type']>('TRAFFIC');
    const [editingStallId, setEditingStallId] = useState<number | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

    const updateStall = (id: number, patch: Partial<DesignerStall>) => {
        setStalls(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    };

    const deleteStall = (id: number) => {
        setStalls(prev => prev.filter(s => s.id !== id));
        if (editingStallId === id) setEditingStallId(null);
    };

    const { calculatePrice } = usePriceCalculation();

    return (
        <DesignerContext.Provider value={{
            event, hall, stalls, setStalls,
            zones, setZones, influences, setInfluences,
            drawMode, setDrawMode,
            zoneType, setZoneType,
            influenceType, setInfluenceType,
            editingStallId, setEditingStallId,
            isDrawing, setIsDrawing,
            startPos, setStartPos,
            currentPos, setCurrentPos,
            updateStall, deleteStall,
            calculatePrice
        }}>
            {children}
        </DesignerContext.Provider>
    );
}

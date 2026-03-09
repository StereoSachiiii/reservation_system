import { createContext } from 'react';
import { Event, Hall } from '@/shared/types/api';
import { DesignerStall, DesignerZone, DesignerInfluence, DesignerDrawMode } from './types';

export interface DesignerContextType {
    event: Event;
    hall: Hall;
    stalls: DesignerStall[];
    setStalls: React.Dispatch<React.SetStateAction<DesignerStall[]>>;
    zones: DesignerZone[];
    setZones: React.Dispatch<React.SetStateAction<DesignerZone[]>>;
    influences: DesignerInfluence[];
    setInfluences: React.Dispatch<React.SetStateAction<DesignerInfluence[]>>;
    drawMode: DesignerDrawMode;
    setDrawMode: React.Dispatch<React.SetStateAction<DesignerDrawMode>>;
    zoneType: DesignerZone['type'];
    setZoneType: React.Dispatch<React.SetStateAction<DesignerZone['type']>>;
    influenceType: DesignerInfluence['type'];
    setInfluenceType: React.Dispatch<React.SetStateAction<DesignerInfluence['type']>>;
    editingStallId: number | null;
    setEditingStallId: React.Dispatch<React.SetStateAction<number | null>>;
    isDrawing: boolean;
    setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
    startPos: { x: number; y: number } | null;
    setStartPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
    currentPos: { x: number; y: number } | null;
    setCurrentPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
    updateStall: (id: number, patch: Partial<DesignerStall>) => void;
    deleteStall: (id: number) => void;
    calculatePrice: (stall: DesignerStall, influences: DesignerInfluence[]) => DesignerStall;
}

export const DesignerContext = createContext<DesignerContextType | null>(null);

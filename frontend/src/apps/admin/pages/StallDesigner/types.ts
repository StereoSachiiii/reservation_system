import { StallSize, StallCategory } from '@/shared/types/api';

export type DesignerDrawMode = 'STALL' | 'ZONE' | 'INFLUENCE';

export interface DesignerZone {
    id: string; // usually UUID
    type: 'WALKWAY' | 'STAGE' | 'ENTRANCE';
    posX: number;
    posY: number;
    width: number;
    height: number;
    label: string;
}

export interface DesignerInfluence {
    id: string;
    type: 'NOISE' | 'TRAFFIC' | 'FACILITY';
    posX: number; // percentage cx
    posY: number; // percentage cy
    radius: number; // percentage r
    intensity: number; // 0-100
    falloff: string; // 'linear'|'LINEAR'|'exponential'|'EXPONENTIAL'
}

export interface DesignerStall {
    id: number;
    name: string;
    posX: number;
    posY: number;
    width: number;
    height: number;
    priceCents: number;
    baseRateCents: number;
    pricingVersion: string;
    size: StallSize;
    category: StallCategory;
    isAvailable: boolean;
    sqFt?: number;
}


/* 
This function parses the geometry of a stall

@param geometryString - The geometry of the stall
@returns The geometry of the stall
*/
export function parseGeometry(geometryString: string| null  ): { x: number; y: number; w: number; h: number } {
    if (!geometryString) return { x: 0, y: 0, w: 5, h: 5 };
    if (typeof geometryString === 'string') {
        try { return JSON.parse(geometryString); } catch { return { x: 0, y: 0, w: 5, h: 5 }; }
    }
    return geometryString;
}


/* 
This function gets the draw rectangle of a stall

@param start - The starting point of the stall
@param end - The ending point of the stall
@returns The draw rectangle of the stall
*/
export function getDrawRect(start: { x: number; y: number }, end: { x: number; y: number }) {
    return {
        x: Math.min(start.x, end.x), y: Math.min(start.y, end.y),
        w: Math.abs(end.x - start.x), h: Math.abs(end.y - start.y),
    };
}

export function toPercent(event: React.MouseEvent, element: HTMLElement) {
    const r = element.getBoundingClientRect();
    return { x: ((event.clientX - r.left) / r.width) * 100, y: ((event.clientY - r.top) / r.height) * 100 };
}

export function stallColor(cat: StallCategory, isSelected: boolean): string {
    if (isSelected) return 'bg-blue-100 border-blue-500 text-blue-800';
    switch (cat) {
        case 'FOOD': return 'bg-emerald-50 border-emerald-300 text-emerald-700';
        case 'SPONSOR': return 'bg-violet-50 border-violet-300 text-violet-700';
        case 'ANCHOR': return 'bg-amber-50 border-amber-300 text-amber-700';
        default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
}


/* 
This function fromats the price from cents to LKR format

@param cents - The price in cents
@returns The price in LKR format
*/
export const formatPrice = (cents: number) => `LKR ${(cents / 100).toLocaleString()} `;

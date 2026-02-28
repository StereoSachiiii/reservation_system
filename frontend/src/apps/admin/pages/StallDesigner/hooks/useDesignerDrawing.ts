import { useDesigner } from '../DesignerContext';
import { getDrawRect, DesignerStall, DesignerZone, DesignerInfluence } from '../types';

export function useDesignerDrawing() {
    const {
        stalls, setStalls,
        setZones,
        setInfluences,
        drawMode, zoneType, influenceType,
        setEditingStallId,
        isDrawing, setIsDrawing,
        startPos, setStartPos,
        currentPos, setCurrentPos
    } = useDesigner();

    const startDrawing = (pos: { x: number; y: number }) => {
        setIsDrawing(true);
        setStartPos(pos);
        setCurrentPos(pos);
        setEditingStallId(null);
    };

    const updateDrawing = (pos: { x: number; y: number }) => {
        if (isDrawing) {
            setCurrentPos(pos);
        }
    };

    const finalizeDrawing = () => {
        if (!isDrawing || !startPos || !currentPos) return;
        const rect = getDrawRect(startPos, currentPos);
        setIsDrawing(false);
        setStartPos(null);
        setCurrentPos(null);

        if (rect.w > 0.5 && rect.h > 0.5) {
            if (drawMode === 'STALL') {
                const newStall: DesignerStall = {
                    id: Date.now(),
                    name: `S-${stalls.length + 1}`,
                    geometry: rect,
                    priceCents: 500000,
                    size: 'MEDIUM',
                    category: 'RETAIL',
                    isAvailable: true,
                };
                setStalls(prev => [...prev, newStall]);
                setEditingStallId(newStall.id);
            } else if (drawMode === 'ZONE') {
                const newZone: DesignerZone = {
                    id: crypto.randomUUID(),
                    type: zoneType,
                    geometry: rect,
                    label: zoneType === 'WALKWAY' ? 'Main Walkway' : zoneType === 'STAGE' ? 'Main Stage' : 'Entrance'
                };
                setZones(prev => [...prev, newZone]);
            } else if (drawMode === 'INFLUENCE') {
                const newInf: DesignerInfluence = {
                    id: crypto.randomUUID(),
                    type: influenceType,
                    x: rect.x + (rect.w / 2),
                    y: rect.y + (rect.h / 2),
                    radius: Math.max(rect.w, rect.h) / 2,
                    intensity: 80,
                    falloff: 'linear'
                };
                setInfluences(prev => [...prev, newInf]);
            }
        }
    };

    return {
        isDrawing,
        startPos,
        currentPos,
        startDrawing,
        updateDrawing,
        finalizeDrawing
    };
}

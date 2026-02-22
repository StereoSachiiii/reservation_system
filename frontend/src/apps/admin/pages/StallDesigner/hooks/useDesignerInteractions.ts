import { useRef, useState } from 'react';
import { useDesigner } from '../DesignerContext';
import { getDrawRect, toPercent, DesignerStall, DesignerZone, DesignerInfluence } from '../types';

export function useDesignerInteractions() {
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

    const overlayRef = useRef<HTMLDivElement>(null);
    const [dragData, setDragData] = useState<{ id: string | number, type: 'STALL' | 'ZONE' | 'INFLUENCE', offsetX: number, offsetY: number } | null>(null);

    const handleItemMouseDown = (e: React.MouseEvent, id: string | number, type: 'STALL' | 'ZONE' | 'INFLUENCE', itemX: number, itemY: number) => {
        e.stopPropagation();
        if (type === 'STALL') {
            setEditingStallId(id as number);
        }
        if (!overlayRef.current) return;
        const pos = toPercent(e, overlayRef.current);
        setDragData({ id, type, offsetX: pos.x - itemX, offsetY: pos.y - itemY });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!overlayRef.current) return;
        setIsDrawing(true);
        const pos = toPercent(e, overlayRef.current);
        setStartPos(pos);
        setCurrentPos(pos);
        setEditingStallId(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!overlayRef.current) return;
        const pos = toPercent(e, overlayRef.current);

        if (dragData) {
            const newX = pos.x - dragData.offsetX;
            const newY = pos.y - dragData.offsetY;

            if (dragData.type === 'STALL') {
                setStalls(prev => prev.map(s => s.id === dragData.id ? { ...s, geometry: { ...s.geometry, x: newX, y: newY } } : s));
            } else if (dragData.type === 'ZONE') {
                setZones(prev => prev.map(z => z.id === dragData.id ? { ...z, geometry: { ...z.geometry, x: newX, y: newY } } : z));
            } else if (dragData.type === 'INFLUENCE') {
                setInfluences(prev => prev.map(inf => inf.id === dragData.id ? { ...inf, x: newX + inf.radius, y: newY + inf.radius } : inf));
            }
            return;
        }

        if (isDrawing) {
            setCurrentPos(pos);
        }
    };

    const handleMouseUp = () => {
        if (dragData) {
            setDragData(null);
            return;
        }
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
        overlayRef,
        handleItemMouseDown,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        isDrawing, startPos, currentPos, dragData
    };
}

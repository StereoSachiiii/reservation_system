import { useState } from 'react';
import { useDesigner } from '../DesignerContext';

export function useDesignerDragging() {
    const {
        setStalls,
        setZones,
        setInfluences,
        setEditingStallId,
    } = useDesigner();

    const [dragData, setDragData] = useState<{
        id: string | number,
        type: 'STALL' | 'ZONE' | 'INFLUENCE',
        offsetX: number,
        offsetY: number
    } | null>(null);

    const startDragging = (id: string | number, type: 'STALL' | 'ZONE' | 'INFLUENCE', pos: { x: number, y: number }, itemX: number, itemY: number) => {
        if (type === 'STALL') {
            setEditingStallId(id as number);
        }
        setDragData({ id, type, offsetX: pos.x - itemX, offsetY: pos.y - itemY });
    };

    const updateDragging = (pos: { x: number, y: number }) => {
        if (!dragData) return;

        const newX = pos.x - dragData.offsetX;
        const newY = pos.y - dragData.offsetY;

        if (dragData.type === 'STALL') {
            setStalls(prev => prev.map(s => s.id === dragData.id ? { ...s, geometry: { ...s.geometry, x: newX, y: newY } } : s));
        } else if (dragData.type === 'ZONE') {
            setZones(prev => prev.map(z => z.id === dragData.id ? { ...z, geometry: { ...z.geometry, x: newX, y: newY } } : z));
        } else if (dragData.type === 'INFLUENCE') {
            setInfluences(prev => prev.map(inf => inf.id === dragData.id ? { ...inf, x: newX + inf.radius, y: newY + inf.radius } : inf));
        }
    };

    const stopDragging = () => {
        setDragData(null);
    };

    return {
        dragData,
        startDragging,
        updateDragging,
        stopDragging
    };
}

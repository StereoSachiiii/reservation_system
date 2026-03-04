import { useRef } from 'react';
import { toPercent, DesignerStall } from '../types';
import { useDesignerDrawing } from './useDesignerDrawing';
import { useDesignerDragging } from './useDesignerDragging';
import { useDesigner } from '../DesignerContext';

export function useDesignerInteractions() {
    const overlayRef = useRef<HTMLDivElement>(null);

    const {
        isDrawing,
        startPos,
        currentPos,
        startDrawing,
        updateDrawing,
        finalizeDrawing
    } = useDesignerDrawing();

    const {
        dragData,
        startDragging,
        updateDragging,
        stopDragging
    } = useDesignerDragging();

    const handleItemMouseDown = (e: React.MouseEvent, id: string | number, type: 'STALL' | 'ZONE' | 'INFLUENCE', itemX: number, itemY: number) => {
        e.stopPropagation();
        if (!overlayRef.current) return;
        const pos = toPercent(e, overlayRef.current);
        startDragging(id, type, pos, itemX, itemY);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!overlayRef.current) return;
        const pos = toPercent(e, overlayRef.current);
        startDrawing(pos);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!overlayRef.current) return;
        const pos = toPercent(e, overlayRef.current);

        if (dragData) {
            updateDragging(pos);
            const { stalls, zones, influences, calculatePrice } = useDesigner();
            if (dragData.type === 'STALL') {
                const targetStall = stalls.find((s: DesignerStall) => s.id === dragData.id);
                if (targetStall) {
                    const newX = pos.x - dragData.offsetX;
                    const newY = pos.y - dragData.offsetY;
                    const updatedStall = { ...targetStall, geometry: { ...targetStall.geometry, x: newX, y: newY } };
                    calculatePrice(updatedStall, stalls.map((s: DesignerStall) => s.id === updatedStall.id ? updatedStall : s), zones, influences);
                }
            }
        } else if (isDrawing) {
            updateDrawing(pos);
        }
    };

    const handleMouseUp = () => {
        if (dragData) {
            stopDragging();
        } else if (isDrawing) {
            finalizeDrawing();
        }
    };

    return {
        overlayRef,
        handleItemMouseDown,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        isDrawing,
        startPos,
        currentPos
    };
}


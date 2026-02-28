import { useRef } from 'react';
import { toPercent } from '../types';
import { useDesignerDrawing } from './useDesignerDrawing';
import { useDesignerDragging } from './useDesignerDragging';

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


import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapStall, parseGeometry, getStallRenderState, parseScore } from '../../types/stallMap.utils';
import { useStomp } from '@/shared/context/StompContext';
import { StallPresenceEvent } from '@/hooks/useStallUpdates';
import { STALL_STATUS } from '@/constants/stallStatus';

interface MapStallProps {
    stall: MapStall;
    selectedIds: number[];
    showHeatmap: boolean;
    onStallClick: (stallId: number, isReserved: boolean) => void;
    onHoverChange: (stall: MapStall | null, anchorRect: DOMRect | null) => void;
}

function PresenceDot({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full shadow-sm">
            {count}
        </div>
    );
}

export default function MapStallComponent({ stall, selectedIds, showHeatmap, onStallClick, onHoverChange }: MapStallProps) {
    const g = parseGeometry(stall);
    const isSelected = selectedIds.includes(stall.id);
    const score = stall.pricingBreakdown?.calculatedScore ?? parseScore(stall.pricingBreakdown?.['Visibility Score']);

    const [presence, setPresence] = useState<StallPresenceEvent | null>(null);
    const stompClient = useStomp();

    useEffect(() => {
        if (!stompClient || !stompClient.current || !stompClient.current.connected) return;
        
        const sub = stompClient.current.subscribe(`/topic/stalls/${stall.id}`, (msg) => {
            const event: StallPresenceEvent = JSON.parse(msg.body);
            if (event.status === "LOCKED" && isSelected) {
                alert(`Stall ${stall.templateName} was just reserved by another vendor!`);
            }
            setPresence(event);
        });
        return () => sub.unsubscribe();
    }, [stompClient, stall.id, isSelected]);

    let currentStatus: keyof typeof STALL_STATUS = 'AVAILABLE';
    if (stall.reserved) currentStatus = 'RESERVED';
    else if (isSelected) currentStatus = 'SELECTED';
    else if (presence && presence.status === 'VIEWING') currentStatus = 'VIEWING';
    else if (getStallRenderState(stall, selectedIds) === 'premium') currentStatus = 'PREMIUM';

    const style = STALL_STATUS[currentStatus];
    const isInteractive = !stall.reserved;

    const handleMouseEnter = useCallback((e: React.MouseEvent) => {
        onHoverChange(stall, (e.currentTarget as HTMLElement).getBoundingClientRect());
        // Broadcast presence
        if (stompClient?.current?.connected) {
            stompClient.current.publish({ destination: `/app/stall/${stall.id}/select` });
        }
    }, [stall, onHoverChange, stompClient]);

    const handleMouseLeave = useCallback(() => {
        onHoverChange(null, null);
        if (stompClient?.current?.connected) {
            stompClient.current.publish({ destination: `/app/stall/${stall.id}/deselect` });
        }
    }, [onHoverChange, stompClient, stall.id]);

    return (
        <motion.div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onStallClick(stall.id, stall.reserved)}
            style={{
                position: 'absolute',
                left: `${g.x}%`,
                top: `${g.y}%`,
                width: `${g.w}%`,
                height: `${g.h}%`,
                zIndex: isSelected ? 15 : 5,
            }}
            whileHover={isInteractive ? { scale: 1.03 } : undefined}
            whileTap={isInteractive ? { scale: 0.98 } : undefined}
            className={`
                rounded-md border-2 cursor-pointer flex flex-col items-center justify-center gap-0.5
                transition-colors duration-150 relative select-none
                ${style.border} ${style.fill}
                ${isSelected ? 'shadow-md ring-2 ring-brand-200' : 'shadow-sm'}
                ${!isInteractive ? 'cursor-not-allowed opacity-60' : ''}
            `}
        >
            {currentStatus === 'RESERVED' && (
                <span className="absolute top-1 left-1 text-[10px] leading-none opacity-50">🔒</span>
            )}

            <span className="text-xs font-semibold text-neutral-900 leading-none truncate w-full text-center px-0.5">
                {stall.templateName}
            </span>
            
            {g.h > 5 && (
                <span className={`text-[9px] font-medium uppercase tracking-wide leading-none ${showHeatmap ? 'text-brand-600' : 'text-neutral-500'}`}>
                    {showHeatmap ? `${score}%` : `${Math.round(stall.priceCents / 100000)}L`}
                </span>
            )}

            {currentStatus === 'VIEWING' && presence && (
                <PresenceDot count={presence.viewerCount} />
            )}
        </motion.div>
    );
}

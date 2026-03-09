import React, { memo, useState, useMemo } from 'react'
import { EventStall } from '@/shared/types/api'
import StallActionButtons from './StallActionButtons'
import StallDetailsOverlay from './StallDetailsOverlay'
import { cn } from '@/shared/utils/cn.ts'

interface StallItemProps {
    stall: EventStall;
    isSelected: boolean;
    onToggle: (id: number, reserved: boolean) => void;
}

/**
 * Represents a single stall on the event map.
 * Handles selection, focused state, and displays status overlays.
 */
const StallItem: React.FC<StallItemProps> = ({ stall, isSelected, onToggle }) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showDetails, setShowDetails] = useState(false)

    // Memoize grid class generation to avoid unnecessary recalculations
    const gridClasses = useMemo(() => {
        // Use explicit dimensions if provided by API (width/height represent spans)
        const colSpan = stall.width || 1;
        const rowSpan = stall.height || 1;

        if (colSpan > 1 || rowSpan > 1) {
            return `col-span-${colSpan} row-span-${rowSpan}`;
        }

        // Fallback: Size-based predefined spans
        switch (stall.size) {
            case 'LARGE': return 'col-span-2 row-span-2';
            case 'MEDIUM': return 'col-span-2 row-span-1';
            case 'SMALL':
            default: return 'col-span-1 row-span-1';
        }
    }, [stall.width, stall.height, stall.size]);

    const containerClasses = cn(
        "relative rounded-xl border-2 transition-all duration-300",
        "flex flex-col justify-center items-center",
        "min-h-[100px] shadow-sm overflow-hidden group",
        gridClasses,
        {
            "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80": stall.reserved,
            "bg-secondary border-primary-500 text-primary-400 shadow-glow-gold scale-[1.02] z-10 ring-2 ring-primary-500 ring-offset-2": isSelected,
            "bg-white border-gray-200 text-gray-600 hover:border-primary-400 hover:shadow-md cursor-pointer": !stall.reserved && !isSelected,
            "scale-[1.02] z-20": isFocused && !stall.reserved && !isSelected
        }
    );

    const hatchedStyle = useMemo(() =>
        stall.reserved ? {
            backgroundImage: 'repeating-linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 50%, #f3f4f6 50%, #f3f4f6 75%, transparent 75%, transparent)',
            backgroundSize: '10px 10px'
        } : {}, [stall.reserved]
    );

    // Handlers
    const handleFocus = () => {
        if (!stall.reserved && !isSelected) setIsFocused(true);
    };

    const handleBlur = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFocused(false);
        setShowDetails(false);
    };

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFocused(false);
        onToggle(stall.id, !!stall.reserved);
    };

    const toggleSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(stall.id, false);
    };

    return (
        <div
            onClick={handleFocus}
            onMouseLeave={() => !showDetails && setIsFocused(false)}
            className={containerClasses}
            style={hatchedStyle}
            role="button"
            aria-pressed={isSelected}
            tabIndex={stall.reserved ? -1 : 0}
            title={stall.reserved ? `Reserved by ${stall.occupiedBy || 'another user'}` : 'Available'}
        >
            {/* Background Content */}
            <div className={cn("transition-all duration-300 flex flex-col items-center", isFocused && "blur-md brightness-50")}>
                <span className="font-bold text-lg tracking-tight">{stall.name}</span>
                <span className={cn("text-[10px] uppercase tracking-widest mt-1 font-bold", isSelected ? "text-primary-500/80" : "text-gray-400")}>
                    {stall.size}
                </span>
            </div>

            {/* Status Indicator Dot */}
            {!stall.reserved && !isFocused && (
                <div
                    className={cn(
                        "absolute top-2 right-2 w-2 h-2 rounded-full",
                        isSelected ? "bg-primary-500 animate-pulse" : "bg-green-400"
                    )}
                />
            )}

            {/* Focus Overlay Actions */}
            {isFocused && !showDetails && !stall.reserved && !isSelected && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <StallActionButtons
                        onBook={handleSelect}
                        onDetails={(e) => { e.stopPropagation(); setShowDetails(true); }}
                    />
                </div>
            )}

            {/* Details Modal (Portal-based) */}
            {showDetails && (
                <StallDetailsOverlay
                    stall={stall}
                    onClose={handleBlur}
                />
            )}

            {/* Reserved Overlay */}
            {stall.reserved && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                    <span className="bg-gray-800 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg">
                        Reserved
                    </span>
                </div>
            )}

            {/* Selected Overlay Indicator */}
            {isSelected && (
                <button
                    onClick={toggleSelection}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-secondary shadow-lg hover:bg-black hover:text-white transition-all z-20 focus:outline-none focus:ring-2 focus:ring-black"
                    aria-label="Deselect stall"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default memo(StallItem);

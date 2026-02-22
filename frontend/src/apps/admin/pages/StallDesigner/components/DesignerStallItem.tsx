import { DesignerStall, stallColor, formatPrice } from '../types';

interface DesignerStallItemProps {
    stall: DesignerStall;
    isEditing: boolean;
    onMouseDown: (e: React.MouseEvent, id: string | number, type: 'STALL', itemX: number, itemY: number) => void;
}

export function DesignerStallItem({ stall, isEditing, onMouseDown }: DesignerStallItemProps) {
    return (
        <div
            onMouseDown={e => onMouseDown(e, stall.id, 'STALL', stall.geometry.x, stall.geometry.y)}
            className={`absolute border-2 transition-colors cursor-move flex flex-col items-center justify-center gap-0.5
                ${stallColor(stall.category, isEditing)}
                ${!stall.isAvailable ? 'opacity-40' : 'hover:shadow-md'}
                ${isEditing ? 'z-20 shadow-lg' : 'z-10'}`}
            style={{
                left: `${stall.geometry.x}%`,
                top: `${stall.geometry.y}%`,
                width: `${stall.geometry.w}%`,
                height: `${stall.geometry.h}%`,
            }}
        >
            <span className="font-black text-[9px] leading-none">{stall.name}</span>
            {stall.geometry.w > 4 && stall.geometry.h > 4 && (
                <span className="text-[7px] font-bold opacity-60">{formatPrice(stall.priceCents)}</span>
            )}
        </div>
    );
}

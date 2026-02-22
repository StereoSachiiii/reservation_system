import { DesignerZone } from '../types';

interface DesignerZoneItemProps {
    zone: DesignerZone;
    onMouseDown: (e: React.MouseEvent, id: string | number, type: 'ZONE', itemX: number, itemY: number) => void;
}

export function DesignerZoneItem({ zone, onMouseDown }: DesignerZoneItemProps) {
    const bg = zone.type === 'STAGE' ? 'bg-purple-100 border-purple-300' :
        zone.type === 'ENTRANCE' ? 'bg-orange-100 border-orange-300' :
            'bg-gray-200 border-gray-300';

    return (
        <div
            onMouseDown={e => onMouseDown(e, zone.id, 'ZONE', zone.geometry.x, zone.geometry.y)}
            className={`absolute border-2 ${bg} flex items-center justify-center opacity-70 cursor-move rounded-md`}
            style={{
                left: `${zone.geometry.x}%`,
                top: `${zone.geometry.y}%`,
                width: `${zone.geometry.w}%`,
                height: `${zone.geometry.h}%`
            }}
        >
            <span className="text-[10px] font-black uppercase text-gray-700/80 tracking-widest px-2 text-center leading-tight">
                {zone.label}
            </span>
        </div>
    );
}

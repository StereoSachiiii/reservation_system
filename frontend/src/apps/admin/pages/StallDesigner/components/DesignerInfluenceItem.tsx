import { DesignerInfluence } from '../types';

interface DesignerInfluenceItemProps {
    influence: DesignerInfluence;
    onMouseDown: (e: React.MouseEvent, id: string | number, type: 'INFLUENCE', itemX: number, itemY: number) => void;
}

export function DesignerInfluenceItem({ influence, onMouseDown }: DesignerInfluenceItemProps) {
    const color = influence.type === 'NOISE' ? 'bg-red-500' :
        influence.type === 'FACILITY' ? 'bg-blue-500' : 'bg-green-500';

    return (
        <div
            onMouseDown={e => onMouseDown(e, influence.id, 'INFLUENCE', influence.x - influence.radius, influence.y - influence.radius)}
            className="absolute z-0 mix-blend-multiply flex items-center justify-center cursor-move hover:border hover:border-gray-400 hover:border-dashed"
            style={{
                left: `${influence.x - influence.radius}%`,
                top: `${influence.y - influence.radius}%`,
                width: `${influence.radius * 2}%`,
                height: `${influence.radius * 2}%`,
                background: `radial-gradient(circle, ${color} ${influence.intensity}%, transparent 70%)`,
                opacity: 0.25
            }}
        >
            <div className={`w-2 h-2 rounded-full ${color}`} />
        </div>
    );
}

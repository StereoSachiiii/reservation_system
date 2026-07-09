import { useMemo } from 'react';
import { STALL_STATUS } from '@/constants/stallStatus';

export function StallHotspot({ status, code }: { status: keyof typeof STALL_STATUS, code: string }) {
    return (
        <div className={`w-full h-full rounded border flex items-center justify-center transition-colors shadow-sm
            ${status === 'AVAILABLE' ? 'bg-white/40 border-white/60 text-slate-800' : ''}
            ${status === 'VIEWING' ? 'bg-amber-400/40 border-amber-400/80 text-amber-900' : ''}
            ${status === 'SELECTED' ? 'bg-brand-500/40 border-brand-500/80 text-brand-900 ring-2 ring-brand-400' : ''}
            ${status === 'PREMIUM' ? 'bg-yellow-400/40 border-yellow-500/80 text-yellow-900' : ''}
            ${status === 'RESERVED' ? 'bg-slate-200/30 border-slate-300/50 text-slate-500 opacity-60' : ''}
        `}>
            <span className="text-[10px] font-black tracking-wide bg-white/50 px-1 rounded backdrop-blur-sm">{code}</span>
        </div>
    );
}

interface AerialMapStall {
    id: number;
    code?: string;
    templateName?: string;
    reserved?: boolean;
    position: {
        xPct: number;
        yPct: number;
        widthPct: number;
        heightPct: number;
    };
}

interface AerialMapProps {
    layout: { imageUrl: string };
    stalls: AerialMapStall[];
    statusByStallId: Record<string, string>;
    onSelectStall: (id: number, reserved: boolean) => void;
}

export function AerialMap({ layout, stalls, statusByStallId, onSelectStall }: AerialMapProps) {
  const renderedStalls = useMemo(() => {
      return stalls.filter((s) => s.position).map((stall) => (
        <button
          key={stall.id}
          className="absolute"
          style={{
            left: `${stall.position.xPct * 100}%`,
            top: `${stall.position.yPct * 100}%`,
            width: `${stall.position.widthPct * 100}%`,
            height: `${stall.position.heightPct * 100}%`,
          }}
          onClick={() => onSelectStall(stall.id, stall.reserved || false)}
        >
            <StallHotspot 
                code={stall.templateName || stall.code || ''}
                status={(statusByStallId[stall.id.toString()] as any) || 'AVAILABLE'} 
            />
        </button>
      ));
  }, [stalls, statusByStallId, onSelectStall]);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 bg-slate-100">
      <img
        src={layout.imageUrl}
        alt="Hall floor plan"
        className="w-full h-auto block"
      />
      {renderedStalls}
    </div>
  );
}

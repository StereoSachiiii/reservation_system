import HallPicker from './HallPicker';
import GenreReccomendation from './GenreReccomendation';
import { Sparkles, Map as MapIcon } from 'lucide-react';

interface StallMapHeaderProps {
    eventName: string;
    halls: string[];
    selectedHall: string | null;
    setSelectedHall: (hall: string) => void;
    isRecommended: (hall: string) => boolean;
    showHeatmap: boolean;
    setShowHeatmap: (show: boolean | ((v: boolean) => boolean)) => void;
    availableCount: number;
    selectedGenre?: string | null;
}

export const StallMapHeader = ({
    eventName,
    halls,
    selectedHall,
    setSelectedHall,
    isRecommended,
    showHeatmap,
    setShowHeatmap,
    availableCount,
    selectedGenre
}: StallMapHeaderProps) => {
    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-6xl px-4 flex justify-center">
            <div className="pointer-events-auto bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] rounded-[2rem] p-2 pl-6 pr-4 flex items-center gap-6 transition-all duration-500 hover:bg-white/95 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)]">
                
                {/* Brand / Event Name */}
                <div className="flex items-center gap-3 shrink-0 py-2">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-200">
                        <Sparkles className="w-4 h-4 text-white absolute animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-900 font-black text-base tracking-tight leading-none">
                            {eventName}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 mt-1">
                            Live Floorplan
                        </span>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-200 to-transparent shrink-0" />

                {/* Main Controls */}
                <div className="flex items-center gap-3">
                    {selectedGenre && (
                        <div className="scale-95 origin-right">
                            <GenreReccomendation genre={selectedGenre} />
                        </div>
                    )}
                    
                    <div className="bg-slate-50/80 rounded-2xl p-1 border border-slate-100 shadow-inner">
                        <HallPicker
                            halls={halls}
                            selectedHall={selectedHall}
                            onSelect={setSelectedHall}
                            isRecommended={isRecommended}
                        />
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-200 to-transparent shrink-0" />

                {/* Right Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => setShowHeatmap(v => !v)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border ${
                            showHeatmap 
                            ? 'bg-amber-100/80 text-amber-800 border-amber-200 shadow-sm' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                    >
                        <MapIcon className={`w-3.5 h-3.5 ${showHeatmap ? 'text-amber-600' : 'text-slate-400'}`} />
                        Heatmap
                    </button>
                    
                    <div className="flex flex-col items-center justify-center bg-slate-900 text-white rounded-xl px-4 py-1.5 shadow-lg shadow-slate-900/20">
                        <span className="text-lg font-black leading-tight tracking-tighter tabular-nums">{availableCount}</span>
                        <span className="text-[8px] uppercase font-bold tracking-widest text-slate-300">Free</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StallMapHeader;

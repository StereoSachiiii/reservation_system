import HallPicker from './HallPicker';
import GenreReccomendation from './GenreReccomendation';
import { Pill } from '@/shared/components/ui/Pill';

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
        <div
            className="absolute top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100/50
                     flex items-center justify-between px-6 py-0 shadow-sm"
            style={{ height: '56px' }}
        >
            {/* Left: Event info */}
            <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-900 font-extrabold text-sm tracking-tight truncate max-w-[140px]">
                        {eventName}
                    </span>
                </div>
            </div>

            {/* Middle: Recommendation + Picker */}
            <div className="flex items-center gap-3">
                {selectedGenre && <GenreReccomendation genre={selectedGenre} />}
                <HallPicker
                    halls={halls}
                    selectedHall={selectedHall}
                    onSelect={setSelectedHall}
                    isRecommended={isRecommended}
                />
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-2 p-1">
                    <Pill
                        variant={showHeatmap ? 'brand' : 'neutral'}
                        onClick={() => setShowHeatmap(v => !v)}
                        icon={<span>◉</span>}
                    >
                        {showHeatmap ? 'Heatmap On' : 'Heatmap'}
                    </Pill>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <Pill variant="neutral">
                        <span className="tabular-nums">{availableCount}</span>
                        <span className="text-slate-400 font-medium">Free</span>
                    </Pill>
                </div>
            </div>
        </div>
    );
};

export default StallMapHeader;

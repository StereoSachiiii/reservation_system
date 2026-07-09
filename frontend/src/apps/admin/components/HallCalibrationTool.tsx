import React, { useState, useRef } from 'react';

// Basic admin tool to draw bounding boxes
export function HallCalibrationTool({ layoutUrl, stalls, onSavePositions }: any) {
    const [rects, setRects] = useState<any[]>([]);
    const [drawing, setDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentRect, setCurrentRect] = useState<any>(null);
    const [selectedStallId, setSelectedStallId] = useState<number | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!selectedStallId || !imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setStartPos({ x, y });
        setDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!drawing || !imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setCurrentRect({
            x: Math.min(startPos.x, x),
            y: Math.min(startPos.y, y),
            width: Math.abs(x - startPos.x),
            height: Math.abs(y - startPos.y)
        });
    };

    const handleMouseUp = () => {
        if (!drawing || !currentRect || !imageRef.current || !selectedStallId) {
            setDrawing(false);
            return;
        }
        
        const img = imageRef.current;
        // Convert to percentage
        const xPct = currentRect.x / img.width;
        const yPct = currentRect.y / img.height;
        const widthPct = currentRect.width / img.width;
        const heightPct = currentRect.height / img.height;

        setRects([...rects, {
            stallTemplateId: selectedStallId,
            xPct, yPct, widthPct, heightPct
        }]);
        setDrawing(false);
        setCurrentRect(null);
        setSelectedStallId(null);
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Hall Calibration Tool</h2>
            <div className="flex gap-4 mb-4">
                <select 
                    className="border p-2 rounded"
                    value={selectedStallId || ''}
                    onChange={e => setSelectedStallId(parseInt(e.target.value))}
                >
                    <option value="">Select Stall to Map...</option>
                    {stalls.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.templateName || s.code}</option>
                    ))}
                </select>
                <button 
                    className="bg-brand-600 text-white px-4 py-2 rounded"
                    onClick={() => onSavePositions(rects)}
                >
                    Save All Positions
                </button>
            </div>
            
            <div 
                className="relative inline-block border-2 border-dashed border-slate-300"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img 
                    ref={imageRef}
                    src={layoutUrl} 
                    alt="Layout" 
                    className="max-w-4xl select-none"
                    draggable={false}
                />
                
                {rects.map((r, i) => (
                    <div 
                        key={i}
                        className="absolute border-2 border-brand-500 bg-brand-500/20"
                        style={{
                            left: `${r.xPct * 100}%`,
                            top: `${r.yPct * 100}%`,
                            width: `${r.widthPct * 100}%`,
                            height: `${r.heightPct * 100}%`
                        }}
                    >
                        <span className="text-[10px] font-bold bg-white/80">{r.stallTemplateId}</span>
                    </div>
                ))}
                
                {drawing && currentRect && (
                    <div 
                        className="absolute border-2 border-amber-500 bg-amber-500/20"
                        style={{
                            left: currentRect.x,
                            top: currentRect.y,
                            width: currentRect.width,
                            height: currentRect.height
                        }}
                    />
                )}
            </div>
        </div>
    );
}

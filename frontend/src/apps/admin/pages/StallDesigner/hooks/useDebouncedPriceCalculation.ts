import { useState, useCallback, useRef } from 'react';
import { DesignerStall, DesignerZone, DesignerInfluence } from '../types';

export function useDebouncedPriceCalculation(eventId: number, updateStall: (id: number, patch: Partial<DesignerStall>) => void) {
    const [calculatingPriceId, setCalculatingPriceId] = useState<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const calculatePrice = useCallback((
        stall: DesignerStall,
        stalls: DesignerStall[],
        zones: DesignerZone[],
        influences: DesignerInfluence[]
    ) => {
        if (!eventId) return;

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set calculating state
        setCalculatingPriceId(stall.id);

        // Debounce for 500ms
        timeoutRef.current = setTimeout(async () => {
            try {
                const layoutConfig = JSON.stringify({
                    width: 1100,
                    height: 720,
                    stalls,
                    zones,
                    influences
                });

                const request = {
                    geometry: JSON.stringify(stall.geometry),
                    baseRateCents: stall.priceCents || 0,
                    defaultProximityScore: 50,
                    layoutConfig
                };

                const response = await fetch(`/api/v1/admin/events/${eventId}/calculate-price-interactive`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(request)
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data['Final Price'] !== undefined) {
                        updateStall(stall.id, { priceCents: data['Final Price'] });
                    }
                }
            } catch (error) {
                console.error("Failed to calculate price interactively:", error);
            } finally {
                setCalculatingPriceId(null);
            }
        }, 500);
    }, [eventId, updateStall]);

    return {
        calculatingPriceId,
        calculatePrice
    };
}

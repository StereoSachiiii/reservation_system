import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/adminApi';
import { publicApi } from '@/shared/api/publicApi';


export function useStallPricing() {
    const queryClient = useQueryClient();
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

    // --- QUERIES ---

    const eventsQuery = useQuery({
        queryKey: ['admin-active-events'],
        queryFn: async () => {
            const data = await publicApi.getActiveEvents();
            return data.content || [];
        },
    });

    const stallsQuery = useQuery({
        queryKey: ['admin-event-stalls', selectedEventId],
        queryFn: () => adminApi.getEventStalls(selectedEventId!),
        enabled: !!selectedEventId,
    });

    // --- AUTO SELECTION ---
    useEffect(() => {
        if (!selectedEventId && eventsQuery.data && eventsQuery.data.length > 0) {
            setSelectedEventId(eventsQuery.data[0].id);
        }
    }, [eventsQuery.data, selectedEventId]);

    // --- MUTATIONS ---

    const updatePriceMutation = useMutation({
        mutationFn: ({ id, base, mult }: { id: number; base: number; mult: number }) => 
            adminApi.updateStallPrice(id, base, mult),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-event-stalls', selectedEventId] });
        }
    });

    const handleUpdate = async (id: number, base: number, mult: number) => {
        updatePriceMutation.mutate({ id, base, mult });
    };

    // --- DERIVED ---
    const stalls = useMemo(() => stallsQuery.data || [], [stallsQuery.data]);
    const events = useMemo(() => eventsQuery.data || [], [eventsQuery.data]);

    const stats = useMemo(() => {
        if (stalls.length === 0) return { avg: 0, max: 1, count: stalls.length };
        const prices = stalls.map(s => s.finalPriceCents || 0).filter(p => p > 0);
        const avg = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        const max = prices.length > 0 ? Math.max(...prices) : 0;
        return { avg, max, count: stalls.length };
    }, [stalls]);

    const pricingStalls = (stallsQuery.data || []).map(s => ({
        id: s.id,
        name: `Stall #${s.id}`,
        templateName: s.pricingVersion || 'Standard',
        baseRateCents: s.finalPriceCents || 0,
        multiplier: 1.0,
    }));

    const loading = eventsQuery.isLoading || stallsQuery.isLoading;
    const error = (eventsQuery.error instanceof Error ? eventsQuery.error.message : '') ||
                  (stallsQuery.error instanceof Error ? stallsQuery.error.message : '') ||
                  (updatePriceMutation.error instanceof Error ? updatePriceMutation.error.message : '');

    return {
        events, selectedEventId, setSelectedEventId,
        stalls, loading, error,
        handleUpdate, stats, pricingStalls
    };
}

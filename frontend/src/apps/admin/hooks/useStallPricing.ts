import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '@/shared/api/adminApi';
import { publicApi } from '@/shared/api/publicApi';
import { Event, EventStallAdminResponse } from '@/shared/types/api';

export function useStallPricing() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [stalls, setStalls] = useState<EventStallAdminResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const data = await publicApi.getActiveEvents();
            const eventList = data.content || [];
            setEvents(eventList);
            if (eventList.length > 0) {
                setSelectedEventId(eventList[0].id);
            }
        } catch {
            setError('Failed to load events.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedEventId) loadStallsForEvent(selectedEventId);
    }, [selectedEventId]);

    const loadStallsForEvent = async (eventId: number) => {
        setLoading(true);
        setError('');
        try {
            const stallList = await adminApi.getEventStalls(eventId);
            setStalls(stallList);
        } catch {
            setError('Failed to load stalls for this event.');
            setStalls([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id: number, base: number, mult: number) => {
        await adminApi.updateStallPrice(id, base, mult);
        setStalls(prev => prev.map(s => s.id === id
            ? { ...s, finalPriceCents: Math.round(base * mult), pricingVersion: 'MANUAL' }
            : s
        ));
    };

    const stats = useMemo(() => {
        if (stalls.length === 0) return { avg: 0, max: 1, count: stalls.length };
        const prices = stalls.map(s => s.finalPriceCents || 0).filter(p => p > 0);
        const avg = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        const max = prices.length > 0 ? Math.max(...prices) : 0;
        return { avg, max, count: stalls.length };
    }, [stalls]);

    const pricingStalls = stalls.map(s => ({
        id: s.id,
        name: `Stall #${s.id}`,
        templateName: s.pricingVersion || 'Standard',
        baseRateCents: s.finalPriceCents || 0,
        multiplier: 1.0,
    }));

    return {
        events, selectedEventId, setSelectedEventId,
        stalls, loading, error,
        handleUpdate, stats, pricingStalls
    };
}

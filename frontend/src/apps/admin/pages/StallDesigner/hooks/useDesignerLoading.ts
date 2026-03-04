import { useState, useEffect } from 'react';
import { adminApi } from '@/shared/api/adminApi';
import { publicApi } from '@/shared/api/publicApi';
import { Event, Hall } from '@/shared/types/api';
import { DesignerStall, parseGeometry, DesignerZone, DesignerInfluence } from '../types';
import { parseZones } from '@/shared/types/stallMap.utils';

export function useDesignerLoading(hallId: string | undefined) {
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<Event | null>(null);
    const [hall, setHall] = useState<Hall | null>(null);
    const [initialStalls, setInitialStalls] = useState<DesignerStall[]>([]);
    const [initialZones, setInitialZones] = useState<DesignerZone[]>([]);
    const [initialInfluences, setInitialInfluences] = useState<DesignerInfluence[]>([]);
    const [rawMapData, setRawMapData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!hallId) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const allHalls = await adminApi.getAllHalls();
                const currentHall = allHalls.find(h => h.id === Number(hallId));
                if (!currentHall) throw new Error("Hall not found");
                setHall(currentHall);

                const venues = await adminApi.getAllVenues();
                const currentVenue = venues.find(v =>
                    v.buildings?.some(b => b.halls?.some(h => h.id === Number(hallId)))
                );
                if (!currentVenue) throw new Error("Venue not found for this hall");

                const events = await adminApi.getAllEvents();
                const currentEvent = events.find(e => e.venueId === currentVenue.id);
                if (!currentEvent) throw new Error("No active event assigned to this venue");
                setEvent(currentEvent);

                const mapData = await publicApi.getEventMap(currentEvent.id).catch(() => ({ stalls: [] }));
                setRawMapData(mapData);

                const hallStalls = (mapData?.stalls || [])
                    .filter((s: any) => s.hallName === currentHall.name)
                    .map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        geometry: parseGeometry(s.geometry),
                        priceCents: s.priceCents,
                        size: s.size || 'MEDIUM',
                        category: s.type || 'RETAIL',
                        isAvailable: !s.reserved,
                        sqFt: s.sqFt,
                    }));

                setInitialStalls(hallStalls);

                const parsedConfig = parseZones(currentEvent.layoutConfig);
                const hallInfluences = parsedConfig.influences.filter(inf => !inf.hallName || inf.hallName === currentHall.name);
                setInitialInfluences(hallInfluences.map(inf => ({
                    id: inf.id,
                    type: inf.type as any,
                    x: inf.cx, y: inf.cy, radius: inf.r,
                    intensity: inf.intensity,
                    falloff: inf.falloff as any
                })));

                const hallZones = parsedConfig.zones.filter(z => !z.hallName || z.hallName === currentHall.name);
                setInitialZones(hallZones.map(z => ({
                    id: crypto.randomUUID(),
                    type: z.type,
                    geometry: { x: z.x, y: z.y, w: z.w, h: z.h },
                    label: z.label
                })));

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [hallId]);

    return {
        loading,
        event,
        hall,
        initialStalls,
        initialZones,
        initialInfluences,
        rawMapData,
        error,
        setRawMapData // For refreshing after save
    };
}

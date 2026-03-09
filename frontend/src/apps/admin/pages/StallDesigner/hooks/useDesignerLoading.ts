import { useState, useEffect } from 'react';
import { adminApi } from '@/shared/api/adminApi';
import { publicApi } from '@/shared/api/publicApi';
import { Event, Hall, EventStall } from '@/shared/types/api';
import { DesignerStall, DesignerZone, DesignerInfluence } from '../types';
import { normalizeMapData, NormalizedInfluence, NormalizedZone, RawEventMap, adaptToDesignerStall } from '@/shared/types/stallMap.utils';

export function useDesignerLoading(hallId: string | undefined) {
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<Event | null>(null);
    const [hall, setHall] = useState<Hall | null>(null);
    const [initialStalls, setInitialStalls] = useState<DesignerStall[]>([]);
    const [initialZones, setInitialZones] = useState<DesignerZone[]>([]);
    const [initialInfluences, setInitialInfluences] = useState<DesignerInfluence[]>([]);
    const [rawMapData, setRawMapData] = useState<RawEventMap | null>(null);
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

                const [mapDataRaw, adminStallsRaw, templatesRaw] = await Promise.all([
                    publicApi.getEventMap(currentEvent.id).catch(() => ({ eventId: currentEvent.id, eventName: currentEvent.name, stalls: [], zones: [], influences: [] })),
                    adminApi.getEventStalls(currentEvent.id).catch(() => []),
                    adminApi.getStallsByHall(currentHall.id).catch(() => [])
                ]);
                const mapData = mapDataRaw as RawEventMap;
                setRawMapData(mapData);

                const adminStallsMap = new Map(adminStallsRaw.map(s => [s.id, s]));
                const templatesMap = new Map(templatesRaw.map(t => [t.id, t]));

                const hallStalls: DesignerStall[] = (mapData?.stalls || [])
                    .filter((s: EventStall) => s.hallName === currentHall.name)
                    .map((s: EventStall) => {
                        const adminInfo = adminStallsMap.get(s.id);
                        const template = templatesMap.get(s.id) || Array.from(templatesMap.values()).find(t => t.name === s.templateName);
                        return adaptToDesignerStall(s, adminInfo, template);
                    });

                setInitialStalls(hallStalls);

                const parsedConfig = normalizeMapData(mapData.zones || [], mapData.influences || []);
                const hallInfluences: DesignerInfluence[] = parsedConfig.influences
                    .filter((inf: NormalizedInfluence) => !inf.hallName || inf.hallName === currentHall.name)
                    .map((inf: NormalizedInfluence) => ({
                        id: inf.id,
                        type: inf.type as DesignerInfluence['type'],
                        intensity: inf.intensity,
                        falloff: inf.falloff as DesignerInfluence['falloff'],
                        posX: inf.cx,
                        posY: inf.cy,
                        radius: inf.r
                    }));
                setInitialInfluences(hallInfluences);

                const hallZones: DesignerZone[] = parsedConfig.zones
                    .filter((z: NormalizedZone) => !z.hallName || z.hallName === currentHall.name)
                    .map((z: NormalizedZone) => ({
                        id: crypto.randomUUID(),
                        type: z.type as DesignerZone['type'],
                        posX: z.x,
                        posY: z.y,
                        width: z.w,
                        height: z.h,
                        label: z.label
                    }));
                setInitialZones(hallZones);

            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
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

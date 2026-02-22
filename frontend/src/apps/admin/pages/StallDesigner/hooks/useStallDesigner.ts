import { useState, useEffect } from 'react';
import { adminApi } from '@/shared/api/adminApi';
import { publicApi } from '@/shared/api/publicApi';
import { Event, Hall } from '@/shared/types/api';
import { DesignerStall, parseGeometry, DesignerZone, DesignerInfluence } from '../types';
import { parseZones } from '@/shared/types/stallMap.utils';

export function useStallDesigner(hallId: string | undefined) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const [event, setEvent] = useState<Event | null>(null);
    const [hall, setHall] = useState<Hall | null>(null);
    const [initialStalls, setInitialStalls] = useState<DesignerStall[]>([]);
    const [initialZones, setInitialZones] = useState<DesignerZone[]>([]);
    const [initialInfluences, setInitialInfluences] = useState<DesignerInfluence[]>([]);
    const [rawMapData, setRawMapData] = useState<any>(null);

    useEffect(() => {
        if (!hallId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const allHalls = await adminApi.getAllHalls();
                const currentHall = allHalls.find(h => h.id === Number(hallId));
                if (!currentHall) throw new Error("Hall not found");
                setHall(currentHall);

                const venues = await adminApi.getAllVenues();
                const currentVenue = venues.find(v =>
                    v.buildings.some(b => b.halls.some(h => h.id === Number(hallId)))
                );
                if (!currentVenue) throw new Error("Venue not found for this hall");

                const events = await adminApi.getAllEvents();
                const currentEvent = events.find(e => e.venueId === currentVenue.id);
                if (!currentEvent) throw new Error("No active event assigned to this venue");
                setEvent(currentEvent);

                const mapData = await publicApi.getEventMap(currentEvent.id).catch(() => ({ stalls: [] }));
                setRawMapData(mapData);

                const hallStalls = mapData.stalls
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
                setMessage({ text: 'Failed to load designer: ' + err.message, type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [hallId]);

    const handleSave = async (currentStalls: DesignerStall[], currentZones: DesignerZone[], currentInfluences: DesignerInfluence[]) => {
        if (!event || !hall || !rawMapData) return;
        setSaving(true);
        setMessage(null);
        try {
            const otherStalls = rawMapData.stalls.filter((s: any) => s.hallName !== hall.name);

            const payload = [
                ...otherStalls.map((s: any) => ({
                    id: s.id, name: s.name, hallName: s.hallName,
                    geometry: typeof s.geometry === 'object' ? JSON.stringify(s.geometry) : s.geometry,
                    finalPriceCents: s.priceCents,
                })),
                ...currentStalls.map(s => ({
                    id: s.id > 10_000_000_000 ? undefined : s.id,
                    name: s.name, hallName: hall.name,
                    geometry: JSON.stringify(s.geometry),
                    finalPriceCents: s.priceCents,
                })),
            ];

            await adminApi.saveLayout(event.id, payload as any);

            const oldConfig = parseZones(event.layoutConfig);
            const otherZones = oldConfig.zones.filter(z => z.hallName && z.hallName !== hall.name);
            const otherInfluences = oldConfig.influences.filter(inf => inf.hallName && inf.hallName !== hall.name);

            const layoutConfigObj = {
                width: 1000, height: 600,
                zones: [
                    ...otherZones.map(z => ({
                        hallName: z.hallName, type: z.type, geometry: { x: z.x, y: z.y, w: z.w, h: z.h }, metadata: { label: z.label }
                    })),
                    ...currentZones.map(z => ({
                        hallName: hall.name, type: z.type, geometry: z.geometry, metadata: { label: z.label }
                    }))
                ],
                influences: [
                    ...otherInfluences.map(inf => ({
                        hallName: inf.hallName, id: inf.id, type: inf.type, intensity: inf.intensity, falloff: inf.falloff,
                        x: (inf.cx / 100) * 1000,
                        y: (inf.cy / 100) * 600,
                        radius: (inf.r / 100) * 1000
                    })),
                    ...currentInfluences.map(inf => ({
                        hallName: hall.name, id: inf.id, type: inf.type, intensity: inf.intensity, falloff: inf.falloff,
                        x: (inf.x / 100) * 1000,
                        y: (inf.y / 100) * 600,
                        radius: (inf.radius / 100) * 1000
                    }))
                ]
            };

            await adminApi.updateEvent(event.id, {
                name: event.name,
                description: event.description,
                startDate: event.startDate,
                endDate: event.endDate,
                location: event.location,
                status: event.status,
                imageUrl: event.imageUrl,
                venueId: event.venueId,
                layoutConfig: JSON.stringify(layoutConfigObj)
            } as any);

            setMessage({ text: 'Layout & zones saved successfully!', type: 'success' });

            const freshMapData = await publicApi.getEventMap(event.id);
            setRawMapData(freshMapData);

            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ text: 'Save failed: ' + err.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return {
        loading, saving, message,
        event, hall, initialStalls, initialZones, initialInfluences,
        handleSave
    };
}

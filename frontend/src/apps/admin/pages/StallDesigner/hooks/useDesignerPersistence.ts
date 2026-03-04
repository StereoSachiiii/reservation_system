import { useState } from 'react';
import { adminApi } from '@/shared/api/adminApi';
import { publicApi } from '@/shared/api/publicApi';
import { Event, Hall } from '@/shared/types/api';
import { DesignerStall, DesignerZone, DesignerInfluence } from '../types';
import { parseZones } from '@/shared/types/stallMap.utils';

export function useDesignerPersistence() {
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleSave = async (
        event: Event,
        hall: Hall,
        rawMapData: any,
        currentStalls: DesignerStall[],
        currentZones: DesignerZone[],
        currentInfluences: DesignerInfluence[],
        onSuccess?: (freshMapData: any) => void
    ) => {
        setSaving(true);
        setMessage(null);
        try {
            const otherStalls = (rawMapData?.stalls || []).filter((s: any) => s.hallName !== hall.name);

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
            if (onSuccess) onSuccess(freshMapData);

            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ text: 'Save failed: ' + err.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return {
        saving,
        message,
        handleSave
    };
}

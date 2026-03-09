import { useState } from 'react';
import { adminApi } from '@/shared/api/adminApi';
import { publicApi } from '@/shared/api/publicApi';
import { Event, Hall, MapZone, MapInfluence, EventStall } from '@/shared/types/api';
import { DesignerStall, DesignerZone, DesignerInfluence } from '../types';
import { RawEventMap } from '@/shared/types/stallMap.utils';

export function useDesignerPersistence() {
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleSave = async (
        event: Event,
        hall: Hall,
        rawMapData: RawEventMap | null,
        currentStalls: DesignerStall[],
        currentZones: DesignerZone[],
        currentInfluences: DesignerInfluence[],
        onSuccess?: (freshMapData: RawEventMap) => void
    ) => {
        setSaving(true);
        setMessage(null);
        try {
            const otherStalls = (rawMapData?.stalls || []).filter((s: EventStall) => s.hallName !== hall.name);

            const payload = [
                ...otherStalls.map((s: EventStall) => ({
                    id: s.id, name: s.name, hallName: s.hallName,
                    posX: s.posX, posY: s.posY, width: s.width, height: s.height,
                    finalPriceCents: s.priceCents,
                })),
                ...currentStalls.map(s => ({
                    id: s.id > 10_000_000_000 ? undefined : s.id,
                    name: s.name, hallName: hall.name,
                    posX: s.posX, posY: s.posY, width: s.width, height: s.height,
                    finalPriceCents: s.priceCents,
                })),
            ];

            // 1. Save Stalls
            await adminApi.saveLayout(event.id, payload);

            // 2. Save Zones
            const zonePayload: Partial<MapZone>[] = [
                ...(rawMapData?.zones || []).filter((z: MapZone) => z.hallName !== hall.name),
                ...currentZones.map(z => ({
                    hallName: hall.name,
                    type: z.type,
                    posX: z.posX,
                    posY: z.posY,
                    width: z.width,
                    height: z.height,
                    label: z.label
                }))
            ];
            await adminApi.saveZones(event.id, zonePayload);

            // 3. Save Influences
            const influencePayload: Partial<MapInfluence>[] = [
                ...(rawMapData?.influences || []).filter((inf: MapInfluence) => inf.hallName !== hall.name),
                ...currentInfluences.map(inf => ({
                    hallName: hall.name,
                    id: inf.id,
                    type: inf.type,
                    intensity: inf.intensity,
                    falloff: inf.falloff,
                    posX: inf.posX,
                    posY: inf.posY,
                    radius: inf.radius
                }))
            ];
            await adminApi.saveInfluences(event.id, influencePayload);

            // 4. Update Event (minimal - without layoutConfig string)
            await adminApi.updateEvent(event.id, {
                name: event.name,
                description: event.description,
                startDate: event.startDate,
                endDate: event.endDate,
                location: event.location,
                status: event.status,
                imageUrl: event.imageUrl,
                venueId: event.venueId
            });

            setMessage({ text: 'Layout & zones saved successfully!', type: 'success' });

            const freshMapData = await publicApi.getEventMap(event.id, true);
            if (onSuccess) onSuccess(freshMapData);

            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            const error = err as Error;
            setMessage({ text: 'Save failed: ' + error.message, type: 'error' });
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

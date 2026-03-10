import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/shared/api/adminApi';
import { publicApi } from '@/shared/api/publicApi';
import { EventStall } from '@/shared/types/api';
import { DesignerStall, DesignerZone, DesignerInfluence } from '../types';
import { normalizeMapData, NormalizedInfluence, NormalizedZone, RawEventMap, adaptToDesignerStall } from '@/shared/types/stallMap.utils';

export function useDesignerLoading(hallId: string | undefined) {
    const designerQuery = useQuery({
        queryKey: ['designer-data', hallId],
        queryFn: async () => {
            if (!hallId) throw new Error("Hall ID is required");

            // 1. Fetch Basic Infrastructure
            const allHalls = await adminApi.getAllHalls();
            const currentHall = allHalls.find(h => h.id === Number(hallId));
            if (!currentHall) throw new Error("Hall not found");

            const venues = await adminApi.getAllVenues();
            const currentVenue = venues.find(v =>
                v.buildings?.some(b => b.halls?.some(h => h.id === Number(hallId)))
            );
            if (!currentVenue) throw new Error("Venue not found for this hall");

            const events = await adminApi.getAllEvents();
            const currentEvent = events.find(e => e.venueId === currentVenue.id);
            if (!currentEvent) throw new Error("No active event assigned to this venue");

            // 2. Fetch Map and Stall Data
            const [mapDataRaw, adminStallsRaw, templatesRaw] = await Promise.all([
                publicApi.getEventMap(currentEvent.id).catch(() => ({ 
                    eventId: currentEvent.id, 
                    eventName: currentEvent.name, 
                    stalls: [], 
                    zones: [], 
                    influences: [] 
                })),
                adminApi.getEventStalls(currentEvent.id).catch(() => []),
                adminApi.getStallsByHall(currentHall.id).catch(() => [])
            ]);

            const mapData = mapDataRaw as RawEventMap;
            const adminStallsMap = new Map(adminStallsRaw.map(s => [s.id, s]));
            const templatesMap = new Map(templatesRaw.map(t => [t.id, t]));

            // 3. Transform Stalls
            const hallStalls: DesignerStall[] = (mapData?.stalls || [])
                .filter((s: EventStall) => s.hallName === currentHall.name)
                .map((s: EventStall) => {
                    const adminInfo = adminStallsMap.get(s.id);
                    const template = templatesMap.get(s.id) || Array.from(templatesMap.values()).find(t => t.name === s.templateName);
                    return adaptToDesignerStall(s, adminInfo, template);
                });

            // 4. Transform Influences and Zones
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

            return {
                event: currentEvent,
                hall: currentHall,
                initialStalls: hallStalls,
                initialZones: hallZones,
                initialInfluences: hallInfluences,
                rawMapData: mapData
            };
        },
        enabled: !!hallId,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    return {
        loading: designerQuery.isLoading,
        error: designerQuery.error instanceof Error ? designerQuery.error.message : null,
        event: designerQuery.data?.event || null,
        hall: designerQuery.data?.hall || null,
        initialStalls: designerQuery.data?.initialStalls || [],
        initialZones: designerQuery.data?.initialZones || [],
        initialInfluences: designerQuery.data?.initialInfluences || [],
        rawMapData: designerQuery.data?.rawMapData || null,
    };
}

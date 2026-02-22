import { useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/shared/api/publicApi'
import { vendorApi } from '@/shared/api/vendorApi'
import { RawEventMap, MapStall, parseZones } from '@/shared/types/stallMap.utils'

interface UseMapDataProps {
    eventId: number | null
    user: any | null
    selectedGenre: string | null
    selectedHall: string | null
    setSelectedHall: (hall: string | null) => void
}

export function useMapData({
    eventId,
    user,
    selectedGenre,
    selectedHall,
    setSelectedHall,
}: UseMapDataProps) {
    const initialEventMap: RawEventMap = { eventId: 0, eventName: '', stalls: [], zones: '' }

    const { data: rawEventMap = initialEventMap, isLoading } = useQuery<RawEventMap>({
        queryKey: ['stalls', eventId],
        queryFn: () => {
            console.info(`[MapPage] Refetching event map for eventId: ${eventId}`);
            return eventId
                ? publicApi.getEventMap(eventId)
                : Promise.resolve(initialEventMap);
        },
        enabled: !!eventId,
        staleTime: 1000 * 60 * 5,
    })

    const { data: limitData } = useQuery({
        queryKey: ['available-count', eventId],
        queryFn: () => {
            console.info(`[MapPage] Checking available slots for eventId: ${eventId}`);
            return eventId ? vendorApi.getAvailableCount(eventId) : Promise.resolve({ limit: 3, used: 0, remaining: 3 });
        },
        enabled: !!user && !!eventId,
    })

    const remainingSlots: number = limitData?.remaining ?? 3

    const { influences, zones } = useMemo(
        () => parseZones(rawEventMap?.zones),
        [rawEventMap?.zones]
    )

    const allStalls: MapStall[] = rawEventMap?.stalls ?? []

    const halls = useMemo(
        () => Array.from(new Set(allStalls.map((s: MapStall) => s.hallName).filter(Boolean))).sort() as string[],
        [allStalls]
    )

    // Auto-select best hall on load — prefer genre-matched hall
    useEffect(() => {
        if (halls.length > 0 && (!selectedHall || !halls.includes(selectedHall))) {
            const hallsMeta = rawEventMap.halls ?? [];
            let best = halls[0];
            if (selectedGenre && selectedGenre !== 'ANY') {
                const match = halls.find(h => {
                    const meta = hallsMeta.find(m => m.hallName === h || m.name === h);
                    const cat = (meta?.mainCategory || meta?.category || '').toUpperCase();
                    return cat === selectedGenre;
                });
                if (match) best = match;
            }
            setSelectedHall(best)
        } else if (halls.length === 0) {
            setSelectedHall(null)
        }
    }, [halls, selectedHall, selectedGenre, rawEventMap, setSelectedHall])

    const displayedStalls = useMemo(
        () => (selectedHall ? allStalls.filter((s: MapStall) => s.hallName === selectedHall) : allStalls),
        [allStalls, selectedHall]
    )

    const displayedInfluences = useMemo(
        () => influences.filter(inf => !inf.hallName || inf.hallName === selectedHall),
        [influences, selectedHall]
    )

    const displayedZones = useMemo(
        () => zones.filter(z => !z.hallName || z.hallName === selectedHall),
        [zones, selectedHall]
    )

    const isRecommended = (hall: string): boolean => {
        if (selectedGenre === 'ANY' || !selectedGenre) return false;
        const hallMeta = rawEventMap.halls?.find(h => h.hallName === hall || h.name === hall);
        if (!hallMeta) return false;
        const category = (hallMeta.mainCategory || hallMeta.category || '').toUpperCase();
        return category === selectedGenre;
    }

    return {
        rawEventMap,
        isLoading,
        remainingSlots,
        halls,
        displayedStalls,
        displayedInfluences,
        displayedZones,
        isRecommended,
        allStalls
    }
}

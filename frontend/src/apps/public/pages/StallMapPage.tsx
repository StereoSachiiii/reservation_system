//hooks
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

//auth context
import { useAuth } from '@/shared/context/useAuth'
import { StompContext } from '@/shared/context/StompContext'

//sub componenets
import { GenreGate } from '@/apps/public/components/GenreGate'
import { StallMapHeader } from '@/apps/public/components/StallMapHeader'
import { StallMapHero } from '@/apps/public/components/StallMapHero'
import { MapLoadingOverlay } from '@/apps/public/components/MapLoadingOverlay'
import { HallInfo } from '@/apps/public/components/HallInfo'
import { MapCanvas } from '@/shared/components/MapCanvas'
import { AerialMap } from '@/apps/public/components/AerialMap'
import { SegmentedControl } from '@/shared/components/ui/SegmentedControl'
import { STALL_STATUS } from '@/constants/stallStatus'
import { StallTooltip } from '@/shared/components/StallTooltip'
import { BookingPanel } from '@/apps/public/components/BookingPanel'

import { useMapData } from '../hooks/useMapData'
import { useStallSelection } from '../hooks/useStallSelection'
import { useStallUpdates } from '@/hooks/useStallUpdates'
import { useQueryClient } from '@tanstack/react-query'

//types
import { MapStall, RawEventMap } from '@/shared/types/stallMap.utils'

export default function StallMapPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { eventId: urlEventId } = useParams()
  const eventId = urlEventId ? parseInt(urlEventId, 10) : null

  // ── Real-time Updates ─────────────────────────────────────────────────────
  const stompClient = useStallUpdates(useCallback((update: { stallId: number, reserved: boolean, occupiedBy: string | null, publisherCategory: string | null }) => {
    queryClient.setQueryData(['stalls', eventId], (oldData: RawEventMap | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        stalls: oldData.stalls.map(s => s.id === update.stallId ? {
          ...s,
          reserved: update.reserved,
          occupiedBy: update.occupiedBy,
          publisherCategory: update.publisherCategory
        } : s)
      };
    });
  }, [queryClient, eventId]));

  useEffect(() => {
    if (!eventId) {
      navigate('/events')
    }
  }, [eventId, navigate])

  const { user } = useAuth()

  // ── UI State ──────────────────────────────────────────────────────────────
  const [selectedHall, setSelectedHall] = useState<string | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [hoveredStall, setHoveredStall] = useState<MapStall | null>(null)
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'schematic' | 'aerial'>('schematic')
  const [statusByStallId, setStatusByStallId] = useState<Record<number, keyof typeof STALL_STATUS>>({})

  // ── Logic Hooks ───────────────────────────────────────────────────────────
  const {
    rawEventMap,
    isLoading,
    remainingSlots,
    halls,
    displayedStalls,
    displayedInfluences,
    displayedZones,
    isRecommended,
    allStalls
  } = useMapData({
    eventId,
    user,
    selectedGenre,
    selectedHall,
    setSelectedHall
  })

  const {
    selectedIds,
    error,
    handleStallClick,
    handleConfirm,
    handleClearSelection,
    isPending
  } = useStallSelection({
    eventId,
    user,
    remainingSlots
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleHoverChange = useCallback(
    (stall: MapStall | null, anchorRect: DOMRect | null) => {
      setHoveredStall(stall)
      setTooltipAnchor(anchorRect)
    },
    []
  )

  useEffect(() => {
    if (!stompClient?.current?.connected || !displayedStalls.length) return;
    const subs = displayedStalls.map(stall => {
        return stompClient.current!.subscribe(`/topic/stalls/${stall.id}`, (msg) => {
             const event = JSON.parse(msg.body);
             setStatusByStallId(prev => {
                const currentStatus = prev[stall.id];
                if (currentStatus === 'SELECTED' && event.status === 'LOCKED') {
                    alert(`Stall ${stall.id} was just reserved by another vendor`);
                    handleClearSelection();
                }
                return { ...prev, [stall.id]: event.status };
             });
        });
    });

    return () => subs.forEach(sub => sub.unsubscribe());
  }, [stompClient, displayedStalls, handleClearSelection]);

  const aerialStalls = useMemo(() => {
      return displayedStalls.map(s => ({
          ...s,
          position: { xPct: (s.posX || 0)/100, yPct: (s.posY || 0)/100, widthPct: (s.width || 0)/100, heightPct: (s.height || 0)/100 }
      }));
  }, [displayedStalls]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) return <MapLoadingOverlay />;

  return (
    <StompContext.Provider value={stompClient}>
      <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
        {!selectedGenre && <GenreGate setSelectedGenre={setSelectedGenre} />}

      {selectedGenre && (
        <>
          <section className="relative w-full h-screen">
            <StallMapHeader
              eventName={rawEventMap?.eventName ?? 'Loading...'}
              halls={halls}
              selectedHall={selectedHall}
              setSelectedHall={setSelectedHall}
              isRecommended={isRecommended}
              showHeatmap={showHeatmap}
              setShowHeatmap={setShowHeatmap}
              availableCount={displayedStalls.filter(s => !s.reserved).length}
              selectedGenre={selectedGenre}
            />

            {/* View Mode Toggle (Overlay) */}
            <div className="absolute top-[110px] left-1/2 -translate-x-1/2 z-40">
                <SegmentedControl
                    value={viewMode}
                    onChange={(v) => setViewMode(v as "schematic" | "aerial")}
                    options={[
                        { value: 'schematic', label: 'Floor Plan' },
                        { value: 'aerial', label: 'Real View' },
                    ]}
                />
            </div>

            <div className="absolute left-0 right-0 bottom-0 top-[56px] bg-slate-50">
              {viewMode === 'schematic' ? (
                  <MapCanvas
                    stalls={displayedStalls}
                    influences={displayedInfluences}
                    zones={displayedZones}
                    selectedIds={selectedIds}
                    showHeatmap={showHeatmap}
                    onStallClick={handleStallClick}
                    onHoverChange={handleHoverChange}
                  />
              ) : (
                  <div className="w-full h-full p-8 pt-20 flex justify-center items-start overflow-y-auto">
                      <AerialMap 
                          layout={{ imageUrl: selectedHall && (selectedHall.toLowerCase().includes('b') || selectedHall.toLowerCase().includes('ogf') || selectedHall.toLowerCase().includes('stationery')) ? '/aerial-hall-b.png' : '/aerial-hall-a.png' }}
                          stalls={aerialStalls}
                          statusByStallId={statusByStallId}
                          onSelectStall={handleStallClick}
                      />
                  </div>
              )}
            </div>
          </section>

          <div className="fixed left-6 bottom-6 z-40 w-64">
            <BookingPanel
              selectedIds={selectedIds}
              allStalls={allStalls}
              remainingSlots={remainingSlots}
              eventName={rawEventMap?.eventName ?? ''}
              error={error}
              isPending={isPending}
              onConfirm={handleConfirm}
              onClearSelection={handleClearSelection}
            />
          </div>

          {(() => {
            const currentHall = rawEventMap?.halls?.find(h => h.name === selectedHall);
            return currentHall ? <HallInfo currentHall={currentHall} /> : null;
          })()}

          <StallMapHero eventName={rawEventMap?.eventName ?? ''} />

          {hoveredStall && !hoveredStall.reserved && tooltipAnchor && (
            <StallTooltip stall={hoveredStall} anchorRect={tooltipAnchor} />
          )}
        </>
      )
      }
      </div>
    </StompContext.Provider>
  )
}

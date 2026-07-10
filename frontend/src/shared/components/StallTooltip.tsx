import { MapStall, parseScore, formatPrice, scoreToColor } from '../types/stallMap.utils'
import { Info, MousePointer2 } from 'lucide-react'

// ─── StallTooltip ─────────────────────────────────────────────────────────────
// Renders fixed to the viewport — NOT inside the stall div.
// This prevents any z-index or overflow clipping from the map container.
// Parent passes anchorRect (from getBoundingClientRect) to position it.

interface StallTooltipProps {
  stall: MapStall
  anchorRect: DOMRect | null
}

const TOOLTIP_W = 340
const TOOLTIP_H = 400
const GAP = 16

function getTooltipPosition(anchorRect: DOMRect): { left: number; top: number } {
  // Prefer right of stall; fall back to left if it would clip viewport edge
  let left = anchorRect.right + GAP
  if (left + TOOLTIP_W > window.innerWidth - 8) {
    left = anchorRect.left - TOOLTIP_W - GAP
  }

  // Vertically center on stall, clamp to viewport
  let top = anchorRect.top + anchorRect.height / 2 - TOOLTIP_H / 2
  top = Math.max(8, Math.min(top, window.innerHeight - TOOLTIP_H - 8))

  return { left, top }
}

export function StallTooltip({ stall, anchorRect }: StallTooltipProps) {
  if (!anchorRect) return null

  const { left, top } = getTooltipPosition(anchorRect)
  const score = stall.pricingBreakdown?.calculatedScore ?? parseScore(stall.pricingBreakdown?.['Visibility Score'])
  const drivers = stall.pricingBreakdown?.['Value Drivers'] ?? []
  const baseRate = stall.pricingBreakdown?.['Base Rate'] ?? stall.priceCents
  const { bar: barColor, label: scoreLabel } = scoreToColor(score)

  return (
    <div
      style={{
        position: 'fixed',
        left,
        top,
        width: TOOLTIP_W,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden animate-stallTooltip flex flex-col"
    >
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-start">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-1 font-bold">Bay</div>
          <div className="font-black text-3xl leading-tight tracking-tight">{stall.templateName}</div>
          <div className="text-xs font-medium text-slate-300 mt-1">{stall.hallName?.split(' ').slice(-2).join(' ')}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-1 font-bold">Final Rate</div>
          <div className="font-black text-2xl tracking-tight text-emerald-400">{formatPrice(stall.priceCents)}</div>
          <div className="text-xs font-bold text-slate-400">LKR</div>
        </div>
      </div>

      {/* Visibility score */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
        <div className="flex justify-between items-end mb-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              Visibility Score
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <span className="text-xs font-medium text-slate-500">{scoreLabel}</span>
          </div>
          <span className="text-lg font-black text-slate-800">{score}/100</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-500 shadow-inner"
            style={{ width: `${score}%`, background: barColor }}
          />
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          This score predicts expected foot traffic based on proximity to entrances, main aisles, and facility hotspots.
        </p>
      </div>

      {/* Value drivers (Always show Base Rate at least) */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1">
          Price Breakdown
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-600">Base Hall Rate</span>
            <span className="text-xs font-bold text-slate-600 tabular-nums">
              {formatPrice(baseRate)}
            </span>
          </div>
          {drivers.slice(0, 4).map((d: { label: string; value: string }, i: number) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-700">{d.label}</span>
              <span className={`text-xs font-black tabular-nums ${d.value.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer badges & CTA */}
      <div className="px-6 py-4 flex flex-col gap-3 bg-slate-50">
        <div className="flex flex-wrap items-center gap-2">
          {stall.reserved ? (
            <span className={`text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full ${stall.occupiedBy === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-slate-900 text-white'}`}>
              {stall.occupiedBy === 'BLOCKED' ? 'Blocked' : 'Reserved'}
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Available
            </span>
          )}
          <span className={`text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full ${stall.type === 'PREMIUM'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-slate-200 text-slate-700'
            }`}>
            {stall.type ?? 'STANDARD'}
          </span>
          {stall.size && (
            <span className="text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full bg-slate-200 text-slate-700">
              {stall.size}
            </span>
          )}
          {stall.category && stall.category !== 'RETAIL' && (
            <span className="text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {stall.category.replace('_', ' ')}
            </span>
          )}
        </div>
        
        {!stall.reserved && (
           <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-slate-200/50 py-2 rounded-lg">
             <MousePointer2 className="w-4 h-4" />
             Click on map to select this stall
           </div>
        )}
      </div>
    </div>
  )
}
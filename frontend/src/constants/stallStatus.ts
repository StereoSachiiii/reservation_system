export const STALL_STATUS = {
  AVAILABLE: { color: 'neutral', border: 'border-neutral-200', fill: 'bg-white' },
  VIEWING:   { color: 'amber',   border: 'border-amber-400',   fill: 'bg-amber-50' },
  SELECTED:  { color: 'brand',   border: 'border-brand-500',   fill: 'bg-brand-50' },
  PREMIUM:   { color: 'gold',    border: 'border-yellow-500',  fill: 'bg-yellow-50' },
  RESERVED:  { color: 'red',     border: 'border-red-300',     fill: 'bg-red-50' },
} as const;

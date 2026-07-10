import { useRef, useState, useEffect } from 'react';
import { useInView, animate } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/shared/api/publicApi';

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView || value === undefined) return;
    const controls = animate(0, value, {
      duration: 1.2,
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight block mb-2">
      {display.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsBand() {
  const { data: stats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: publicApi.getPlatformStats,
    staleTime: 60000,
  });

  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-y border-neutral-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            {stats ? <AnimatedNumber value={stats.activeVendors} suffix="+" /> : <span className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight block mb-2">-</span>}
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Active Publishers</div>
          </div>
          <div>
            {stats ? <AnimatedNumber value={stats.stallsReserved} suffix="+" /> : <span className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight block mb-2">-</span>}
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Stalls Reserved</div>
          </div>
          <div>
            {stats ? <AnimatedNumber value={stats.upcomingEvents} suffix="" /> : <span className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight block mb-2">-</span>}
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Upcoming Events</div>
          </div>
          <div>
            <AnimatedNumber value={100} suffix="%" />
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Secure Payments</div>
          </div>
        </div>
      </div>
    </section>
  );
}

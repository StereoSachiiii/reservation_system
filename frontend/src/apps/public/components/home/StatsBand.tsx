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
    <span ref={ref} className="text-4xl font-bold text-neutral-900 tracking-tight block mb-2">
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
    <section className="py-16 bg-white border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <AnimatedNumber value={stats?.activeVendors || 0} suffix="+" />
            <div className="text-sm text-neutral-500">Active Publishers</div>
          </div>
          <div>
            <AnimatedNumber value={stats?.stallsReserved || 0} suffix="+" />
            <div className="text-sm text-neutral-500">Stalls Reserved</div>
          </div>
          <div>
            <AnimatedNumber value={stats?.upcomingEvents || 0} suffix="" />
            <div className="text-sm text-neutral-500">Upcoming Events</div>
          </div>
          <div>
            <AnimatedNumber value={100} suffix="%" />
            <div className="text-sm text-neutral-500">Secure Payments</div>
          </div>
        </div>
      </div>
    </section>
  );
}

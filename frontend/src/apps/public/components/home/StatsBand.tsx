import React, { useRef, useState, useEffect } from 'react';
import { useInView, animate } from 'framer-motion';

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
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
  return (
    <section className="py-16 bg-white border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <AnimatedNumber value={45} suffix="k+" />
            <div className="text-sm text-neutral-500">Annual Footfall</div>
          </div>
          <div>
            <AnimatedNumber value={200} suffix="+" />
            <div className="text-sm text-neutral-500">Publishers</div>
          </div>
          <div>
            <AnimatedNumber value={10} suffix="+" />
            <div className="text-sm text-neutral-500">Exhibition Halls</div>
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

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/ui/Card';

const TESTIMONIALS = [
  {
    quote: 'Booking used to take a dozen email threads. Now it takes two minutes.',
    author: 'Vendor, Colombo Book Fair 2025',
  },
  {
    quote: 'The interactive map is a game-changer. I secured a premium spot instantly.',
    author: 'Independent Publisher',
  },
  {
    quote: 'We saw a 40% increase in early bookings after switching to this platform.',
    author: 'Event Organizer, KCC',
  }
];

export function Testimonials() {
  return (
    <section className="py-20 bg-neutral-50 border-t border-neutral-100">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12">What our users say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="h-full"
            >
              <Card className="h-full">
                <p className="text-sm text-neutral-700 leading-relaxed">"{t.quote}"</p>
                <p className="mt-4 text-xs font-medium text-neutral-400">{t.author}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

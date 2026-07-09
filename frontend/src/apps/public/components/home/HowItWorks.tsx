import { motion } from 'framer-motion';

const STEPS = [
  {
    number: '01',
    title: 'Browse live events',
    description: 'See every upcoming fair with real-time hall availability before you commit.',
  },
  {
    number: '02',
    title: 'Select your stall on the floor plan',
    description: 'Pick from an interactive, real-time map — no double-bookings, no waiting on email replies.',
  },
  {
    number: '03',
    title: 'Pay securely',
    description: 'Stripe-backed checkout confirms your reservation instantly.',
  },
  {
    number: '04',
    title: 'Get your QR check-in pass',
    description: 'Walk in and scan — no printed forms, no manual verification queues.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 max-w-5xl mx-auto px-6">
      <h2 className="text-2xl font-bold text-neutral-900 text-center">How it works</h2>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <span className="text-sm font-bold text-brand-500">{step.number}</span>
            <h3 className="mt-2 text-base font-semibold text-neutral-900">{step.title}</h3>
            <p className="mt-1.5 text-sm text-neutral-500">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

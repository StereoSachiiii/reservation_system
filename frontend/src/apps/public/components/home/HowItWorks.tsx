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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8, rotateX: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    rotateX: 0,
    transition: { 
      type: "spring" as const, 
      stiffness: 120, 
      damping: 12 
    } 
  },
};

export function HowItWorks() {
  return (
    <section className="py-24 max-w-6xl mx-auto px-6 overflow-hidden perspective-1000">
      <motion.h2 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-3xl md:text-5xl font-black text-neutral-900 text-center tracking-tight"
      >
        How it works
      </motion.h2>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {STEPS.map((step) => (
          <motion.div
            key={step.number}
            variants={cardVariants}
            whileHover={{ 
              scale: 1.05, 
              y: -10,
              boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)",
              borderColor: "rgba(99, 102, 241, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative bg-white dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 p-8 rounded-3xl transition-colors cursor-pointer hover:bg-brand-50/30 dark:hover:bg-slate-800"
          >
            {/* Animated background blob on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl -z-10" />
            
            <motion.span 
              className="inline-block text-5xl font-black text-brand-100 dark:text-brand-900 mb-6 group-hover:text-brand-500 transition-colors duration-300"
              initial={{ scale: 1 }}
              whileHover={{ rotate: [-5, 5, 0], scale: 1.1 }}
            >
              {step.number}
            </motion.span>
            
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-brand-700 transition-colors">{step.title}</h3>
            <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400 leading-relaxed group-hover:text-neutral-800 dark:group-hover:text-neutral-200">{step.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

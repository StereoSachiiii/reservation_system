import React from 'react';

const COMPARISON = [
  { old: 'Email threads to reserve a stall', new: 'Book in under 2 minutes' },
  { old: 'No visibility into floor plan', new: 'Live, interactive stall map' },
  { old: 'Manual check-in lists', new: 'QR-based instant check-in' },
  { old: 'Uncertain availability', new: 'Real-time stall status' },
];

export function WhyBookFair() {
  return (
    <section className="py-20 bg-neutral-50 dark:bg-slate-900 border-y border-neutral-100 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">Why BookFair?</h2>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-12">
          Stop managing your stall bookings the hard way.
        </p>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 text-left">
          {COMPARISON.map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-4 text-neutral-400 dark:text-slate-500 line-through opacity-70">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm md:text-base">{item.old}</span>
              </div>
              <div className="flex items-center gap-4 text-neutral-900 dark:text-white font-medium">
                <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm md:text-base">{item.new}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

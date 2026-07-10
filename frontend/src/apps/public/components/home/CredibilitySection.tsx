
export function CredibilitySection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-brand-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-200 dark:shadow-none">
            B
          </div>
        </div>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">BookFair</h2>
        <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
          We built this platform to take the chaos out of managing book fairs. 
          Our mission is to connect organizers and vendors through simple, transparent tools.
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500 uppercase tracking-widest font-semibold">
          Trusted by independent organizers worldwide
        </p>
      </div>
    </section>
  );
}

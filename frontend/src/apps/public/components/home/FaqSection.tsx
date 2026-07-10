import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
    {
        question: "How do I reserve a stall for an upcoming event?",
        answer: "Simply create a vendor account, navigate to the Events page, select an upcoming book fair, and choose an available stall from the interactive floor map. You can then proceed to checkout and secure your spot instantly."
    },
    {
        question: "What payment methods are accepted?",
        answer: "We securely process payments via Stripe. You can pay using all major credit and debit cards, including Visa, MasterCard, and American Express."
    },
    {
        question: "Can I cancel or modify my reservation?",
        answer: "Yes! Cancellations made at least 14 days prior to the event start date are eligible for a refund (minus a small processing fee). Modifications to stall sizes or locations can be requested through the vendor dashboard."
    },
    {
        question: "How do I know where my stall is located?",
        answer: "Our interactive 2D floor map provides a precise layout of the venue. When you book a stall, you can see exactly where it is located relative to entrances, stages, and other vendors."
    }
];

export function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 bg-white dark:bg-slate-900 border-t border-neutral-100 dark:border-slate-800 transition-colors duration-200">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
                    <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">Everything you need to know about booking and managing your stalls.</p>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div 
                                key={index} 
                                className={`border border-neutral-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors duration-200 ${isOpen ? 'bg-neutral-50 dark:bg-slate-800 border-brand-200 dark:border-brand-800' : 'bg-white dark:bg-slate-900 hover:bg-neutral-50/50 dark:hover:bg-slate-800/50'}`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                                >
                                    <span className={`font-semibold text-lg ${isOpen ? 'text-brand-700 dark:text-brand-400' : 'text-neutral-900 dark:text-white'}`}>
                                        {faq.question}
                                    </span>
                                    <span className={`ml-6 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </button>
                                
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="px-6 pb-6 pt-0 text-neutral-600 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

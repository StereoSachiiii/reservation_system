import { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedPageWrapper from '@/shared/components/AnimatedPageWrapper';
import FormField from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/Button';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setForm({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <AnimatedPageWrapper className="min-h-screen bg-neutral-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-100">
                {/* Left Side: Contact Info */}
                <div className="bg-brand-900 text-white p-10 md:p-16 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-800 rounded-full blur-3xl opacity-50 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">Get in Touch</h2>
                        <p className="text-brand-100 mb-12 text-lg">
                            Have questions about booking a stall or managing your event? Our team is here to help you every step of the way.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-brand-800/50 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Email</h3>
                                    <p className="text-brand-200">support@bookfair.com</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="bg-brand-800/50 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Phone</h3>
                                    <p className="text-brand-200">+94 (11) 234-5678</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-brand-800/50 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Office</h3>
                                    <p className="text-brand-200 leading-relaxed">
                                        123 BookFair Avenue<br />
                                        Colombo 03, Sri Lanka
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Contact Form */}
                <div className="p-10 md:p-16 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-6">Send us a message</h3>
                    
                    {status === 'success' ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-50 border border-green-100 rounded-xl p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-green-900 mb-2">Message Sent!</h4>
                            <p className="text-green-700">Thank you for reaching out. We will get back to you within 24 hours.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <FormField 
                                    label="Your Name" 
                                    placeholder="John Doe" 
                                    required 
                                    value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})} 
                                />
                                <FormField 
                                    label="Email Address" 
                                    type="email" 
                                    placeholder="john@example.com" 
                                    required 
                                    value={form.email} 
                                    onChange={e => setForm({...form, email: e.target.value})} 
                                />
                            </div>
                            
                            <FormField 
                                label="Subject" 
                                placeholder="How can we help?" 
                                required 
                                value={form.subject} 
                                onChange={e => setForm({...form, subject: e.target.value})} 
                            />
                            
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-neutral-700">Message</label>
                                <textarea 
                                    required
                                    className="w-full h-32 px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                                    placeholder="Type your message here..."
                                    value={form.message}
                                    onChange={e => setForm({...form, message: e.target.value})}
                                />
                            </div>

                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="w-full py-4 text-base mt-2" 
                                disabled={status === 'submitting'}
                            >
                                {status === 'submitting' ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </AnimatedPageWrapper>
    );
}

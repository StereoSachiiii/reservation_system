import { motion } from 'framer-motion';
import AnimatedPageWrapper from '@/shared/components/AnimatedPageWrapper';

export default function TermsOfServicePage() {
    return (
        <AnimatedPageWrapper className="min-h-screen bg-neutral-50 py-16 px-4 sm:px-6 lg:px-8">
            <motion.div 
                className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold text-neutral-900 mb-8 tracking-tight">Terms of Service</h1>
                <div className="prose prose-neutral max-w-none text-neutral-600 space-y-6">
                    <p>
                        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                    </p>
                    
                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the BookFair reservation system, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you must not access or use our services.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">2. Account Registration</h2>
                    <p>
                        To reserve a stall, you must register for a vendor account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">3. Reservations and Payments</h2>
                    <p>
                        All stall reservations are subject to availability and confirmation. Payments are processed securely via our third-party payment provider (Stripe). By submitting a reservation, you authorize us to charge your payment method for the total amount displayed at checkout.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">4. Cancellations and Refunds</h2>
                    <p>
                        Cancellations must be made at least 14 days prior to the event start date to be eligible for a refund. A processing fee may be deducted from the refunded amount. Cancellations made within 14 days of the event are strictly non-refundable.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">5. User Conduct</h2>
                    <p>
                        You agree not to engage in any activity that disrupts or interferes with our services, including but not limited to submitting false information, spamming, or attempting to gain unauthorized access to our systems.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">6. Limitation of Liability</h2>
                    <p>
                        In no event shall BookFair or its directors, employees, or agents be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">7. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes by posting the new Terms of Service on this page. Your continued use of the service after any such changes constitutes your acceptance of the new Terms of Service.
                    </p>
                </div>
            </motion.div>
        </AnimatedPageWrapper>
    );
}

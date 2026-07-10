import { motion } from 'framer-motion';
import AnimatedPageWrapper from '@/shared/components/AnimatedPageWrapper';

export default function PrivacyPolicyPage() {
    return (
        <AnimatedPageWrapper className="min-h-screen bg-neutral-50 py-16 px-4 sm:px-6 lg:px-8">
            <motion.div 
                className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold text-neutral-900 mb-8 tracking-tight">Privacy Policy</h1>
                <div className="prose prose-neutral max-w-none text-neutral-600 space-y-6">
                    <p>
                        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                    </p>
                    
                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, make a reservation, or communicate with us. This information may include your name, email address, phone number, business name, and payment information.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to operate and improve our services, process transactions, communicate with you regarding your reservations, and send you technical notices, updates, and support messages.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">3. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">4. Sharing of Information</h2>
                    <p>
                        We may share your personal information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., payment processing via Stripe).
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">5. Your Privacy Rights</h2>
                    <p>
                        Depending on your location, you may have the right to request access to, correct, or delete the personal information we hold about you. To exercise these rights, please contact us using the information provided on our Contact page.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">6. Cookies and Tracking Technologies</h2>
                    <p>
                        We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                    </p>

                    <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">7. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us via our Contact page or email us directly at privacy@bookfair.com.
                    </p>
                </div>
            </motion.div>
        </AnimatedPageWrapper>
    );
}

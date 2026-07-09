import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import UpcomingEvents from '@/apps/public/components/UpcomingEvents'
import { HOME_COPY } from '@/copy/home.copy'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/context/useAuth'

import { LogoMarquee } from '@/apps/public/components/home/LogoMarquee'
import { StatsBand } from '@/apps/public/components/home/StatsBand'
import { HowItWorks } from '@/apps/public/components/home/HowItWorks'
import { Testimonials } from '@/apps/public/components/home/Testimonials'

const LOGOS = [
  { name: 'BMICH' },
  { name: 'OGF' },
  { name: 'Colombo Book Fair' },
  { name: 'Kandy City Center' },
];

export default function HomePage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <div className="bg-white">
            {/* 1. Hero Section */}
            <section className="relative overflow-hidden py-24 lg:py-32 border-b border-neutral-100">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl animate-pulse-slow [animation-delay:1.5s]" />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto px-6 text-center z-10 relative"
                >
                    <h1 className="text-5xl font-bold text-neutral-900 tracking-tight">
                        Connect Authors with Readers at Scale
                    </h1>
                    <p className="mt-4 text-lg text-neutral-500">
                        The all-in-one platform to discover premium book fairs, secure your
                        exhibition stalls, and manage your publishing presence effortlessly.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Button variant="primary" onClick={() => navigate('/events')}>
                            {HOME_COPY.bookStallCta}
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* 2. Logo / Venue Strip */}
            <LogoMarquee logos={LOGOS} />

            {/* 3. Stats Band */}
            <StatsBand />

            {/* 4. Feature Grid (Reimagined w/ How It Works) */}
            <HowItWorks />

            {/* 5. Testimonials */}
            <Testimonials />

            {/* 5. Upcoming Events Preview */}
            <section className="py-20 bg-neutral-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-semibold text-neutral-900">{HOME_COPY.upcomingEventsTitle}</h2>
                            {user && <p className="text-sm text-neutral-500 mt-1">{HOME_COPY.welcomeBack(user.username, dateStr)}</p>}
                        </div>
                        <Link to="/events" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                            {HOME_COPY.viewAllEvents}
                        </Link>
                    </div>
                    <UpcomingEvents />
                </div>
            </section>

            {/* 7. Footer CTA Band */}
            <section className="py-24 bg-brand-50 border-t border-brand-100 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-semibold text-neutral-900 mb-6">{HOME_COPY.expandPresenceTitle}</h2>
                    <p className="text-lg text-neutral-600 mb-8">{HOME_COPY.expandPresenceBody}</p>
                    <div className="flex justify-center">
                        <Button variant="primary" onClick={() => navigate('/events')}>
                            {HOME_COPY.bookStallCta}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

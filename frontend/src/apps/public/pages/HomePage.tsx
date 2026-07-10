import { Link, useNavigate } from 'react-router-dom'
import UpcomingEvents from '@/apps/public/components/UpcomingEvents'
import { HOME_COPY } from '@/copy/home.copy'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/context/useAuth'

import { LogoMarquee } from '@/apps/public/components/home/LogoMarquee'
import { StatsBand } from '@/apps/public/components/home/StatsBand'
import { HowItWorks } from '@/apps/public/components/home/HowItWorks'
import { Testimonials } from '@/apps/public/components/home/Testimonials'
import { HeroSlider } from '@/apps/public/components/home/HeroSlider'
import { FaqSection } from '@/apps/public/components/home/FaqSection'

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
            {/* 1. Hero Slider Section */}
            <HeroSlider />

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

            {/* 6. FAQ Section */}
            <FaqSection />

            {/* 7. Footer CTA Band */}
            <section className="py-24 bg-brand-50 border-t border-brand-100 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-semibold text-neutral-900 mb-6">{HOME_COPY.expandPresenceTitle}</h2>
                    <p className="text-lg text-neutral-600 mb-8">{HOME_COPY.expandPresenceBody}</p>
                    <div className="flex justify-center items-center gap-4 flex-col sm:flex-row">
                        <Button variant="primary" onClick={() => navigate('/events')}>
                            {HOME_COPY.bookStallCta}
                        </Button>
                        <Button variant="secondary" className="border-brand-200 text-brand-700 hover:bg-brand-100" onClick={() => window.location.href = 'mailto:paulaabdul1209@gmail.com'}>
                            Contact Us to Host an Event
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

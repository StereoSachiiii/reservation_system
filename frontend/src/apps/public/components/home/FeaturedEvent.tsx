import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/shared/api/publicApi';
import { Card } from '@/shared/components/ui/Card';
import { Pill } from '@/shared/components/ui/Pill';
import { Button } from '@/shared/components/ui/Button';
import { EventStatus } from '@/apps/public/components/UpcomingEvents';

export function FeaturedEvent() {
    const { data: events, isLoading } = useQuery({
        queryKey: ['public-events'],
        queryFn: publicApi.getEvents,
    });

    if (isLoading || !events || events.length === 0) return null;

    // Get the most important/nearest upcoming event
    const featured = events.find(e => e.status === 'UPCOMING' || e.status === 'ONGOING') || events[0];
    
    // Mock image since the API might not provide a heroImage
    const heroImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000";

    return (
        <section className="pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <Card className="overflow-hidden md:flex border border-neutral-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <img src={heroImage} className="md:w-2/5 h-64 md:h-auto object-cover" alt={featured.name} />
                    <div className="p-8 flex-1 flex flex-col justify-center">
                        <div className="mb-4">
                            <EventStatus status={featured.status} />
                        </div>
                        <h3 className="mt-3 text-3xl font-bold text-neutral-900 dark:text-white">{featured.name}</h3>
                        <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400 line-clamp-3">
                            {featured.description || "Join us at this spectacular event. Book your stall now and showcase your products to thousands of attendees."}
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                {new Date(featured.startDate).toLocaleDateString()} - {new Date(featured.endDate).toLocaleDateString()}
                            </div>
                            <span>&middot;</span>
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                {featured.venue}
                            </div>
                        </div>
                        <div className="mt-8">
                            <Link to={`/events/${featured.id}`}>
                                <Button variant="primary">Explore Event</Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
}

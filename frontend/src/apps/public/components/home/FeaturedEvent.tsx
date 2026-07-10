import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/shared/api/publicApi';

export function FeaturedEvent() {
    const { data: eventEnvelope, isLoading } = useQuery({
        queryKey: ['active-events'],
        queryFn: publicApi.getActiveEvents,
    });

    const events = eventEnvelope?.content || [];

    if (isLoading || events.length === 0) return null;

    // Get the most important/nearest upcoming event
    const featured = events.find(e => e.status === 'OPEN') || events[0];
    
    // Mock image since the API might not provide a heroImage
    const heroImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000";
    const isOpen = featured.status?.toUpperCase() === 'OPEN';

    return (
        <section className="pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="overflow-hidden md:flex border border-slate-100 bg-white shadow-sm rounded-xl">
                    <img src={heroImage} className="md:w-2/5 h-64 md:h-auto object-cover" alt={featured.name} />
                    <div className="p-8 flex-1 flex flex-col justify-center">
                        <div className="mb-4">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                                isOpen 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                                {featured.status || 'Upcoming'}
                            </span>
                        </div>
                        <h3 className="mt-3 text-3xl font-extrabold text-slate-800">{featured.name}</h3>
                        <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
                            {featured.description || "Join us at this spectacular event. Book your stall now and showcase your products to thousands of attendees."}
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold">
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                {new Date(featured.startDate).toLocaleDateString()}
                            </div>
                            <span>&middot;</span>
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                {featured.location || 'Location TBA'}
                            </div>
                        </div>
                        <div className="mt-8">
                            <Link to={`/events/${featured.id}`} className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-0.5 inline-block">
                                Explore Event
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

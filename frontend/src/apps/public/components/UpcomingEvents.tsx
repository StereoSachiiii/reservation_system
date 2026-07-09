import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/shared/api/publicApi'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import { EVENTS_COPY } from '@/copy/events.copy'
import { Card } from '@/shared/components/ui/Card'

export default function UpcomingEvents() {
    const { data: eventEnvelope, isLoading, error } = useQuery({
        queryKey: ['active-events'],
        queryFn: publicApi.getActiveEvents,
        staleTime: 1000 * 60 * 15 // 15 mins
    })

    const events = eventEnvelope?.content || []

    if (isLoading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-800"></div>
        </div>
    )

    if (error) return (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-100 text-center text-sm font-semibold">
            {EVENTS_COPY.loadingError}
        </div>
    )

    if (events.length === 0) return (
        <div className="text-center py-12 bg-neutral-50 rounded-md border border-dashed border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-600">{EVENTS_COPY.noEventsTitle}</h3>
            <p className="text-neutral-500 text-sm mt-1">{EVENTS_COPY.noEventsBody}</p>
        </div>
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
                const isOpen = event.status?.toUpperCase() === 'OPEN';
                return (
                    <Card key={event.id} className="p-0 overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg transition-shadow duration-300">
                        {/* Event Cover Image */}
                        <div className="h-44 overflow-hidden relative">
                            <img
                                src={event.imageUrl || "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                                alt={event.name}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>

                        {/* Event Content */}
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-sm ${
                                    isOpen 
                                        ? 'bg-emerald-50 text-emerald-700' 
                                        : 'bg-amber-50 text-amber-700'
                                }`}>
                                    {event.status || EVENTS_COPY.statusUpcoming}
                                </span>
                            </div>

                            <h3 className="font-semibold text-lg text-neutral-900 mb-2 group-hover:text-brand-600 transition-colors leading-tight">
                                {event.name}
                            </h3>

                            <p className="text-neutral-600 text-sm leading-relaxed mb-6 line-clamp-2">
                                {event.description || EVENTS_COPY.defaultDescription}
                            </p>

                            <div className="space-y-2 mb-6 border-t border-neutral-50 pt-4 mt-auto">
                                <div className="flex items-center text-sm text-neutral-600">
                                    <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                                    {new Date(event.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="flex items-center text-sm text-neutral-600">
                                    <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                                    {event.location || EVENTS_COPY.locationTba}
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link
                                    to={`/events/${event.id}`}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:text-brand-700"
                                >
                                    {EVENTS_COPY.exploreEvent}
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    )
}

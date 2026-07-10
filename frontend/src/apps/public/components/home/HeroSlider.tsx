import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { Button } from '@/shared/components/ui/Button';
import { HOME_COPY } from '@/copy/home.copy';
import { useNavigate } from 'react-router-dom';

// Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const SLIDES = [
    {
        id: 1,
        title: "Connect Authors with Readers at Scale",
        subtitle: "The all-in-one platform to discover premium book fairs, secure your exhibition stalls, and manage your publishing presence effortlessly.",
        image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop",
    },
    {
        id: 2,
        title: "Global Publishing Expos",
        subtitle: "Join the most prestigious literary events worldwide. From Frankfurt to Colombo, expand your reach.",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop",
    },
    {
        id: 3,
        title: "Exclusive Vendor Tools",
        subtitle: "Manage your floor plan presence in real-time, track analytics, and maximize your sales footprint.",
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2000&auto=format&fit=crop",
    }
];

export const HeroSlider = () => {
    const navigate = useNavigate();

    return (
        <section className="relative h-[600px] lg:h-[700px] w-full overflow-hidden bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <Swiper
                modules={[Autoplay, EffectFade, Pagination, Navigation]}
                effect="fade"
                speed={1000}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                navigation
                loop
                className="w-full h-full hero-swiper"
            >
                {SLIDES.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative w-full h-full">
                            {/* Background Image */}
                            <img 
                                src={slide.image} 
                                alt={slide.title}
                                className="absolute inset-0 w-full h-full object-cover select-none"
                            />
                            
                            {/* Overlay Gradient for readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/20" />

                            {/* Content */}
                            <div className="absolute inset-0 flex items-center justify-center z-10 px-6">
                                <div className="max-w-4xl mx-auto text-center animate-in slide-in-from-bottom-8 fade-in duration-1000">
                                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight drop-shadow-xl">
                                        {slide.title}
                                    </h1>
                                    <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-10 drop-shadow-md">
                                        {slide.subtitle}
                                    </p>
                                    <div className="flex justify-center">
                                        <Button 
                                            variant="primary" 
                                            onClick={() => navigate('/events')}
                                            className="shadow-2xl shadow-indigo-500/20 px-8 py-4 text-lg"
                                        >
                                            {HOME_COPY.bookStallCta}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom CSS for Swiper Overrides to match theme */}
            <style dangerouslySetInnerHTML={{ __html: `
                .hero-swiper .swiper-pagination-bullet {
                    background: #cbd5e1;
                    opacity: 0.5;
                    transition: all 0.3s ease;
                }
                .hero-swiper .swiper-pagination-bullet-active {
                    background: #6366f1;
                    opacity: 1;
                    width: 24px;
                    border-radius: 8px;
                }
                .hero-swiper .swiper-button-next,
                .hero-swiper .swiper-button-prev {
                    color: rgba(255, 255, 255, 0.7);
                    transition: color 0.3s ease;
                }
                .hero-swiper .swiper-button-next:hover,
                .hero-swiper .swiper-button-prev:hover {
                    color: white;
                }
            `}} />
        </section>
    );
};

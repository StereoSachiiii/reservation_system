import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function Hero() {
    return (
        <section className="relative overflow-hidden rounded-3xl animate-fluid-gradient py-24 sm:py-32 shadow-2xl">
            {/* Soft overlay to improve readability */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none" />

            {/* Content Container */}
            <div className="relative max-w-5xl mx-auto px-6 text-center flex flex-col items-center z-10">
                
                {/* Micro-badge */}
                <motion.span 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 
                        rounded-full text-xs font-black tracking-widest uppercase
                        bg-white/20 backdrop-blur-xl 
                        border border-white/30 text-white shadow-lg"
                >
                    ✨ The Literary Event of 2026
                </motion.span>

                {/* Main Heading */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-none"
                >
                    Book Fair <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-300">2026</span>
                </motion.h1>

                {/* Subtext */}
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-2xl text-lg sm:text-xl text-white/90 leading-relaxed font-semibold mb-12 drop-shadow-sm"
                >
                    Secure your spot at the city's premier literary event.
                    Reserve premium stalls, manage inventory, and connect with thousands of readers.
                </motion.p>

                {/* Call To Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 mb-20"
                >
                    <Link
                        to="/events"
                        className="group relative inline-flex items-center justify-center 
                        px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest
                        text-black bg-white hover:bg-gray-50
                        shadow-2xl transition-all duration-300
                        hover:-translate-y-1 hover:scale-[1.02]"
                    >
                        Reserve a Stall
                        <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">
                            &rarr;
                        </span>
                    </Link>

                    <a
                        href="#services"
                        className="inline-flex items-center justify-center
                        px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest
                        text-white bg-white/10 backdrop-blur-md
                        border border-white/20
                        transition-all duration-300
                        hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.02]"
                    >
                        Learn More
                    </a>
                </motion.div>

                {/* Publisher Logo Ribbon (Stripe-like partner band) */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="w-full border-t border-white/10 pt-10 flex flex-wrap justify-center items-center gap-x-16 gap-y-6 text-white/40 text-sm font-black tracking-widest"
                >
                    <span className="hover:text-white/80 transition-colors cursor-default">BMICH</span>
                    <span className="hover:text-white/80 transition-colors cursor-default">OGF</span>
                    <span className="hover:text-white/80 transition-colors cursor-default">COLOMBO BOOK FAIR</span>
                </motion.div>
            </div>
        </section>
    )
}

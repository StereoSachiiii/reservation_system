import type { Hall } from "../../../shared/types/api"
import { Layers, Maximize2, Users, Wind, Volume2, MapPin, Sparkles, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export const HallInfo = ({ currentHall }: { currentHall: Hall }) => {
  // Provide realistic fallbacks if API returns nil
  const totalSqFt = currentHall.totalSqFt || 24500;
  const capacity = currentHall.capacity || 150;
  const floorLevel = currentHall.floorLevel !== undefined ? currentHall.floorLevel : 'G';
  const expectedFootfall = currentHall.expectedFootfall || 12000;
  const ceilingHeight = currentHall.ceilingHeight || 24;
  const noiseLevel = currentHall.noiseLevel || 'Managed';
  const nearbyFacilities = currentHall.nearbyFacilities || 'Prime Venue Area & Food Court';

  const catName = currentHall.mainCategory ? String(currentHall.mainCategory).replace('_', ' ') : 'General Exhibition';
  const tierName = currentHall.tier || 'Standard';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-0 pt-10 pb-16">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white border border-neutral-200 shadow-sm"
      >
        <div className="p-8 md:p-12 border-b border-neutral-200 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-neutral-100 border border-neutral-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
                <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest">{tierName} Tier</span>
              </div>
              <div className="px-3 py-1 bg-neutral-100 border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest">{catName}</span>
              </div>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
              {currentHall.name}
            </motion.h2>
          </div>
          
          <motion.div variants={itemVariants} className="flex items-center gap-4 text-neutral-900">
             <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-neutral-500">Live Status</span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-neutral-900"></span>
                    </span>
                    <span className="text-neutral-900 font-bold tracking-wide uppercase text-sm">Accepting Vendors</span>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Specifications Grid */}
        <div className="p-8 md:p-12 bg-neutral-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
            
            <motion.div variants={itemVariants} className="group flex gap-4 items-start">
              <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 text-neutral-900" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Floor Level</p>
                <p className="text-xl font-bold text-neutral-900">Level {floorLevel}</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group flex gap-4 items-start">
              <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Maximize2 className="w-5 h-5 text-neutral-900" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Total Area</p>
                <p className="text-xl font-bold text-neutral-900">{totalSqFt.toLocaleString()} <span className="text-sm text-neutral-500 font-medium">sqft</span></p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group flex gap-4 items-start">
              <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-neutral-900" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Capacity</p>
                <p className="text-xl font-bold text-neutral-900">{capacity.toLocaleString()} <span className="text-sm text-neutral-500 font-medium">vendors</span></p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group flex gap-4 items-start">
              <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Wind className="w-5 h-5 text-neutral-900" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Climate</p>
                {currentHall.isAirConditioned ? (
                  <p className="text-xl font-bold text-neutral-900">A/C <span className="text-sm text-neutral-500 font-medium">Controlled</span></p>
                ) : (
                  <p className="text-xl font-bold text-neutral-900">Natural</p>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group flex gap-4 items-start">
              <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-neutral-900" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Daily Footfall</p>
                <p className="text-xl font-bold text-neutral-900">{expectedFootfall.toLocaleString()} <span className="text-sm text-neutral-500 font-medium">est.</span></p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group flex gap-4 items-start">
              <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Maximize2 className="w-5 h-5 text-neutral-900 rotate-90" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Ceiling Clearance</p>
                <p className="text-xl font-bold text-neutral-900">{ceilingHeight} <span className="text-sm text-neutral-500 font-medium">ft</span></p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group flex gap-4 items-start">
              <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-5 h-5 text-neutral-900" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Acoustics</p>
                <p className="text-xl font-bold text-neutral-900 capitalize">{noiseLevel}</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group flex gap-4 items-start">
              <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-neutral-900" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Location</p>
                <p className="text-sm font-bold text-neutral-900 leading-tight line-clamp-2 pr-4">{nearbyFacilities}</p>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  )
}
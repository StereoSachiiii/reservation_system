import { PUBLISHER_GENRES } from '@/shared/constants'
import { motion } from 'framer-motion'

const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 120 } }
};

export const GenreGate = ({setSelectedGenre}: {setSelectedGenre: (genre: string) => void}) => {
  return (    
      <div className="h-[calc(100vh-4.25rem)] bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-xl w-full text-center bg-white p-10 rounded-xl border border-slate-100 shadow-sm"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md mb-6 inline-block">
              Step 1 of 2
          </span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-4">What do you publish?</h1>
          <p className="text-slate-600 mb-10 max-w-md mx-auto text-sm font-semibold leading-relaxed">
            Select your primary genre so we can recommend the best hall for your stall.
            <br />
            <span className="text-slate-400 text-xs font-medium">You can still browse all halls if you want to skip recommendations.</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {PUBLISHER_GENRES.map(g => (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200/80
                           text-slate-700 bg-white hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/30
                           transition-all shadow-sm"
              >
                {g.label}
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => setSelectedGenre('ANY')}
            className="text-xs font-black text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors hover:underline"
          >
            Skip &mdash; show me all halls
          </button>
        </motion.div>
      </div>
  )
}

export default GenreGate

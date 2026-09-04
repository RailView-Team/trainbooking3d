import React from 'react';
import { Calendar, Users, MapPin, Search, ChevronDown, TrainFront } from 'lucide-react';
import { motion } from 'framer-motion';
import BookingForm from './BookingForm';

export default function HeroBooking() {
  return (
    <div className="flex flex-col">
      <div className="relative w-full h-[85vh] md:h-[95vh] flex items-center justify-center overflow-hidden bg-stone-950">
        {/* Background Visual - Premium Train Image */}
        <motion.div 
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="/hero_dark.png" 
            alt="Premium Train Background" 
            className="w-full h-full object-cover object-center opacity-80"
          />
          {/* Deep charcoal shadows, no neon */}
          <div className="absolute inset-0 bg-stone-950/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-90" />
        </motion.div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-6 md:px-12 mt-12 md:mt-20">
          <div className="max-w-4xl">
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex items-center gap-2 mb-6"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 text-stone-300 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase flex items-center gap-2">
                <TrainFront className="w-4 h-4 opacity-80" />
                Next-Gen Transit
              </div>
            </motion.div>

            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              Travel smarter.<br />
              See your seat before you book.
            </motion.h1>
            
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-stone-300 mb-10 max-w-2xl font-light leading-relaxed"
            >
              Explore trains, choose your coach, and experience your exact seat in 3D before making a reservation.
            </motion.p>
            
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button 
                onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })}
                className="bg-rose-700 hover:bg-rose-600 text-white rounded-xl px-8 py-4 font-bold text-lg tracking-wide transition-all shadow-lg shadow-rose-900/20 active:scale-95 flex items-center gap-2"
              >
                <Search className="w-5 h-5" /> Search Trains
              </button>
              
              <button 
                onClick={() => document.getElementById('3d-section').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-8 py-4 font-bold text-lg tracking-wide transition-all backdrop-blur-sm active:scale-95 flex items-center gap-2"
              >
                Explore 3D Seats <ChevronDown className="w-5 h-5" />
              </button>
            </motion.div>
            
          </div>
        </div>
      </div>

      {/* Light Search Section */}
      <div id="search-section" className="relative z-20 -mt-16 lg:-mt-24 mx-auto w-full max-w-6xl px-4 md:px-8 pb-12">
        <BookingForm />
      </div>
    </div>
  );
}

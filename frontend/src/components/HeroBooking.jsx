import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import BookingForm from './BookingForm';

export default function HeroBooking() {
  const scrollToExperience = (e) => {
    e.preventDefault();
    document.getElementById('experience-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative bg-gradient-to-b from-[#eaf2ff] via-[#f3f7fe] to-[#ffffff] pt-28 md:pt-36 pb-20 md:pb-28 z-20">
      
      {/* Background soft ambient glow (safely clipped without cutting off dropdowns) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-300/10 rounded-full blur-3xl -ml-20" />
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-6xl">
        
        {/* Top Split: Left Content + Right Vande Bharat Train */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8 lg:mb-12">
          
          {/* Left Text */}
          <div className="lg:col-span-6 lg:pr-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/70 px-4 py-1.5 text-[11px] font-black tracking-widest uppercase text-blue-700 mb-5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>PLAN • EXPLORE • BOOK</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-[52px] font-black text-stone-900 tracking-tight leading-[1.12] mb-4"
            >
              Book your journey. <br />
              <span className="text-[#2563eb]">See your seat before you go.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-stone-600 text-base md:text-lg max-w-lg leading-relaxed"
            >
              Experience India&apos;s next-generation train booking platform. Inspect realistic 3D coaches, choose your exact seat, and enjoy instant confirmation.
            </motion.p>
          </div>

          {/* Right Train Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-[22px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-stone-200/60 aspect-[16/11]">
              <img
                src="/vande_bharat_hero.jpg"
                alt="Vande Bharat Express Train"
                className="w-full h-full object-cover object-center"
              />

              {/* Subtle bottom dark gradient only at the lower portion */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />

              {/* Bottom Information & Primary Action */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 flex items-end justify-between gap-3">
                
                {/* Bottom-left: Compact route info & secondary typography */}
                <div>
                  <div className="text-white font-black text-sm sm:text-base tracking-tight leading-snug">
                    Howrah → New Delhi
                  </div>
                  <div className="text-white/70 text-[11px] font-mono tracking-wider">
                    HWH → NDLS
                  </div>
                  <div className="text-stone-300 text-[11px] font-medium mt-1">
                    Vande Bharat Express
                  </div>
                </div>

                {/* Bottom-right: Interactive indicator + Compact white button with blue text */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[11px] font-medium text-white/85 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Interactive seat view
                  </span>
                  <a
                    href="#experience-section"
                    onClick={scrollToExperience}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-stone-50 text-[#2563eb] font-bold px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <span>View Coach &amp; Seats</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563eb]" />
                  </a>
                </div>

              </div>
            </div>
          </motion.div>

        </div>

        {/* Search Bar Form */}
        <div id="search-section" className="relative z-30">
          <BookingForm />
        </div>

      </div>
    </div>
  );
}

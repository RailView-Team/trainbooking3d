import React from 'react';
import { motion } from 'framer-motion';
import BookingForm from './BookingForm';

export default function HeroBooking() {
  return (
    <div className="flex flex-col bg-[#faf8ff]">
      <div className="relative overflow-hidden pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'linear-gradient(#dbe4ff 1px, transparent 1px), linear-gradient(90deg, #dbe4ff 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="container relative z-10 mx-auto px-4 md:px-10 max-w-6xl">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full bg-[#e2e7ff] px-3 py-1 text-[11px] font-bold tracking-wide text-[#0037b0]">
              <span className="h-2 w-2 rounded-full bg-[#16a34a]" /> OFFICIAL RAILWAY RESERVATIONS PORTAL
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="mt-4 text-3xl md:text-[42px] leading-tight font-bold tracking-[-0.03em] text-[#131b2e]">Book verified train tickets</motion.h1>
            <p className="mt-2 text-sm md:text-base text-[#434655]">Choose your route, inspect your exact coach, and reserve your seat with confidence.</p>
          </div>
        </div>
      </div>
      <div id="search-section" className="relative z-20 mx-auto w-full max-w-6xl px-4 md:px-10 pb-12"><BookingForm /></div>
    </div>
  );
}

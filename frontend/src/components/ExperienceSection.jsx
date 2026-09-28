import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Layers, 
  Box, 
  CheckCircle2, 
  CreditCard, 
  ArrowRight, 
  Sparkles,
  Eye,
  Check
} from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'SEARCH TRAIN',
    desc: 'Enter your departure and arrival stations with travel date',
    icon: <Search className="w-5 h-5 text-blue-600" />
  },
  {
    num: '02',
    title: 'CHOOSE COACH',
    desc: 'Select preferred class: Executive, AC 3-Tier, or Chair Car',
    icon: <Layers className="w-5 h-5 text-indigo-600" />
  },
  {
    num: '03',
    title: 'EXPLORE 3D TRAIN',
    desc: 'Walk through the realistic virtual coach before choosing',
    icon: <Box className="w-5 h-5 text-blue-600" />
  },
  {
    num: '04',
    title: 'SELECT SEAT',
    desc: 'Inspect window alignment, legroom, and exact berth position',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
  },
  {
    num: '05',
    title: 'BOOK',
    desc: 'Instant PNR confirmation and secure frictionless checkout',
    icon: <CreditCard className="w-5 h-5 text-violet-600" />
  }
];

export default function ExperienceSection() {
  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <section id="experience-section" className="py-20 bg-stone-50/70 border-t border-stone-200/80 relative overflow-hidden">
      
      {/* Decorative background shapes */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 max-w-6xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/80 px-4 py-1.5 text-xs font-black tracking-widest uppercase text-blue-700 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>THE RAILVISTA EXPERIENCE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight mb-4"
          >
            Don&apos;t just book a seat. <br />
            <span className="text-[#2563eb]">Explore it first.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-stone-600 text-base md:text-lg leading-relaxed"
          >
            Walk through coaches with our immersive 3D technology. View window placements, charging points, legroom, and live seat occupancy before reserving.
          </motion.p>
        </div>

        {/* 5-Step Visual Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {steps.map((s, idx) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {s.num}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-stone-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                    {s.icon}
                  </div>
                </div>

                <h3 className="text-sm font-black tracking-tight text-stone-900 mb-1.5">
                  {s.title}
                </h3>
                <p className="text-xs text-stone-500 font-medium leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block pt-3 border-t border-stone-100 mt-4 text-[10px] font-bold text-stone-400 text-right">
                  Next Step →
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 3D Coach Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-10 shadow-xl overflow-hidden relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Showcase Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live 3D Coach Visualizer
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-snug">
                Step inside the coach before confirming your ticket
              </h3>

              <p className="text-stone-600 text-sm leading-relaxed">
                Take full control of your travel experience. Rotate 360°, inspect your seat relative to the window and exit doors, and never guess your berth location again.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-bold text-stone-800">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Realistic 3D perspective with aisle walk-through</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-stone-800">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Real-time confirmed seat availability overlays</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-stone-800">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Select Window, Aisle, Lower or Upper berths directly</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to={`/trains?from=HWH&to=NDLS&date=${todayDate}`}
                  className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3.5 rounded-xl font-extrabold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>Explore Coach in 3D</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Interactive/Visual Mockup of Coach and Seats */}
            <div className="lg:col-span-7">
              <div className="bg-gradient-to-br from-stone-900 to-slate-900 rounded-2xl p-6 text-white relative shadow-2xl overflow-hidden border border-stone-800">
                
                {/* Header bar of 3D viewer mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-lg bg-blue-600 text-xs font-black tracking-wide">
                      Coach B3
                    </div>
                    <span className="text-xs font-semibold text-stone-400">AC 3-Tier (3A)</span>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    18 seats available
                  </div>
                </div>

                {/* Simulated 3D Coach Interior Grid */}
                <div className="relative py-6 px-4 bg-stone-950/70 rounded-xl border border-stone-800/80 mb-6">
                  <div className="text-[10px] uppercase tracking-widest font-black text-stone-500 mb-4 text-center">
                    Virtual Coach Interior • Window Side (Left) & Aisle
                  </div>

                  {/* Seat Bay Mockup */}
                  <div className="grid grid-cols-4 gap-3 max-w-md mx-auto items-center">
                    
                    {/* Seat 40 */}
                    <div className="bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 rounded-xl p-3 text-center transition-all cursor-pointer">
                      <div className="text-[10px] text-stone-400 font-bold">Aisle</div>
                      <div className="text-sm font-black text-white">40</div>
                      <div className="text-[9px] text-emerald-400 font-bold">₹850</div>
                    </div>

                    {/* Seat 41 */}
                    <div className="bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 rounded-xl p-3 text-center transition-all cursor-pointer">
                      <div className="text-[10px] text-stone-400 font-bold">Middle</div>
                      <div className="text-sm font-black text-white">41</div>
                      <div className="text-[9px] text-emerald-400 font-bold">₹850</div>
                    </div>

                    {/* Seat 42 - Selected Highlight */}
                    <div className="bg-[#2563eb] border-2 border-blue-400 rounded-xl p-3 text-center shadow-lg shadow-blue-500/40 relative scale-105 transition-all">
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Selected
                      </div>
                      <div className="text-[10px] text-blue-100 font-bold">Window</div>
                      <div className="text-base font-black text-white">42</div>
                      <div className="text-[10px] text-blue-100 font-black">₹850</div>
                    </div>

                    {/* Seat 43 - Booked */}
                    <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-3 text-center opacity-40 cursor-not-allowed">
                      <div className="text-[10px] text-stone-500 font-bold">Window</div>
                      <div className="text-sm font-black text-stone-500">43</div>
                      <div className="text-[9px] text-red-400 font-bold">Booked</div>
                    </div>

                  </div>

                  {/* Seat Detail Floating Card */}
                  <div className="mt-6 pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-[#2563eb]" />
                      <span className="text-stone-300 font-medium">Seat 42 (Window Berth)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">Status:</span>
                      <span className="text-emerald-400 font-bold">Available • CNF</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-400">Total:</span>
                      <span className="text-base font-black text-white">₹850</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls simulation */}
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>3D Orbit Controls Enabled</span>
                  </div>
                  <span className="font-mono text-stone-500">Camera: Isometric Bay 3</span>
                </div>

              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

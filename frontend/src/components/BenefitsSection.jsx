import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Box, 
  CreditCard, 
  Compass, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  {
    tag: 'REAL-TIME SYNC',
    title: 'LIVE AVAILABILITY',
    description: 'Instant seat charts with real-time seat inventory, live availability numbers, and confirmed booking quotas without surprises.',
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
    highlight: 'Instant CNF Updates'
  },
  {
    tag: 'FIRST IN INDIA',
    title: '3D SEAT VIEW',
    description: 'Walk through coaches in interactive 3D. Inspect window alignment, legroom, upper/lower berth positions, and charging sockets before reserving.',
    icon: <Box className="w-6 h-6 text-blue-600" />,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
    highlight: '360° Coach Walkthrough'
  },
  {
    tag: 'SEAMLESS CHECKOUT',
    title: 'FAST BOOKING',
    description: 'Frictionless passenger entry, single-click traveler profiles, quick payment via UPI & Cards, and immediate printable digital e-tickets.',
    icon: <CreditCard className="w-6 h-6 text-emerald-600" />,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    highlight: '< 60 Sec Checkout'
  },
  {
    tag: 'INTELLIGENT TRAVEL',
    title: 'SMART JOURNEY',
    description: 'Live train tracking, station timeline breakdowns, platform notifications, and onboard facility guides designed for Indian Railways.',
    icon: <Compass className="w-6 h-6 text-purple-600" />,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
    highlight: 'Route Timeline Alerts'
  }
];

export default function BenefitsSection() {
  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <section className="py-20 bg-white border-t border-stone-100 relative">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2563eb] block mb-2">
              WHY CHOOSE RAILVISTA
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              Engineered for the <br className="hidden sm:block" />
              modern railway traveler
            </h2>
          </div>
          <p className="text-stone-500 text-sm md:text-base max-w-md font-medium leading-relaxed">
            Eliminating uncertainty from Indian train journeys with advanced seat visualization and transparent booking.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-[#f8faff] hover:bg-white border border-stone-200 hover:border-blue-300 rounded-3xl p-6 transition-all shadow-xs hover:shadow-xl hover:shadow-blue-600/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    {b.icon}
                  </div>
                  <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border ${b.badgeColor}`}>
                    {b.tag}
                  </span>
                </div>

                <h3 className="text-base font-black text-stone-900 tracking-tight mb-2">
                  {b.title}
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed mb-6 font-medium">
                  {b.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200/60 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  {b.highlight}
                </span>
                <Link
                  to={`/trains?from=HWH&to=NDLS&date=${todayDate}`}
                  className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors"
                  aria-label={`Explore ${b.title}`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

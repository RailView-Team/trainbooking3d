import React from 'react';
import { Eye, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Eye className="w-8 h-8 text-rose-700" />,
    title: 'See Before You Book',
    description: 'Explore your exact seat in full 3D. Check window alignment, legroom, and proximity to doors before confirming your reservation.'
  },
  {
    icon: <Sparkles className="w-8 h-8 text-rose-700" />,
    title: 'Smart Recommendations',
    description: 'Tell us your preferences—window, aisle, quiet zone, or family seating—and our algorithm will highlight the best available seats.'
  },
  {
    icon: <Smartphone className="w-8 h-8 text-rose-700" />,
    title: 'Instant Mobile Ticketing',
    description: 'Skip the line. Your digital ticket is instantly available on your device, complete with live journey tracking and platform updates.'
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-rose-700" />,
    title: 'Secure & Flexible',
    description: 'Enterprise-grade payment security. Change or cancel your trip with just a few taps using our seamless self-service portal.'
  }
];

export default function Features() {
  return (
    <section className="bg-[#faf8ff] py-16 border-t border-[#e2e8f0] relative z-10">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4 tracking-tight">Essential railway services</h2>
          <p className="text-sm text-stone-500 leading-relaxed">Clear tools for searching, selecting, and managing every journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white p-6 lg:p-7 rounded-2xl border border-[#c4c5d7] shadow-none hover:border-[#93c5fd] transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-[#e2e7ff] border border-[#dbe2fd] flex items-center justify-center mb-6 group-hover:bg-[#dbeafe] transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-3">{f.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <section className="bg-[#faf9f6] py-24 border-t border-stone-200 relative z-10">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-stone-900 mb-6 tracking-tight">The Modern Standard for Rail Travel</h2>
          <p className="text-lg text-stone-500 leading-relaxed">Experience a new era of transportation where transparency, comfort, and technology converge seamlessly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white p-8 lg:p-10 rounded-[2rem] border border-stone-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-rose-50 group-hover:border-rose-100 transition-all duration-500">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-4">{f.title}</h3>
              <p className="text-stone-500 leading-relaxed font-medium">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

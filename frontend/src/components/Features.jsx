import React from 'react';
import { ShieldCheck, TrainFront, Zap, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    iconBg: 'bg-emerald-50 border-emerald-100',
    title: '100% Secure',
    description: 'Safe and reliable booking process'
  },
  {
    icon: <TrainFront className="w-5 h-5 text-purple-600" />,
    iconBg: 'bg-purple-50 border-purple-100',
    title: 'Real-time Availability',
    description: 'Check seat availability instantly'
  },
  {
    icon: <Zap className="w-5 h-5 text-amber-600" />,
    iconBg: 'bg-amber-50 border-amber-100',
    title: 'Easy & Fast',
    description: 'Book in just a few simple steps'
  },
  {
    icon: <Headphones className="w-5 h-5 text-blue-600" />,
    iconBg: 'bg-blue-50 border-blue-100',
    title: '24/7 Support',
    description: "We're here to help, anytime"
  }
];

export default function Features() {
  return (
    <section className="bg-white py-14 border-t border-stone-100 relative z-10">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        {/* Section Heading */}
        <div className="mb-10">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-1">
            WHY CHOOSE RAILVISTA?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            A smarter way to book your journey
          </h2>
        </div>

        {/* 4 Feature Items in a Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-start gap-3.5 p-4 rounded-2xl bg-white hover:bg-stone-50/60 transition-colors"
            >
              <div className={`w-11 h-11 rounded-full border ${f.iconBg} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-stone-900 leading-tight mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-stone-500 font-medium leading-relaxed">
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

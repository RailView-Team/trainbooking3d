import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Train, Sparkles } from 'lucide-react';

const popularRoutes = [
  {
    fromCode: 'HWH',
    fromName: 'Howrah Junction',
    fromCity: 'Kolkata',
    toCode: 'NDLS',
    toName: 'New Delhi',
    toCity: 'Delhi',
    trainName: 'Vande Bharat Express',
    trainNumber: '22301',
    duration: '17h 05m',
    frequency: 'Daily',
    startFare: '₹1,850',
    type: 'Express',
    accent: 'border-blue-200 hover:border-blue-400'
  },
  {
    fromCode: 'MMCT',
    fromName: 'Mumbai Central',
    fromCity: 'Mumbai',
    toCode: 'NDLS',
    toName: 'New Delhi',
    toCity: 'Delhi',
    trainName: 'Tejas Rajdhani Express',
    trainNumber: '12951',
    duration: '15h 30m',
    frequency: 'Daily',
    startFare: '₹2,050',
    type: 'Superfast',
    accent: 'border-indigo-200 hover:border-indigo-400'
  },
  {
    fromCode: 'HWH',
    fromName: 'Howrah Junction',
    fromCity: 'Kolkata',
    toCode: 'RNC',
    toName: 'Ranchi Junction',
    toCity: 'Ranchi',
    trainName: 'Vande Bharat Express',
    trainNumber: '20897',
    duration: '7h 05m',
    frequency: 'Mon, Wed, Fri',
    startFare: '₹1,150',
    type: 'Vande Bharat',
    accent: 'border-cyan-200 hover:border-cyan-400'
  },
  {
    fromCode: 'MMCT',
    fromName: 'Mumbai Central',
    fromCity: 'Mumbai',
    toCode: 'ADI',
    toName: 'Ahmedabad Junction',
    toCity: 'Ahmedabad',
    trainName: 'Vande Bharat Express',
    trainNumber: '20901',
    duration: '5h 25m',
    frequency: 'Except Sun',
    startFare: '₹1,200',
    type: 'Vande Bharat',
    accent: 'border-emerald-200 hover:border-emerald-400'
  }
];

export default function PopularRoutes() {
  const navigate = useNavigate();
  const todayDate = new Date().toISOString().split('T')[0];

  const handleRouteClick = (route) => {
    const params = new URLSearchParams({
      from: route.fromCode,
      to: route.toCode,
      date: todayDate,
      passengers: '1',
      class: 'All Classes'
    });
    navigate(`/trains?${params.toString()}`);
  };

  return (
    <section className="py-20 bg-stone-50/60 border-t border-stone-200/70 relative">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#2563eb] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>POPULAR DESTINATIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              Top Indian Railway routes
            </h2>
          </div>
          <p className="text-stone-500 text-sm max-w-md font-medium leading-relaxed">
            Most booked inter-city journeys with fast express coaches and guaranteed 3D seat previews.
          </p>
        </div>

        {/* 4 Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRoutes.map((r, i) => (
            <motion.div
              key={`${r.fromCode}-${r.toCode}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              onClick={() => handleRouteClick(r)}
              className={`bg-white border ${r.accent} rounded-3xl p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group`}
            >
              <div>
                {/* Train Badge & Number */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200/60">
                    {r.trainName}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-400">
                    #{r.trainNumber}
                  </span>
                </div>

                {/* Route Visual */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-2xl font-black text-stone-900 tracking-tight">
                      {r.fromCode}
                    </div>
                    <div className="text-xs font-semibold text-stone-500 truncate max-w-[100px]">
                      {r.fromCity}
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-2 flex-1">
                    <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      {r.duration}
                    </span>
                    <div className="w-full flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <div className="flex-1 h-[2px] bg-stone-200 mx-1 border-dashed" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-stone-900 tracking-tight">
                      {r.toCode}
                    </div>
                    <div className="text-xs font-semibold text-stone-500 truncate max-w-[100px]">
                      {r.toCity}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-6">
                  <Train className="w-3.5 h-3.5 text-blue-500" />
                  <span>Runs: <strong className="text-stone-800">{r.frequency}</strong></span>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                    Starting from
                  </span>
                  <span className="text-lg font-black text-stone-900">
                    {r.startFare}
                  </span>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#2563eb] group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

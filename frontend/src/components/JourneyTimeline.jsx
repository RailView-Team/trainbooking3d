import React from 'react';
import { Clock, MapPin, Navigation } from 'lucide-react';

const JOURNEY = [
  { station: 'New York (NYP)', time: '08:00 AM', type: 'origin', platform: 'Plat 9', boarding: 'Zone A' },
  { station: 'Philadelphia (PHL)', time: '09:15 AM', type: 'stop', platform: 'Plat 2', boarding: 'Zone C' },
  { station: 'Baltimore (BWI)', time: '10:30 AM', type: 'stop', platform: 'Plat 4', boarding: 'Zone B' },
  { station: 'Washington (WAS)', time: '11:45 AM', type: 'destination', platform: 'Plat 1', boarding: 'Zone A' }
];

export default function JourneyTimeline() {
  return (
    <div className="bg-stone-900 border border-stone-800/80 rounded-[2rem] p-6 lg:p-10 mb-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
      
      {/* Header Info */}
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-rose-500/10 text-rose-400 font-bold px-2 py-0.5 rounded text-xs tracking-wider uppercase border border-rose-500/30">Express</span>
            <span className="text-stone-500 text-sm font-semibold">AeroExpress 104</span>
          </div>
          <h2 className="text-2xl font-black text-white">Route Schedule</h2>
        </div>
        <div className="text-right">
          <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Total Duration</div>
          <div className="flex items-center gap-1.5 text-white font-black text-lg">
            <Clock className="w-5 h-5 text-rose-500" /> 3h 45m
          </div>
        </div>
      </div>

      {/* Timeline Graphic */}
      <div className="relative pt-4 pb-2 z-10">
        
        {/* The Track Line Background */}
        <div className="absolute top-7 left-0 right-0 h-1 bg-stone-800 rounded-full mx-8"></div>
        
        {/* Animated Progress Line */}
        <div className="absolute top-7 left-0 right-0 h-1 rounded-full mx-8 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-rose-700/0 via-rose-700 to-rose-700/0 animate-[shimmer_3s_infinite]" style={{ backgroundSize: '200% 100%' }}></div>
        </div>

        <div className="flex justify-between relative">
          {JOURNEY.map((stop, index) => {
            const isOrigin = stop.type === 'origin';
            const isDest = stop.type === 'destination';
            
            return (
              <div key={index} className="flex flex-col items-center w-32 relative group">
                {/* Time above dot */}
                <div className="text-white font-bold text-sm mb-2">{stop.time}</div>
                
                {/* The Dot */}
                <div className={`w-6 h-6 rounded-full border-4 border-white flex items-center justify-center relative z-10 transition-transform group-hover:scale-125 shadow-xl shadow-black/20
                  ${isOrigin || isDest ? 'bg-rose-600' : 'bg-stone-700'}
                `}>
                  {isOrigin && <Navigation className="w-3 h-3 text-white rotate-90" />}
                  {isDest && <MapPin className="w-3 h-3 text-white" />}
                </div>

                {/* Station Info below dot */}
                <div className="mt-3 text-center">
                  <div className={`font-bold text-sm ${isOrigin || isDest ? 'text-white' : 'text-stone-300'}`}>
                    {stop.station.split(' ')[0]}
                  </div>
                  <div className="text-stone-500 text-xs font-semibold mb-2">
                    {stop.station.match(/\(([^)]+)\)/)?.[1]}
                  </div>
                  
                  {/* Practical boarding info */}
                  <div className="flex flex-col gap-1 items-center bg-stone-950/50 border border-stone-800/80 rounded-xl py-1.5 px-3">
                    <span className="text-[10px] uppercase text-stone-500 font-bold tracking-wider">{stop.platform}</span>
                    <span className="text-[10px] uppercase text-rose-400 font-bold tracking-wider">{stop.boarding}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* CSS Animation defined locally for convenience */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

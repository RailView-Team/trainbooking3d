import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Coffee, Wind, Moon, Sun, CheckCircle2, Shield, Armchair, ChevronRight } from 'lucide-react';

const CLASSES = [
  { code: '1A', name: 'First AC', fare: 4200, available: 4, desc: 'Premium luxury, spacious cabins, privacy doors', amenities: ['Bedding', 'Meals', 'Reading Light', 'Personal AC'] },
  { code: '2A', name: 'Second AC', fare: 2800, available: 12, desc: 'Comfortable air-conditioned sleeper with curtains', amenities: ['Bedding', 'Curtains', 'Reading Light'] },
  { code: '3A', name: 'Third AC', fare: 1800, available: 45, desc: 'Air-conditioned sleeper, budget friendly', amenities: ['Bedding'] },
  { code: 'SL', name: 'Sleeper', fare: 650, available: 120, desc: 'Standard non-AC sleeper class', amenities: ['Fan'] },
  { code: 'EC', name: 'Exec Chair', fare: 1850, available: 8, desc: 'Spacious AC seating with ample legroom', amenities: ['Extra Legroom', 'Meals', 'Tray Table'] },
  { code: 'CC', name: 'AC Chair', fare: 950, available: 20, desc: 'Air-conditioned seating for day travel', amenities: ['AC', 'Tray Table'] },
  { code: '2S', name: '2nd Seating', fare: 250, available: 80, desc: 'Basic non-AC seating', amenities: ['Fan'] },
];

const TRAIN_COMPOSITION = [
  { id: 'ENG', type: 'engine', label: 'ENG' },
  { id: 'GN1', type: 'GN', label: 'UR' },
  { id: 'S1', type: 'SL', classCode: 'SL' },
  { id: 'S2', type: 'SL', classCode: 'SL' },
  { id: 'S3', type: 'SL', classCode: 'SL' },
  { id: 'PC', type: 'pantry', label: 'PC' },
  { id: 'B1', type: '3A', classCode: '3A' },
  { id: 'B2', type: '3A', classCode: '3A' },
  { id: 'B3', type: '3A', classCode: '3A' },
  { id: 'A1', type: '2A', classCode: '2A' },
  { id: 'A2', type: '2A', classCode: '2A' },
  { id: 'H1', type: '1A', classCode: '1A' },
  { id: 'C1', type: 'CC', classCode: 'CC' },
  { id: 'E1', type: 'EC', classCode: 'EC' },
  { id: 'D1', type: '2S', classCode: '2S' },
  { id: 'GN2', type: 'GN', label: 'UR' }
];

const getAmenityIcon = (amenity) => {
  if (amenity.includes('AC') || amenity.includes('Fan')) return <Wind className="w-3.5 h-3.5" />;
  if (amenity.includes('Meals')) return <Coffee className="w-3.5 h-3.5" />;
  if (amenity.includes('Bedding') || amenity.includes('Curtains')) return <Moon className="w-3.5 h-3.5" />;
  if (amenity.includes('Legroom') || amenity.includes('Tray')) return <Armchair className="w-3.5 h-3.5" />;
  return <Info className="w-3.5 h-3.5" />;
};

export default function CoachSelection() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[2]); // Default 3A
  const [selectedCoach, setSelectedCoach] = useState('B1');

  const availableCoaches = useMemo(() => {
    return TRAIN_COMPOSITION.filter(c => c.classCode === selectedClass.code);
  }, [selectedClass]);

  // Reset coach when class changes
  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    const coaches = TRAIN_COMPOSITION.filter(c => c.classCode === cls.code);
    if (coaches.length > 0) {
      setSelectedCoach(coaches[0].id);
    } else {
      setSelectedCoach(null);
    }
  };

  return (
    <section className="relative z-10 bg-slate-950 py-16 border-t border-slate-900/50">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-white mb-2">Select Class & Coach</h2>
          <p className="text-slate-400 font-medium">AeroExpress 104 • NYP to WAS</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Class Selection List */}
          <div className="lg:w-1/3 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Travel Classes</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {CLASSES.map((cls) => {
                const isSelected = selectedClass.code === cls.code;
                const isSoldOut = cls.available === 0;

                return (
                  <div 
                    key={cls.code}
                    onClick={() => !isSoldOut && handleClassSelect(cls)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group
                      ${isSoldOut ? 'opacity-50 border-slate-800 bg-slate-950/30' : 
                        isSelected ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(225,29,72,0.15)]' : 
                        'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900'}`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/20 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    )}
                    
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black px-2 py-1 rounded bg-slate-800 ${isSelected ? 'text-rose-400 border border-rose-500/30' : 'text-slate-300'}`}>
                          {cls.code}
                        </span>
                        <h4 className={`font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>{cls.name}</h4>
                      </div>
                      <div className={`font-bold text-lg ${isSelected ? 'text-rose-400' : 'text-white'}`}>
                        ${cls.fare}
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-400 mb-3 relative z-10 pr-4">{cls.desc}</div>
                    
                    <div className="flex justify-between items-end relative z-10">
                      <div className={`text-xs font-semibold px-2 py-1 rounded-md ${isSoldOut ? 'bg-slate-800 text-slate-500' : isSelected ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {isSoldOut ? 'Sold Out' : `${cls.available} Seats`}
                      </div>
                      
                      {!isSoldOut && (
                        <div className={`text-xs font-bold flex items-center gap-1 transition-colors ${isSelected ? 'text-rose-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                          {isSelected ? 'Selected' : 'Select'} 
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Coach Strip */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            
            {/* Selected Class Details Card */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedClass.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                  <div>
                    <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
                      <span className="text-rose-500">{selectedClass.code}</span> {selectedClass.name}
                    </h3>
                    <p className="text-slate-400 mt-2 max-w-md">{selectedClass.desc}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">Base Fare</div>
                    <div className="text-4xl font-black text-white mt-1">${selectedClass.fare}</div>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Included Amenities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedClass.amenities.map(am => (
                      <div key={am} className="flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="text-rose-500">{getAmenityIcon(am)}</div>
                        <span className="text-sm font-semibold text-slate-300">{am}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Visual Train Composition Strip */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Train Composition</h4>
                  <p className="text-sm font-medium text-slate-300">Front to Rear →</p>
                </div>
                {availableCoaches.length > 0 && (
                  <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-sm font-semibold text-slate-300">
                    Showing <span className="text-rose-500">{selectedClass.code}</span> Coaches
                  </div>
                )}
              </div>

              {/* Scrollable Strip */}
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex items-center gap-1.5 min-w-max px-2">
                  {TRAIN_COMPOSITION.map((coach, i) => {
                    const isTargetClass = coach.classCode === selectedClass.code;
                    const isSelected = selectedCoach === coach.id;
                    const isEngine = coach.type === 'engine';
                    const isPantry = coach.type === 'pantry';
                    
                    let bgClass = 'bg-slate-800 border-slate-700';
                    let textClass = 'text-slate-400';
                    let connectorClass = 'bg-slate-800';

                    if (isEngine) {
                      bgClass = 'bg-amber-500/20 border-amber-500/40';
                      textClass = 'text-amber-500';
                    } else if (isPantry) {
                      bgClass = 'bg-sky-500/20 border-sky-500/40';
                      textClass = 'text-sky-400';
                    } else if (isTargetClass) {
                      if (isSelected) {
                        bgClass = 'bg-rose-600 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]';
                        textClass = 'text-white';
                      } else {
                        bgClass = 'bg-rose-500/20 border-rose-500/40 cursor-pointer hover:bg-rose-500/30';
                        textClass = 'text-rose-400';
                      }
                    } else {
                      bgClass = 'bg-slate-900 border-slate-800 opacity-60';
                      textClass = 'text-slate-600';
                    }

                    return (
                      <React.Fragment key={i}>
                        {/* The Coach */}
                        <div 
                          onClick={() => isTargetClass && setSelectedCoach(coach.id)}
                          className={`
                            relative w-16 h-20 rounded-md border-2 flex flex-col items-center justify-center transition-all duration-300
                            ${bgClass}
                            ${isTargetClass && !isSelected ? 'hover:-translate-y-1' : ''}
                          `}
                        >
                          {/* Roof detail */}
                          <div className={`absolute top-1 left-2 right-2 h-1 rounded-sm ${isSelected ? 'bg-rose-400/50' : 'bg-slate-700/50'}`}></div>
                          
                          <span className={`font-black text-lg ${textClass}`}>{coach.label || coach.id}</span>
                          
                          {/* Wheels area */}
                          <div className="absolute -bottom-1.5 left-2 right-2 flex justify-between">
                            <div className="w-2 h-2 rounded-full bg-slate-950"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-950"></div>
                          </div>
                        </div>
                        
                        {/* Connector */}
                        {i < TRAIN_COMPOSITION.length - 1 && (
                          <div className={`w-3 h-2 ${isTargetClass && TRAIN_COMPOSITION[i+1]?.classCode === selectedClass.code ? 'bg-rose-500/40' : 'bg-slate-800'} rounded-sm`}></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Selected Coach Sub-Selector */}
              {availableCoaches.length > 0 && (
                <div className="mt-8 border-t border-slate-800/60 pt-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Select Specific Coach</h4>
                  <div className="flex flex-wrap gap-3">
                    {availableCoaches.map(coach => (
                      <button
                        key={coach.id}
                        onClick={() => setSelectedCoach(coach.id)}
                        className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                          selectedCoach === coach.id 
                            ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]' 
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        Coach {coach.id}
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl px-10 py-4 font-bold text-lg tracking-wide transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transform hover:-translate-y-0.5 flex items-center gap-2">
                      Proceed to Seat Map <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

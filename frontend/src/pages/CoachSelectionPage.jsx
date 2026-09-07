import React, { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrainFront } from 'lucide-react';
import { TRAIN_COMPOSITION, CLASSES } from '../coachData';

export default function CoachSelectionPage() {
  const { trainId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const classCode = searchParams.get('class');
  const selectedClass = CLASSES.find(c => c.code === classCode);
  
  // Use mock logic if no class provided
  if (!selectedClass) {
    return (
      <div className="pt-32 pb-24 text-center">
        <h2 className="text-2xl font-bold mb-4">No class selected</h2>
        <Link to={`/trains/${trainId}/class${location.search}`} className="text-rose-600 font-bold hover:underline">Go back to Class Selection</Link>
      </div>
    );
  }

  // Get coaches for this class based on train composition mock data
  // The actual implementation would have a flat list of train composition 
  // Let's create a generic array based on TRAIN_COMPOSITION
  const compositionArr = [
    { id: 'ENG', type: 'engine', label: 'ENG' },
    { id: 'GN1', type: 'GN', label: 'UR' },
    ...TRAIN_COMPOSITION['SL']?.map(id => ({ id, type: 'SL', classCode: 'SL' })) || [],
    { id: 'PC', type: 'pantry', label: 'PC' },
    ...TRAIN_COMPOSITION['3A']?.map(id => ({ id, type: '3A', classCode: '3A' })) || [],
    ...TRAIN_COMPOSITION['2A']?.map(id => ({ id, type: '2A', classCode: '2A' })) || [],
    ...TRAIN_COMPOSITION['1A']?.map(id => ({ id, type: '1A', classCode: '1A' })) || [],
    ...TRAIN_COMPOSITION['CC']?.map(id => ({ id, type: 'CC', classCode: 'CC' })) || [],
    ...TRAIN_COMPOSITION['EC']?.map(id => ({ id, type: 'EC', classCode: 'EC' })) || [],
    ...TRAIN_COMPOSITION['2S']?.map(id => ({ id, type: '2S', classCode: '2S' })) || [],
    { id: 'GN2', type: 'GN', label: 'UR' }
  ];

  const availableCoaches = compositionArr.filter(c => c.classCode === classCode);
  const [selectedCoach, setSelectedCoach] = useState(availableCoaches.length > 0 ? availableCoaches[0].id : null);

  const handleContinue = () => {
    if (selectedCoach) {
      searchParams.set('coach', selectedCoach);
      navigate(`/trains/${trainId}/seats?${searchParams.toString()}`);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-[70vh] bg-stone-50">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <Link 
          to={`/trains/${trainId}/class${location.search}`} 
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-6 inline-flex"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Class Selection
        </Link>
        
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900 mb-2">Select Coach</h2>
            <p className="text-stone-500 font-medium">Train: {trainId} • Class: <span className="text-stone-900 font-bold">{selectedClass.name}</span></p>
          </div>
          <div className="bg-white border border-stone-200 px-4 py-2 rounded-xl text-sm font-bold text-stone-700 shadow-sm inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {availableCoaches.length} Coaches Available
          </div>
        </div>

        {/* Visual Train Composition Strip */}
        <div className="bg-white border border-stone-200/60 rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Train Composition</h4>
              <p className="text-sm font-medium text-stone-600">Front to Rear →</p>
            </div>
            {availableCoaches.length > 0 && (
              <div className="bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-bold text-stone-700">
                Showing <span className="text-rose-700">{classCode}</span> Coaches
              </div>
            )}
          </div>

          {/* Scrollable Strip */}
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max px-2">
              {compositionArr.map((coach, i) => {
                const isTargetClass = coach.classCode === classCode;
                const isSelected = selectedCoach === coach.id;
                const isEngine = coach.type === 'engine';
                const isPantry = coach.type === 'pantry';
                
                let bgClass = 'bg-stone-100 border-stone-200';
                let textClass = 'text-stone-500';

                if (isEngine) {
                  bgClass = 'bg-amber-100 border-amber-200';
                  textClass = 'text-amber-700';
                } else if (isPantry) {
                  bgClass = 'bg-sky-100 border-sky-200';
                  textClass = 'text-sky-700';
                } else if (isTargetClass) {
                  if (isSelected) {
                    bgClass = 'bg-rose-700 border-rose-800 shadow-[0_4px_15px_rgba(225,29,72,0.3)]';
                    textClass = 'text-white';
                  } else {
                    bgClass = 'bg-rose-50 border-rose-200 cursor-pointer hover:bg-rose-100 hover:border-rose-300 transition-colors';
                    textClass = 'text-rose-700';
                  }
                } else {
                  bgClass = 'bg-stone-50 border-stone-100 opacity-70';
                  textClass = 'text-stone-400';
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
                      <div className={`absolute top-1 left-2 right-2 h-1 rounded-sm ${isSelected ? 'bg-white/30' : 'bg-black/5'}`}></div>
                      
                      <span className={`font-black text-lg ${textClass}`}>{coach.label || coach.id}</span>
                      
                      {/* Wheels area */}
                      <div className="absolute -bottom-1.5 left-2 right-2 flex justify-between">
                        <div className="w-2 h-2 rounded-full bg-stone-800"></div>
                        <div className="w-2 h-2 rounded-full bg-stone-800"></div>
                      </div>
                    </div>
                    
                    {/* Connector */}
                    {i < compositionArr.length - 1 && (
                      <div className={`w-3 h-2 ${isTargetClass && compositionArr[i+1]?.classCode === classCode ? 'bg-rose-200' : 'bg-stone-200'} rounded-sm`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Coach Details */}
        {availableCoaches.length > 0 && selectedCoach && (
          <div className="bg-white border border-stone-200/60 rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col lg:flex-row gap-8 justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                <TrainFront className="w-10 h-10 text-rose-700" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-stone-900 mb-1">Coach {selectedCoach}</h3>
                <p className="text-stone-500 font-medium">{selectedClass.name} • Approx. 28 seats available</p>
              </div>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col items-end gap-4">
              <button 
                onClick={handleContinue}
                className="w-full lg:w-auto bg-rose-700 hover:bg-rose-800 text-white rounded-xl px-10 py-4 font-bold text-lg tracking-wide transition-all shadow-[0_4px_15px_rgba(225,29,72,0.2)] hover:shadow-[0_8px_25px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Proceed to Seats <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

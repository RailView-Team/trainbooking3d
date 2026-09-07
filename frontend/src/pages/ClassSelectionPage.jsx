import React from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info, Coffee, Wind, Moon, Sun, Armchair } from 'lucide-react';
import { CLASSES } from '../coachData';

const getAmenityIcon = (amenity) => {
  if (amenity.includes('AC') || amenity.includes('Fan')) return <Wind className="w-3.5 h-3.5" />;
  if (amenity.includes('Meals')) return <Coffee className="w-3.5 h-3.5" />;
  if (amenity.includes('Bedding') || amenity.includes('Curtains')) return <Moon className="w-3.5 h-3.5" />;
  if (amenity.includes('Legroom') || amenity.includes('Tray')) return <Armchair className="w-3.5 h-3.5" />;
  return <Info className="w-3.5 h-3.5" />;
};

export default function ClassSelectionPage() {
  const { trainId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  // In a real app, you'd filter available classes by trainId. 
  // Here we show all mocked classes.

  const handleSelectClass = (classCode) => {
    searchParams.set('class', classCode);
    navigate(`/trains/${trainId}/coach?${searchParams.toString()}`);
  };

  return (
    <div className="pt-28 pb-24 min-h-[70vh] bg-stone-50">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <Link 
          to={`/trains/${trainId}${location.search}`} 
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-6 inline-flex"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Train Details
        </Link>
        
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-stone-900 mb-2">Select Class</h2>
          <p className="text-stone-500 font-medium">Train: {trainId} • Choose your comfort level</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CLASSES.map((cls) => {
            // Mock some sold out status based on ID
            const isSoldOut = cls.code === '1A' && trainId === 'TR-209'; // Just a random mock rule
            
            return (
              <div 
                key={cls.code}
                onClick={() => !isSoldOut && handleSelectClass(cls.code)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                  ${isSoldOut ? 'opacity-60 border-stone-200' : 'border-stone-200/60 hover:border-rose-700/50 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1'}`}
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-black px-3 py-1.5 rounded-lg ${isSoldOut ? 'bg-stone-100 text-stone-400' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                      {cls.code}
                    </span>
                    <h4 className="font-bold text-xl text-stone-900">{cls.name}</h4>
                  </div>
                  <div className="font-black text-2xl text-stone-900">
                    ${cls.fare}
                  </div>
                </div>
                
                <p className="text-sm text-stone-500 mb-6 max-w-sm relative z-10">{cls.desc}</p>
                
                <div className="flex flex-wrap gap-2 mb-6 border-t border-stone-100 pt-4">
                  {(cls.amenities || ['Seats']).map(am => (
                    <div key={am} className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-100">
                      <div className="text-rose-700">{getAmenityIcon(am)}</div>
                      <span className="text-xs font-semibold text-stone-600">{am}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <div className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg ${isSoldOut ? 'bg-stone-100 text-stone-500' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {isSoldOut ? 'Sold Out' : `${cls.capacity} Seats Available`}
                  </div>
                  
                  {!isSoldOut && (
                    <div className="text-sm font-bold flex items-center gap-1 transition-colors text-rose-700 group-hover:text-rose-800">
                      Select Class <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { User, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generate2DLayout, getSeatAvailability } from '../coachData';

export default function SeatMap2D({ classCode, coachId, selectedSeats, recommendedSeatId, onToggleSeat }) {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, seat: null });

  // Generate the pure layout template (doesn't contain status)
  const layout = useMemo(() => generate2DLayout(classCode), [classCode]);

  const handleHover = (e, seat, status) => {
    if (seat) {
      setTooltip({ show: true, x: e.clientX, y: e.clientY, seat: { ...seat, status } });
    } else {
      setTooltip({ ...tooltip, show: false });
    }
  };

  const Seat = ({ seat }) => {
    // Determine live availability based on coach and seat
    const status = getSeatAvailability(coachId, seat.id);
    
    const isAvail = status === 'available';
    const isRAC = status === 'RAC';
    const isOcc = status === 'occupied';
    const isSelected = selectedSeats.includes(seat.id);
    const isRecommended = seat.id === recommendedSeatId && !isSelected;

    let bgClass = '';
    if (isSelected) bgClass = 'bg-rose-600 text-white border-rose-600 shadow-md z-10';
    else if (isRecommended) bgClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-xl shadow-black/20 z-10 ring-2 ring-emerald-500/30 animate-[pulse_2s_ease-in-out_infinite]';
    else if (isAvail) bgClass = 'bg-stone-900 border-stone-700 text-stone-200 hover:border-rose-700 hover:text-rose-500 hover:shadow-xl shadow-black/20 cursor-pointer';
    else if (isRAC) bgClass = 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 cursor-pointer';
    else bgClass = 'bg-stone-900/50 border-stone-800 text-stone-500 cursor-not-allowed opacity-60';

    const isChair = seat.type.includes('Chair') || seat.type.includes('Bench');

    return (
      <div 
        className={`relative flex items-center justify-center text-[11px] font-bold rounded-md border transition-all duration-200 ${bgClass} 
          ${isChair ? 'w-10 h-10' : 'w-12 h-8'}`}
        onClick={() => (isAvail || isRAC) && onToggleSeat(seat.id)}
        onMouseEnter={(e) => handleHover(e, seat, status)}
        onMouseLeave={(e) => handleHover(e, null)}
      >
        {seat.id}
        {isOcc && <User className="absolute w-5 h-5 text-stone-300" strokeWidth={3} />}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-stone-950 p-8">
      
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 bg-stone-900/95 border border-stone-800 rounded-xl p-4 mb-8 sticky top-0 z-20 backdrop-blur shadow-xl shadow-black/20">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-stone-900 border border-stone-700"></div><span className="text-sm text-stone-300 font-medium">Available</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-rose-600 border border-rose-600 shadow-xl shadow-black/20"></div><span className="text-sm text-white font-bold">Selected</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500 shadow-xl shadow-black/20 ring-1 ring-emerald-500/30"></div><span className="text-sm text-emerald-400 font-bold">Recommended</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-50 border border-amber-300"></div><span className="text-sm text-amber-700 font-medium">RAC</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-stone-900/50 border border-stone-800 flex items-center justify-center"><User className="w-3 h-3 text-stone-300" /></div><span className="text-sm text-stone-500 font-medium">Occupied</span></div>
      </div>

      {/* Coach Layout Scroll View */}
      <div className="flex-1 overflow-auto custom-scrollbar flex justify-center pb-8">
        <div className="bg-stone-950 border-4 border-stone-800 rounded-3xl p-8 relative shadow-xl shadow-black/20 flex gap-10 items-center min-w-max">
          
          {layout.map((unit, i) => {
            if (unit.type === 'bay') {
              return (
                <div key={i} className="flex flex-col gap-4 border-r border-stone-800 pr-10 last:border-0 last:pr-0">
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1.5">{unit.mainLeft.map(s => <Seat key={s.id} seat={s} />)}</div>
                    <div className="flex flex-col gap-1.5">{unit.mainRight.map(s => <Seat key={s.id} seat={s} />)}</div>
                  </div>
                  <div className="h-6 flex items-center justify-center">
                    <div className="w-full h-px border-t-2 border-dashed border-stone-700"></div>
                  </div>
                  <div className="flex justify-center">
                    <div className="flex flex-col gap-1.5">{unit.side.map(s => <Seat key={s.id} seat={s} />)}</div>
                  </div>
                </div>
              );
            }
            
            if (unit.type === 'cabin') {
              return (
                <div key={i} className="flex flex-col relative border border-stone-800 rounded-xl p-4 bg-stone-900">
                  <div className="absolute -top-3 left-4 bg-stone-950 px-3 border border-stone-800 rounded-md text-[10px] font-bold text-rose-400 tracking-wider">
                    {unit.isCabin ? 'CABIN' : 'COUPE'} {unit.name}
                  </div>
                  <div className="flex gap-6 mt-2">
                    <div className="flex flex-col gap-1.5">{unit.mainLeft.map(s => <Seat key={s.id} seat={s} />)}</div>
                    {unit.isCabin && <div className="flex flex-col gap-1.5">{unit.mainRight.map(s => <Seat key={s.id} seat={s} />)}</div>}
                  </div>
                </div>
              );
            }

            if (unit.type === 'row') {
              return (
                <div key={i} className="flex flex-col gap-1 relative border-r border-stone-800 pr-4 last:border-0 last:pr-0">
                  <div className="flex flex-col gap-1">{unit.left.map(s => <Seat key={s.id} seat={s} />)}</div>
                  <div className="h-8 flex items-center justify-center">
                    <div className="h-full w-px border-l border-dashed border-stone-700"></div>
                  </div>
                  <div className="flex flex-col gap-1">{unit.right.map(s => <Seat key={s.id} seat={s} />)}</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {tooltip.show && tooltip.seat && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
            className="fixed z-50 bg-stone-900 border border-stone-800 shadow-xl rounded-lg p-3 pointer-events-none min-w-[140px]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-rose-400 text-lg">{tooltip.seat.id}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                tooltip.seat.status === 'available' ? 'bg-stone-900/50 text-stone-300' : 
                tooltip.seat.status === 'RAC' ? 'bg-amber-50 text-amber-600' : 'bg-stone-800 text-stone-500'
              }`}>
                {tooltip.seat.status}
              </span>
            </div>
            <div className="text-white font-bold text-sm">{tooltip.seat.type}</div>
            <div className="text-stone-500 text-xs mt-0.5 flex items-center gap-1 font-medium">
              <Info className="w-3 h-3" /> {tooltip.seat.pos}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

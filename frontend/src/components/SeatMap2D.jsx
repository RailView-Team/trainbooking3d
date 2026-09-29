import React, { useMemo, useState, useRef } from 'react';
import { User, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generate2DLayout, getSeatAvailability } from '../coachData';

export default function SeatMap2D({ classCode, coachId, selectedSeats = [], recommendedSeatId, onToggleSeat, availabilityData }) {
  const [preview, setPreview] = useState({ show: false, seat: null });
  const scrollRef = useRef(null);

  // Generate the pure layout template
  const layout = useMemo(() => generate2DLayout(classCode), [classCode]);

  // Build a map of available seats from the API data
  const seatStatusMap = useMemo(() => {
    if (!availabilityData?.coaches) return {};

    const map = {};
    availabilityData.coaches.forEach(coach => {
      if (String(coach.coachId) === String(coachId) || coach.coachNumber === coachId) {
        coach.seats?.forEach(seat => {
          map[seat.seatNumber] = { id: seat.id, status: seat.available ? 'available' : 'occupied' };
          map[String(seat.id)] = { id: seat.id, status: seat.available ? 'available' : 'occupied' };
        });
      }
    });
    return map;
  }, [availabilityData, coachId]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSingleClick = (e, seat, status) => {
    setPreview({ show: true, seat: { ...seat, status } });
  };

  const handleDoubleClick = (e, seat, status, realSeatId) => {
    if (status === 'available' || status === 'RAC') {
      onToggleSeat(realSeatId);
    }
  };

  const Seat = ({ seat }) => {
    const apiSeat = seatStatusMap[seat.id] || seatStatusMap[String(seat.id)];
    const status = apiSeat?.status || getSeatAvailability(coachId || '', seat.id);
    const seatId = apiSeat?.id ?? seat.id;

    const isAvail = status === 'available';
    const isRAC = status === 'RAC';
    const isOcc = status === 'occupied';
    const isSelected = selectedSeats.includes(seatId);
    const isRecommended = seat.id === recommendedSeatId && !isSelected;
    const isPreviewed = preview.show && preview.seat?.id === seat.id;

    let bgClass = '';
    if (isSelected) bgClass = 'bg-rose-600 text-white border-rose-600 shadow-md z-10';
    else if (isPreviewed) bgClass = 'bg-stone-800 border-stone-500 text-stone-200 shadow-lg z-10 ring-2 ring-stone-500/50';
    else if (isRecommended) bgClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-xl shadow-black/20 z-10 ring-2 ring-emerald-500/30 animate-[pulse_2s_ease-in-out_infinite]';
    else if (isAvail) bgClass = 'bg-stone-900 border-stone-700 text-stone-200 hover:border-stone-500 hover:shadow-xl shadow-black/20 cursor-pointer';
    else if (isRAC) bgClass = 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 cursor-pointer';
    else bgClass = 'bg-stone-900/50 border-stone-800 text-stone-500 cursor-not-allowed opacity-60';

    const isChair = seat.type.includes('Chair') || seat.type.includes('Bench');

    return (
      <div
        className={`relative flex items-center justify-center text-[11px] font-bold rounded-md border transition-all duration-200 ${bgClass} 
          ${isChair ? 'w-10 h-10' : 'w-12 h-8'} select-none shrink-0`}
        onClick={(e) => handleSingleClick(e, seat, status)}
        onDoubleClick={(e) => handleDoubleClick(e, { ...seat, id: seatId }, status, seatId)}
        title={`Seat ${seat.id} (${seat.type} - ${seat.pos}) • ${status}`}
      >
        {seat.id}
        {isOcc && <User className="absolute w-5 h-5 text-stone-300" strokeWidth={3} />}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-stone-950 p-4 md:p-6 overflow-hidden">

      {/* Legend & Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/95 border border-stone-800 rounded-2xl p-3 mb-4 sticky top-0 z-20 backdrop-blur shadow-xl shadow-black/20">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-stone-900 border border-stone-700"></div><span className="text-stone-300 font-medium">Available</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-stone-800 border border-stone-500 ring-1 ring-stone-500/50"></div><span className="text-stone-300 font-medium">Previewed</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-rose-600 border border-rose-600 shadow-md"></div><span className="text-white font-bold">Selected</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-300"></div><span className="text-amber-700 font-medium">RAC</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-stone-900/50 border border-stone-800 flex items-center justify-center"><User className="w-2.5 h-2.5 text-stone-300" /></div><span className="text-stone-500 font-medium">Occupied</span></div>
        </div>

        {/* Scroll helper buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-medium transition-colors"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Left</span>
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-medium transition-colors"
            title="Scroll Right"
          >
            <span className="hidden sm:inline">Right</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Coach Layout Scroll View - starts at Seat 1 with no left-side overflow cutoff */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar px-6 py-4 flex items-center justify-start min-h-0"
        onWheel={(e) => {
          if (e.deltaY && !e.deltaX && scrollRef.current) {
            scrollRef.current.scrollLeft += e.deltaY;
          }
        }}
      >
        <div className="bg-stone-950 border-2 border-stone-800 rounded-3xl p-6 relative shadow-2xl flex flex-col gap-3 min-w-max my-auto">
          
          {/* Coach Direction Orientation Bar */}
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-widest px-2 border-b border-stone-800/80 pb-2">
            <span className="flex items-center gap-1.5 text-stone-400">
              <span className="text-rose-400 font-black">←</span> Engine / Front (Seats 1+)
            </span>
            <span className="text-stone-400 font-mono">
              Coach {coachId || ''} {classCode ? `• ${classCode}` : ''}
            </span>
            <span className="flex items-center gap-1.5 text-stone-400">
              Rear / Exit <span className="text-rose-400 font-black">→</span>
            </span>
          </div>

          {/* Coach Interior Units */}
          <div className="flex gap-8 items-center pt-2">
            {layout.map((unit, i) => {
              if (unit.type === 'bay') {
                return (
                  <div key={i} className="flex flex-col gap-3 border-r border-stone-800/90 pr-8 last:border-0 last:pr-0">
                    <div className="flex gap-3">
                      <div className="flex flex-col gap-1.5">{unit.mainLeft.map(s => <Seat key={s.id} seat={s} />)}</div>
                      <div className="flex flex-col gap-1.5">{unit.mainRight.map(s => <Seat key={s.id} seat={s} />)}</div>
                    </div>
                    <div className="h-5 flex items-center justify-center">
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
                  <div key={i} className="flex flex-col relative border border-stone-800 rounded-xl p-4 bg-stone-900/60">
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
                  <div key={i} className="flex flex-col gap-1 relative border-r border-stone-800/80 pr-3 last:border-0 last:pr-0">
                    <div className="flex flex-col gap-1">{unit.left.map(s => <Seat key={s.id} seat={s} />)}</div>
                    <div className="h-5 flex items-center justify-center">
                      <div className="w-full h-px border-t-2 border-dashed border-stone-700"></div>
                    </div>
                    <div className="flex flex-col gap-1">{unit.right.map(s => <Seat key={s.id} seat={s} />)}</div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Dedicated Bottom Preview / Action Dock - Never overlaps coach seats */}
      <div className="mt-3 pt-3 border-t border-stone-800/80 min-h-[58px] flex items-center justify-between">
        <AnimatePresence mode="wait">
          {preview.show && preview.seat ? (
            <motion.div
              key={preview.seat.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="w-full flex items-center justify-between gap-3 bg-stone-900/90 border border-stone-700/80 rounded-xl px-4 py-2 shadow-xl"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-rose-400 bg-stone-950/90 border border-stone-800 px-2.5 py-0.5 rounded-lg">
                    Seat {preview.seat.id}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      preview.seat.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : preview.seat.status === 'RAC'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-stone-800 text-stone-400 border border-stone-700'
                    }`}
                  >
                    {preview.seat.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                  <span>{preview.seat.type}</span>
                  <span className="text-stone-400 font-normal">({preview.seat.pos})</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {(preview.seat.status === 'available' || preview.seat.status === 'RAC') && (
                  <button
                    type="button"
                    onClick={() => {
                      const realSeatId = seatStatusMap[preview.seat.id]?.id ?? preview.seat.id;
                      onToggleSeat(realSeatId);
                    }}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md cursor-pointer ${
                      selectedSeats.includes(seatStatusMap[preview.seat.id]?.id ?? preview.seat.id)
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/40'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
                    }`}
                  >
                    {selectedSeats.includes(seatStatusMap[preview.seat.id]?.id ?? preview.seat.id)
                      ? 'Deselect Seat'
                      : 'Select Seat'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreview({ show: false, seat: null })}
                  className="text-stone-400 hover:text-white p-1 rounded-md hover:bg-stone-800 transition-colors"
                  title="Close preview"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="w-full flex items-center justify-between text-xs text-stone-400 px-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Click any seat to preview details • Double-click or click button to select</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-stone-400 text-[11px]">
                <span>Tip: Use mouse wheel or Left/Right buttons to scroll coach</span>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

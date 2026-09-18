import React, { useState, useMemo } from 'react';
import { User, CheckCircle2, AlertCircle, Info, ChevronRight, Armchair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA GENERATOR ---
function generateCoachData(classCode) {
  let layout = [];
  let currentId = 1;

  if (classCode === '3A' || classCode === 'SL') {
    for (let i = 0; i < 9; i++) {
      layout.push({
        type: 'bay',
        mainLeft: [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Middle Berth', pos: 'Middle' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ],
        mainRight: [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Middle Berth', pos: 'Middle' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ],
        side: [
          { id: currentId++, type: 'Side Lower', pos: 'Window' },
          { id: currentId++, type: 'Side Upper', pos: 'Window' }
        ]
      });
    }
  } else if (classCode === '2A') {
    for (let i = 0; i < 8; i++) {
      layout.push({
        type: 'bay',
        mainLeft: [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ],
        mainRight: [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ],
        side: [
          { id: currentId++, type: 'Side Lower', pos: 'Window' },
          { id: currentId++, type: 'Side Upper', pos: 'Window' }
        ]
      });
    }
  } else if (classCode === '1A') {
    for (let i = 0; i < 6; i++) {
      const isCabin = i % 3 !== 0; // 4 cabins, 2 coupes
      layout.push({
        type: 'cabin',
        isCabin,
        name: String.fromCharCode(65 + i),
        mainLeft: [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ],
        mainRight: isCabin ? [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ] : []
      });
    }
  } else if (classCode === 'CC') {
    for (let i = 0; i < 15; i++) {
      layout.push({
        type: 'row',
        left: [
          { id: currentId++, type: 'Chair', pos: 'Window' },
          { id: currentId++, type: 'Chair', pos: 'Middle' },
          { id: currentId++, type: 'Chair', pos: 'Aisle' }
        ],
        right: [
          { id: currentId++, type: 'Chair', pos: 'Aisle' },
          { id: currentId++, type: 'Chair', pos: 'Window' }
        ]
      });
    }
  } else if (classCode === 'EC') {
    for (let i = 0; i < 14; i++) {
      layout.push({
        type: 'row',
        left: [
          { id: currentId++, type: 'Exec Chair', pos: 'Window' },
          { id: currentId++, type: 'Exec Chair', pos: 'Aisle' }
        ],
        right: [
          { id: currentId++, type: 'Exec Chair', pos: 'Aisle' },
          { id: currentId++, type: 'Exec Chair', pos: 'Window' }
        ]
      });
    }
  } else if (classCode === '2S') {
    for (let i = 0; i < 18; i++) {
      layout.push({
        type: 'row',
        left: [
          { id: currentId++, type: 'Bench', pos: 'Window' },
          { id: currentId++, type: 'Bench', pos: 'Middle' },
          { id: currentId++, type: 'Bench', pos: 'Aisle' }
        ],
        right: [
          { id: currentId++, type: 'Bench', pos: 'Aisle' },
          { id: currentId++, type: 'Bench', pos: 'Middle' },
          { id: currentId++, type: 'Bench', pos: 'Window' }
        ]
      });
    }
  }
  
  const traverseAndAssign = (arr) => {
    arr.forEach(seat => {
      const rand = (seat.id * 17) % 100;
      if (rand < 55) seat.status = 'available';
      else if (rand < 85) seat.status = 'occupied';
      else seat.status = 'RAC';
    });
  }

  layout.forEach(unit => {
    if (unit.type === 'bay' || unit.type === 'cabin') {
      traverseAndAssign(unit.mainLeft || []);
      traverseAndAssign(unit.mainRight || []);
      traverseAndAssign(unit.side || []);
    } else {
      traverseAndAssign(unit.left || []);
      traverseAndAssign(unit.right || []);
    }
  });

  return layout;
}

// --- COMPONENTS ---
export default function SeatMap() {
  const [activeClass, setActiveClass] = useState('3A');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, seat: null });

  const layout = useMemo(() => generateCoachData(activeClass), [activeClass]);

  // Clear selections when changing class
  const handleClassChange = (cls) => {
    setActiveClass(cls);
    setSelectedSeats([]);
  };

  const handleToggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        alert("Maximum 6 seats allowed per booking.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleHover = (e, seat) => {
    if (seat) {
      setTooltip({ show: true, x: e.clientX, y: e.clientY, seat });
    } else {
      setTooltip({ ...tooltip, show: false });
    }
  };

  const Seat = ({ seat }) => {
    const isAvail = seat.status === 'available';
    const isRAC = seat.status === 'RAC';
    const isOcc = seat.status === 'occupied';
    const isSelected = selectedSeats.includes(seat.id);

    let bgClass = '';
    if (isSelected) bgClass = 'bg-rose-600 text-white border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)] z-10';
    else if (isAvail) bgClass = 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer';
    else if (isRAC) bgClass = 'bg-amber-500/20 border-amber-500/30 text-amber-500 hover:bg-amber-500/30 cursor-pointer';
    else bgClass = 'bg-slate-950 border-slate-900 text-slate-800 cursor-not-allowed opacity-70';

    const isChair = seat.type.includes('Chair') || seat.type.includes('Bench');

    return (
      <div 
        className={`relative flex items-center justify-center text-[11px] font-bold rounded-md border transition-all duration-200 ${bgClass} 
          ${isChair ? 'w-10 h-10' : 'w-12 h-8'}`}
        onClick={() => (isAvail || isRAC) && handleToggleSeat(seat.id)}
        onMouseEnter={(e) => handleHover(e, seat)}
        onMouseLeave={(e) => handleHover(e, null)}
      >
        {seat.id}
        {isOcc && <User className="absolute w-5 h-5 text-slate-700" strokeWidth={3} />}
      </div>
    );
  };

  return (
    <section className="relative z-10 bg-slate-950 py-16 border-t border-slate-900/50">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        {/* Header & Class Tabs for testing */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Select Your Seats</h2>
            <p className="text-slate-400 font-medium">Coach B1 • AeroExpress 104</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['1A', '2A', '3A', 'SL', 'EC', 'CC', '2S'].map(cls => (
              <button
                key={cls}
                onClick={() => handleClassChange(cls)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  activeClass === cls ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Main Seat Map Area */}
          <div className="xl:w-3/4 flex flex-col">
            
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-800 border border-slate-600"></div><span className="text-sm text-slate-300 font-medium">Available</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-rose-600 border border-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.4)]"></div><span className="text-sm text-white font-bold">Selected</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/30"></div><span className="text-sm text-amber-500 font-medium">RAC (Sharing)</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-950 border border-slate-900 flex items-center justify-center"><User className="w-3 h-3 text-slate-700" /></div><span className="text-sm text-slate-600 font-medium">Occupied</span></div>
            </div>

            {/* Coach Wrapper */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/40 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/40 to-transparent z-10 pointer-events-none"></div>
              
              {/* Horizontal scrollable area */}
              <div className="overflow-x-auto custom-scrollbar pb-6">
                <div className="flex gap-10 items-center min-w-max px-4">
                  
                  {layout.map((unit, i) => {
                    // Render Bay (3A, 2A, SL)
                    if (unit.type === 'bay') {
                      return (
                        <div key={i} className="flex flex-col gap-4 border-r border-slate-800/50 pr-10 last:border-0 last:pr-0">
                          <div className="flex gap-4">
                            <div className="flex flex-col gap-1.5">{unit.mainLeft.map(s => <Seat key={s.id} seat={s} />)}</div>
                            <div className="flex flex-col gap-1.5">{unit.mainRight.map(s => <Seat key={s.id} seat={s} />)}</div>
                          </div>
                          <div className="h-6 flex items-center justify-center">
                            <div className="w-full h-px border-t-2 border-dashed border-slate-800"></div>
                          </div>
                          <div className="flex justify-center">
                            <div className="flex flex-col gap-1.5">{unit.side.map(s => <Seat key={s.id} seat={s} />)}</div>
                          </div>
                        </div>
                      );
                    }
                    
                    // Render Cabin/Coupe (1A)
                    if (unit.type === 'cabin') {
                      return (
                        <div key={i} className="flex flex-col relative border border-slate-700/50 rounded-xl p-4 bg-slate-900/30">
                          <div className="absolute -top-3 left-4 bg-slate-950 px-3 border border-slate-800 rounded-md text-[10px] font-bold text-rose-500 tracking-wider">
                            {unit.isCabin ? 'CABIN' : 'COUPE'} {unit.name}
                          </div>
                          <div className="flex gap-6 mt-2">
                            <div className="flex flex-col gap-1.5">{unit.mainLeft.map(s => <Seat key={s.id} seat={s} />)}</div>
                            {unit.isCabin && <div className="flex flex-col gap-1.5">{unit.mainRight.map(s => <Seat key={s.id} seat={s} />)}</div>}
                          </div>
                        </div>
                      );
                    }

                    // Render Row (CC, EC, 2S)
                    if (unit.type === 'row') {
                      return (
                        <div key={i} className="flex flex-col gap-1 relative border-r border-slate-800/30 pr-4 last:border-0 last:pr-0">
                          <div className="flex flex-col gap-1">{unit.left.map(s => <Seat key={s.id} seat={s} />)}</div>
                          <div className="h-8 flex items-center justify-center">
                            <div className="h-full w-px border-l border-dashed border-slate-700/50"></div>
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
          </div>

          {/* Sidebar / Checkout Area */}
          <div className="xl:w-1/4 flex flex-col gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                Your Selection
                <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-1 rounded-md">{selectedSeats.length} Seats</span>
              </h3>
              
              {selectedSeats.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Armchair className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-slate-400 font-medium">Click on available seats to select them.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {selectedSeats.map(id => {
                      // Find seat detail from layout
                      let seatDetail = null;
                      layout.forEach(unit => {
                        const allSeats = [...(unit.mainLeft||[]), ...(unit.mainRight||[]), ...(unit.side||[]), ...(unit.left||[]), ...(unit.right||[])];
                        const found = allSeats.find(s => s.id === id);
                        if (found) seatDetail = found;
                      });
                      
                      return (
                        <div key={id} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-rose-600 flex items-center justify-center font-black text-white">{id}</div>
                            <div>
                              <div className="text-white font-bold text-sm">{seatDetail?.type}</div>
                              <div className="text-slate-400 text-xs">{seatDetail?.pos}</div>
                            </div>
                          </div>
                          <div className="text-rose-400 font-medium text-xs">Selected</div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="border-t border-slate-800/60 pt-4 mt-4">
                    <div className="flex justify-between text-slate-400 font-medium mb-2">
                      <span>Base Fare ({selectedSeats.length}x)</span>
                      <span className="text-white font-bold">₹{selectedSeats.length * 45}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-medium mb-4">
                      <span>Taxes & Fees</span>
                      <span className="text-white font-bold">₹{selectedSeats.length * 5}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-rose-500/30">
                      <span className="text-slate-300 font-bold uppercase tracking-wider text-xs">Total Amount</span>
                      <span className="text-2xl font-black text-rose-500">₹{selectedSeats.length * 50}</span>
                    </div>
                  </div>

                  <button className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-4 font-bold text-lg tracking-wide transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 mt-2 flex justify-center items-center gap-2">
                    Proceed to Payment <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip.show && tooltip.seat && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
            className="fixed z-50 bg-slate-900 border border-slate-700 shadow-2xl rounded-lg p-3 pointer-events-none min-w-[140px]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-rose-500 text-lg">{tooltip.seat.id}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                tooltip.seat.status === 'available' ? 'bg-slate-800 text-slate-300' : 
                tooltip.seat.status === 'RAC' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'
              }`}>
                {tooltip.seat.status}
              </span>
            </div>
            <div className="text-white font-semibold text-sm">{tooltip.seat.type}</div>
            <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <Info className="w-3 h-3" /> {tooltip.seat.pos}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Armchair, Info, User, Coffee, Wind, Moon, Sun, CheckCircle2, Shield, Eye, Sparkles, ArrowRightLeft, DoorOpen, VolumeX, Users } from 'lucide-react';
import { CLASSES, TRAIN_COMPOSITION, getSeatAvailability, generate2DLayout, generate3DLayout } from '../coachData';
import SeatMap2D from './SeatMap2D';
import CoachViewer3D from './CoachViewer3D';
import JourneyTimeline from './JourneyTimeline';

export default function SeatSelectionFlow({ onCheckout }) {
  const [selectedClassCode, setSelectedClassCode] = useState(null);
  const [selectedCoachId, setSelectedCoachId] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [viewMode, setViewMode] = useState('2D');
  const [preferences, setPreferences] = useState([]);
  const [focusedSeatId, setFocusedSeatId] = useState(null);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const selectedClass = useMemo(() => CLASSES.find(c => c.code === selectedClassCode), [selectedClassCode]);
  const availableCoaches = useMemo(() => selectedClassCode ? TRAIN_COMPOSITION[selectedClassCode] || [] : [], [selectedClassCode]);

  const handleClassSelect = (code) => {
    setSelectedClassCode(code);
    setSelectedCoachId(null);
    setSelectedSeats([]);
  };

  const handleCoachSelect = (id) => {
    setSelectedCoachId(id);
    setSelectedSeats([]); // reset seats when changing coach
  };

  const handleToggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
      if (focusedSeatId === seatId) setFocusedSeatId(null);
    } else {
      if (selectedSeats.length >= 6) {
        alert("Maximum 6 seats allowed per booking.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
      setFocusedSeatId(seatId);
    }
  };

  const handleViewSeat = (seatId) => {
    setFocusedSeatId(seatId);
    if (viewMode !== '3D') setViewMode('3D');
  };

  const handleCheckoutClick = () => {
    if (onCheckout && selectedSeats.length > 0) {
      onCheckout({
        seats: selectedSeats,
        coachId: selectedCoachId,
        classCode: selectedClassCode,
        fare: selectedClass.fare
      });
    }
  };

  const togglePreference = (prefId) => {
    if (preferences.includes(prefId)) setPreferences(preferences.filter(p => p !== prefId));
    else setPreferences([...preferences, prefId]);
  };

  const recommendation = useMemo(() => {
    if (preferences.length === 0 || !selectedCoachId) return null;
    
    // Get flat seats from 3D layout to easily filter available seats
    const { seats } = generate3DLayout(selectedClassCode);
    const availableSeats = seats.filter(s => getSeatAvailability(selectedCoachId, s.id) === 'available' && !selectedSeats.includes(s.id));
    
    if (availableSeats.length === 0) return null;

    let bestSeat = null;
    let highestScore = -1;

    availableSeats.forEach(seat => {
      let score = 0;
      if (preferences.includes('window') && seat.pos === 'Window') score += 2;
      if (preferences.includes('aisle') && seat.pos === 'Aisle') score += 2;
      if (preferences.includes('lower') && seat.type === 'Lower Berth') score += 3;
      if (preferences.includes('door') && (seat.id < 10 || seat.id > seats.length - 10)) score += 2;
      if (preferences.includes('quiet') && (seat.id >= 10 && seat.id <= seats.length - 10)) score += 2;
      if (preferences.includes('family')) score += 1; // Generic weight
      
      // Random variance so it doesn't always pick seat 1
      score += (seat.id % 3) * 0.1;

      if (score > highestScore) {
        highestScore = score;
        bestSeat = seat;
      }
    });

    if (highestScore > 0 && bestSeat) {
      let reasons = [];
      if (preferences.includes('lower') && bestSeat.type === 'Lower Berth') reasons.push('Lower Berth');
      if (preferences.includes('window') && bestSeat.pos === 'Window') reasons.push('Window side');
      if (preferences.includes('aisle') && bestSeat.pos === 'Aisle') reasons.push('Aisle side');
      if (preferences.includes('door') && (bestSeat.id < 10 || bestSeat.id > seats.length - 10)) reasons.push('Near door');
      if (preferences.includes('quiet') && (bestSeat.id >= 10 && bestSeat.id <= seats.length - 10)) reasons.push('Quiet zone');
      
      return {
        seatId: bestSeat.id,
        reason: reasons.length > 0 ? `Matches your preferences: ${reasons.join(', ')}.` : 'Smart recommendation based on your profile.',
        type: bestSeat.type
      };
    }
    return null;
  }, [preferences, selectedCoachId, selectedClassCode, selectedSeats]);

  const PREF_OPTIONS = [
    { id: 'window', label: 'Window', icon: <Wind className="w-4 h-4" /> },
    { id: 'aisle', label: 'Aisle', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'lower', label: 'Lower Berth', icon: <Moon className="w-4 h-4" /> },
    { id: 'door', label: 'Near Door', icon: <DoorOpen className="w-4 h-4" /> },
    { id: 'quiet', label: 'Quiet Area', icon: <VolumeX className="w-4 h-4" /> },
    { id: 'family', label: 'Family/Group', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <section id="3d-section" className="relative z-10 bg-stone-950 py-16 border-t border-stone-800">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        
        {/* STEP 0: JOURNEY TIMELINE */}
        <JourneyTimeline />

        {/* STEP 1: CLASS SELECTION */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">1. Choose Your Class</h2>
          <p className="text-stone-500 font-medium">Select a travel class for AeroExpress 104</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
          {CLASSES.map(cls => (
            <div 
              key={cls.code}
              onClick={() => handleClassSelect(cls.code)}
              className={`p-6 lg:p-8 rounded-[2rem] border transition-all duration-300 cursor-pointer relative overflow-hidden group
                ${selectedClassCode === cls.code 
                  ? 'border-rose-700/50 bg-stone-900 shadow-[0_4px_20px_rgb(225,29,72,0.15)] ring-1 ring-rose-700/20' 
                  : 'border-stone-800 bg-stone-900 hover:border-stone-700/80 hover:shadow-[0_20px_40px_rgb(0,0,0,0.5)] hover:-translate-y-1'}`}
            >
              
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold px-2.5 py-1 rounded bg-stone-950 ${selectedClassCode === cls.code ? 'text-rose-400 border border-rose-500/30' : 'text-stone-300 border border-stone-800'}`}>
                    {cls.code}
                  </span>
                  <h4 className={`font-semibold ${selectedClassCode === cls.code ? 'text-white' : 'text-stone-200'}`}>{cls.name}</h4>
                </div>
                <div className={`font-bold text-xl ${selectedClassCode === cls.code ? 'text-rose-400' : 'text-white'}`}>
                  ${cls.fare}
                </div>
              </div>
              <div className="text-sm text-stone-500 relative z-10">{cls.desc}</div>
            </div>
          ))}
        </div>

        {/* STEP 2: CLASS OVERVIEW & COACH SELECTION */}
        <AnimatePresence mode="wait">
          {selectedClass && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-white mb-6">2. {selectedClass.code} Coach Layout</h2>
              
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Layout Diagram */}
                <div className="lg:w-1/2 bg-stone-900 border border-stone-800/80 rounded-[2rem] p-8 lg:p-10 relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-stone-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wide">Standard {selectedClass.type}</h3>
                      <p className="text-stone-500 text-sm font-medium">{selectedClass.layoutDesc}</p>
                    </div>
                  </div>

                  <div className="bg-stone-950 border border-stone-800 rounded-xl p-6 font-mono text-sm text-stone-500 leading-loose">
                    {/* Simple ASCII-style preview based on class */}
                    {['3A', 'SL'].includes(selectedClass.code) && (
                      <div className="text-center">
                        <div className="flex justify-between px-8 py-2 border-b border-stone-800 mb-2">
                          <span className="text-stone-300">LOWER</span>
                          <span className="text-stone-300">MIDDLE</span>
                          <span className="text-stone-300">UPPER</span>
                        </div>
                        <div className="py-4 text-rose-400 font-bold tracking-[0.5em] bg-stone-900 rounded-lg my-2 border border-stone-800/50">AISLE</div>
                        <div className="flex justify-around px-8 py-2 border-t border-stone-800 mt-2">
                          <span className="text-stone-300">SIDE LOWER</span>
                          <span className="text-stone-300">SIDE UPPER</span>
                        </div>
                      </div>
                    )}
                    {['2A'].includes(selectedClass.code) && (
                      <div className="text-center">
                        <div className="flex justify-around px-8 py-2 border-b border-stone-800 mb-2">
                          <span className="text-stone-300">LOWER</span>
                          <span className="text-stone-300">UPPER</span>
                        </div>
                        <div className="py-4 text-rose-400 font-bold tracking-[0.5em] bg-stone-900 rounded-lg my-2 border border-stone-800/50">AISLE</div>
                        <div className="flex justify-around px-8 py-2 border-t border-stone-800 mt-2">
                          <span className="text-stone-300">SIDE LOWER</span>
                          <span className="text-stone-300">SIDE UPPER</span>
                        </div>
                      </div>
                    )}
                    {['1A'].includes(selectedClass.code) && (
                      <div className="text-center">
                        <div className="flex justify-around px-8 py-4 border-b border-stone-800 mb-2">
                          <span className="text-stone-300 bg-stone-900 px-6 py-2 rounded border border-stone-800">LOWER & UPPER (CABIN/COUPE)</span>
                        </div>
                        <div className="py-4 text-rose-400 font-bold tracking-[0.5em] bg-stone-900 rounded-lg mt-2 border border-stone-800/50">SIDE AISLE</div>
                      </div>
                    )}
                    {['CC', 'EC', '2S'].includes(selectedClass.code) && (
                      <div className="text-center flex items-center justify-between px-12">
                        <div className="flex flex-col gap-2">
                          <div className="text-stone-300 bg-stone-900 px-4 py-2 rounded border border-stone-800">WINDOW</div>
                          <div className="text-stone-300 bg-stone-900 px-4 py-2 rounded border border-stone-800">MIDDLE / AISLE</div>
                        </div>
                        <div className="py-12 px-4 text-rose-400 font-bold tracking-widest bg-stone-900 border border-stone-800/50 rounded-lg" style={{ writingMode: 'vertical-rl' }}>AISLE</div>
                        <div className="flex flex-col gap-2">
                          <div className="text-stone-300 bg-stone-900 px-4 py-2 rounded border border-stone-800">AISLE / MIDDLE</div>
                          <div className="text-stone-300 bg-stone-900 px-4 py-2 rounded border border-stone-800">WINDOW</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-4 text-center">All {selectedClass.code} coaches share this identical layout.</p>
                </div>

                {/* Coach Selection */}
                <div className="lg:w-1/2 flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-white">Select Coach</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableCoaches.map(coachId => (
                      <button
                        key={coachId}
                        onClick={() => handleCoachSelect(coachId)}
                        className={`py-4 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                          selectedCoachId === coachId 
                            ? 'bg-rose-600 text-white border-rose-700 shadow-md' 
                            : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-950 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-xl">{coachId}</span>
                        <span className="text-[10px] uppercase tracking-wider opacity-70">Coach</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 3: SEAT SELECTION (LIVE AVAILABILITY) */}
        <AnimatePresence mode="wait">
          {selectedCoachId && (
            <motion.div 
              key="seat-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-t border-stone-800 pt-16 gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">3. Select Seats in {selectedCoachId}</h2>
                  <p className="text-stone-500 font-medium">Viewing real-time availability for Coach {selectedCoachId}</p>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center bg-stone-900/50 p-1 rounded-xl shrink-0 border border-stone-800">
                  <button 
                    onClick={() => setViewMode('2D')}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === '2D' ? 'bg-stone-900 text-white shadow-xl shadow-black/20 border border-stone-800' : 'text-stone-500 hover:text-stone-200 border border-transparent'}`}
                  >
                    2D Map
                  </button>
                  <button 
                    onClick={() => setViewMode('3D')}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === '3D' ? 'bg-stone-900 text-white shadow-xl shadow-black/20 border border-stone-800' : 'text-stone-500 hover:text-stone-200 border border-transparent'}`}
                  >
                    3D View
                  </button>
                </div>
              </div>

              {/* Preferences UI */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-white">Smart Seat Recommendation</h3>
                </div>
                <div className="flex flex-wrap gap-3 mb-6">
                  {PREF_OPTIONS.map(pref => (
                    <button
                      key={pref.id}
                      onClick={() => togglePreference(pref.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        preferences.includes(pref.id)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-950'
                      }`}
                    >
                      {pref.icon} {pref.label}
                    </button>
                  ))}
                </div>

                {recommendation && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-stone-900 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between shadow-xl shadow-black/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-950 rounded-lg flex items-center justify-center font-black text-xl text-emerald-400 border border-emerald-500/30">
                        {recommendation.seatId}
                      </div>
                      <div>
                        <div className="font-bold text-emerald-400">Recommended for you: {recommendation.type}</div>
                        <div className="text-stone-500 text-sm">{recommendation.reason}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleToggleSeat(recommendation.seatId)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                    >
                      Select Seat
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col xl:flex-row gap-8 pb-32 xl:pb-0">
                {/* Map Area */}
                <div className="xl:w-3/4 bg-stone-900 border border-stone-800/80 rounded-[2rem] overflow-hidden relative h-[65vh] xl:min-h-[600px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                  {viewMode === '2D' ? (
                    <SeatMap2D 
                      classCode={selectedClassCode} 
                      coachId={selectedCoachId}
                      selectedSeats={selectedSeats}
                      recommendedSeatId={recommendation?.seatId}
                      onToggleSeat={handleToggleSeat}
                    />
                  ) : (
                    <CoachViewer3D 
                      classCode={selectedClassCode}
                      coachId={selectedCoachId}
                      selectedSeats={selectedSeats}
                      recommendedSeatId={recommendation?.seatId}
                      focusedSeatId={focusedSeatId}
                      price={selectedClass.fare}
                      onToggleSeat={handleToggleSeat}
                    />
                  )}
                </div>

                {/* Booking Summary - Desktop Sidebar & Mobile Bottom Sheet */}
                <div className={`fixed bottom-0 left-0 right-0 z-50 xl:relative xl:z-auto bg-stone-900 border-t border-stone-800 xl:bg-transparent xl:border-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] xl:shadow-none transition-transform duration-300 ${isMobileSummaryOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'} xl:translate-y-0 xl:w-1/4 flex flex-col gap-6 rounded-t-3xl xl:rounded-none`}>
                  
                  {/* Mobile Drag Handle / Toggle */}
                  <div 
                    className="xl:hidden w-full flex flex-col items-center justify-center pt-3 pb-1 cursor-pointer"
                    onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
                  >
                    <div className="w-12 h-1.5 bg-stone-700 rounded-full mb-3"></div>
                    {!isMobileSummaryOpen && (
                      <div className="flex justify-between items-center w-full px-6 pb-2">
                        <div className="font-bold text-white">{selectedSeats.length} Seats</div>
                        <div className="font-black text-rose-400">${selectedSeats.length * (selectedClass.fare + 15)}</div>
                      </div>
                    )}
                  </div>

                  <div className={`bg-stone-900 border border-stone-800/80 xl:rounded-[2rem] p-6 lg:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] xl:sticky xl:top-6 ${!isMobileSummaryOpen ? 'hidden xl:block' : 'block overflow-y-auto max-h-[70vh] xl:max-h-none'}`}>
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                      Booking Summary
                      <span className="bg-stone-900/50 text-stone-300 border border-stone-800 text-xs px-2 py-1 rounded-md">{selectedSeats.length} Seats</span>
                    </h3>
                    
                    {selectedSeats.length === 0 ? (
                      <div className="text-center py-10 flex flex-col justify-center border border-dashed border-stone-800 rounded-xl bg-stone-950">
                        <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800/50 flex items-center justify-center mx-auto mb-4">
                          <Armchair className="w-6 h-6 text-stone-500" />
                        </div>
                        <p className="text-stone-500 font-medium text-sm px-4">Select seats from the map to proceed.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full">
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar pr-2 space-y-3 mb-6">
                          {selectedSeats.map(id => (
                            <div key={id} className="flex flex-col gap-2 bg-stone-900 border border-stone-800 p-3 rounded-xl shadow-xl shadow-black/20 group">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-rose-600 flex items-center justify-center font-black text-white shadow-xl shadow-black/20">{id}</div>
                                  <div className="text-left">
                                    <div className="text-white font-bold text-xs uppercase tracking-wider">Seat {id}</div>
                                    <div className="text-stone-500 text-[10px] uppercase">Coach {selectedCoachId}</div>
                                  </div>
                                </div>
                                <div className="text-rose-500 font-medium text-xs bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded">Selected</div>
                              </div>
                              <button 
                                onClick={() => {
                                  handleViewSeat(id);
                                  if (window.innerWidth < 1280) setIsMobileSummaryOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 mt-1 bg-stone-950 hover:bg-stone-900/50 border border-stone-800 hover:border-stone-700 text-stone-200 rounded text-xs font-bold transition-all"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-500" /> View My Seat in 3D
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-stone-800 pt-6 mt-auto">
                          <div className="flex justify-between text-stone-500 font-medium text-sm mb-3">
                            <span>Base Fare ({selectedSeats.length}x)</span>
                            <span className="text-white font-bold">${selectedSeats.length * selectedClass.fare}</span>
                          </div>
                          <div className="flex justify-between text-stone-500 font-medium text-sm mb-5">
                            <span>Taxes & Fees</span>
                            <span className="text-white font-bold">${selectedSeats.length * 15}</span>
                          </div>
                          <div className="flex justify-between items-center bg-stone-950 p-4 rounded-xl border border-stone-800 mb-6">
                            <span className="text-stone-500 font-bold uppercase tracking-wider text-xs">Total</span>
                            <span className="text-2xl font-black text-rose-400">${selectedSeats.length * (selectedClass.fare + 15)}</span>
                          </div>

                          <button 
                            onClick={handleCheckoutClick}
                            className="w-full bg-rose-700 hover:bg-rose-800 text-white rounded-2xl py-4 font-bold text-lg tracking-wide transition-all shadow-[0_8px_30px_rgba(225,29,72,0.2)] hover:shadow-[0_8px_30px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2"
                          >
                            Checkout <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

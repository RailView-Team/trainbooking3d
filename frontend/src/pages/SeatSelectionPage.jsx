import React, { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Eye, EyeOff } from 'lucide-react';
import SeatMap2D from '../components/SeatMap2D';
import CoachViewer3D from '../components/CoachViewer3D';
import { CLASSES } from '../coachData';

export default function SeatSelectionPage() {
  const { trainId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const classCode = searchParams.get('class');
  const coachId = searchParams.get('coach');
  const fromCode = searchParams.get('from');
  const toCode = searchParams.get('to');
  const date = searchParams.get('date');
  const passengersCount = parseInt(searchParams.get('passengers') || '1', 10);
  
  const selectedClassInfo = CLASSES.find(c => c.code === classCode);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [viewMode, setViewMode] = useState('2d');

  // Use mock logic if no params provided
  if (!classCode || !coachId) {
    return (
      <div className="pt-32 pb-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Missing selection</h2>
        <Link to={`/trains/${trainId}${location.search}`} className="text-rose-600 font-bold hover:underline">Start over from Details</Link>
      </div>
    );
  }

  const handleToggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length > 0) {
      searchParams.set('seats', selectedSeats.join(','));
      navigate(`/booking/passengers?${searchParams.toString()}`);
    }
  };

  const farePerSeat = selectedClassInfo?.fare || 0;
  const totalFare = farePerSeat * selectedSeats.length;

  return (
    <div className="pt-28 pb-24 min-h-[70vh] bg-stone-50">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <Link 
          to={`/trains/${trainId}/coach${location.search}`} 
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-6 inline-flex"
        >
          <ChevronLeft className="w-5 h-5" /> Change Coach
        </Link>
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900 mb-2">Select Seats</h2>
            <p className="text-stone-500 font-medium">
              Click to preview. Double-click to select or deselect.
            </p>
          </div>
          <div className="flex bg-stone-200/80 p-1.5 rounded-xl">
            <button 
              onClick={() => setViewMode('2d')}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${viewMode === '2d' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              2D MAP
            </button>
            <button 
              onClick={() => setViewMode('3d')}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${viewMode === '3d' ? 'bg-rose-700 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              3D VIEW
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Seat Map Area */}
          <div className="lg:w-3/4 flex flex-col h-[600px] rounded-3xl overflow-hidden border border-stone-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white relative">
            {viewMode === '2d' ? (
              <SeatMap2D 
                classCode={classCode}
                coachId={coachId}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
              />
            ) : (
              <CoachViewer3D 
                classCode={classCode}
                coachId={coachId}
                selectedSeats={selectedSeats}
                price={farePerSeat}
                onToggleSeat={handleToggleSeat}
              />
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:w-1/4 flex flex-col gap-6">
            <div className="bg-white border border-stone-200/60 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] sticky top-32">
              <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center justify-between">
                Booking Summary
              </h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between border-b border-stone-100 pb-3">
                  <span className="text-stone-500">Train</span>
                  <span className="font-bold text-stone-900">{trainId}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-3">
                  <span className="text-stone-500">Journey</span>
                  <span className="font-bold text-stone-900">{fromCode} → {toCode}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-3">
                  <span className="text-stone-500">Date</span>
                  <span className="font-bold text-stone-900">{date}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-3">
                  <span className="text-stone-500">Class</span>
                  <span className="font-bold text-stone-900">{classCode} ({selectedClassInfo?.name})</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-3">
                  <span className="text-stone-500">Coach</span>
                  <span className="font-bold text-stone-900">{coachId}</span>
                </div>
                <div className="flex justify-between pb-3">
                  <span className="text-stone-500">Seats</span>
                  <span className="font-bold text-rose-700 flex flex-col items-end gap-1">
                    <span>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
                    <span className="text-xs text-stone-400">({selectedSeats.length} seats selected)</span>
                  </span>
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Base Fare ({selectedSeats.length}x)</span>
                    <span className="font-bold text-stone-900">${totalFare}</span>
                  </div>
                </div>
              )}

              <button 
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className={`w-full rounded-xl py-4 font-bold text-lg tracking-wide transition-all flex items-center justify-center gap-2
                  ${selectedSeats.length > 0 
                    ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-[0_4px_15px_rgba(225,29,72,0.2)] hover:shadow-[0_8px_25px_rgba(225,29,72,0.3)] hover:-translate-y-0.5' 
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

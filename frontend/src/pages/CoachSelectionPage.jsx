import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrainFront } from 'lucide-react';
import { CLASSES } from '../coachData';
import { getAvailability } from '../service/api';

export default function CoachSelectionPage() {
  const { trainId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const classCode = searchParams.get('class');
  const fromCode = searchParams.get('from');
  const toCode = searchParams.get('to');
  const date = searchParams.get('date');

  const selectedClassInfo = CLASSES.find(c => c.code === classCode);

  const [availabilityData, setAvailabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCoach, setSelectedCoach] = useState(null);

  // Fetch availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!trainId || !classCode || !fromCode || !toCode || !date) {
        setLoading(false);
        setError('Missing required journey details');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await getAvailability({
          trainId: parseInt(trainId),
          from: fromCode,
          to: toCode,
          date: date
        });
        setAvailabilityData(data);

        // Auto-select first available coach of the selected class
        const coachesForClass = data.coaches.filter(c => c.classType === classCode);
        if (coachesForClass.length > 0) {
          setSelectedCoach(coachesForClass[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch availability:', err);
        setError('Unable to load coach availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [trainId, classCode, fromCode, toCode, date]);

  // Use mock logic if no class provided
  if (!selectedClassInfo) {
    return (
      <div className="pt-32 pb-24 text-center">
        <h2 className="text-2xl font-bold mb-4">No class selected</h2>
        <Link to={`/trains/${trainId}/class${location.search}`} className="text-rose-600 font-bold hover:underline">Go back to Class Selection</Link>
      </div>
    );
  }

  // Get coaches for this class from availability data
  const getCoachesForClass = () => {
    if (!availabilityData || !availabilityData.coaches) return [];

    return availabilityData.coaches
      .filter(coach => coach.classType === classCode)
      .map(coach => ({
        id: coach.coachId,
        number: coach.coachNumber,
        type: coach.classType,
        seats: coach.seats,
        availableCount: coach.seats.filter(s => s.available).length
      }))
      .sort((a, b) => a.number.localeCompare(b.number));
  };

  const availableCoaches = getCoachesForClass();

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] bg-stone-50">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl text-center">
          <p className="text-stone-600 font-medium">Loading available coaches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] bg-stone-50">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl text-center">
          <p className="text-rose-600 font-bold mb-4">{error}</p>
          <Link to="/" className="text-rose-700 hover:underline">Return to Search</Link>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    if (selectedCoach) {
      searchParams.set('coach', selectedCoach);
      navigate(`/trains/${trainId}/seats?${searchParams.toString()}`);
    }
  };

  const currentCoach = availableCoaches.find(c => c.id === selectedCoach);

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
            <p className="text-stone-500 font-medium">Train: {trainId} • Class: <span className="text-stone-900 font-bold">{selectedClassInfo.name}</span></p>
          </div>
          {availableCoaches.length > 0 && (
            <div className="bg-white border border-stone-200 px-4 py-2 rounded-xl text-sm font-bold text-stone-700 shadow-sm inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {availableCoaches.length} {availableCoaches.length === 1 ? 'Coach' : 'Coaches'} Available
            </div>
          )}
        </div>

        {/* Coach List */}
        <div className="bg-white border border-stone-200/60 rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-8">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Available Coaches</h4>

          {availableCoaches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500 font-medium">No coaches available for this class.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableCoaches.map((coach) => {
                const isSelected = selectedCoach === coach.id;

                return (
                  <div
                    key={coach.id}
                    onClick={() => setSelectedCoach(coach.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center
                      ${isSelected
                        ? 'border-rose-700 bg-rose-50 shadow-[0_4px_15px_rgba(225,29,72,0.3)]'
                        : 'border-stone-200 bg-white hover:border-rose-300 hover:bg-stone-50'
                      }`}
                  >
                    <div className="text-lg font-black text-stone-900 mb-1">{coach.number}</div>
                    <div className={`text-xs font-semibold ${isSelected ? 'text-rose-700' : 'text-stone-500'}`}>
                      {coach.availableCount} seats
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Coach Details */}
        {currentCoach && (
          <div className="bg-white border border-stone-200/60 rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col lg:flex-row gap-8 justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                <TrainFront className="w-10 h-10 text-rose-700" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-stone-900 mb-1">Coach {currentCoach.number}</h3>
                <p className="text-stone-500 font-medium">{selectedClassInfo.name} • {currentCoach.availableCount} seats available</p>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col items-end gap-4">
              <button
                onClick={handleContinue}
                disabled={!selectedCoach}
                className="w-full lg:w-auto bg-rose-700 hover:bg-rose-800 disabled:bg-stone-300 text-white rounded-xl px-10 py-4 font-bold text-lg tracking-wide transition-all shadow-[0_4px_15px_rgba(225,29,72,0.2)] hover:shadow-[0_8px_25px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
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

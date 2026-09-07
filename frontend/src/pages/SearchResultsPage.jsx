import React from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, MapPin, Calendar, Users, Search } from 'lucide-react';
import TrainResults from '../components/TrainResults';
import { MOCK_STATIONS } from '../components/BookingForm';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fromCode = searchParams.get('from');
  const toCode = searchParams.get('to');
  const date = searchParams.get('date');
  const passengers = searchParams.get('passengers') || '1';
  const travelClass = searchParams.get('class') || 'Economy';

  const fromStation = MOCK_STATIONS.find(s => s.code === fromCode);
  const toStation = MOCK_STATIONS.find(s => s.code === toCode);

  // If no valid search params, show empty state
  if (!fromCode || !toCode) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-stone-400" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-3">No Search Criteria</h2>
        <p className="text-stone-500 font-medium mb-8 max-w-md text-center">
          Please search for trains from the homepage to see available results.
        </p>
        <Link
          to="/"
          className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl px-8 py-3.5 font-bold transition-all shadow-lg"
        >
          Go to Search
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const fromLabel = fromStation ? `${fromStation.city} (${fromStation.code})` : fromCode;
  const toLabel = toStation ? `${toStation.city} (${toStation.code})` : toCode;

  const handleSelectTrain = (trainId) => {
    navigate(`/trains/${trainId}${location.search}`);
  };

  return (
    <div className="pt-28 pb-8">
      {/* Journey Header */}
      <div className="container mx-auto px-6 md:px-12 max-w-5xl mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-6"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Search
        </button>

        <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-700" />
                <span className="font-bold text-stone-900 text-lg">{fromLabel}</span>
              </div>
              <div className="text-stone-400 font-bold">→</div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-700" />
                <span className="font-bold text-stone-900 text-lg">{toLabel}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {date && (
                <div className="flex items-center gap-1.5 bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium text-stone-700">
                  <Calendar className="w-4 h-4 text-rose-700" />
                  {formatDate(date)}
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium text-stone-700">
                <Users className="w-4 h-4 text-rose-700" />
                {passengers} {parseInt(passengers) === 1 ? 'Traveler' : 'Travelers'} • {travelClass}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Train Results */}
      <TrainResults
        fromLabel={fromLabel}
        toLabel={toLabel}
        onSelectTrain={handleSelectTrain}
      />
    </div>
  );
}

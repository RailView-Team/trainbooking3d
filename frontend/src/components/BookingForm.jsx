import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, ArrowRightLeft, Clock, TrendingUp, Check, Loader2, Calendar, Users, ChevronDown } from 'lucide-react';

export const MOCK_STATIONS = [
  { code: 'KOL', city: 'Kolkata', name: 'Sealdh Station' },
  { code: 'BOM', city: 'Mumbai', name: 'Central Station' },
  { code: 'DEL', city: 'Delhi', name: 'New Delhi Station' },
  { code: 'BAN', city: 'Bangalore', name: 'Banglore Station' },
  { code: 'HYD', city: 'Hyderabad', name: 'King Koil Station' },
  { code: 'CHE', city: 'Chennai', name: 'Madras Station' },
];

const RECENT_ROUTES = [
  { from: 'KOL', to: 'BOM', fromCity: 'Kolkata', toCity: 'Mumbai' },
];

const POPULAR_ROUTES = [
  { from: 'KOL', to: 'DEL', fromCity: 'Kolkata', toCity: 'Delhi' },
  { from: 'DEL', to: 'BOM', fromCity: 'Delhi', toCity: 'Mumbai' },
];

export default function BookingForm() {
  const navigate = useNavigate();
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = () => {
    setError('');
    if (!from || !to) {
      setError('Please select both origin and destination.');
      return;
    }
    if (from.code === to.code) {
      setError('Origin and destination cannot be the same.');
      return;
    }
    if (!date) {
      setError('Please select a travel date.');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const params = new URLSearchParams({
        from: from.code,
        to: to.code,
        date: date,
        passengers: passengers.toString(),
        class: travelClass,
      });
      navigate(`/trains?${params.toString()}`);
    }, 600);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Select Date';
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateObj = new Date(dateStr + 'T00:00:00');
    dateObj.setHours(0, 0, 0, 0);
    if (dateObj.getTime() === today.getTime()) return 'Today';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const filteredStations = MOCK_STATIONS.filter(s => 
    s.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-stone-200 rounded-[2rem] p-4 lg:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] relative" ref={dropdownRef}>
      
      {error && (
        <div className="absolute -top-12 left-0 right-0 bg-rose-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center justify-center shadow-md animate-in slide-in-from-bottom-2 fade-in">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3">
        
        {/* Destinations Group */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
          
          {/* FROM */}
          <div 
            className={`bg-stone-50 rounded-2xl p-4 lg:p-5 border transition-all cursor-text group ${activeDropdown === 'from' ? 'border-rose-700 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-100/50'}`}
            onClick={() => { setActiveDropdown('from'); setSearchQuery(''); }}
          >
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1 block">From</span>
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 transition-opacity ${activeDropdown === 'from' || from ? 'text-rose-700 opacity-100' : 'text-stone-400 group-hover:opacity-100'}`} />
              {activeDropdown === 'from' ? (
                <input 
                  autoFocus
                  type="text" 
                  placeholder="City or Station Code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-stone-900 w-full outline-none placeholder:text-stone-400 font-semibold text-lg" 
                />
              ) : (
                <div className="text-stone-900 w-full font-semibold text-lg truncate">
                  {from ? from.city : <span className="text-stone-400">Departure City</span>}
                </div>
              )}
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div 
            onClick={handleSwap}
            className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border border-stone-200 items-center justify-center z-10 text-stone-500 cursor-pointer hover:bg-stone-100 hover:text-stone-900 hover:border-stone-300 transition-all shadow-sm active:scale-95"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </div>

          {/* TO */}
          <div 
            className={`bg-stone-50 rounded-2xl p-4 lg:p-5 border transition-all cursor-text group ${activeDropdown === 'to' ? 'border-rose-700 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-100/50'}`}
            onClick={() => { setActiveDropdown('to'); setSearchQuery(''); }}
          >
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1 block">To</span>
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 transition-opacity ${activeDropdown === 'to' || to ? 'text-rose-700 opacity-100' : 'text-stone-400 group-hover:opacity-100'}`} />
              {activeDropdown === 'to' ? (
                <input 
                  autoFocus
                  type="text" 
                  placeholder="City or Station Code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-stone-900 w-full outline-none placeholder:text-stone-400 font-semibold text-lg" 
                />
              ) : (
                <div className="text-stone-900 w-full font-semibold text-lg truncate">
                  {to ? to.city : <span className="text-stone-400">Destination City</span>}
                </div>
              )}
            </div>
          </div>

          {/* STATION DROPDOWN */}
          {(activeDropdown === 'from' || activeDropdown === 'to') && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:w-[205%] lg:w-full bg-white border border-stone-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-50 overflow-hidden flex flex-col max-h-[350px]">
              {searchQuery ? (
                <div className="overflow-y-auto py-2 custom-scrollbar">
                  {filteredStations.length > 0 ? filteredStations.map(s => (
                    <div 
                      key={s.code} 
                      className="px-4 py-3 hover:bg-stone-50 cursor-pointer flex items-center justify-between transition-colors"
                      onClick={() => {
                        activeDropdown === 'from' ? setFrom(s) : setTo(s);
                        setActiveDropdown(null);
                      }}
                    >
                      <div>
                        <div className="text-stone-900 font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-stone-400" />
                          {s.city}
                        </div>
                        <div className="text-xs text-stone-500 ml-6">{s.name}</div>
                      </div>
                      <div className="text-xs font-bold text-stone-500 bg-stone-100 border border-stone-200 px-2 py-1 rounded">{s.code}</div>
                    </div>
                  )) : (
                    <div className="px-4 py-8 text-center text-stone-500 text-sm font-medium">No stations found for "{searchQuery}"</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
                  <div className="flex-1 p-5 bg-stone-50/50">
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-stone-400"/> Recent Searches</div>
                    <div className="space-y-1">
                      {RECENT_ROUTES.map((route, i) => (
                        <div key={i} className="flex items-center gap-3 py-2.5 hover:bg-white -mx-2 px-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-stone-200 hover:shadow-sm group"
                          onClick={() => {
                            setFrom(MOCK_STATIONS.find(s => s.code === route.from));
                            setTo(MOCK_STATIONS.find(s => s.code === route.to));
                            setActiveDropdown(null);
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center"><ArrowRightLeft className="w-3.5 h-3.5 text-stone-400" /></div>
                          <div>
                            <div className="text-sm font-medium text-stone-900">{route.fromCity} <span className="text-stone-400 mx-1">→</span> {route.toCity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 p-5 bg-stone-50/50">
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-stone-400"/> Popular Routes</div>
                    <div className="space-y-1">
                      {POPULAR_ROUTES.map((route, i) => (
                        <div key={i} className="flex items-center gap-3 py-2.5 hover:bg-white -mx-2 px-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-stone-200 hover:shadow-sm group"
                          onClick={() => {
                            setFrom(MOCK_STATIONS.find(s => s.code === route.from));
                            setTo(MOCK_STATIONS.find(s => s.code === route.to));
                            setActiveDropdown(null);
                          }}
                        >
                          <div className="text-sm font-medium text-stone-900 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                            {route.fromCity} <span className="text-stone-400 mx-1">→</span> {route.toCity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 relative">
          {/* Date Picker */}
          <div 
            className="bg-stone-50 rounded-2xl p-4 lg:p-5 border border-stone-200 hover:border-stone-300 hover:bg-stone-100/50 transition-colors cursor-pointer group flex-1 sm:min-w-[140px] relative"
          >
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1 block">Date</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-700 opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="text-stone-900 font-semibold text-lg">{formatDateDisplay(date)}</span>
              <ChevronDown className="w-4 h-4 text-stone-400 ml-auto" />
            </div>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          {/* Passenger & Class */}
          <div 
            className={`bg-stone-50 rounded-2xl p-4 lg:p-5 border transition-all cursor-pointer group flex-1 sm:min-w-[170px] relative ${activeDropdown === 'passengers' ? 'border-rose-700 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-100/50'}`}
            onClick={() => setActiveDropdown(activeDropdown === 'passengers' ? null : 'passengers')}
          >
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1 block">Travelers</span>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-700 opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col">
                <span className="text-stone-900 font-semibold text-base leading-tight">{passengers} {passengers === 1 ? 'Adult' : 'Adults'}</span>
                <span className="text-[11px] text-stone-500 font-medium">{travelClass}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 ml-auto transition-transform duration-300 ${activeDropdown === 'passengers' ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown content */}
            {activeDropdown === 'passengers' && (
              <div 
                className="absolute top-[calc(100%+8px)] right-0 w-[280px] bg-white border border-stone-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-50 p-5 cursor-default"
                onClick={e => e.stopPropagation()}
              >
                <div className="mb-6">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Passengers</div>
                  <div className="flex items-center justify-between bg-stone-50 p-2 rounded-xl border border-stone-200">
                    <button 
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-10 h-10 rounded-lg bg-white border border-stone-200 text-stone-900 flex items-center justify-center hover:bg-stone-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={passengers <= 1}
                    >-</button>
                    <span className="text-xl font-bold text-stone-900">{passengers}</span>
                    <button 
                      onClick={() => setPassengers(Math.min(9, passengers + 1))}
                      className="w-10 h-10 rounded-lg bg-white border border-stone-200 text-stone-900 flex items-center justify-center hover:bg-stone-100 transition-colors"
                    >+</button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Travel Class</div>
                  <div className="flex flex-col gap-2">
                    {['Economy', 'Premium', 'First Class'].map(c => (
                      <div 
                        key={c}
                        onClick={() => {
                          setTravelClass(c);
                          setActiveDropdown(null);
                        }}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-between transition-all ${travelClass === c ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'}`}
                      >
                        {c}
                        {travelClass === c && <Check className="w-4 h-4" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-rose-700 hover:bg-rose-800 text-white rounded-2xl px-8 flex items-center justify-center gap-3 font-semibold text-lg tracking-wide transition-all shadow-[0_8px_30px_rgba(225,29,72,0.2)] hover:shadow-[0_8px_30px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 active:translate-y-0 mt-2 lg:mt-0 disabled:opacity-70 disabled:hover:translate-y-0 min-w-[160px]"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span className="lg:hidden xl:inline">Search</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}

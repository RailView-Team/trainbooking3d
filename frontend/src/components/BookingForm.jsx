import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, ArrowRightLeft, Calendar, Users, ChevronDown, Check, Loader2, ArrowRight } from 'lucide-react';
import { getStations } from '../service/api';

export const POPULAR_STATIONS = [
  { code: 'HWH', city: 'Kolkata', name: 'Howrah Junction' },
  { code: 'NDLS', city: 'New Delhi', name: 'New Delhi' },
  { code: 'MMCT', city: 'Mumbai', name: 'Mumbai Central' },
  { code: 'BSB', city: 'Varanasi', name: 'Varanasi Junction' },
  { code: 'RNC', city: 'Ranchi', name: 'Ranchi Junction' },
  { code: 'ADI', city: 'Ahmedabad', name: 'Ahmedabad Junction' },
  { code: 'MAS', city: 'Chennai', name: 'Chennai Central' },
  { code: 'SBC', city: 'Bengaluru', name: 'KSR Bengaluru City' },
  { code: 'HYB', city: 'Hyderabad', name: 'Hyderabad Deccan' },
  { code: 'SDAH', city: 'Kolkata', name: 'Sealdah' },
];

export const MOCK_STATIONS = POPULAR_STATIONS;

const getLocalDate = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60 * 1000).toISOString().split('T')[0];
};

export default function BookingForm() {
  const navigate = useNavigate();
  const [from, setFrom] = useState(POPULAR_STATIONS[0]); // Default Howrah
  const [to, setTo] = useState(POPULAR_STATIONS[1]);     // Default New Delhi
  const [date, setDate] = useState(() => getLocalDate());
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState('All Classes');
  
  const [stations, setStations] = useState(POPULAR_STATIONS);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const dropdownRef = useRef(null);
  const dateInputRef = useRef(null);

  const handleDateClick = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch {
        dateInputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const loadStations = async () => {
      try {
        setStationsLoading(true);
        const data = await getStations();
        if (Array.isArray(data) && data.length > 0) {
          setStations(data);
        }
      } catch (err) {
        console.warn('Using fallback stations list:', err.message);
      } finally {
        setStationsLoading(false);
      }
    };
    loadStations();
  }, []);

  const handleSwap = (e) => {
    e.stopPropagation();
    setFrom(to);
    setTo(from);
  };

  const handleSearch = () => {
    setError('');
    if (!from || !to) {
      setError('Please select both departure and destination stations.');
      return;
    }
    if (from.code === to.code) {
      setError('Departure and destination stations cannot be the same.');
      return;
    }
    if (!date) {
      setError('Please choose a valid travel date.');
      return;
    }

    setIsLoading(true);
    const params = new URLSearchParams({
      from: from.code,
      to: to.code,
      date,
      passengers: passengers.toString(),
      class: travelClass,
    });

    navigate(`/trains?${params.toString()}`);
  };

  const getDateInfo = (dateStr) => {
    if (!dateStr) return { title: 'Select Date', subtitle: 'Choose journey date' };

    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    dateObj.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    let relative = '';
    if (dateObj.getTime() === today.getTime()) {
      relative = 'Today';
    } else if (dateObj.getTime() === tomorrow.getTime()) {
      relative = 'Tomorrow';
    }

    const subtitle = relative ? `${relative} · ${weekday}` : weekday;

    return {
      title: formattedDate,
      subtitle,
    };
  };

  const dateInfo = getDateInfo(date);

  const filteredStations = stations.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={dropdownRef}
      className="bg-white border border-stone-200/80 rounded-[2rem] p-5 lg:p-7 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.08)] relative"
    >
      {error && (
        <div className="absolute -top-12 left-0 right-0 bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center shadow-md animate-in fade-in">
          {error}
        </div>
      )}

      <div className="space-y-4">
        
        {/* Row 1: Departure & Destination with Center Swap Button */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          
          {/* FROM */}
          <div
            className={`bg-[#f8faff] rounded-2xl p-4 lg:p-5 border transition-all cursor-pointer relative group
              ${activeDropdown === 'from' ? 'border-[#2563eb] bg-white shadow-md' : 'border-stone-200 hover:border-blue-300'}`}
            onClick={() => { setActiveDropdown('from'); setSearchQuery(''); }}
          >
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
              From
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <MapPin className="w-5 h-5 text-[#2563eb] flex-shrink-0" />
                {activeDropdown === 'from' ? (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search city or code…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-stone-900 w-full outline-none font-bold text-lg"
                  />
                ) : (
                  <div>
                    <div className="text-stone-900 font-extrabold text-base lg:text-lg leading-tight truncate">
                      {from ? from.name : 'Departure City'}
                    </div>
                    <div className="text-xs font-semibold text-stone-400 mt-0.5">
                      {from ? `${from.code} · ${from.city || ''}` : 'Enter city or station name'}
                    </div>
                  </div>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0 ml-2" />
            </div>

            {/* Dropdown for FROM */}
            {activeDropdown === 'from' && (
              <div
                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-stone-200/90 rounded-2xl shadow-2xl z-[60] p-2 max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
              >
                {stationsLoading ? (
                  <div className="p-4 text-center text-xs font-semibold text-stone-400">Loading stations…</div>
                ) : filteredStations.length > 0 ? (
                  filteredStations.map((s) => (
                    <div
                      key={s.code}
                      onClick={() => { setFrom(s); setActiveDropdown(null); }}
                      className="p-3 hover:bg-blue-50/60 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#2563eb]" />
                        <div>
                          <div className="text-sm font-bold text-stone-900">{s.name}</div>
                          <div className="text-xs text-stone-400">{s.city}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {s.code}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-semibold text-stone-400">No stations found</div>
                )}
              </div>
            )}
          </div>

          {/* SWAP BUTTON (Floats in center between From & To) */}
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap origin and destination"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-stone-200 shadow-sm hover:shadow-md hover:bg-blue-50 text-[#2563eb] flex items-center justify-center transition-all z-10 active:scale-95 hidden md:flex"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#2563eb]" />
          </button>

          {/* TO */}
          <div
            className={`bg-[#f8faff] rounded-2xl p-4 lg:p-5 border transition-all cursor-pointer relative group
              ${activeDropdown === 'to' ? 'border-[#2563eb] bg-white shadow-md' : 'border-stone-200 hover:border-blue-300'}`}
            onClick={() => { setActiveDropdown('to'); setSearchQuery(''); }}
          >
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
              To
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <MapPin className="w-5 h-5 text-[#2563eb] flex-shrink-0" />
                {activeDropdown === 'to' ? (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search city or code…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-stone-900 w-full outline-none font-bold text-lg"
                  />
                ) : (
                  <div>
                    <div className="text-stone-900 font-extrabold text-base lg:text-lg leading-tight truncate">
                      {to ? to.name : 'Destination City'}
                    </div>
                    <div className="text-xs font-semibold text-stone-400 mt-0.5">
                      {to ? `${to.code} · ${to.city || ''}` : 'Enter city or station name'}
                    </div>
                  </div>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0 ml-2" />
            </div>

            {/* Dropdown for TO */}
            {activeDropdown === 'to' && (
              <div
                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-stone-200/90 rounded-2xl shadow-2xl z-[60] p-2 max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
              >
                {stationsLoading ? (
                  <div className="p-4 text-center text-xs font-semibold text-stone-400">Loading stations…</div>
                ) : filteredStations.length > 0 ? (
                  filteredStations.map((s) => (
                    <div
                      key={s.code}
                      onClick={() => { setTo(s); setActiveDropdown(null); }}
                      className="p-3 hover:bg-blue-50/60 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#2563eb]" />
                        <div>
                          <div className="text-sm font-bold text-stone-900">{s.name}</div>
                          <div className="text-xs text-stone-400">{s.city}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {s.code}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-semibold text-stone-400">No stations found</div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Row 2: Date + Travelers + Search Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
          
          {/* Date Picker */}
          <div
            onClick={handleDateClick}
            className="lg:col-span-4 bg-[#f8faff] rounded-2xl p-4 border border-stone-200 hover:border-blue-300 transition-all cursor-pointer relative group"
          >
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
              Date
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#2563eb] flex-shrink-0" />
                <div>
                  <span className="text-stone-900 font-extrabold text-base lg:text-lg block leading-none">
                    {dateInfo.title}
                  </span>
                  <span className="text-xs font-semibold text-stone-400 mt-1 block">
                    {dateInfo.subtitle}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              min={getLocalDate()}
              onChange={(e) => setDate(e.target.value)}
              onClick={(e) => {
                try {
                  e.target.showPicker();
                } catch {}
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          {/* Passengers & Class */}
          <div
            className={`lg:col-span-4 bg-[#f8faff] rounded-2xl p-4 border transition-all cursor-pointer relative group
              ${activeDropdown === 'travelers' ? 'border-[#2563eb] bg-white shadow-md' : 'border-stone-200 hover:border-blue-300'}`}
            onClick={() => setActiveDropdown(activeDropdown === 'travelers' ? null : 'travelers')}
          >
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
              Travelers
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#2563eb]" />
                <div>
                  <span className="text-stone-900 font-extrabold text-base lg:text-lg block leading-none">
                    {passengers} {passengers === 1 ? 'Adult' : 'Adults'}
                  </span>
                  <span className="text-xs font-semibold text-stone-400 mt-1 block">
                    {travelClass}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${activeDropdown === 'travelers' ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown for Travelers */}
            {activeDropdown === 'travelers' && (
              <div
                className="absolute top-[calc(100%+8px)] left-0 right-0 sm:left-auto sm:right-0 sm:w-[290px] bg-white border border-stone-200/90 rounded-2xl shadow-2xl z-[60] p-5 cursor-default animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
              >
                <div className="mb-5">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2">Number of Passengers</span>
                  <div className="flex items-center justify-between bg-stone-50 p-2 rounded-xl border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      disabled={passengers <= 1}
                      className="w-9 h-9 rounded-lg bg-white border border-stone-200 text-stone-800 font-bold flex items-center justify-center hover:bg-stone-100 disabled:opacity-40"
                    >-</button>
                    <span className="font-extrabold text-lg text-stone-900">{passengers}</span>
                    <button
                      type="button"
                      onClick={() => setPassengers(Math.min(6, passengers + 1))}
                      disabled={passengers >= 6}
                      className="w-9 h-9 rounded-lg bg-white border border-stone-200 text-stone-800 font-bold flex items-center justify-center hover:bg-stone-100 disabled:opacity-40"
                    >+</button>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2">Travel Class</span>
                  <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                    {[
                      'All Classes',
                      'Sleeper (SL)',
                      'AC 3 Tier (3A)',
                      'AC 2 Tier (2A)',
                      'First AC (1A)',
                      'AC Chair Car (CC)',
                      'Executive Chair (EC)',
                    ].map(c => (
                      <div
                        key={c}
                        onClick={() => { setTravelClass(c); setActiveDropdown(null); }}
                        className={`p-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-between transition-colors
                          ${travelClass === c ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-stone-50 text-stone-700'}`}
                      >
                        {c}
                        {travelClass === c && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="lg:col-span-4">
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-2xl py-4 px-6 font-extrabold text-base shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Search Trains</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

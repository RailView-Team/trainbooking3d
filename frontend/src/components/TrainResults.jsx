import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Users, Wifi, Coffee, Filter, ArrowUpDown, ChevronDown, ChevronUp, BatteryCharging, Wind, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const MOCK_TRAINS = [
  {
    id: 'TR-104',
    name: 'AeroExpress 104',
    departure: { time: '08:30 AM', station: 'NYP' },
    arrival: { time: '11:15 AM', station: 'WAS' },
    duration: '2h 45m',
    durationMinutes: 165,
    stops: 2,
    fare: 145,
    classes: [
      { name: 'Economy', available: 12, price: 145 },
      { name: 'Premium', available: 4, price: 210 },
      { name: 'First Class', available: 0, price: 340 }
    ],
    amenities: ['Wi-Fi', 'Power Outlets', 'Cafe Car', 'Quiet Zone'],
    status: 'On Time'
  },
  {
    id: 'TR-209',
    name: 'Regional Rail 209',
    departure: { time: '10:00 AM', station: 'NYP' },
    arrival: { time: '01:30 PM', station: 'WAS' },
    duration: '3h 30m',
    durationMinutes: 210,
    stops: 5,
    fare: 85,
    classes: [
      { name: 'Economy', available: 45, price: 85 },
      { name: 'Premium', available: 12, price: 130 },
      { name: 'First Class', available: 2, price: 250 }
    ],
    amenities: ['Wi-Fi', 'Cafe Car'],
    status: 'Delayed 10m'
  },
  {
    id: 'TR-055',
    name: 'AeroRail Direct 055',
    departure: { time: '02:15 PM', station: 'NYP' },
    arrival: { time: '04:30 PM', station: 'WAS' },
    duration: '2h 15m',
    durationMinutes: 135,
    stops: 0,
    fare: 220,
    classes: [
      { name: 'Economy', available: 8, price: 220 },
      { name: 'Premium', available: 20, price: 310 },
      { name: 'First Class', available: 5, price: 480 }
    ],
    amenities: ['Ultra Wi-Fi', 'Dining Car', 'Lounge Access', 'Power Outlets'],
    status: 'On Time'
  },
  {
    id: 'TR-312',
    name: 'Night Rider 312',
    departure: { time: '08:00 PM', station: 'NYP' },
    arrival: { time: '11:45 PM', station: 'WAS' },
    duration: '3h 45m',
    durationMinutes: 225,
    stops: 6,
    fare: 65,
    classes: [
      { name: 'Economy', available: 120, price: 65 },
      { name: 'Premium', available: 40, price: 110 },
      { name: 'First Class', available: 10, price: 190 }
    ],
    amenities: ['Wi-Fi', 'Sleeper Pods'],
    status: 'On Time'
  }
];

const getAmenityIcon = (amenity) => {
  if (amenity.includes('Wi-Fi')) return <Wifi className="w-3.5 h-3.5" />;
  if (amenity.includes('Cafe') || amenity.includes('Dining')) return <Coffee className="w-3.5 h-3.5" />;
  if (amenity.includes('Power')) return <BatteryCharging className="w-3.5 h-3.5" />;
  if (amenity.includes('Quiet')) return <Wind className="w-3.5 h-3.5" />;
  return <CheckCircle2 className="w-3.5 h-3.5" />;
};

function TrainCard({ train }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedClass, setSelectedClass] = useState(train.classes.find(c => c.available > 0) || train.classes[0]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border transition-all duration-300 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]
        ${expanded ? 'border-rose-700/50 ring-1 ring-rose-700/10' : 'border-stone-200/60 hover:border-stone-300/80'}`}
    >
      {/* Main Card Header */}
      <div 
        className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center gap-6"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Timing & Stations */}
        <div className="flex-1 flex items-center justify-between md:justify-start md:gap-12">
          <div>
            <div className="text-2xl font-bold text-stone-900 tracking-tight">{train.departure.time}</div>
            <div className="text-sm font-medium text-stone-500 mt-1">{train.departure.station}</div>
          </div>

          <div className="flex flex-col items-center px-4">
            <div className="text-xs font-bold text-stone-400 mb-1">{train.duration}</div>
            <div className="relative w-24 md:w-32 h-px bg-stone-200 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-300 absolute left-0"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-700 absolute right-0"></div>
            </div>
            <div className="text-[10px] font-semibold text-rose-700 uppercase tracking-widest mt-1.5">
              {train.stops === 0 ? 'Direct' : `${train.stops} Stops`}
            </div>
          </div>

          <div className="text-right md:text-left">
            <div className="text-2xl font-bold text-stone-900 tracking-tight">{train.arrival.time}</div>
            <div className="text-sm font-medium text-stone-500 mt-1">{train.arrival.station}</div>
          </div>
        </div>

        {/* Train Info & Price */}
        <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 border-t md:border-t-0 border-stone-100 pt-4 md:pt-0">
          <div>
            <div className="text-sm font-bold text-stone-900">{train.name}</div>
            <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${train.status === 'On Time' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {train.status === 'On Time' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {train.status}
            </div>
          </div>

          <div className="text-right flex items-center gap-4">
            <div>
              <div className="text-xs text-stone-500 font-medium">from</div>
              <div className="text-2xl font-bold text-stone-900">${train.fare}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-500 transition-transform">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 bg-stone-50 p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Amenities & Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {train.amenities.map((amenity, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-600 shadow-sm">
                          {getAmenityIcon(amenity)} {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Train Details</h4>
                    <div className="text-sm text-stone-500">
                      Operated by RailView Network. ID: <span className="text-stone-700 font-mono">{train.id}</span>
                    </div>
                  </div>
                </div>

                {/* Class Selection & CTA */}
                <div className="flex-1 lg:max-w-md bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Select Class</h4>
                  <div className="space-y-2 mb-6">
                    {train.classes.map((c) => {
                      const isSoldOut = c.available === 0;
                      const isSelected = selectedClass.name === c.name;
                      
                      return (
                        <div 
                          key={c.name}
                          onClick={() => !isSoldOut && setSelectedClass(c)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isSoldOut ? 'opacity-50 cursor-not-allowed border-stone-100 bg-stone-50 text-stone-400' : 
                            isSelected ? 'border-rose-700/30 bg-rose-50' : 
                            'border-stone-200/60 bg-white hover:border-stone-300/80 cursor-pointer'
                          }`}
                        >
                          <div>
                            <div className={`font-semibold ${isSelected ? 'text-rose-800' : isSoldOut ? 'text-stone-400' : 'text-stone-700'}`}>{c.name}</div>
                            <div className="text-xs text-stone-500 mt-0.5">
                              {isSoldOut ? 'Sold Out' : `${c.available} seats left`}
                            </div>
                          </div>
                          <div className={`font-bold ${isSelected ? 'text-rose-800' : isSoldOut ? 'text-stone-400' : 'text-stone-900'}`}>
                            ${c.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-3.5 font-bold transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:-translate-y-0.5 active:translate-y-0 mt-2">
                    View 3D Seats
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-200/60 rounded-[2rem] p-5 flex flex-col md:flex-row gap-6 animate-pulse shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
      <div className="flex-1 flex justify-between gap-12">
        <div className="space-y-2"><div className="w-16 h-6 bg-stone-200 rounded"></div><div className="w-10 h-4 bg-stone-100 rounded"></div></div>
        <div className="flex flex-col items-center justify-center w-32"><div className="w-full h-px bg-stone-200 rounded"></div></div>
        <div className="space-y-2 items-end flex flex-col"><div className="w-16 h-6 bg-stone-200 rounded"></div><div className="w-10 h-4 bg-stone-100 rounded"></div></div>
      </div>
      <div className="w-px h-12 bg-stone-100 hidden md:block"></div>
      <div className="flex justify-between md:justify-end gap-10 w-full md:w-auto">
        <div className="space-y-2"><div className="w-32 h-5 bg-stone-200 rounded"></div><div className="w-20 h-4 bg-stone-100 rounded"></div></div>
        <div className="w-16 h-8 bg-stone-200 rounded"></div>
      </div>
    </div>
  );
}

export default function TrainResults() {
  const [loading, setLoading] = useState(true);
  const [filterStops, setFilterStops] = useState('All'); // 'All', 'Direct'
  const [sortBy, setSortBy] = useState('Price'); // 'Price', 'Duration', 'Departure'

  useEffect(() => {
    // Mock loading delay
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredTrains = useMemo(() => {
    let result = [...MOCK_TRAINS];
    if (filterStops === 'Direct') {
      result = result.filter(t => t.stops === 0);
    }
    
    if (sortBy === 'Price') result.sort((a, b) => a.fare - b.fare);
    if (sortBy === 'Duration') result.sort((a, b) => a.durationMinutes - b.durationMinutes);
    if (sortBy === 'Departure') {
      result.sort((a, b) => {
        // Very basic time string sort (works for mock data)
        const timeA = new Date(`1970/01/01 ${a.departure.time}`).getTime();
        const timeB = new Date(`1970/01/01 ${b.departure.time}`).getTime();
        return timeA - timeB;
      });
    }
    return result;
  }, [filterStops, sortBy]);

  return (
    <section className="relative z-10 bg-[#faf9f6] py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">Available Trains</h2>
            <p className="text-stone-500 font-medium">New York (NYP) to Washington DC (WAS)</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Stops Filter */}
            <div className="flex items-center bg-white border border-stone-200 rounded-lg p-1 shadow-sm">
              {['All', 'Direct'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterStops(type)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${filterStops === type ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-4 py-2 cursor-pointer hover:border-stone-300 transition-colors shadow-sm">
                <ArrowUpDown className="w-4 h-4 text-stone-400" />
                <span className="text-sm font-semibold text-stone-900">Sort: {sortBy}</span>
              </div>
              <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-stone-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                {['Price', 'Duration', 'Departure'].map(opt => (
                  <div 
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredTrains.length > 0 ? (
            filteredTrains.map(train => (
              <TrainCard key={train.id} train={train} />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="bg-white border border-stone-200 border-dashed rounded-2xl p-12 text-center shadow-sm"
            >
              <Filter className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-2">No trains found</h3>
              <p className="text-stone-500">Try adjusting your filters to see more results.</p>
              <button 
                onClick={() => setFilterStops('All')}
                className="mt-6 text-rose-700 font-bold hover:text-rose-800"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>

      </div>
    </section>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { searchTrains } from '../service/api';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

function TrainCard({ train, onSelectTrain }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-200/60 transition-all duration-300 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:border-rose-700/30"
    >
      {/* Main Card */}
      <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
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
              Direct
            </div>
          </div>

          <div className="text-right md:text-left">
            <div className="text-2xl font-bold text-stone-900 tracking-tight">{train.arrival.time}</div>
            <div className="text-sm font-medium text-stone-500 mt-1">{train.arrival.station}</div>
          </div>
        </div>

        {/* Train Info & CTA */}
        <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 border-t md:border-t-0 border-stone-100 pt-4 md:pt-0">
          <div>
            <div className="text-sm font-bold text-stone-900">{train.name}</div>
            <div className="text-xs font-medium mt-1 flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
              On Time
            </div>
          </div>

          <button
            onClick={() => onSelectTrain(train.id)}
            className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl px-6 py-3 font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            Select
          </button>
        </div>
      </div>
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

export default function TrainResults({
  fromCode,
  toCode,
  date,
  fromLabel,
  toLabel,
  onSelectTrain,
}) {
  const [loading, setLoading] = useState(true);
  const [trains, setTrains] = useState([]);
  const [error, setError] = useState('');

  const [filterStops, setFilterStops] = useState('All');
  const [sortBy, setSortBy] = useState('Price');

  // Fetch trains from backend
  useEffect(() => {
    const fetchTrains = async () => {
      if (!fromCode || !toCode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await searchTrains({
          from: fromCode,
          to: toCode,
        });

        const backendTrains = Array.isArray(data) ? data : [];

        const formattedTrains = backendTrains.map((train) => {
          const formatTime = (value) => String(value || '').slice(0, 5);
          const durationMinutes = Number(train.durationMinutes || 0);

          return {
            id: train.trainId,
            trainNumber: train.trainNumber,
            name: train.name,

            departure: {
              time: formatTime(train.departure),
              station: fromCode,
            },

            arrival: {
              time: formatTime(train.arrival),
              station: toCode,
            },

            duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
          };
        });

        setTrains(formattedTrains);
      } catch (err) {
        console.error('Failed to fetch trains:', err);
        setError('Unable to load trains. Please try again.');
        setTrains([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, [fromCode, toCode]);

  const filteredTrains = useMemo(() => {
    let result = [...trains];

    // Sort by departure time
    result.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.departure.time}`).getTime();
      const timeB = new Date(`1970/01/01 ${b.departure.time}`).getTime();
      return timeA - timeB;
    });

    return result;
  }, [trains]);
  return (
    <section className="relative z-10 bg-[#faf9f6] py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-stone-900 mb-2">Available Trains</h2>
          <p className="text-stone-500 font-medium">{fromLabel || 'Departure'} to {toLabel || 'Destination'}</p>
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
              <TrainCard key={train.id} train={train} onSelectTrain={onSelectTrain} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-stone-200 border-dashed rounded-2xl p-12 text-center shadow-sm"
            >
              <h3 className="text-xl font-bold text-stone-900 mb-2">No trains found</h3>
              <p className="text-stone-500">Try a different route or date.</p>
            </motion.div>
          )}
        </div>

      </div>
    </section>
  );
}

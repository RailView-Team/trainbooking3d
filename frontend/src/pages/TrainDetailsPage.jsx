import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, TrainFront, ArrowRight, Clock, MapPin, CheckCircle2, Shield, Wifi, Loader2 } from 'lucide-react';
import { getTrain, getTrainSchedule } from '../service/api';

export default function TrainDetailsPage() {
  const { trainId } = useParams();
  const location = useLocation();
  const [train, setTrain] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [trainData, scheduleData] = await Promise.all([
          getTrain(trainId),
          getTrainSchedule(trainId)
        ]);
        setTrain(trainData);
        setSchedule(scheduleData);
      } catch (err) {
        console.error('Failed to load train details:', err);
        setError('Unable to load train schedule and details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [trainId]);

  if (loading) {
    return (
      <div className="pt-36 pb-24 min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-stone-500 font-semibold text-sm">Loading train schedule & details...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-[70vh] bg-[#faf9f6]">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <Link
          to={`/trains${location.search}`}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-8 inline-flex"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Search Results
        </Link>

        {/* Train Overview Card */}
        <div className="bg-white border border-stone-200/60 rounded-[2rem] p-8 lg:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <TrainFront className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-blue-600 text-white font-mono text-xs font-black px-2.5 py-1 rounded">
                    #{train?.train_number || trainId}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {train?.status || 'ON TIME'}
                  </span>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    {train?.train_type || 'Superfast Express'}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-stone-900">{train?.name || `Train ${trainId}`}</h1>
              </div>
            </div>

            <Link
              to={`/trains/${trainId}/class${location.search}`}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-3.5 font-bold text-sm transition-all shadow-md shadow-blue-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 self-start md:self-auto"
            >
              Select Class & Seats <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Amenities */}
          {train?.amenities && train.amenities.length > 0 && (
            <div className="pt-6">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">On-Board Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {train.amenities.map((item, idx) => (
                  <span key={idx} className="bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Train Schedule Table */}
        <div className="bg-white border border-stone-200/60 rounded-[2rem] p-8 lg:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Official Route & Time Table</h2>
              <p className="text-stone-500 text-xs mt-1">Live station sequence and scheduled halt timings</p>
            </div>
            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
              {schedule.length} Stations
            </span>
          </div>

          {schedule.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-sm">
              Schedule details currently loading from railway servers.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-4">Station</th>
                    <th className="py-3 px-4">Arrival</th>
                    <th className="py-3 px-4">Departure</th>
                    <th className="py-3 px-4">Halt</th>
                    <th className="py-3 px-4">Distance</th>
                    <th className="py-3 px-4">Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm font-medium text-stone-700">
                  {schedule.map((stop) => (
                    <tr key={stop.sequence} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-4 px-2 font-mono text-stone-400 text-xs font-bold">
                        {stop.sequence}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-stone-900">{stop.stationName}</div>
                        <div className="text-xs text-stone-400 font-mono font-semibold">{stop.stationCode} · {stop.city}</div>
                      </td>
                      <td className="py-4 px-4 font-mono text-stone-600">
                        {stop.arrival ? stop.arrival.slice(0, 5) : 'Starts'}
                      </td>
                      <td className="py-4 px-4 font-mono text-stone-900 font-bold">
                        {stop.departure ? stop.departure.slice(0, 5) : 'Terminates'}
                      </td>
                      <td className="py-4 px-4 text-xs text-stone-500">
                        {stop.haltMinutes > 0 ? `${stop.haltMinutes} mins` : '—'}
                      </td>
                      <td className="py-4 px-4 text-xs text-stone-500">
                        {stop.distanceKm} km
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-stone-100 border border-stone-200 text-stone-700 text-xs px-2 py-0.5 rounded font-mono font-bold">
                          PF {stop.platform || '1'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end">
            <Link
              to={`/trains/${trainId}/class${location.search}`}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-3.5 font-bold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              Continue to Seat Selection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

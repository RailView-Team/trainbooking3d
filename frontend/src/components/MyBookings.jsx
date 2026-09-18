import React, { useEffect, useState } from 'react';
import { Ticket, Calendar, Train, MapPin, Download, XCircle, Settings2, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_BOOKINGS = [
  {
    id: 'BKG-9842',
    pnr: '8492749102',
    train: 'AeroExpress 104',
    route: { from: 'Kolkata (KOL)', to: 'Mumbai (BOM)' },
    date: '14 Oct 2026',
    time: '08:00 AM',
    coach: 'B1',
    seats: ['24', '25'],
    class: '3A',
    status: 'upcoming',
    amount: '₹165.00'
  },
  {
    id: 'BKG-3121',
    pnr: '3121549880',
    train: 'Coastal Limited 302',
    route: { from: 'Delhi (DEL)', to: 'Kolkata (KOL)' },
    date: '02 Sep 2026',
    time: '02:30 PM',
    coach: 'A2',
    seats: ['12'],
    class: '1A',
    status: 'completed',
    amount: '₹210.00'
  },
  {
    id: 'BKG-1190',
    pnr: '1190334812',
    train: 'Mountain Explorer 900',
    route: { from: 'Denver (DEN)', to: 'Salt Lake (SLC)' },
    date: '15 Aug 2026',
    time: '10:15 AM',
    coach: 'C1',
    seats: ['4', '5', '6'],
    class: 'CC',
    status: 'cancelled',
    amount: '₹135.00'
  }
];

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem('aerorail.bookings') || '[]'));

  useEffect(() => {
    const refresh = () => setBookings(JSON.parse(localStorage.getItem('aerorail.bookings') || '[]'));
    window.addEventListener('storage', refresh);
    refresh();
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  return (
    <div className="bg-[#faf9f6] min-h-screen py-32 relative z-10">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-stone-900 mb-4">My Bookings</h1>
          <p className="text-stone-500 font-medium">Manage your upcoming trips and view past journeys.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-stone-100 p-1.5 rounded-xl border border-stone-200 w-fit mb-10">
          {['upcoming', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-lg font-bold text-sm capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200' 
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-stone-200/60 rounded-[2rem] p-6 lg:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] group hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row gap-8 justify-between">
                    
                    {/* Left: Journey Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                          booking.status === 'upcoming' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          booking.status === 'completed' ? 'bg-stone-100 text-stone-600 border border-stone-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {booking.status}
                        </div>
                        <div className="text-stone-400 text-sm font-bold uppercase tracking-widest">
                          PNR: <span className="text-stone-900">{booking.pnr}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-6">
                        <div>
                          <div className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">From</div>
                          <div className="text-xl font-black text-stone-900">{booking.route.from.split(' ')[0]}</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center max-w-[150px]">
                          <div className="w-full h-px bg-stone-200 relative">
                            <Train className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">To</div>
                          <div className="text-xl font-black text-stone-900">{booking.route.to.split(' ')[0]}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-stone-700 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
                          <Calendar className="w-4 h-4 text-rose-700" /> {booking.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-700 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
                          <Clock className="w-4 h-4 text-rose-700" /> {booking.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-700 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
                          <Train className="w-4 h-4 text-rose-700" /> {booking.train}
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:block w-px bg-stone-200"></div>

                    {/* Right: Seats & Actions */}
                    <div className="lg:w-[300px] flex flex-col justify-between">
                      <div>
                        <div className="text-xs text-stone-500 font-bold uppercase tracking-widest mb-3">Coach & Seats</div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-white border border-stone-200/60 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-stone-900 shadow-sm">
                            {booking.coach}
                          </div>
                          <div className="flex-1 flex gap-2 flex-wrap">
                            {booking.seats.map(seat => (
                              <div key={seat} className="bg-rose-50 border border-rose-100 text-rose-700 w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm">
                                {seat}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <button className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-900 py-3 rounded-xl text-xs font-bold transition-colors">
                          <Ticket className="w-4 h-4" /> View Ticket
                        </button>
                        
                        {booking.status === 'upcoming' ? (
                          <button className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl text-xs font-bold transition-colors shadow-md">
                            <Settings2 className="w-4 h-4" /> Manage
                          </button>
                        ) : (
                          <button className="flex items-center justify-center gap-2 bg-white border border-stone-200/60 hover:border-stone-300 hover:bg-stone-50 text-stone-700 py-3 rounded-xl text-xs font-bold transition-colors shadow-sm">
                            <Download className="w-4 h-4" /> Download
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-stone-200/60 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center shadow-sm"
              >
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                  <Ticket className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">No {activeTab} bookings</h3>
                <p className="text-stone-500 font-medium max-w-sm mb-8">You don't have any {activeTab} trips in your history right now.</p>
                {activeTab === 'upcoming' && (
                  <button className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                    Book a Ticket <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

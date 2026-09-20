import React, { useEffect, useState } from 'react';
import { Ticket, Calendar, Train, Clock, AlertCircle, Loader2, LogIn, ChevronRight, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserBookings, cancelBooking } from '../service/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function MyBookings() {
  const { isAuthenticated, openAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Unable to fetch bookings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return b.status === 'CONFIRMED' || b.status === 'PENDING';
    if (activeTab === 'cancelled') return b.status === 'CANCELLED';
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="bg-[#faf9f6] min-h-screen py-36 relative z-10">
        <div className="container mx-auto px-6 md:px-12 max-w-xl text-center">
          <div className="bg-white border border-stone-200/80 rounded-[2rem] p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Login to View Bookings</h2>
            <p className="text-stone-500 text-sm mb-8">Access your tickets, download reservation slips, and manage your train journeys.</p>
            <button
              onClick={() => openAuth('login')}
              className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign In to Your Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f6] min-h-screen py-32 relative z-10">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-stone-900 mb-2">My Bookings</h1>
            <p className="text-stone-500 font-medium">Manage your active reservations and journey history.</p>
          </div>
          <Link
            to="/"
            className="bg-rose-700 hover:bg-rose-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm inline-flex items-center gap-2 self-start md:self-auto"
          >
            Book New Ticket <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-stone-100 p-1.5 rounded-xl border border-stone-200 w-fit mb-8">
          {[
            { id: 'all', label: 'All' },
            { id: 'upcoming', label: 'Active / Confirmed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200' 
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* State Alerts */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-rose-700" />
            <p className="font-semibold text-sm">Retrieving your bookings...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Bookings List */}
        {!loading && (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white border border-stone-200/60 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] group hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row gap-6 justify-between">
                      
                      {/* Left: Journey Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            booking.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {booking.status}
                          </div>
                          <div className="text-stone-400 text-sm font-bold uppercase tracking-widest">
                            PNR: <span className="text-stone-900 font-mono">{booking.pnr}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                          <div>
                            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">From</div>
                            <div className="text-2xl font-black text-stone-900">{booking.from}</div>
                          </div>
                          <div className="flex-1 flex flex-col items-center max-w-[120px]">
                            <div className="w-full h-px bg-stone-200 relative">
                              <Train className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">To</div>
                            <div className="text-2xl font-black text-stone-900">{booking.to}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-stone-700 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
                            <Train className="w-3.5 h-3.5 text-rose-700" /> {booking.train?.name || `Train ${booking.train?.number}`}
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-700 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
                            <Calendar className="w-3.5 h-3.5 text-rose-700" /> {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-700 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
                            <Clock className="w-3.5 h-3.5 text-rose-700" /> Payment: <span className="font-bold">{booking.paymentStatus}</span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden lg:block w-px bg-stone-100"></div>

                      {/* Right: Amount & Actions */}
                      <div className="lg:w-[240px] flex flex-col justify-between border-t lg:border-t-0 pt-4 lg:pt-0">
                        <div>
                          <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Total Paid</div>
                          <div className="text-2xl font-black text-stone-900 mb-4">₹{booking.totalAmount}</div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/booking/confirmation?pnr=${booking.pnr}`}
                            className="w-full text-center bg-stone-100 hover:bg-stone-200 text-stone-900 py-2.5 rounded-xl text-xs font-bold transition-colors"
                          >
                            View Ticket Slip
                          </Link>

                          {booking.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="w-full flex items-center justify-center gap-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white border border-stone-200/60 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                    <Ticket className="w-7 h-7 text-stone-400" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mb-1">No bookings found</h3>
                  <p className="text-stone-500 font-medium text-xs max-w-sm mb-6">You don't have any tickets under this tab yet.</p>
                  <Link
                    to="/"
                    className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
                  >
                    Search Trains <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}

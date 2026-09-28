import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Copy, Check, Printer, TrainFront, MapPin, Calendar, Clock, User, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getBooking } from '../service/api';

export default function ConfirmationPage() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const bookingId = params.get('bookingId');
  const pnrParam = params.get('pnr');
  const transactionId = params.get('transactionId');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const identifier = bookingId || pnrParam;
    if (!identifier) {
      setLoading(false);
      setError('No booking reference provided.');
      return;
    }

    setLoading(true);
    setError('');

    getBooking(identifier)
      .then((data) => {
        setBooking(data);

        // Store in localStorage for guest persistence
        try {
          const saved = JSON.parse(localStorage.getItem('aerorail.bookings') || '[]');
          const item = {
            id: data.id,
            pnr: data.pnr,
            train: data.train?.name || 'Superfast Express',
            trainNumber: data.train?.trainNumber,
            route: {
              from: data.route?.from?.code,
              fromName: data.route?.from?.name,
              to: data.route?.to?.code,
              toName: data.route?.to?.name,
            },
            date: new Date(data.journeyDate || data.createdAt).toLocaleDateString(),
            time: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            coach: data.coach?.code,
            seats: data.seats?.map(s => s.seat_number) || [],
            class: data.coach?.classCode,
            status: data.status || 'CONFIRMED',
            amount: `₹${data.totalAmount}`
          };
          localStorage.setItem('aerorail.bookings', JSON.stringify([item, ...saved.filter(e => e.id !== item.id && e.pnr !== item.pnr)]));
        } catch {
          // Ignore localStorage errors
        }
      })
      .catch((err) => {
        console.error('Failed to load booking:', err);
        setError('Unable to fetch reservation details. Please check your PNR.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bookingId, pnrParam]);

  const handleCopyPnr = (pnrText) => {
    if (!pnrText) return;
    navigator.clipboard.writeText(pnrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="pt-36 pb-24 min-h-[70vh] flex flex-col items-center justify-center text-center bg-[#faf9f6]">
        <Loader2 className="w-10 h-10 animate-spin text-rose-700 mb-4" />
        <h2 className="text-xl font-bold text-stone-900 mb-1">Generating Your E-Ticket…</h2>
        <p className="text-stone-500 text-sm">Contacting railway reservation systems</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-36 pb-24 min-h-[70vh] flex flex-col items-center justify-center text-center bg-[#faf9f6]">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Booking Not Found</h2>
        <p className="text-stone-500 mb-8 max-w-md">{error || 'We could not locate this reservation.'}</p>
        <Link to="/" className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl px-8 py-3.5 font-bold transition-all shadow-md">
          Return to Search
        </Link>
      </div>
    );
  }

  const pnr = booking.pnr;
  const txn = transactionId || booking.payment?.transaction_id || `TXN${booking.id * 8831}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-28 pb-24 min-h-[70vh] bg-[#faf9f6]"
    >
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Booking Confirmed!</h1>
          <p className="text-stone-500 text-sm md:text-base mt-1">Your reservation has been secured. Have a safe and pleasant journey!</p>
        </div>

        {/* Printable Ticket Card */}
        <div className="bg-white border-2 border-stone-200 rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)] print:border-none print:shadow-none mb-8">
          
          {/* Ticket Header Ribbon */}
          <div className="bg-gradient-to-r from-rose-700 to-rose-900 text-white p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-200 block">Indian Railways E-Reservation Slip</span>
              <div className="text-2xl font-black mt-0.5">{booking.train?.name || 'Express Train'}</div>
              <div className="text-xs text-rose-200 mt-1 font-semibold">#{booking.train?.trainNumber} · {booking.coach?.className || 'AC Coach'}</div>
            </div>

            <div className="flex sm:flex-col sm:items-end justify-between items-center gap-1 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-rose-200 uppercase tracking-widest">PNR Number</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-black tracking-wider text-white">{pnr}</span>
                <button
                  onClick={() => handleCopyPnr(pnr)}
                  className="p-1 hover:bg-white/20 rounded transition-colors text-white"
                  title="Copy PNR"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            
            {/* Journey Stations Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-stone-50 p-5 rounded-2xl border border-stone-200/70">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">From</span>
                <div className="font-extrabold text-lg text-stone-900">{booking.route?.from?.name || booking.route?.from?.code}</div>
                <span className="text-xs font-bold text-rose-700">{booking.route?.from?.code}</span>
              </div>

              <div className="text-center flex flex-col items-center">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  {new Date(booking.journeyDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <div className="w-24 h-0.5 bg-stone-300 relative my-2">
                  <div className="w-2 h-2 rounded-full bg-rose-700 absolute right-0 -top-[3px]"></div>
                </div>
                <span className="text-xs font-bold text-stone-600">
                  Coach {booking.coach?.code} ({booking.coach?.classCode})
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">To</span>
                <div className="font-extrabold text-lg text-stone-900">{booking.route?.to?.name || booking.route?.to?.code}</div>
                <span className="text-xs font-bold text-rose-700">{booking.route?.to?.code}</span>
              </div>
            </div>

            {/* Passenger List */}
            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Passenger & Berth Allocations</h4>
              <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
                {booking.passengers && booking.passengers.length > 0 ? (
                  booking.passengers.map((p, idx) => (
                    <div key={p.id || idx} className="p-4 flex items-center justify-between flex-wrap gap-2 bg-white hover:bg-stone-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-stone-100 font-bold text-xs flex items-center justify-center text-stone-600">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 text-sm">{p.name}</div>
                          <div className="text-xs text-stone-400 capitalize">{p.gender} · {p.age} yrs</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-stone-100 px-2.5 py-1 rounded text-stone-700 border border-stone-200">
                          Coach {booking.coach?.code}
                        </span>
                        <span className="text-xs font-black bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded">
                          Seat #{booking.seats?.[idx]?.seat_number || p.seat_id || idx + 1}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                          CNF
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm text-stone-500 text-center">Passenger details assigned to PNR {pnr}.</div>
                )}
              </div>
            </div>

            {/* Payment & Security Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 block font-semibold">Payment Status</span>
                <span className="font-bold text-emerald-700">PAID</span>
              </div>
              <div>
                <span className="text-stone-400 block font-semibold">Total Fare</span>
                <span className="font-bold text-stone-900">₹{booking.totalAmount}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-semibold">Txn Reference</span>
                <span className="font-mono font-bold text-stone-700 truncate block">{txn}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-semibold">Booking Date</span>
                <span className="font-bold text-stone-700">{new Date(booking.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-white border border-stone-300 hover:border-stone-400 text-stone-800 rounded-xl px-6 py-3.5 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-stone-600" /> Print / Save E-Ticket
          </button>

          <Link
            to="/bookings"
            className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white rounded-xl px-7 py-3.5 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            View in My Bookings <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto bg-rose-700 hover:bg-rose-800 text-white rounded-xl px-7 py-3.5 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            Book Another Train
          </Link>
        </div>

      </div>
    </motion.div>
  );
}

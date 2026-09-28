import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, TrainFront, MapPin, Calendar, Armchair, ShieldCheck, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createBooking, getTrain, getStations } from '../service/api';
import { CLASSES } from '../coachData';
import { useAuth } from '../context/AuthContext';

export default function ReviewBookingPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const trainId = Number(params.get('trainId'));
  const fromCode = params.get('from') || '';
  const toCode = params.get('to') || '';
  const date = params.get('date') || '';
  const classCode = params.get('class') || '';
  const coachParam = params.get('coach') || '';
  const coachId = /^\d+$/.test(coachParam) ? Number(coachParam) : coachParam;

  const seats = (params.get('seats') || '').split(',').filter(Boolean).map(Number);
  const passengers = (params.get('passengerData') || '').split(';;').filter(Boolean).map(value => {
    const [name, age, gender, berthPreference, seatId, seatNumber] = value.split('|');
    return {
      name: decodeURIComponent(name || ''),
      age: Number(age) || 25,
      gender: gender || 'male',
      berthPreference: decodeURIComponent(berthPreference || 'none'),
      seatId: Number(seatId) || seatId,
      seatNumber: decodeURIComponent(seatNumber || '') || seatId
    };
  });

  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [trainInfo, setTrainInfo] = useState(null);
  const [stations, setStations] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email && !contactEmail) setContactEmail(user.email);
    if (user?.phone && !contactPhone) setContactPhone(user.phone);
  }, [user]);

  useEffect(() => {
    if (trainId) {
      getTrain(trainId).then(setTrainInfo).catch(() => {});
    }
    getStations().then(data => { if (Array.isArray(data)) setStations(data); }).catch(() => {});
  }, [trainId]);

  const fromStation = stations.find(s => s.code === fromCode);
  const toStation = stations.find(s => s.code === toCode);
  const selectedClassInfo = CLASSES.find(c => c.code === classCode);

  const farePerSeat = selectedClassInfo?.fare || 850;
  const baseFare = farePerSeat * passengers.length;
  const convenienceFee = passengers.length > 0 ? 30 : 0;
  const totalAmount = baseFare + convenienceFee;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleProceedToPayment = async () => {
    if (!contactEmail.trim()) {
      setError('Please provide a contact email for e-ticket delivery.');
      return;
    }
    if (!contactPhone.trim() || contactPhone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!trainId || !coachId || passengers.length === 0) {
      setError('Missing booking details. Please return to seat selection.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await createBooking({
        trainId,
        from: fromCode,
        to: toCode,
        date,
        classCode,
        coachId,
        seats,
        passengers,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
      });

      const bookingId = result.booking?.id;
      const pnr = result.booking?.pnr;
      const amount = result.booking?.totalAmount || totalAmount;

      navigate(`/booking/payment?bookingId=${bookingId}&pnr=${pnr}&amount=${amount}`);
    } catch (err) {
      console.error('Failed to create booking:', err);
      setError(err.response?.data?.message || 'Unable to reserve seats. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!trainId || passengers.length === 0 || !fromCode || !toCode) {
    return (
      <div className="pt-36 pb-24 min-h-[70vh] flex flex-col items-center justify-center text-center bg-[#faf9f6]">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">No Booking Selected</h2>
        <p className="text-stone-500 mb-8 max-w-md">Please choose your train and passengers before reviewing.</p>
        <Link to="/" className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl px-8 py-3.5 font-bold transition-all shadow-md">
          Start Train Search
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-28 pb-24 min-h-[70vh] bg-[#faf9f6]"
    >
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-6 inline-flex"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Passenger Details
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-stone-900 mb-1">Review Your Reservation</h1>
          <p className="text-stone-500 text-sm font-medium">Verify your journey details and passenger list before proceeding to payment.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Journey Header Card */}
            <div className="bg-white border border-stone-200/80 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="flex items-center justify-between border-b border-stone-100 pb-5 mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <TrainFront className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-stone-900 leading-tight">
                      {trainInfo?.name || `Train #${trainId}`}
                    </h3>
                    <p className="text-xs text-stone-400 font-semibold mt-0.5">
                      #{trainInfo?.train_number || trainId} • {trainInfo?.train_type || 'Superfast Express'}
                    </p>
                  </div>
                </div>

                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Confirmed Allotment
                </span>
              </div>

              {/* Station Route Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-stone-50/70 p-5 rounded-2xl border border-stone-100 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Departure</span>
                  <div className="font-extrabold text-base text-stone-900 mt-0.5">{fromStation?.name || fromCode}</div>
                  <div className="text-xs font-semibold text-blue-600">{fromCode}</div>
                </div>

                <div className="text-center flex flex-col items-center">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{formatDate(date)}</span>
                  <div className="w-24 h-0.5 bg-stone-300 relative my-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 absolute right-0 -top-[3px]"></div>
                  </div>
                  <span className="text-xs font-bold text-stone-600">Class {classCode} · Coach {coachParam}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Destination</span>
                  <div className="font-extrabold text-base text-stone-900 mt-0.5">{toStation?.name || toCode}</div>
                  <div className="text-xs font-semibold text-blue-600">{toCode}</div>
                </div>
              </div>
            </div>

            {/* Passenger List Card */}
            <div className="bg-white border border-stone-200/80 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <h3 className="text-lg font-bold text-stone-900 mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Passenger Details ({passengers.length})
              </h3>

              <div className="divide-y divide-stone-100">
                {passengers.map((p, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-sm text-stone-600">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-base">{p.name}</div>
                        <div className="text-xs text-stone-400 capitalize">
                          {p.gender} · {p.age} yrs · {p.berthPreference !== 'none' ? p.berthPreference : 'No berth preference'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg border border-stone-200">
                        Coach {coachParam}
                      </span>
                      <span className="text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-lg">
                        Seat #{p.seatNumber || p.seatId}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white border border-stone-200/80 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <h3 className="text-lg font-bold text-stone-900 mb-2">E-Ticket & SMS Contact</h3>
              <p className="text-stone-400 text-xs mb-5">Your booking confirmation and PNR ticket will be dispatched here.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. traveler@railvista.in"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar / Price Breakdown */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white border border-stone-200/80 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-6">
              <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-4">
                Fare Breakdown
              </h3>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-stone-600 font-medium">
                  <span>Base Ticket ({passengers.length} × ₹{farePerSeat})</span>
                  <span className="font-bold text-stone-900">₹{baseFare}</span>
                </div>
                <div className="flex justify-between text-stone-600 font-medium">
                  <span>IRCTC Convenience Fee</span>
                  <span className="font-bold text-stone-900">₹{convenienceFee}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                  <span>Travel Insurance</span>
                  <span className="font-bold">Complimentary</span>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Total Payable</span>
                  <span className="text-2xl font-black text-blue-600">₹{totalAmount}</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">All Taxes Included</span>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-4 font-bold text-base tracking-wide transition-all shadow-md shadow-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Reserving Seats…
                  </>
                ) : (
                  <>
                    Proceed to Payment <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-stone-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                256-Bit SSL Encrypted Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

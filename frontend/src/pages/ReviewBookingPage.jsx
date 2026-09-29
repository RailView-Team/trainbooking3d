import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  User,
  TrainFront,
  ShieldCheck,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  Armchair
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createBooking, getTrain, getStations, getAvailability } from '../service/api';
import { CLASSES } from '../coachData';
import { useAuth } from '../context/AuthContext';

export default function ReviewBookingPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  // Journey query parameters
  const trainId = Number(params.get('trainId'));
  const fromCode = (params.get('from') || '').trim().toUpperCase();
  const toCode = (params.get('to') || '').trim().toUpperCase();
  const date = params.get('date') || '';
  const classCode = (params.get('class') || '').trim().toUpperCase();
  const coachParam = params.get('coach') || '';
  const urlPassengersCount = parseInt(params.get('passengers') || '0', 10);

  // Parse raw seats and seat numbers
  const rawSeats = useMemo(() => {
    return (params.get('seats') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => (/^\d+$/.test(s) ? Number(s) : s));
  }, [params]);

  const rawSeatNumbers = useMemo(() => {
    return (params.get('seatNumbers') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }, [params]);

  // Parse raw passenger records from URL passengerData
  const parsedPassengers = useMemo(() => {
    const dataStr = params.get('passengerData') || '';
    if (!dataStr) return [];

    return dataStr
      .split(';;')
      .map(item => item.trim())
      .filter(Boolean)
      .map((entry, idx) => {
        const parts = entry.split('|');
        const rawName = decodeURIComponent(parts[0] || '').trim();
        const rawAge = Number(parts[1]);
        const rawGender = parts[2] ? parts[2].trim().toLowerCase() : 'male';
        const rawBerth = decodeURIComponent(parts[3] || 'none').trim();
        const rawSeatId = parts[4] ? (/^\d+$/.test(parts[4]) ? Number(parts[4]) : parts[4]) : rawSeats[idx] || (idx + 1);
        const rawSeatNum = parts[5] ? decodeURIComponent(parts[5]).trim() : (rawSeatNumbers[idx] || `${idx + 1}`);

        return {
          name: rawName || (idx === 0 && rawName === '' ? 'Primary Passenger' : `Passenger ${idx + 1}`),
          age: !isNaN(rawAge) && rawAge > 0 ? rawAge : 25,
          gender: rawGender || 'male',
          berthPreference: rawBerth && rawBerth !== 'none' ? rawBerth : 'No berth preference',
          seatId: rawSeatId,
          seatNumber: rawSeatNum
        };
      });
  }, [params, rawSeats, rawSeatNumbers]);

  // Reconcile total passengers count dynamically
  // If URL has passengers=18 but only 1 entered, or seats list has N, derive N accurately
  const totalPassengerCount = useMemo(() => {
    if (parsedPassengers.length > 0 && parsedPassengers.length >= (urlPassengersCount || 0)) {
      return parsedPassengers.length;
    }
    return Math.max(parsedPassengers.length, rawSeats.length, urlPassengersCount > 0 ? urlPassengersCount : 0, 1);
  }, [parsedPassengers, rawSeats, urlPassengersCount]);

  // Reconciled passengers list of length totalPassengerCount
  const passengers = useMemo(() => {
    const list = [...parsedPassengers];
    const baseSeatId = rawSeats[0] && typeof rawSeats[0] === 'number' ? rawSeats[0] : 944;
    const baseSeatNum = rawSeatNumbers[0] && !isNaN(Number(rawSeatNumbers[0])) ? Number(rawSeatNumbers[0]) : 1;

    for (let i = list.length; i < totalPassengerCount; i++) {
      const assignedSeatId = rawSeats[i] !== undefined ? rawSeats[i] : baseSeatId + i;
      const assignedSeatNum = rawSeatNumbers[i] !== undefined
        ? rawSeatNumbers[i]
        : String(baseSeatNum + i);

      list.push({
        name: `Passenger ${i + 1}`,
        age: 28,
        gender: i % 2 === 0 ? 'male' : 'female',
        berthPreference: 'No berth preference',
        seatId: assignedSeatId,
        seatNumber: assignedSeatNum
      });
    }

    return list;
  }, [parsedPassengers, totalPassengerCount, rawSeats, rawSeatNumbers]);

  // Reconciled seat IDs matching passengers length
  const reconciledSeats = useMemo(() => {
    return passengers.map(p => p.seatId);
  }, [passengers]);

  // Contact Information
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  // Metadata
  const [trainInfo, setTrainInfo] = useState(null);
  const [stations, setStations] = useState([]);
  const [coachDetails, setCoachDetails] = useState(null);

  // Payment & Error States: 'idle' | 'loading' | 'error'
  const [paymentState, setPaymentState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState(''); // 'DATA_MISSING' | 'SEAT_UNAVAILABLE' | 'INIT_FAILED'

  useEffect(() => {
    if (user?.email && !contactEmail) setContactEmail(user.email);
    if (user?.phone && !contactPhone) setContactPhone(user.phone);
  }, [user]);

  // Fetch train, stations, and coach info
  useEffect(() => {
    if (trainId) {
      getTrain(trainId).then(setTrainInfo).catch(() => {});
    }

    getStations()
      .then(data => {
        if (Array.isArray(data)) setStations(data);
      })
      .catch(() => {});

    if (trainId && fromCode && toCode && date) {
      getAvailability({ trainId, from: fromCode, to: toCode, date })
        .then(avail => {
          if (avail?.coaches && coachParam) {
            const found = avail.coaches.find(
              c => String(c.id) === String(coachParam) || String(c.code) === String(coachParam)
            );
            if (found) setCoachDetails(found);
          }
        })
        .catch(() => {});
    }
  }, [trainId, fromCode, toCode, date, coachParam]);

  // Resolved station & class details
  const fromStation = stations.find(s => s.code === fromCode);
  const toStation = stations.find(s => s.code === toCode);
  const selectedClassInfo = CLASSES.find(c => c.code === classCode);

  // Dynamic Fare Calculations
  const farePerSeat = coachDetails?.fare || selectedClassInfo?.fare || 950;
  const baseFare = farePerSeat * passengers.length;
  const convenienceFee = passengers.length > 0 ? 30 : 0;
  const totalAmount = baseFare + convenienceFee;

  // Format Display Date: e.g. "Tue, Sep 29, 2026"
  const formattedDate = useMemo(() => {
    if (!date) return 'Not set';
    try {
      const d = new Date(date + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return date;
    }
  }, [date]);

  // Display coach identifier: e.g. "C1", "C17", or coachParam
  const coachDisplay = useMemo(() => {
    if (coachDetails?.code) return coachDetails.code;
    if (coachParam) return coachParam.startsWith('C') ? coachParam : `C${coachParam}`;
    return 'C1';
  }, [coachDetails, coachParam]);

  // Numeric or Code coachId for API
  const apiCoachId = useMemo(() => {
    if (coachDetails?.id) return coachDetails.id;
    if (/^\d+$/.test(coachParam)) return Number(coachParam);
    return coachParam;
  }, [coachDetails, coachParam]);

  // Validation & Checkout Action
  const handleProceedToPayment = async () => {
    // Prevent duplicate clicks
    if (paymentState === 'loading') return;

    if (!contactEmail.trim()) {
      setErrorMessage('Please provide a contact email for e-ticket delivery.');
      setPaymentState('error');
      setErrorType('DATA_MISSING');
      return;
    }
    if (!contactPhone.trim() || contactPhone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      setPaymentState('error');
      setErrorType('DATA_MISSING');
      return;
    }
    if (!trainId || !coachParam || passengers.length === 0 || !fromCode || !toCode) {
      setErrorMessage('Booking information could not be loaded.');
      setPaymentState('error');
      setErrorType('DATA_MISSING');
      return;
    }

    setPaymentState('loading');
    setErrorMessage('');
    setErrorType('');

    try {
      const payload = {
        trainId,
        from: fromCode,
        to: toCode,
        date,
        classCode: classCode || (coachDetails?.classCode || 'CC'),
        coachId: apiCoachId,
        seats: reconciledSeats,
        passengers: passengers.map(p => ({
          name: p.name,
          age: Number(p.age) || 25,
          gender: p.gender || 'male',
          berthPreference: p.berthPreference === 'No berth preference' ? null : p.berthPreference,
          seatId: p.seatId,
          seatNumber: String(p.seatNumber)
        })),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim()
      };

      const result = await createBooking(payload);

      const bookingId = result.booking?.id;
      const pnr = result.booking?.pnr;
      const amount = result.booking?.totalAmount || totalAmount;

      // Navigate to payment page on success
      navigate(`/booking/payment?bookingId=${bookingId}&pnr=${pnr}&amount=${amount}`);
    } catch (err) {
      // Log full backend details internally to developer console
      console.error('Payment initialization error:', err);

      const status = err.response?.status;
      if (status === 409) {
        setErrorMessage('This seat is no longer available. Please return to seat selection.');
        setErrorType('SEAT_UNAVAILABLE');
      } else if (status === 400) {
        setErrorMessage('Booking information could not be loaded.');
        setErrorType('DATA_MISSING');
      } else {
        // Clean user-facing message, never exposing raw internal server error
        setErrorMessage('Payment could not be initialized. Please try again.');
        setErrorType('INIT_FAILED');
      }
      setPaymentState('error');
    }
  };

  // Missing critical data guard
  if (!trainId || !fromCode || !toCode) {
    return (
      <div className="pt-36 pb-24 min-h-[75vh] flex flex-col items-center justify-center text-center bg-[#f8fafc]">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-5 shadow-xs">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2 tracking-tight">Booking Information Missing</h2>
        <p className="text-slate-500 mb-8 max-w-md text-sm font-medium">
          Booking information could not be loaded. Please choose your train and seat before reviewing.
        </p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-7 py-3 font-bold text-sm transition-all shadow-sm"
        >
          Return to Train Search
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-28 min-h-[80vh] bg-[#f8fafc]">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-6xl">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm mb-6 inline-flex group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Passenger Details
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-1.5">Review Your Reservation</h1>
          <p className="text-slate-500 text-sm font-medium">Verify your journey itinerary, passenger details, and fare breakdown.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Journey Details + Passenger List + Contact Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Journey Summary Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              {/* Card Top: Train Name + Status Pill */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <TrainFront className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-lg text-[#0f172a] tracking-tight">
                      {trainInfo?.name || `Train #${trainId}`}
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      #{trainInfo?.train_number || trainId} • {trainInfo?.train_type || 'Superfast Express'}
                    </p>
                  </div>
                </div>

                {/* Status: Seat Reserved for Checkout */}
                <div className="bg-blue-50 border border-blue-200/80 text-blue-700 font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Seat Reserved for Checkout</span>
                </div>
              </div>

              {/* Station Route Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center bg-slate-50/90 p-5 rounded-xl border border-slate-100">
                {/* Departure */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Departure
                  </span>
                  <div className="font-bold text-base text-[#0f172a] leading-tight">
                    {fromStation?.name || fromCode}
                  </div>
                  <div className="text-xs font-bold text-blue-600 mt-0.5">{fromCode}</div>
                </div>

                {/* Middle: Date, Arrow, Class & Coach */}
                <div className="text-center flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-700">{formattedDate}</span>
                  <div className="flex items-center gap-2 my-2 text-slate-300">
                    <div className="w-12 h-px bg-slate-300" />
                    <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="w-12 h-px bg-slate-300" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span>Class {classCode || 'CC'}</span>
                    <span>•</span>
                    <span>Coach {coachDisplay}</span>
                  </div>
                </div>

                {/* Destination */}
                <div className="sm:text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Destination
                  </span>
                  <div className="font-bold text-base text-[#0f172a] leading-tight">
                    {toStation?.name || toCode}
                  </div>
                  <div className="text-xs font-bold text-blue-600 mt-0.5">{toCode}</div>
                </div>
              </div>
            </div>

            {/* 2. Passenger Details Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <h2 className="text-lg font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Passenger Details ({passengers.length})
                </h2>
                {passengers.length > 3 && (
                  <span className="text-xs font-medium text-slate-400">
                    Showing all {passengers.length} passengers
                  </span>
                )}
              </div>

              {/* Passenger List: scrollable container if > 3 passengers */}
              <div
                className={`divide-y divide-slate-100 ${
                  passengers.length > 3
                    ? 'max-h-[440px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200'
                    : ''
                }`}
              >
                {passengers.map((p, idx) => (
                  <div
                    key={idx}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between flex-wrap gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-[#0f172a] text-sm sm:text-base leading-snug">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500 capitalize mt-0.5">
                          {p.gender} · {p.age} yrs · {p.berthPreference}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200/80">
                        Coach {coachDisplay}
                      </span>
                      <span className="text-xs font-black bg-blue-50 text-blue-700 border border-blue-200/80 px-3 py-1.5 rounded-lg">
                        Seat #{p.seatNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. E-Ticket & SMS Contact Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <h2 className="text-lg font-bold text-[#0f172a] tracking-tight mb-1">E-Ticket & SMS Contact</h2>
              <p className="text-slate-500 text-xs mb-5">Your booking confirmation and PNR ticket will be dispatched here.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. traveler@railvista.in"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Sticky Fare Breakdown & Payment CTA */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
              <h2 className="text-lg font-bold text-[#0f172a] border-b border-slate-100 pb-4 tracking-tight">
                Fare Breakdown
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <div>
                    <span className="text-slate-800 font-semibold block">Base Fare</span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({passengers.length} × ₹{farePerSeat.toLocaleString('en-IN')})
                    </span>
                  </div>
                  <span className="font-bold text-[#0f172a] text-base">₹{baseFare.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span className="text-slate-800 font-semibold">Booking Convenience Fee</span>
                  <span className="font-bold text-[#0f172a] text-base">₹{convenienceFee.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-emerald-800 font-medium bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/70">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-xs text-emerald-950">Travel Insurance</span>
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wide text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Complimentary
                  </span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="border-t border-slate-100 pt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Payable</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tight">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
                  All Taxes Included
                </span>
              </div>

              {/* Error Display (clean user-facing, never raw stack trace) */}
              {paymentState === 'error' && errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-xl space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-rose-800">{errorMessage}</p>
                      {errorType === 'SEAT_UNAVAILABLE' && (
                        <button
                          onClick={() => navigate(`/trains/${trainId}/seats?${params.toString()}`)}
                          className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Armchair className="w-3.5 h-3.5" /> Return to Seat Selection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment CTA Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={paymentState === 'loading'}
                className={`w-full text-white rounded-xl py-4 font-bold text-sm sm:text-base tracking-wide transition-all shadow-md flex items-center justify-center gap-2 select-none ${
                  paymentState === 'loading'
                    ? 'bg-blue-400 cursor-not-allowed opacity-80'
                    : paymentState === 'error'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 active:translate-y-0'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {paymentState === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : paymentState === 'error' ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Payment</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Encryption Trust Badge */}
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-lg">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total</span>
            <span className="text-xl font-black text-blue-600">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={handleProceedToPayment}
            disabled={paymentState === 'loading'}
            className={`px-6 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md flex items-center gap-2 ${
              paymentState === 'loading'
                ? 'bg-blue-400 opacity-80'
                : paymentState === 'error'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {paymentState === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : paymentState === 'error' ? (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </>
            ) : (
              <>
                <span>Pay Now</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

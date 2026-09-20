import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, TrainFront, MapPin, Calendar, Armchair, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { CLASSES } from '../coachData';
import { MOCK_STATIONS } from '../components/BookingForm';

export default function PassengerDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const { trainId } = useParams();

  // Read all booking state from URL params
  const fromCode = searchParams.get('from') || '';
  const toCode = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengersCount = parseInt(searchParams.get('passengers') || '1', 10);
  const classCode = searchParams.get('class') || '';
  const coachId = searchParams.get('coach') || '';
  const seatsStr = searchParams.get('seats') || '';
  const seatIds = seatsStr ? seatsStr.split(',').map(s => s.trim()) : [];

  const selectedClassInfo = CLASSES.find(c => c.code === classCode);
  const fromStation = MOCK_STATIONS.find(s => s.code === fromCode);
  const toStation = MOCK_STATIONS.find(s => s.code === toCode);

  const farePerSeat = selectedClassInfo?.fare || 0;
  const totalFare = farePerSeat * seatIds.length;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Determine berth preference options based on class
  const berthOptions = useMemo(() => {
    if (['3A', 'SL'].includes(classCode)) {
      return ['No Preference', 'Lower Berth', 'Middle Berth', 'Upper Berth', 'Side Lower', 'Side Upper'];
    }
    if (['2A', '1A'].includes(classCode)) {
      return ['No Preference', 'Lower Berth', 'Upper Berth', 'Side Lower', 'Side Upper'];
    }
    // For chair/bench classes, no berth preference
    return [];
  }, [classCode]);

  const isSleeper = ['1A', '2A', '3A', 'SL'].includes(classCode);

  // Initialize passenger forms – one per seat selected
  const [passengers, setPassengers] = useState(
    seatIds.map((seatId, idx) => ({
      seatId,
      name: '',
      age: '',
      gender: '',
      berthPreference: '',
    }))
  );

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
    // Clear error for this field
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors = {};
    passengers.forEach((p, i) => {
      if (!p.name.trim()) newErrors[`${i}-name`] = 'Full name is required';
      const age = parseInt(p.age, 10);
      if (!p.age || isNaN(age) || age < 1 || age > 120) newErrors[`${i}-age`] = 'Enter a valid age (1–120)';
      if (!p.gender) newErrors[`${i}-gender`] = 'Please select gender';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    setSubmitted(true);
    if (validate()) {
      searchParams.set('trainId', trainId);
      // Encode passenger data into URL (lightweight for review page)
      const passengerData = passengers.map(p => `${p.name}|${p.age}|${p.gender}|${p.berthPreference || 'none'}|${p.seatId}`);
      searchParams.set('passengerData', passengerData.join(';;'));
      navigate(`/booking/review?${searchParams.toString()}`);
    }
  };

  const errorCount = Object.keys(errors).length;

  // Missing params guard
  if (!classCode || !coachId || seatIds.length === 0) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-stone-400" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-3">Missing Booking Information</h2>
        <p className="text-stone-500 font-medium mb-8 max-w-md">
          It looks like you haven't completed the seat selection step. Please go back and select your seats first.
        </p>
        <Link
          to="/"
          className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl px-8 py-3.5 font-bold transition-all shadow-lg"
        >
          Start New Search
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-28 pb-24 min-h-[70vh] bg-stone-50"
    >
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-6"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Seat Selection
        </button>

        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-stone-900 mb-2">Passenger Details</h2>
          <p className="text-stone-500 font-medium">
            Enter details for {seatIds.length} passenger{seatIds.length > 1 ? 's' : ''}.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-10">

          {/* ===== MAIN FORM AREA ===== */}
          <div className="xl:w-2/3 space-y-8">

            {/* Passenger Cards */}
            {passengers.map((p, index) => (
              <div
                key={p.seatId}
                className="bg-white border border-stone-200/60 rounded-[2rem] p-8 lg:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden"
              >
                {/* Left accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-700"></div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-5">
                  <h3 className="text-xl font-bold text-stone-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-stone-500" />
                    </div>
                    Passenger {index + 1}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-50 border border-rose-100 px-4 py-1.5 rounded-lg">
                      <span className="text-rose-800 font-bold text-sm">Seat {p.seatId}</span>
                    </div>
                    <div className="bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg">
                      <span className="text-stone-600 font-bold text-xs">{coachId}</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                  {/* Full Name */}
                  <div className="md:col-span-6">
                    <label className="block text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="As per government ID"
                      value={p.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                      className={`w-full bg-stone-50 border ${errors[`${index}-name`] ? 'border-rose-500 bg-rose-50/30' : 'border-stone-200'} rounded-xl px-4 py-3.5 text-stone-900 font-medium focus:bg-white focus:outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-700/10 transition-all`}
                    />
                    {errors[`${index}-name`] && (
                      <span className="text-rose-600 text-xs font-bold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors[`${index}-name`]}
                      </span>
                    )}
                  </div>

                  {/* Age */}
                  <div className="md:col-span-3">
                    <label className="block text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
                      Age <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Years"
                      value={p.age}
                      onChange={(e) => handleChange(index, 'age', e.target.value)}
                      className={`w-full bg-stone-50 border ${errors[`${index}-age`] ? 'border-rose-500 bg-rose-50/30' : 'border-stone-200'} rounded-xl px-4 py-3.5 text-stone-900 font-medium focus:bg-white focus:outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-700/10 transition-all`}
                    />
                    {errors[`${index}-age`] && (
                      <span className="text-rose-600 text-xs font-bold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors[`${index}-age`]}
                      </span>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="md:col-span-3">
                    <label className="block text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
                      Gender <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={p.gender}
                      onChange={(e) => handleChange(index, 'gender', e.target.value)}
                      className={`w-full bg-stone-50 border ${errors[`${index}-gender`] ? 'border-rose-500 bg-rose-50/30' : 'border-stone-200'} rounded-xl px-4 py-3.5 text-stone-900 font-medium focus:bg-white focus:outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-700/10 transition-all appearance-none`}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors[`${index}-gender`] && (
                      <span className="text-rose-600 text-xs font-bold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors[`${index}-gender`]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Berth Preference (only for sleeper classes) */}
                {isSleeper && berthOptions.length > 0 && (
                  <div className="max-w-sm">
                    <label className="block text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
                      Berth Preference
                    </label>
                    <select
                      value={p.berthPreference}
                      onChange={(e) => handleChange(index, 'berthPreference', e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-stone-900 font-medium focus:bg-white focus:outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-700/10 transition-all appearance-none"
                    >
                      <option value="">No Preference</option>
                      {berthOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-stone-400 mt-1.5 font-medium">
                      Preference only; actual berth is already assigned as Seat {p.seatId}.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="xl:w-1/3">
            <div className="sticky top-28 space-y-6">

              {/* Journey Summary Card */}
              <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center justify-between border-b border-stone-100 pb-4">
                  Booking Summary
                  <TrainFront className="w-5 h-5 text-stone-400" />
                </h3>

                <div className="space-y-4 text-sm">
                  {/* Journey */}
                  <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                    <MapPin className="w-4 h-4 text-rose-700 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-stone-900">
                        {fromStation?.city || fromCode} → {toStation?.city || toCode}
                      </div>
                      <div className="text-stone-400 text-xs mt-0.5">
                        {fromStation?.name || ''} to {toStation?.name || ''}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                    <Calendar className="w-4 h-4 text-rose-700 flex-shrink-0" />
                    <div className="font-bold text-stone-900">{formatDate(date)}</div>
                  </div>

                  {/* Class & Coach */}
                  <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                    <Armchair className="w-4 h-4 text-rose-700 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-stone-900">
                        {classCode} — {selectedClassInfo?.name || classCode}
                      </div>
                      <div className="text-stone-400 text-xs mt-0.5">Coach {coachId}</div>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="pb-4 border-b border-stone-100">
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-2">Selected Seats</div>
                    <div className="flex flex-wrap gap-2">
                      {seatIds.map(id => (
                        <span key={id} className="bg-rose-50 border border-rose-100 text-rose-800 font-bold text-sm px-3 py-1.5 rounded-lg">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare Summary Card */}
              <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <h3 className="text-lg font-bold text-stone-900 mb-6 border-b border-stone-100 pb-4">Fare Details</h3>
                <div className="space-y-3 mb-6">
                  {seatIds.map(id => (
                    <div key={id} className="flex justify-between text-sm font-medium">
                      <span className="text-stone-500">Seat {id} ({coachId})</span>
                      <span className="text-stone-900">₹{farePerSeat}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6">
                  <span className="text-stone-500 font-bold uppercase tracking-wider text-xs">Total Amount</span>
                  <span className="text-2xl font-black text-rose-800">₹{totalFare}</span>
                </div>

                {/* Validation error summary */}
                {submitted && errorCount > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span className="text-rose-700 text-xs font-bold">
                      {errorCount} field{errorCount > 1 ? 's' : ''} require{errorCount === 1 ? 's' : ''} attention
                    </span>
                  </div>
                )}

                <button
                  onClick={handleContinue}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-2xl py-4 font-bold text-lg tracking-wide transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2"
                >
                  Continue to Review <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Mail, Phone, ShieldCheck, Heart, Train, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PassengerDetails({ seats = [], coachId, classCode, fare, onBack, onContinue }) {
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [passengers, setPassengers] = useState(
    seats.map(seatId => ({
      seatId,
      name: '',
      age: '',
      gender: '',
      idType: '',
      specialAssistance: false,
    }))
  );

  const [errors, setErrors] = useState({});

  const handlePassengerChange = (index, field, value) => {
    const newPass = [...passengers];
    newPass[index][field] = value;
    setPassengers(newPass);
    if (errors[`${index}-${field}`]) {
      setErrors({ ...errors, [`${index}-${field}`]: null });
    }
  };

  const handleContactChange = (field, value) => {
    setContact({ ...contact, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!contact.email.includes('@')) newErrors.email = 'Valid email required';
    if (contact.phone.length < 10) newErrors.phone = 'Valid phone required';
    
    passengers.forEach((p, i) => {
      if (!p.name.trim()) newErrors[`${i}-name`] = 'Required';
      if (!p.age || p.age < 1 || p.age > 120) newErrors[`${i}-age`] = 'Invalid age';
      if (!p.gender) newErrors[`${i}-gender`] = 'Required';
      if (!p.idType) newErrors[`${i}-idType`] = 'Required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onContinue({ contact, passengers });
    }
  };

  const taxes = seats.length * 15;
  const baseTotal = seats.length * fare;
  const grandTotal = baseTotal + taxes;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#faf9f6] py-16 min-h-screen"
    >
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-10"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Seat Selection
        </button>

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-stone-900 mb-2">Passenger Details</h2>
          <p className="text-stone-500 font-medium">Please enter details for all {seats.length} passengers.</p>
        </div>

        <div className="flex flex-col xl:flex-row gap-10">
          
          {/* Main Form Area */}
          <div className="xl:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Contact Details */}
              <div className="bg-white border border-stone-200/60 rounded-[2rem] p-8 lg:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-700"></div>
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-rose-700" /> Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="receipts@example.com"
                      value={contact.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className={`w-full bg-stone-50 border ${errors.email ? 'border-rose-600' : 'border-stone-200'} rounded-xl px-4 py-3 text-stone-900 focus:bg-white focus:outline-none focus:border-rose-700 transition-colors`}
                    />
                    {errors.email && <span className="text-rose-600 text-xs font-bold mt-1 block">{errors.email}</span>}
                  </div>
                  <div>
                    <label className="block text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 000-0000"
                      value={contact.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className={`w-full bg-stone-50 border ${errors.phone ? 'border-rose-600' : 'border-stone-200'} rounded-xl px-4 py-3 text-stone-900 focus:bg-white focus:outline-none focus:border-rose-700 transition-colors`}
                    />
                    {errors.phone && <span className="text-rose-600 text-xs font-bold mt-1 block">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Passenger Cards */}
              <div className="space-y-6">
                {passengers.map((p, index) => (
                  <div key={p.seatId} className="bg-white border border-stone-200/60 rounded-[2rem] p-8 lg:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                    <div className="flex items-center justify-between mb-6 border-b border-stone-100 pb-4">
                      <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-stone-400" /> Passenger {index + 1}
                      </h3>
                      <div className="bg-rose-50 border border-rose-100 px-3 py-1 rounded-lg">
                        <span className="text-rose-800 font-bold text-sm">Seat {p.seatId}</span>
                        <span className="text-stone-500 text-xs ml-2">({coachId})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                      <div className="md:col-span-6">
                        <label className="block text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="As per official ID"
                          value={p.name}
                          onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                          className={`w-full bg-stone-50 border ${errors[`${index}-name`] ? 'border-rose-600' : 'border-stone-200'} rounded-xl px-4 py-3 text-stone-900 focus:bg-white focus:outline-none focus:border-rose-700 transition-colors`}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Age</label>
                        <input 
                          type="number" 
                          min="1" max="120"
                          placeholder="Years"
                          value={p.age}
                          onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                          className={`w-full bg-stone-50 border ${errors[`${index}-age`] ? 'border-rose-600' : 'border-stone-200'} rounded-xl px-4 py-3 text-stone-900 focus:bg-white focus:outline-none focus:border-rose-700 transition-colors`}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Gender</label>
                        <select 
                          value={p.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                          className={`w-full bg-stone-50 border ${errors[`${index}-gender`] ? 'border-rose-600' : 'border-stone-200'} rounded-xl px-4 py-3 text-stone-900 focus:bg-white focus:outline-none focus:border-rose-700 transition-colors appearance-none`}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">ID Verification</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                          <select 
                            value={p.idType}
                            onChange={(e) => handlePassengerChange(index, 'idType', e.target.value)}
                            className={`w-full bg-stone-50 border ${errors[`${index}-idType`] ? 'border-rose-600' : 'border-stone-200'} rounded-xl pl-12 pr-4 py-3 text-stone-900 focus:bg-white focus:outline-none focus:border-rose-700 transition-colors appearance-none`}
                          >
                            <option value="">Select ID Type</option>
                            <option value="passport">Passport</option>
                            <option value="license">Driver's License</option>
                            <option value="national_id">National ID</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${p.specialAssistance ? 'bg-rose-700 border-rose-700' : 'bg-stone-50 border-stone-300 group-hover:border-stone-400'}`}>
                            {p.specialAssistance && <Heart className="w-4 h-4 text-white" />}
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={p.specialAssistance}
                            onChange={(e) => handlePassengerChange(index, 'specialAssistance', e.target.checked)}
                          />
                          <span className="text-sm font-bold text-stone-600 group-hover:text-stone-900 transition-colors">Request Special Assistance</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </form>
          </div>

          {/* Sticky Sidebar */}
          <div className="xl:w-1/3">
            <div className="sticky top-10 space-y-6">
              
              {/* Journey Summary */}
              <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center justify-between border-b border-stone-100 pb-4">
                  Journey Summary
                  <Train className="w-5 h-5 text-stone-400" />
                </h3>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-black text-stone-900">NYP</div>
                    <div className="text-xs text-stone-500 font-bold mt-1">08:00 AM</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">3h 45m</div>
                    <div className="w-full h-px bg-stone-200 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-700"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-stone-900">WAS</div>
                    <div className="text-xs text-stone-500 font-bold mt-1">11:45 AM</div>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 mb-2 border border-stone-100">
                  <div className="text-sm text-stone-500 font-bold mb-1">AeroExpress 104</div>
                  <div className="text-stone-900 font-black">{classCode} Class</div>
                </div>
              </div>

              {/* Fare Summary */}
              <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <h3 className="text-lg font-bold text-stone-900 mb-6 border-b border-stone-100 pb-4">Fare Details</h3>
                
                <div className="space-y-3 mb-6">
                  {seats.map(id => (
                    <div key={id} className="flex justify-between text-sm font-medium">
                      <span className="text-stone-500">Seat {id} ({coachId})</span>
                      <span className="text-stone-900">${fare}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium pt-3 border-t border-stone-100">
                    <span className="text-stone-500">Taxes & Fees</span>
                    <span className="text-stone-900">${taxes}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6">
                  <span className="text-stone-500 font-bold uppercase tracking-wider text-xs">Total Amount</span>
                  <span className="text-2xl font-black text-rose-800">${grandTotal}</span>
                </div>

                <button 
                  onClick={handleSubmit}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-2xl py-4 font-bold text-lg tracking-wide transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2"
                >
                  Continue to Review <ArrowRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </motion.section>
  );
}

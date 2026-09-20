import React, { useState } from 'react';
import { ChevronLeft, Train, Calendar, User, ShieldCheck, CreditCard, Building2, Smartphone, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutReview({ bookingData, passengerData, onBack, onComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { seats, coachId, classCode, fare } = bookingData;
  const { passengers, contact } = passengerData;

  const baseFare = seats.length * fare;
  const taxes = seats.length * 15;
  const convenienceFee = 5;
  const grandTotal = baseFare + taxes + convenienceFee;

  const handlePayment = () => {
    setIsProcessing(true);
    // Mock processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div className="bg-[#faf9f6] min-h-[80vh] flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-emerald-200/60 p-12 rounded-[2rem] flex flex-col items-center text-center max-w-md shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)]"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 mb-2">Booking Confirmed!</h2>
          <p className="text-emerald-700 font-medium mb-6">PNR: 8492749102</p>
          <p className="text-stone-500 text-sm">Your tickets have been sent to <br/><span className="text-stone-900 font-bold">{contact.email}</span></p>
        </motion.div>
      </div>
    );
  }

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
          disabled={isProcessing}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-10 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Passenger Details
        </button>

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-stone-900 mb-2">Review & Pay</h2>
          <p className="text-stone-500 font-medium">Verify your itinerary and complete payment.</p>
        </div>

        <div className="flex flex-col xl:flex-row gap-10">
          
          {/* Left Column: Itinerary & Passengers */}
          <div className="xl:w-2/3 space-y-6">
            
            {/* Itinerary Summary */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 border-b border-stone-100 pb-4">
                <Train className="w-5 h-5 text-rose-700" /> Journey Itinerary
              </h3>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="text-sm font-bold text-rose-700 uppercase tracking-wider mb-1">AeroExpress 104</div>
                  <div className="text-2xl font-black text-stone-900 flex items-center gap-3">
                    NYP <ArrowRight className="w-5 h-5 text-stone-400" /> WAS
                  </div>
                </div>
                <div className="flex items-center gap-6 bg-stone-50 px-6 py-4 rounded-xl border border-stone-200">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</span>
                    <span className="text-stone-900 font-bold">14 Oct 2026</span>
                  </div>
                  <div className="w-px h-8 bg-stone-200"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">Class</span>
                    <span className="text-stone-900 font-bold">{classCode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Summary */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 border-b border-stone-100 pb-4">
                <User className="w-5 h-5 text-rose-700" /> Passenger Information
              </h3>
              
              <div className="space-y-4">
                {passengers.map((p, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-50 border border-stone-200 p-4 rounded-xl">
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-600">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-stone-900 font-bold">{p.name}</div>
                        <div className="text-stone-500 text-xs">{p.age} yrs • {p.gender}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-white border border-stone-200 px-3 py-1.5 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-[9px] text-stone-500 uppercase font-bold">Coach</span>
                        <span className="text-stone-900 font-bold text-sm">{coachId}</span>
                      </div>
                      <div className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-[9px] text-rose-800 uppercase font-bold">Seat</span>
                        <span className="text-rose-800 font-bold text-sm">{p.seatId}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Right Column: Payment & Fare */}
          <div className="xl:w-1/3 space-y-6">
            
            {/* Fare Summary */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <h3 className="text-lg font-bold text-stone-900 mb-6 border-b border-stone-100 pb-4">Fare Breakdown</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-stone-500">Base Fare ({seats.length} Tickets)</span>
                  <span className="text-stone-900">₹{baseFare}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-stone-500">Taxes & GST</span>
                  <span className="text-stone-900">₹{taxes}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-stone-500">Convenience Fee</span>
                  <span className="text-stone-900">₹{convenienceFee}</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-stone-500 font-bold uppercase tracking-wider text-xs">Total Payable</span>
                <span className="text-3xl font-black text-rose-800">₹{grandTotal}</span>
              </div>
            </div>

            {/* Payment UI */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Secure Payment
              </h3>
              
              <div className="flex rounded-xl bg-stone-50 p-1 mb-6 border border-stone-200">
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'card' ? 'bg-white text-stone-900 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  <CreditCard className="w-4 h-4" /> Card
                </button>
                <button 
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'upi' ? 'bg-white text-stone-900 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  <Smartphone className="w-4 h-4" /> UPI
                </button>
                <button 
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'netbanking' ? 'bg-white text-stone-900 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  <Building2 className="w-4 h-4" /> NetBank
                </button>
              </div>

              {/* Mock Input Area based on method */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6 h-32 flex items-center justify-center">
                {paymentMethod === 'card' && (
                  <div className="w-full space-y-3">
                    <input type="text" placeholder="Card Number" className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-rose-700" />
                    <div className="flex gap-3">
                      <input type="text" placeholder="MM/YY" className="w-1/2 bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-rose-700" />
                      <input type="text" placeholder="CVV" className="w-1/2 bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-rose-700" />
                    </div>
                  </div>
                )}
                {paymentMethod === 'upi' && (
                  <div className="w-full text-center">
                    <input type="text" placeholder="Enter UPI ID (e.g. name@bank)" className="w-full bg-white border border-stone-200 rounded-lg px-3 py-3 text-sm text-stone-900 focus:outline-none focus:border-rose-700 text-center" />
                  </div>
                )}
                {paymentMethod === 'netbanking' && (
                  <div className="w-full text-center">
                    <select className="w-full bg-white border border-stone-200 rounded-lg px-3 py-3 text-sm text-stone-900 focus:outline-none focus:border-rose-700 appearance-none text-center">
                      <option>Select Bank</option>
                      <option>Chase</option>
                      <option>Bank of America</option>
                      <option>Wells Fargo</option>
                    </select>
                  </div>
                )}
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-2xl py-4 font-bold text-lg tracking-wide transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-stone-200 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Pay ₹{grandTotal} <Lock className="w-4 h-4 ml-1" /></>
                )}
              </button>
              
            </div>

          </div>
        </div>
      </div>
    </motion.section>
  );
}

const ArrowRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CreditCard, QrCode, Building2, ShieldCheck, CheckCircle2, Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { payBooking } from '../service/api';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const bookingId = params.get('bookingId');
  const pnr = params.get('pnr');
  const amount = Number(params.get('amount')) || 0;

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    if (e) e.preventDefault();
    if (!bookingId) {
      setError('Missing booking identification. Please return and create a booking.');
      return;
    }

    setPaying(true);
    setError('');

    try {
      const result = await payBooking(bookingId, paymentMethod);
      const txnId = result.transactionId || `TXN${Date.now()}`;
      navigate(`/booking/confirmation?bookingId=${bookingId}&pnr=${pnr}&transactionId=${txnId}`);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment authorization failed. Please try another method.');
    } finally {
      setPaying(false);
    }
  };

  if (!bookingId || !pnr) {
    return (
      <div className="pt-36 pb-24 min-h-[70vh] flex flex-col items-center justify-center text-center bg-[#faf9f6]">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Invalid Payment Request</h2>
        <p className="text-stone-500 mb-8 max-w-md">No pending booking was found for payment. Please create a booking first.</p>
        <Link to="/" className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl px-8 py-3.5 font-bold transition-all shadow-md">
          Return to Home
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
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-6 inline-flex"
        >
          <ArrowLeft className="w-5 h-5" /> Cancel and Return
        </button>

        {/* Order Banner */}
        <div className="bg-white border border-stone-200/80 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">IRCTC Gateway</span>
              <h1 className="text-2xl font-black text-stone-900 mt-0.5">Secure Railway Checkout</h1>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-stone-500 font-semibold block">Total Payable</span>
              <span className="text-3xl font-black text-blue-600">₹{amount}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-stone-600 pt-4 flex-wrap gap-2">
            <div>PNR: <span className="font-mono font-bold text-stone-900">{pnr}</span></div>
            <div>Booking Ref: <span className="font-mono text-stone-900">#{bookingId}</span></div>
            <div className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded flex items-center gap-1">
              <Lock className="w-3 h-3" /> Encrypted Transaction
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border border-stone-200/80 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-8">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'UPI', label: 'UPI / QR', icon: QrCode },
              { id: 'CARD', label: 'Cards', icon: CreditCard },
              { id: 'NETBANKING', label: 'Net Banking', icon: Building2 },
            ].map(method => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all text-center
                    ${isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/15'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-stone-400'}`} />
                  <span className="text-xs font-bold">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Method 1: UPI */}
          {paymentMethod === 'UPI' && (
            <div className="space-y-6 pt-2">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center">
                <div className="w-36 h-36 mx-auto bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-center mb-3">
                  <QrCode className="w-28 h-28 text-stone-900" />
                </div>
                <p className="text-xs font-bold text-stone-700">Scan QR using any UPI App</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Google Pay • PhonePe • Paytm • BHIM</p>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-stone-400 uppercase">Or Enter VPA</span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  placeholder="e.g. mobileNumber@upi / yourname@okhdfcbank"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
            </div>
          )}

          {/* Method 2: Cards */}
          {paymentMethod === 'CARD' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Card Number</label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="4532 •••• •••• 8821"
                  value={cardDetails.number}
                  onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Valid Thru</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">CVV / CVC</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cardDetails.cvv}
                    onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Name on Card</label>
                <input
                  type="text"
                  placeholder="Name as printed on card"
                  value={cardDetails.name}
                  onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-sm font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
            </div>
          )}

          {/* Method 3: Net Banking */}
          {paymentMethod === 'NETBANKING' && (
            <div className="space-y-4 pt-2">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Popular Banks</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map(bank => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center
                      ${selectedBank === bank
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'}`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-4 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-4 font-bold text-lg tracking-wide transition-all shadow-md shadow-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            {paying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing ₹{amount}…
              </>
            ) : (
              <>
                Authorize & Pay ₹{amount}
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            RBI Compliant • IRCTC Authorized Payment Gateway
          </div>
        </div>
      </div>
    </motion.div>
  );
}

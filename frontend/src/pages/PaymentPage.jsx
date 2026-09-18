import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { payBooking } from '../service/api';

export default function PaymentPage() {
  const params = new URLSearchParams(useLocation().search); const navigate = useNavigate();
  const [method, setMethod] = useState('DEMO_CARD'); const [error, setError] = useState(''); const [paying, setPaying] = useState(false);
  const pay = async () => { setPaying(true); setError(''); try { const result = await payBooking(params.get('bookingId'), method); navigate(`/booking/confirmation?bookingId=${result.bookingId}&pnr=${result.pnr}&transactionId=${result.transactionId}`); } catch (err) { setError(err.response?.data?.message || 'Payment failed.'); } finally { setPaying(false); } };
  return <div className="pt-32 pb-24 min-h-[70vh]"><div className="container mx-auto px-6 max-w-lg"><h2 className="text-3xl font-bold mb-2">Payment</h2><p className="text-stone-500 mb-8">Booking {params.get('pnr')} · ₹{params.get('amount')}</p><div className="bg-white border rounded-2xl p-8 space-y-5"><select value={method} onChange={e => setMethod(e.target.value)} className="w-full border rounded-lg p-3"><option value="DEMO_CARD">Demo card</option><option value="UPI">UPI</option><option value="NETBANKING">Net banking</option></select>{error && <p className="text-rose-700">{error}</p>}<button onClick={pay} disabled={paying} className="w-full bg-stone-900 text-white rounded-xl py-3 font-bold disabled:opacity-50">{paying ? 'Processing…' : `Pay ₹${params.get('amount')}`}</button></div></div></div>;
}

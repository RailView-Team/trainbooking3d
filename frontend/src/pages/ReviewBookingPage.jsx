import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking } from '../service/api';

export default function ReviewBookingPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const seats = (params.get('seats') || '').split(',').filter(Boolean).map(Number);
  const passengers = (params.get('passengerData') || '').split(';;').filter(Boolean).map(value => {
    const [name, age, gender, berthPreference, seatId] = value.split('|');
    return { name: decodeURIComponent(name || ''), age: Number(age), gender, berthPreference: decodeURIComponent(berthPreference || ''), seatId };
  });
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    if (!contactEmail || !contactPhone) { setError('Email and phone are required.'); return; }
    setSubmitting(true); setError('');
    try {
      const result = await createBooking({ trainId: Number(params.get('trainId') || window.location.pathname.split('/')[2]), from: params.get('from'), to: params.get('to'), date: params.get('date'), classCode: params.get('class'), coachId: Number(params.get('coach')), seats, passengers, contactEmail, contactPhone });
      navigate(`/booking/payment?bookingId=${result.booking.id}&pnr=${result.booking.pnr}&amount=${result.booking.totalAmount}`);
    } catch (err) { setError(err.response?.data?.message || 'Unable to create booking.'); }
    finally { setSubmitting(false); }
  };
  return <div className="pt-32 pb-24 min-h-[70vh]"><div className="container mx-auto px-6 max-w-3xl"><h2 className="text-3xl font-bold text-stone-900 mb-2">Review Booking</h2><p className="text-stone-500 mb-8">{params.get('from')} → {params.get('to')} · {params.get('date')}</p><div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-6"><div><h3 className="font-bold mb-2">Passengers</h3>{passengers.map(p => <div key={p.seatId} className="text-sm text-stone-600">{p.name}, {p.age} · Seat {p.seatId}</div>)}</div><div><h3 className="font-bold mb-2">Contact details</h3><div className="grid gap-3"><input value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" placeholder="Email" className="border rounded-lg p-3" /><input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="Phone" className="border rounded-lg p-3" /></div></div>{error && <p className="text-rose-700 font-medium">{error}</p>}<button onClick={submit} disabled={submitting} className="w-full bg-rose-700 text-white rounded-xl py-3 font-bold disabled:opacity-50">{submitting ? 'Creating booking…' : 'Continue to payment'}</button></div></div></div>;
}

import React, { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBooking } from '../service/api';

export default function ConfirmationPage() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  useEffect(() => {
    const bookingId = params.get('bookingId');
    if (!bookingId) return;
    getBooking(bookingId).then((booking) => {
      const saved = JSON.parse(localStorage.getItem('aerorail.bookings') || '[]');
      const item = { id: booking.id, pnr: booking.pnr, train: booking.train.name, route: { from: booking.route.from.code, to: booking.route.to.code }, date: new Date(booking.createdAt).toLocaleDateString(), time: new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), coach: booking.coach.code, seats: booking.seats.map(seat => seat.seat_number), class: booking.coach.classCode, status: 'upcoming', amount: `₹${booking.totalAmount}` };
      localStorage.setItem('aerorail.bookings', JSON.stringify([item, ...saved.filter(existing => existing.id !== item.id)]));
    }).catch(() => {});
  }, [params]);
  return <div className="pt-32 pb-24 min-h-[70vh] flex justify-center"><div className="bg-white border rounded-2xl p-12 text-center max-w-md"><h2 className="text-3xl font-bold mb-4 text-emerald-700">Booking Confirmed</h2><p className="text-stone-600 mb-2">PNR: <strong>{params.get('pnr')}</strong></p><p className="text-stone-500 text-sm mb-8">Transaction: {params.get('transactionId')}</p><Link to="/" className="bg-stone-900 text-white rounded-xl px-6 py-3 font-bold">Return Home</Link></div></div>;
}

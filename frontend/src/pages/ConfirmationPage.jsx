import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function ConfirmationPage() {
  return (
    <div className="pt-32 pb-24 min-h-[70vh] flex flex-col items-center justify-center">
      <div className="bg-white border border-stone-200/60 rounded-[2rem] p-12 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-stone-900 mb-4">Booking Confirmed</h2>
        <p className="text-stone-400 text-sm mb-8">Confirmation details will be available in Phase 2.</p>
        <Link to="/" className="bg-stone-900 hover:bg-stone-800 text-white rounded-xl px-8 py-3.5 font-bold transition-all shadow-lg">
          Return Home
        </Link>
      </div>
    </div>
  );
}

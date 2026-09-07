import React from 'react';
import { ChevronLeft, ClipboardList } from 'lucide-react';

export default function ReviewBookingPage() {
  return (
    <div className="pt-32 pb-24 min-h-[70vh]">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-10">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <div className="bg-white border border-stone-200/60 rounded-[2rem] p-12 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-center">
          <div className="w-20 h-20 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-8 h-8 text-stone-500" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 mb-4">Review Booking</h2>
          <p className="text-stone-400 text-sm">Booking review will be available in Phase 2.</p>
        </div>
      </div>
    </div>
  );
}

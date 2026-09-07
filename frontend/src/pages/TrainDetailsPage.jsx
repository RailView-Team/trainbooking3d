import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, TrainFront, ArrowRight } from 'lucide-react';

export default function TrainDetailsPage() {
  const { trainId } = useParams();
  const location = useLocation();

  return (
    <div className="pt-32 pb-24 min-h-[70vh]">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <Link
          to={-1}
          onClick={(e) => { e.preventDefault(); window.history.back(); }}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-10"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Results
        </Link>

        <div className="bg-white border border-stone-200/60 rounded-[2rem] p-12 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-center">
          <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-6">
            <TrainFront className="w-8 h-8 text-rose-700" />
          </div>
          <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Train ID</div>
          <h2 className="text-3xl font-bold text-stone-900 mb-4">{trainId}</h2>
          <p className="text-stone-500 font-medium mb-8 max-w-md mx-auto">
            Train details, route schedule, and class selection will be available in Phase 2.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/"
              className="bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl px-6 py-3 font-bold text-sm transition-all"
            >
              Return Home
            </Link>
            <Link
              to={`/trains/${trainId}/class${location.search}`}
              className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl px-6 py-3 font-bold text-sm transition-all shadow-lg flex items-center gap-2"
            >
              Select Class <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

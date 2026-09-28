import React from 'react';
import { TrainFront, Globe, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-950 pt-20 pb-10 border-t border-stone-900 relative z-10">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 text-white font-black text-2xl mb-4 tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
                <TrainFront className="w-5 h-5" />
              </div>
              Rail<span className="text-blue-500">Vista</span>
            </div>
            <p className="text-stone-400 text-sm mb-6 max-w-sm leading-relaxed">
              The premier platform for high-speed transit. Experience transparent bookings, 3D seat previews, and seamless journeys.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-700 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-700 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-700 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Search Trains</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">3D Seat Maps</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Smart Recommendations</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Manage Booking</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Accessibility</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-stone-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone-500 text-sm">
            &copy; {new Date().getFullYear()} RailVista Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-stone-500">
            <span>Official Railway Reservations</span>
            <span className="w-1.5 h-1.5 rounded-full bg-stone-800"></span>
            <span>Designed for Premium Travel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

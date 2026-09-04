import React, { useState, useEffect } from 'react'
import { TrainFront, Menu } from 'lucide-react'

export default function Navbar({ onNavigate, currentView }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-stone-200 py-4 shadow-sm' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <TrainFront className={`w-8 h-8 transition-colors duration-500 ${scrolled ? 'text-rose-700' : 'text-rose-600'}`} />
          <span className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-stone-900' : 'text-white'}`}>
            AERO<span className={scrolled ? 'text-rose-700' : 'text-rose-600'}>RAIL</span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-10">
          <button 
            onClick={() => onNavigate && onNavigate('HOME')}
            className={`text-sm font-medium tracking-wide transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-current after:transition-all ${currentView === 'HOME' ? (scrolled ? 'text-stone-900 after:w-full' : 'text-white after:w-full') : (scrolled ? 'text-stone-500 hover:text-stone-900 after:w-0 hover:after:w-full' : 'text-white/70 hover:text-white after:w-0 hover:after:w-full')}`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('BOOKINGS')}
            className={`text-sm font-medium tracking-wide transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-current after:transition-all ${currentView === 'BOOKINGS' ? (scrolled ? 'text-stone-900 after:w-full' : 'text-white after:w-full') : (scrolled ? 'text-stone-500 hover:text-stone-900 after:w-0 hover:after:w-full' : 'text-white/70 hover:text-white after:w-0 hover:after:w-full')}`}
          >
            My Bookings
          </button>
          {['Search Trains', '3D Seats', 'About'].map((link) => (
            <button 
              key={link} 
              onClick={() => onNavigate && onNavigate('HOME')}
              className={`text-sm font-medium tracking-wide transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-current after:transition-all ${scrolled ? 'text-stone-500 hover:text-stone-900 hover:after:w-full' : 'text-white/70 hover:text-white hover:after:w-full'}`}
            >
              {link}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-8">
          <button className={`text-sm font-medium tracking-wide transition-colors ${scrolled ? 'text-stone-500 hover:text-stone-900' : 'text-white/70 hover:text-white'}`}>
            Sign In
          </button>
          <button className={`px-6 py-2.5 text-sm font-semibold tracking-wide rounded-full transition-all duration-300 border shadow-sm ${scrolled ? 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800' : 'bg-white text-stone-900 border-white hover:bg-white/90'}`}>
            Register
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className={`lg:hidden p-2 transition-colors ${scrolled ? 'text-stone-900' : 'text-white'}`}>
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  )
}

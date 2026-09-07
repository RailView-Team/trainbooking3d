import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TrainFront, Menu } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // On non-home pages, always show the solid navbar style
  const isTransparent = isHomePage && !scrolled

  const linkClass = (active) => {
    if (active) {
      return `text-sm font-medium tracking-wide transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-current after:transition-all after:w-full ${isTransparent ? 'text-white' : 'text-stone-900'}`
    }
    return `text-sm font-medium tracking-wide transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-current after:transition-all hover:after:w-full ${isTransparent ? 'text-white/70 hover:text-white' : 'text-stone-500 hover:text-stone-900'}`
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isTransparent 
          ? 'bg-transparent border-transparent py-6' 
          : 'bg-white/95 backdrop-blur-md border-stone-200 py-4 shadow-sm'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <TrainFront className={`w-8 h-8 transition-colors duration-500 ${isTransparent ? 'text-rose-600' : 'text-rose-700'}`} />
          <span className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-stone-900'}`}>
            AERO<span className={isTransparent ? 'text-rose-600' : 'text-rose-700'}>RAIL</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-10">
          <Link to="/" className={linkClass(location.pathname === '/')}>
            Home
          </Link>
          <Link to="/bookings" className={linkClass(location.pathname === '/bookings')}>
            My Bookings
          </Link>
          {['Search Trains', '3D Seats', 'About'].map((label) => (
            <Link 
              key={label} 
              to="/"
              className={linkClass(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-8">
          <button className={`text-sm font-medium tracking-wide transition-colors ${isTransparent ? 'text-white/70 hover:text-white' : 'text-stone-500 hover:text-stone-900'}`}>
            Sign In
          </button>
          <button className={`px-6 py-2.5 text-sm font-semibold tracking-wide rounded-full transition-all duration-300 border shadow-sm ${isTransparent ? 'bg-white text-stone-900 border-white hover:bg-white/90' : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'}`}>
            Register
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className={`lg:hidden p-2 transition-colors ${isTransparent ? 'text-white' : 'text-stone-900'}`}>
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  )
}

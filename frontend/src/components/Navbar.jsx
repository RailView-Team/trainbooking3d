import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TrainFront, Menu, UserCircle2, X, Loader2, Ticket, Compass } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    user,
    logout,
    authModalOpen,
    authMode,
    setAuthMode,
    openAuth,
    closeAuth,
    login,
    register,
  } = useAuth()

  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const submitAuth = async (event) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      if (authMode === 'login') {
        await login({ email: authForm.email, password: authForm.password })
      } else {
        await register(authForm)
      }
      setAuthForm({ name: '', email: '', password: '' })
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Unable to authenticate. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    navigate('/')
  }

  const linkClass = (active) => {
    if (active) {
      return `text-sm font-bold tracking-tight pb-1 border-b-2 border-[#2563eb] text-[#2563eb] transition-all`
    }
    return `text-sm font-medium tracking-tight pb-1 text-stone-600 hover:text-stone-900 border-b-2 border-transparent transition-all`
  }

  const scrollToExperience = (e) => {
    if (location.pathname === '/') {
      e.preventDefault()
      document.getElementById('experience-section')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white/95 backdrop-blur-md border-stone-200/80 py-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform shadow-xs">
            <TrainFront className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-stone-900">
            Rail<span className="text-blue-600">Vista</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className={linkClass(location.pathname === '/')}>
            Book Ticket
          </Link>
          <Link to="/bookings" className={linkClass(location.pathname === '/bookings')}>
            My Bookings
          </Link>
          <a href="#experience-section" onClick={scrollToExperience} className={linkClass(false)}>
            Explore
          </a>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-sm font-bold text-stone-800">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="h-10 px-4 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuth('login')}
                className="w-10 h-10 rounded-full border border-stone-200 hover:border-blue-300 flex items-center justify-center text-stone-600 hover:text-blue-600 transition-colors"
                title="Account"
              >
                <UserCircle2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => openAuth('login')}
                className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm shadow-blue-500/20"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-stone-700 hover:text-stone-900 rounded-lg transition-colors"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-stone-800 font-bold text-base py-2"
          >
            <TrainFront className="w-5 h-5 text-blue-600" /> Book Ticket
          </Link>
          <Link
            to="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-stone-800 font-bold text-base py-2"
          >
            <Ticket className="w-5 h-5 text-blue-600" /> My Bookings
          </Link>
          <a
            href="#experience-section"
            onClick={(e) => {
              setMobileMenuOpen(false)
              scrollToExperience(e)
            }}
            className="flex items-center gap-3 text-stone-800 font-bold text-base py-2"
          >
            <Compass className="w-5 h-5 text-blue-600" /> Explore
          </a>

          <div className="pt-3 border-t border-stone-100">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-800">Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-stone-100 text-xs font-bold text-stone-700"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  openAuth('login')
                }}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-center text-sm shadow-sm"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <div 
          className="fixed inset-0 z-[60] overflow-y-auto bg-stone-900/60 backdrop-blur-xs p-4 flex min-h-screen items-center justify-center" 
          onClick={(e) => { if (e.target === e.currentTarget) closeAuth(); }}
        >
          <div 
            className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl my-auto relative animate-in fade-in zoom-in-95 duration-200" 
            onClick={event => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">RailVista account</p>
                <h2 className="mt-1 text-2xl font-black text-stone-900">
                  {authMode === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
              </div>
              <button 
                onClick={closeAuth} 
                aria-label="Close login" 
                className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Mode Selector Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={submitAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    required
                    value={authForm.name}
                    onChange={event => setAuthForm({ ...authForm, name: event.target.value })}
                    placeholder="Enter your name"
                    className="h-12 w-full rounded-xl border border-stone-200 px-4 text-sm font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  required
                  type="email"
                  value={authForm.email}
                  onChange={event => setAuthForm({ ...authForm, email: event.target.value })}
                  placeholder="name@example.com"
                  className="h-12 w-full rounded-xl border border-stone-200 px-4 text-sm font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={authForm.password}
                  onChange={event => setAuthForm({ ...authForm, password: event.target.value })}
                  placeholder="At least 6 characters"
                  className="h-12 w-full rounded-xl border border-stone-200 px-4 text-sm font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {authError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700">
                  {authError}
                </p>
              )}

              <button
                disabled={authLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md shadow-blue-600/20 active:scale-[0.99]"
              >
                {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthForm({ name: '', email: 'demo@railvista.in', password: 'password123' });
                    setAuthError('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors"
                >
                  ⚡ Fill Demo Account (demo@railvista.in)
                </button>
              )}
            </form>

            <button
              onClick={() => { 
                setAuthMode(authMode === 'login' ? 'register' : 'login'); 
                setAuthError('');
              }}
              className="mt-5 w-full text-center text-xs font-bold text-blue-600 hover:underline"
            >
              {authMode === 'login' ? 'New to RailVista? Create an account' : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

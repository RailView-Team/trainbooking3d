import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TrainFront, Menu, UserCircle2, X, Loader2 } from 'lucide-react'
import { loginUser, registerUser } from '../service/api'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('aerorail.user') || 'null'))

  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthForm({ name: '', email: '', password: '' })
    setAuthError('')
    setAuthOpen(true)
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const result = authMode === 'login'
        ? await loginUser({ email: authForm.email, password: authForm.password })
        : await registerUser(authForm)
      localStorage.setItem('aerorail.token', result.token)
      localStorage.setItem('aerorail.user', JSON.stringify(result.user))
      setUser(result.user)
      setAuthOpen(false)
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Unable to authenticate. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('aerorail.token')
    localStorage.removeItem('aerorail.user')
    setUser(null)
    navigate('/')
  }

  // On non-home pages, always show the solid navbar style
  const isTransparent = false

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
          ? 'bg-white border-[#c4c5d7] py-4' 
          : 'bg-white border-[#c4c5d7] py-4 shadow-sm'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <TrainFront className={`w-8 h-8 transition-colors duration-500 ${isTransparent ? 'text-rose-600' : 'text-rose-700'}`} />
          <span className="text-2xl font-bold tracking-tight text-[#0037b0]">
            Rail<span className="text-[#1d4ed8]">View</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className={linkClass(location.pathname === '/')}>
            Book Train
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
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-sm font-semibold text-[#131b2e]">Hi, {user.name}</span>
              <button onClick={logout} className="h-10 px-4 rounded-lg border border-[#c4c5d7] text-sm font-semibold text-[#131b2e] hover:bg-[#f2f3ff] transition-colors">Log out</button>
            </div>
          ) : (
            <button onClick={() => openAuth('login')} className="h-10 px-4 rounded-lg border border-[#c4c5d7] text-sm font-semibold text-[#131b2e] hover:bg-[#f2f3ff] transition-colors flex items-center gap-2">
              <UserCircle2 className="w-4 h-4" /> Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className={`lg:hidden p-2 transition-colors ${isTransparent ? 'text-white' : 'text-stone-900'}`}>
          <Menu className="w-6 h-6" />
        </button>
      </div>
      {authOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#131b2e]/35 px-4" onMouseDown={() => setAuthOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-[#c4c5d7] bg-white p-7 shadow-xl" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div><p className="text-xs font-bold uppercase tracking-widest text-[#1d4ed8]">RailView account</p><h2 className="mt-1 text-2xl font-bold text-[#131b2e]">{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2></div>
              <button onClick={() => setAuthOpen(false)} aria-label="Close login" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitAuth} className="space-y-4">
              {authMode === 'register' && <input required value={authForm.name} onChange={event => setAuthForm({ ...authForm, name: event.target.value })} placeholder="Full name" className="h-12 w-full rounded-lg border border-[#c4c5d7] px-4 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#93c5fd]" />}
              <input required type="email" value={authForm.email} onChange={event => setAuthForm({ ...authForm, email: event.target.value })} placeholder="Email address" className="h-12 w-full rounded-lg border border-[#c4c5d7] px-4 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#93c5fd]" />
              <input required minLength={6} type="password" value={authForm.password} onChange={event => setAuthForm({ ...authForm, password: event.target.value })} placeholder="Password" className="h-12 w-full rounded-lg border border-[#c4c5d7] px-4 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#93c5fd]" />
              {authError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{authError}</p>}
              <button disabled={authLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1d4ed8] font-bold text-white hover:bg-[#1e40af] disabled:opacity-60">{authLoading && <Loader2 className="w-4 h-4 animate-spin" />}{authMode === 'login' ? 'Log in' : 'Create account'}</button>
            </form>
            <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError('') }} className="mt-5 w-full text-center text-sm font-semibold text-[#1d4ed8] hover:underline">{authMode === 'login' ? 'New to RailView? Create an account' : 'Already have an account? Log in'}</button>
          </div>
        </div>
      )}
    </header>
  )
}

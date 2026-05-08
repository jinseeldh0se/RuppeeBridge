import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import RateTicker from './RateTicker'
import clsx from 'clsx'

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-navy sticky top-0 z-50 shadow-lg shadow-black/20">
      <RateTicker />
      <nav className="flex items-center justify-between px-4 md:px-6 h-16 max-w-7xl mx-auto">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 flex-shrink-0"
        >
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center font-display font-extrabold text-white text-lg shadow-md">
            R
          </div>
          <span className="font-display font-bold text-white text-xl">RupeeBridge</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Home', action: () => navigate('/about') },
            {
              label: 'How it works',
              action: () =>
                document.getElementById('architecture')?.scrollIntoView({
                  behavior: 'smooth',
                }),
            },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm transition-all duration-150',
                isActive(item.label)
                  ? 'bg-white/10 text-white'
                  : 'text-white/55 hover:text-white hover:bg-white/6'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-px h-5 bg-white/10" />
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-white/8 hover:bg-white/12 transition-all rounded-xl px-3 py-2"
              >
                <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-white text-sm font-medium">{user.name}</span>
                <ChevronDown size={14} className="text-white/40" />
              </button>
              <button
                onClick={onLogout}
                className="text-white/40 hover:text-white/70 text-sm transition-all"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg transition-all"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary py-2 px-4 text-sm text-orange-600"
              >
                Get started
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/8 transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-2 border-t border-white/8 px-4 py-4 space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-white/8">
                <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-white/40 text-xs">{user.email}</p>
                </div>
              </div>
              <button onClick={() => { navigate('/dashboard'); setMenuOpen(false) }} className="w-full text-left text-white/70 py-2.5 text-sm hover:text-white transition-all">
                Dashboard
              </button>
              <button onClick={() => { navigate('/nri'); setMenuOpen(false) }} className="w-full text-left text-white/70 py-2.5 text-sm hover:text-white transition-all">
                Send Money
              </button>
              <button onClick={() => { navigate('/tourist'); setMenuOpen(false) }} className="w-full text-left text-white/70 py-2.5 text-sm hover:text-white transition-all">
                Tourist Wallet
              </button>
              <button onClick={() => { onLogout(); setMenuOpen(false) }} className="w-full text-left text-red-400 py-2.5 text-sm">
                Sign out
              </button>
            </>
          ) : (
            <button onClick={() => { navigate('/login'); setMenuOpen(false) }} className="btn-primary w-full justify-center">
              Get Started
            </button>
          )}
        </div>
      )}
    </header>
  )
}

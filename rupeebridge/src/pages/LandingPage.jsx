import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveRates } from '../hooks/useLiveRates'
import ArchitectureDiagram from '../components/ArchitectureDiagram'
import { COMPETITORS, FLAGS } from '../utils/constants'
import clsx from 'clsx'

const USER_FEATURES = {
  nri: [
    { icon: '⚡', title: 'Under 5 minutes', desc: 'Wise takes 1–2 days. Banks take 3–5. We settle via Solana + UPI in minutes, any time, any day.' },
    { icon: '📋', title: 'Zero paperwork', desc: 'FEMA purpose codes auto-tagged. e-FIRA auto-generated. Your bank will never call to ask why.' },
    { icon: '💰', title: '0.5% total fee', desc: 'Wise charges 1.6–1.9%. PayPal takes 5–7%. You keep ₹5,000+ more on every $1,000 sent.' },
    { icon: '🔐', title: 'RBI compliant', desc: 'All transactions reported. Purpose codes filed. Fully FEMA-compliant from day one.' },
  ],
  tourist: [
    { icon: '🛂', title: 'Visa-linked wallet', desc: 'Wallet activates on entry and hard-expires on your visa date. Fully KYC verified.' },
    { icon: '📱', title: 'Pay via UPI scanner', desc: 'Scan any UPI QR in India — street food, autos, hotels, markets. Any merchant accepted.' },
    { icon: '↩️', title: 'Auto refund on exit', desc: 'Leftover balance auto-refunded to your original card in your home currency.' },
    { icon: '🎗️', title: 'Donate leftover', desc: 'Convert unspent INR to gift cards or donate to verified Indian charities. Get a certificate.' },
  ],

}

function HeroQuickCalc() {
  const { rates, flash } = useLiveRates(3000)
  const [amount, setAmount] = useState(500)
  const [currency, setCurrency] = useState('USD')
  const rate = rates[currency] || 83.50
  const inr = Math.round(amount * rate * 0.995)

  return (
    <div className="glass rounded-2xl p-5 max-w-sm mx-auto mt-10 text-left">
      <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Quick calculator</p>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">{FLAGS[currency]}</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value) || 0)}
            className="w-full bg-white/8 border border-white/10 rounded-xl pl-9 pr-3 py-2.5
                       text-white font-display font-bold text-lg outline-none focus:border-brand"
          />
        </div>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="bg-white/10 border border-white/10 rounded-xl px-3 text-white text-sm outline-none"
          style={{ fontFamily: 'DM Sans' }}
        >
          {Object.keys(FLAGS).map(c => (
            <option key={c} value={c} style={{ background: '#1e2d4a', color: 'white' }}>{c}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-white/40 text-sm">Family receives</span>
        <span className={clsx(
          'font-display font-bold text-2xl transition-colors duration-400',
          flash ? 'text-sol-green' : 'text-brand'
        )}>₹{inr.toLocaleString('en-IN')}</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-sol-green">
        <span className="w-1.5 h-1.5 rounded-full bg-sol-green live-dot" />
        1 {currency} = ₹{rate.toFixed(2)} · Live rate
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('nri')

  return (
    <div className="page">

      {/* ── HERO ── */}
      <section className="bg-navy pt-16 pb-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-sol-purple/6 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand-muted
                          text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand live-dot" />
            Built on Solana · Powered by USDC · Hackathon demo
          </div>

          <h1 className="text-4xl md:text-[3.5rem] font-extrabold text-white leading-[1.08] tracking-tight mb-5">
            Send money to India<br />
            <span className="text-brand">10x faster</span> than banks
          </h1>

          <p className="text-white/55 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light">
            NRI remittances, tourist wallets, freelancer payments — all in one platform.
            Settling in minutes, not days. Fully FEMA compliant.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <button className="text-white bg-green-600 box-border border border-transparent hover:bg-green-500 focus:ring-4 focus:ring-warning-medium shadow-xs font-medium leading-5 rounded-xl text-sm px-7 py-3.5 focus:outline-none" onClick={() => navigate('/login')}>
              Get started free →
            </button>
            <button
              className="text-white bg-orange-600 box-border border border-transparent hover:bg-orange-500 focus:ring-4 focus:ring-warning-medium shadow-xs font-medium leading-5 rounded-xl text-sm px-7 py-3.5 focus:outline-none"
              onClick={() => document.getElementById('architecture').scrollIntoView({ behavior: 'smooth' })}
            >
              See how it works
            </button>
          </div>

          <HeroQuickCalc />
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-navy-3 border-y border-white/5 py-5 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: '< 5 min', label: 'Settlement time' },
            { val: '0.5%', label: 'Total fee' },
            { val: '$120B', label: 'India remittance market' },
            { val: '9M+', label: 'Tourists to India/yr' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-2xl font-bold text-brand">{s.val}</div>
              <div className="text-white/40 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT WE'RE BUILDING ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3">What we're building</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            One platform, three use cases
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            RupeeBridge uses Solana's USDC stablecoin as a settlement rail —
            giving you bank-level compliance at crypto-level speed.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-md">

            {/* Sliding Active Background */}
            <div
              className={clsx(
                "absolute top-2 bottom-2 w-[47%] rounded-xl bg-slate-800 shadow-[0_0_18px_rgba(249,115,22,0.25)] transition-all duration-300 ease-in-out",
                activeTab === "nri" ? "left-2" : "left-[51%]"
              )}
            ></div>

            {[
              { id: 'nri', label: '🇮🇳 NRI Family' },
              { id: 'tourist', label: '✈️ Tourists' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "relative z-10 px-8 py-3 rounded-xl text-sm md:text-base font-medium transition-all duration-300",
                  activeTab === tab.id
                    ? "text-orange-500 scale-105 drop-shadow-[0_0_8px_rgba(249,115,22,0.45)]"
                    : "text-orange-500/50 hover:text-orange-400"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {USER_FEATURES[activeTab].map((f, i) => (
            <div key={i} className="card p-5 hover:border-brand/40 hover:shadow-md transition-all cursor-default">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button onClick={() => navigate('/login')} className="btn-primary px-8 py-3.5 mx-auto text-orange-800">
            Start sending money →
          </button>
        </div>
      </section>

      {/* ── ARCHITECTURE ── */}
      <section id="architecture" className="bg-navy py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3">Architecture</p>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
              How money flows through RupeeBridge
            </h2>
            <p className="text-white/35 text-sm max-w-lg mx-auto">
              Stablecoin rails replace slow SWIFT. Everything else stays familiar to your bank.
            </p>
          </div>

          <ArchitectureDiagram />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: '01', title: 'You send USD/AED/GBP', desc: 'Received into your virtual account via Airwallex. Any currency, any country.' },
              { n: '02', title: 'Converts to USDC on Solana', desc: 'Circle API mints USDC. Settles on Solana in ~10 seconds for $0.001.' },
              { n: '03', title: 'Family gets INR via UPI', desc: 'Pre-funded INR pool pays out instantly. Replenished every 4–6 hrs in batch.' },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-5">
                <div className="text-brand/30 font-display text-5xl font-extrabold mb-2 leading-none">{s.n}</div>
                <h3 className="font-display font-semibold text-white text-base mb-2">{s.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3">Why RupeeBridge</p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Faster and cheaper than everyone
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Platform', 'Fee', 'FX rate', 'Settlement', 'e-FIRA'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((r, i) => (
                <tr key={i} className={clsx(
                  'border-b border-gray-100 transition-colors',
                  r.you
                    ? 'bg-orange-50 border-l-[3px] border-l-brand'
                    : 'hover:bg-gray-50'
                )}>
                  <td className="px-4 py-3 font-medium">
                    {r.you
                      ? <span className="text-brand font-semibold">{r.name} ✦</span>
                      : r.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.fee}</td>
                  <td className="px-4 py-3 text-gray-600">{r.fx}</td>
                  <td className={clsx('px-4 py-3 font-medium', r.you ? 'text-green-600' : 'text-gray-600')}>{r.settlement}</td>
                  <td className="px-4 py-3 text-gray-600">{r.fira || '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 text-center">
          <button onClick={() => navigate('/login')} className="btn-primary px-8 py-3.5 mx-auto text-orange-600">
            Try it now — free →
          </button>
        </div>
      </section>
    </div>
  )
}

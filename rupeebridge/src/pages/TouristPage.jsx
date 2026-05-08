import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveRates } from '../hooks/useLiveRates'
import { FLAGS, generateTxHash, getSolanaExplorerUrl } from '../utils/constants'
import clsx from 'clsx'

const INITIAL_TXN = [
  { icon: '💵', name: 'Wallet loaded · $200 USD', sub: '12 Apr · Solana devnet', amt: '+₹16,800', credit: true, hash: null },
  { icon: '🏨', name: 'Taj Hotel · Agra', sub: '13 Apr', amt: '−₹2,800', credit: false, hash: null },
  { icon: '🍜', name: 'Street food · Chandni Chowk', sub: '14 Apr · Delhi', amt: '−₹350', credit: false, hash: null },
  { icon: '🛺', name: 'Auto rickshaw', sub: '14 Apr', amt: '−₹120', credit: false, hash: null },
  { icon: '🛍️', name: 'Handicrafts · Jaipur market', sub: '15 Apr', amt: '−₹1,080', credit: false, hash: null },
]

const SPEND_CATS = [
  { icon: '🍜', name: 'Street food', amt: 180 },
  { icon: '🛺', name: 'Auto', amt: 95 },
  { icon: '🏨', name: 'Hotel', amt: 2400 },
  { icon: '🛍️', name: 'Shopping', amt: 850 },
  { icon: '🏛️', name: 'Museum', amt: 250 },
  { icon: '☕', name: 'Café', amt: 180 },
]

const CHARITIES = [
  'Child education · CRY India',
  'Flood relief · NDMA Fund',
  'Animal rescue · PETA India',
  'PM Relief Fund · PMNRF',
]

function LoadWalletModal({ onLoad, onClose }) {
  const { rates, flash } = useLiveRates(3000)
  const [amt, setAmt] = useState(200)
  const [cur, setCur] = useState('USD')
  const rate = rates[cur] || 83.50
  const inr = Math.round(amt * rate * 0.985)

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Load Tourist Wallet</h3>
          <button onClick={onClose} className="text-gray-400 text-xl w-8 h-8">×</button>
        </div>

        <div className="bg-[#0a0f1e] rounded-xl p-4 space-y-3 mb-4">
          <div>
            <p className="text-[11px] text-white/40 uppercase tracking-widest mb-2">You load</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">{FLAGS[cur]}</span>
                <input
                  type="number"
                  value={amt}
                  onChange={e => setAmt(Number(e.target.value) || 0)}
                  className="w-full bg-white/8 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white font-bold text-lg outline-none focus:border-orange-400"
                />
              </div>
              <select
                value={cur}
                onChange={e => setCur(e.target.value)}
                className="bg-white/10 border border-white/10 rounded-lg px-2.5 text-white text-sm outline-none"
                style={{ fontFamily: 'DM Sans' }}
              >
                {Object.entries(FLAGS).map(([c, f]) => (
                  <option key={c} value={c} style={{ background: '#1e2d4a', color: 'white' }}>{f} {c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/40">
            <span>1 {cur} = <span className={clsx('font-semibold', flash ? 'text-green-400' : 'text-white/70')}>₹{rate.toFixed(2)}</span></span>
            <span className="flex items-center gap-1 text-green-400"><span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />Live</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-white/8">
            <span className="text-white/40 text-sm">Wallet receives</span>
            <span className={clsx('font-display font-bold text-2xl transition-colors duration-300', flash ? 'text-green-400' : 'text-orange-400')}>
              ₹{inr.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">
          🛂 Wallet linked to your visa · expires 15 May 2026 · KYC verified
        </div>

        <button
          className="btn-primary w-full justify-center"
          onClick={() => onLoad(amt, cur, inr)}
        >
          Load ₹{inr.toLocaleString('en-IN')} to wallet →
        </button>
      </div>
    </div>
  )
}

export default function TouristPage() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(12450)
  const [txns, setTxns] = useState(INITIAL_TXN)
  const [showScanner, setShowScanner] = useState(false)
  const [showDonate, setShowDonate] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [donated, setDonated] = useState(false)
  const [selectedTx, setSelectedTx] = useState(null)

  const addTxn = (icon, name, amt, credit = false) => {
    const hash = generateTxHash()
    setTxns(t => [{ icon, name, sub: 'Just now · UPI', amt: credit ? `+₹${amt.toLocaleString('en-IN')}` : `−₹${amt.toLocaleString('en-IN')}`, credit, hash }, ...t])
    return hash
  }

  const handleSpend = (cat) => {
    addTxn(cat.icon, `${cat.name} payment`, cat.amt)
    setBalance(b => Math.max(0, b - cat.amt))
  }

  const handleLoad = (amt, cur, inr) => {
    setShowLoad(false)
    addTxn('💵', `Wallet loaded · ${amt} ${cur}`, inr, true)
    setBalance(b => b + inr)
  }

  const handleQRScan = () => {
    const amt = Math.floor(Math.random() * 400) + 80
    const hash = generateTxHash()
    setBalance(b => Math.max(0, b - amt))
    setTxns(t => [{ icon: '📷', name: 'QR scan · UPI merchant', sub: 'Just now', amt: `−₹${amt}`, credit: false, hash }, ...t])
    setShowScanner(false)
    alert(`✅ Paid ₹${amt} via UPI\n\nSolana tx: ${hash.slice(0, 16)}...\nView: explorer.solana.com`)
  }

  const handleDonate = (cause) => {
    const amt = balance
    addTxn('🎗️', `Donated · ${cause.split('·')[0].trim()}`, amt)
    setBalance(0)
    setDonated(true)
    setShowDonate(false)
    alert(`✅ ₹${amt.toLocaleString('en-IN')} donated to ${cause}\n\n🎁 Reward: 0.5% fee off your next India visit!\n\nCertificate will be emailed.`)
  }

  return (
    <div className="page max-w-lg mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">‹</button>
        <div className="flex-1">
          <h2 className="font-display font-bold text-xl text-gray-900">Tourist Wallet</h2>
          <p className="text-gray-400 text-sm">Visa-linked · KYC verified · Solana-powered</p>
        </div>
        <button onClick={() => setShowScanner(true)} className="btn-primary py-2 px-3.5 text-sm">📷 Pay via QR</button>
      </div>

      {/* Balance card */}
      <div className="bg-[#0a0f1e] rounded-2xl p-5 mb-4 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-orange-500/5 pointer-events-none" />
        <div className="relative">
          <p className="text-white/40 text-xs mb-1">Available balance</p>
          <p className="font-display text-4xl font-bold text-white mb-1">₹{balance.toLocaleString('en-IN')}</p>
          <p className="text-white/30 text-sm mb-4">≈ ${(balance / 83.5).toFixed(2)} USD remaining</p>
          <div className="flex gap-5">
            {[
              { label: 'Loaded', val: '$200 USD' },
              { label: 'Spent', val: `₹${Math.max(0, 16800 - balance).toLocaleString('en-IN')}` },
              { label: 'Rate locked', val: '₹83.50' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-white/25 text-xs">{item.label}</p>
                <p className="text-white/70 text-sm font-medium">{item.val}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-full">
              🛂 Visa active · Expires 15 May 2026
            </span>
            <button onClick={() => setShowLoad(true)} className="bg-orange-500/15 border border-orange-500/20 text-orange-400 text-xs px-3 py-1.5 rounded-full hover:bg-orange-500/25 transition-all">
              + Load more
            </button>
          </div>
        </div>
      </div>

      {/* 7 day warning */}
      {!donated && balance > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
          <p className="font-semibold text-orange-800 text-sm mb-1">⏰ 7 days before visa expiry</p>
          <p className="text-orange-600 text-xs mb-3">You have ₹{balance.toLocaleString('en-IN')} left. Choose what to do:</p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowDonate(true)} className="bg-orange-500 text-white text-xs px-4 py-2 rounded-xl font-medium">🎗️ Donate + get reward</button>
            <button onClick={() => alert('Gift cards: Amazon India, Taj Hotels, BookMyShow, Zomato, IndiGo — one tap spend!')} className="bg-white border border-orange-200 text-orange-700 text-xs px-3 py-2 rounded-xl">🎁 Gift cards</button>
            <button onClick={() => alert('Auto-refund to your original card in 3–5 days via Airwallex')} className="bg-white border border-orange-200 text-orange-700 text-xs px-3 py-2 rounded-xl">↩️ Refund to card</button>
          </div>
        </div>
      )}

      {donated && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 text-center">
          <p className="text-green-700 font-semibold">🎉 Thank you for donating to India!</p>
          <p className="text-green-600 text-xs mt-1">Certificate emailed · 0.5% off your next visit</p>
        </div>
      )}

      {/* Quick spend */}
      <div className="card p-4 mb-4">
        <h3 className="font-display font-semibold text-gray-900 mb-3 text-sm">Quick pay</h3>
        <div className="grid grid-cols-3 gap-2">
          {SPEND_CATS.map(cat => (
            <button
              key={cat.name}
              onClick={() => handleSpend(cat)}
              className="flex flex-col items-center p-3 border border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all"
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700">{cat.name}</span>
              <span className="text-xs text-gray-400">₹{cat.amt}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="w-full mt-3 border-2 border-dashed border-orange-300 rounded-xl py-3 text-orange-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-orange-50 transition-all"
        >
          📷 Scan any UPI QR code to pay
        </button>
      </div>

      {/* Transactions */}
      <div className="card p-4">
        <h3 className="font-display font-semibold text-gray-900 mb-3 text-sm">Transactions</h3>
        <div>
          {txns.slice(0, 7).map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded-lg transition-all"
              onClick={() => setSelectedTx(selectedTx === i ? null : i)}
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base flex-shrink-0">{t.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                <p className="text-xs text-gray-400">{t.sub}</p>
                {/* Solana hash on expand */}
                {selectedTx === i && t.hash && (
                  <div className="mt-1.5 bg-gray-900 rounded-lg px-2.5 py-1.5">
                    <p className="text-[10px] text-gray-500 mb-0.5">Solana tx hash</p>
                    <p className="text-green-400 font-mono text-[10px] break-all">{t.hash}</p>
                    <a href={getSolanaExplorerUrl(t.hash)} target="_blank" rel="noreferrer" className="text-[10px] text-purple-400 hover:underline">View on Explorer ↗</a>
                  </div>
                )}
              </div>
              <span className={clsx('text-sm font-semibold flex-shrink-0', t.credit ? 'text-green-600' : 'text-gray-800')}>{t.amt}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">Tap any transaction to see Solana hash</p>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowScanner(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Scan UPI QR Code</h3>
              <button onClick={() => setShowScanner(false)} className="text-gray-400 text-xl w-8 h-8">×</button>
            </div>
            <div className="border-[2.5px] border-dashed border-orange-400 rounded-2xl aspect-square bg-gray-900 flex flex-col items-center justify-center mb-5" style={{ animation: 'pulse 2s infinite' }}>
              <p className="text-white/50 text-sm mb-2">📷 Camera preview</p>
              <p className="text-white/25 text-xs text-center px-6">Point at any UPI QR code in India</p>
              <div className="mt-4 opacity-10">
                {[0,1,2,3].map(r => (
                  <div key={r} className="flex gap-1 mb-1">
                    {[0,1,2,3].map(c => (
                      <div key={c} className={`w-6 h-6 rounded ${(r+c)%2===0 ? 'bg-white' : ''}`} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleQRScan} className="btn-primary w-full justify-center">
              Simulate successful scan ✓
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">Works with any merchant UPI QR in India</p>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showDonate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowDonate(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-xl mb-1">🎗️ Donate your balance</h3>
            <p className="text-gray-500 text-sm mb-4">₹{balance.toLocaleString('en-IN')} → verified Indian charity</p>
            <div className="space-y-2 mb-4">
              {CHARITIES.map(cause => (
                <button key={cause} onClick={() => handleDonate(cause)}
                  className="w-full text-left border border-gray-200 rounded-xl p-3 hover:border-orange-400 hover:bg-orange-50 transition-all text-sm text-gray-700">
                  {cause}
                </button>
              ))}
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700 mb-4">
              🎁 <strong>Reward:</strong> 0.5% fee off your next India visit · Stored 2 years
            </div>
            <button onClick={() => setShowDonate(false)} className="btn-outline w-full justify-center">Cancel</button>
          </div>
        </div>
      )}

      {/* Load Wallet Modal */}
      {showLoad && <LoadWalletModal onLoad={handleLoad} onClose={() => setShowLoad(false)} />}
    </div>
  )
}

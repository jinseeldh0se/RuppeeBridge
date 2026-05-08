import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveRates } from '../hooks/useLiveRates'
import PurposeSelector from '../components/PurposeSelector'
import StepIndicator from '../components/StepIndicator'
import { FLAGS, TRANSFER_METHODS, generateTxHash, getSolanaExplorerUrl } from '../utils/constants'
import clsx from 'clsx'

// ─── Live Converter ───────────────────────────────────────────────────────────
function Converter({ amount, setAmount, currency, setCurrency }) {
  const { rates, flash } = useLiveRates(3000)
  const rate = rates[currency] || 83.50
  const fee = (amount || 0) * 0.005
  const inr = Math.round((amount - fee) * rate)

  return (
    <div className="bg-[#0a0f1e] rounded-2xl p-5 space-y-4">
      {/* Send box */}
      <div>
        <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-2">You convert</p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 items-center focus-within:border-orange-500 transition-colors">
          <span className="text-2xl">{FLAGS[currency]}</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            className="flex-1 bg-transparent text-white text-xl font-bold outline-none placeholder-white/20 min-w-0"
            placeholder="500"
            min="0"
          />
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-sm outline-none cursor-pointer hover:bg-white/15 transition-all flex-shrink-0"
            style={{ fontFamily: 'DM Sans' }}
          >
            {Object.entries(FLAGS).map(([c, f]) => (
              <option key={c} value={c} style={{ background: '#1e2d4a', color: 'white' }}>{f} {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rate row */}
      <div className="flex justify-between text-xs px-1">
        <span className="text-white/40">1 {currency} = <span className={clsx('font-semibold transition-colors duration-300', flash ? 'text-green-400' : 'text-white/70')}>₹{rate.toFixed(2)}</span></span>
        <span className="text-white/40">Fee: <span className="text-white/60">{FLAGS[currency]} {fee.toFixed(2)}</span></span>
        <span className="flex items-center gap-1 text-green-400 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
        </span>
      </div>

      {/* Swap arrow */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/8" />
        <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/40 text-sm">⇅</div>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Receive box */}
      <div>
        <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-2">Wallet receives</p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">🇮🇳</span>
          <span className={clsx('text-2xl font-bold flex-1 transition-colors duration-500', flash ? 'text-green-400' : 'text-orange-400')}>
            ₹{inr.toLocaleString('en-IN')}
          </span>
          <span className="bg-white/10 text-white/50 text-xs px-2.5 py-1.5 rounded-lg">INR</span>
        </div>
      </div>

      {/* Solana badge */}
      <div className="flex items-center gap-2.5 bg-white/4 rounded-xl px-3.5 py-2.5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-green-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">S</div>
        <div className="flex-1 min-w-0">
          <p className="text-green-400 text-xs font-semibold">Powered by Solana USDC</p>
          <p className="text-white/30 text-[10px]">{currency} → USDC on Solana → INR · instant</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
      </div>

      <p style={{ display: 'none' }} id="inr-val">{inr}</p>
    </div>
  )
}

// ─── Wallet Balance Card ──────────────────────────────────────────────────────
function WalletCard({ balance, currency, onSend, onPay }) {
  return (
    <div className="bg-[#0a0f1e] rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-orange-500/5 pointer-events-none" />
      <div className="relative">
        <p className="text-white/40 text-xs mb-1">NRI Wallet balance</p>
        <p className="font-display text-4xl font-bold text-white mb-1">
          ₹{balance.toLocaleString('en-IN')}
        </p>
        <p className="text-white/30 text-sm mb-5">
          ≈ {FLAGS[currency]} {(balance / 83.5).toFixed(2)} {currency} equivalent
        </p>

        {/* Two action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onSend}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 text-sm font-semibold transition-all flex flex-col items-center gap-1"
          >
            <span className="text-lg">📤</span>
            Send to India
          </button>
          <button
            onClick={onPay}
            className="bg-white/10 hover:bg-white/15 text-white rounded-xl py-3 text-sm font-semibold transition-all flex flex-col items-center gap-1 border border-white/10"
          >
            <span className="text-lg">📷</span>
            Pay via QR
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Send Modal ───────────────────────────────────────────────────────────────
function SendModal({ balance, onClose, onSuccess }) {
  const [methodId, setMethodId] = useState('upi')
  const [fields, setFields] = useState({})
  const [recipientName, setRecipientName] = useState('')
  const [purposeCode, setPurposeCode] = useState('P1301')
  const [sending, setSending] = useState(false)
  const method = TRANSFER_METHODS.find(m => m.id === methodId)

  const handleSend = () => {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      onSuccess(generateTxHash(), balance)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-gray-900">Send to India</h3>
            <button onClick={onClose} className="text-gray-400 text-xl w-8 h-8 flex items-center justify-center">×</button>
          </div>

          {/* Amount summary */}
          <div className="bg-[#0a0f1e] rounded-xl p-3.5 flex justify-between items-center">
            <span className="text-white/40 text-sm">Sending</span>
            <span className="font-display font-bold text-orange-400 text-xl">₹{balance.toLocaleString('en-IN')}</span>
          </div>

          {/* Recipient name */}
          <div>
            <label className="label">Recipient name</label>
            <input className="input" placeholder="Full name" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
          </div>

          {/* Transfer method */}
          <div>
            <label className="label">Transfer method</label>
            <div className="grid grid-cols-3 gap-2">
              {TRANSFER_METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMethodId(m.id); setFields({}) }}
                  className={clsx(
                    'flex flex-col items-center gap-1 p-2.5 rounded-xl border-[1.5px] text-center transition-all',
                    methodId === m.id
                      ? 'border-orange-400 bg-orange-50 text-orange-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300'
                  )}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-[11px] font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic fields */}
          {method?.fields.map(field => (
            <div key={field.key}>
              <label className="label">{field.label}</label>
              <input
                className="input"
                placeholder={field.placeholder}
                value={fields[field.key] || ''}
                onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
              />
            </div>
          ))}

          {/* Purpose code */}
          <div>
            <label className="label">Purpose of transfer</label>
            <PurposeSelector selected={purposeCode} onSelect={setPurposeCode} inrAmount={balance} />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="btn-primary w-full justify-center py-3.5"
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Sending...
              </span>
            ) : `Send ₹${balance.toLocaleString('en-IN')} →`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── QR Pay Modal ─────────────────────────────────────────────────────────────
function QRModal({ onClose, onPay }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Scan UPI QR Code</h3>
          <button onClick={onClose} className="text-gray-400 text-xl w-8 h-8">×</button>
        </div>
        <div className="border-[2.5px] border-dashed border-orange-400 rounded-2xl aspect-square bg-gray-900 flex flex-col items-center justify-center mb-5">
          <p className="text-white/50 text-sm mb-2">📷 Camera preview</p>
          <p className="text-white/25 text-xs text-center px-6">Point at any UPI QR code in India</p>
          <div className="mt-4 opacity-10 grid grid-cols-4 gap-1">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className={`w-5 h-5 rounded ${(i % 3 === 0) ? 'bg-white' : ''}`} />
            ))}
          </div>
        </div>
        <button onClick={onPay} className="btn-primary w-full justify-center">
          Simulate successful scan ✓
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">Works with any UPI QR in India</p>
      </div>
    </div>
  )
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ txHash, inrAmount, mode, onReset }) {
  const navigate = useNavigate()
  return (
    <div className="animate-fade-in text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 border-4 border-green-400 flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
        {mode === 'send' ? 'Money sent!' : 'Payment done!'}
      </h2>
      <p className="text-gray-500 mb-6">
        <strong className="text-green-600">₹{inrAmount.toLocaleString('en-IN')}</strong>{' '}
        {mode === 'send' ? 'sent to recipient in India' : 'paid via UPI scan'}
      </p>

      {/* Solana hash */}
      <div className="bg-[#0a0f1e] rounded-2xl p-4 text-left mb-5">
        <p className="text-[10px] text-white/25 mb-1.5 font-mono uppercase tracking-wide">Solana Transaction · Devnet · USDC-SPL</p>
        <p className="text-green-400 font-mono text-xs break-all leading-relaxed">{txHash}</p>
        <div className="flex justify-between mt-3">
          <span className="text-[10px] text-white/20 font-mono">{new Date().toLocaleTimeString()}</span>
          <a href={getSolanaExplorerUrl(txHash)} target="_blank" rel="noreferrer"
            className="text-xs text-purple-400 hover:underline">View on Solana Explorer ↗</a>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-4 text-left space-y-3 mb-6">
        {[
          { dot: 'bg-green-500', title: 'Foreign currency received', time: 'Just now', done: true },
          { dot: 'bg-purple-500', title: 'USDC minted on Solana · ' + txHash.slice(0, 10) + '...', time: '~8 sec', done: true },
          { dot: 'bg-orange-400', title: mode === 'send' ? 'INR payout via UPI/IMPS' : 'UPI payment processed', time: 'Confirmed', done: true },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className={`w-2 h-2 rounded-full ${item.dot} mt-1.5 flex-shrink-0`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.title} ✓</p>
              <p className="text-xs text-gray-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn-outline flex-1" onClick={onReset}>New transaction</button>
        <button className="btn-primary flex-1 justify-center" onClick={() => navigate('/dashboard')}>Done</button>
      </div>
    </div>
  )
}

// ─── Main NRI Page ────────────────────────────────────────────────────────────
export default function NRIPage() {
  const navigate = useNavigate()

  // States
  const [view, setView] = useState('convert') // convert | wallet | success
  const [amount, setAmount] = useState(500)
  const [currency, setCurrency] = useState('USD')
  const [walletBalance, setWalletBalance] = useState(0)
  const [converting, setConverting] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [successMode, setSuccessMode] = useState('send')
  const [successAmount, setSuccessAmount] = useState(0)

  const { rates } = useLiveRates(3000)
  const rate = rates[currency] || 83.50
  const fee = amount * 0.005
  const inrAmount = Math.round((amount - fee) * rate)

  const handleConvert = () => {
    setConverting(true)
    setTimeout(() => {
      setWalletBalance(inrAmount)
      setConverting(false)
      setView('wallet')
    }, 1800)
  }

  const handleSendSuccess = (hash, amt) => {
    setTxHash(hash)
    setSuccessAmount(amt)
    setSuccessMode('send')
    setShowSend(false)
    setWalletBalance(0)
    setView('success')
  }

  const handleQRPay = () => {
    const amt = Math.floor(Math.random() * 500) + 100
    const hash = generateTxHash()
    setTxHash(hash)
    setSuccessAmount(amt)
    setSuccessMode('pay')
    setShowQR(false)
    setWalletBalance(b => Math.max(0, b - amt))
    setView('success')
  }

  const handleReset = () => {
    setView('convert')
    setWalletBalance(0)
    setTxHash('')
    setAmount(500)
  }

  return (
    <div className="page max-w-lg mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => view === 'wallet' ? setView('convert') : navigate('/dashboard')}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"
        >‹</button>
        <div>
          <h2 className="font-display font-bold text-xl text-gray-900">NRI Wallet</h2>
          <p className="text-gray-400 text-sm">Convert · Send · Pay anywhere in India</p>
        </div>
      </div>

      {/* ── CONVERT VIEW ── */}
      {view === 'convert' && (
        <div className="animate-fade-in space-y-4">

          {/* How it works — 3 steps */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            {[
              { icon: '💱', label: 'Convert', desc: 'USD → INR' },
              { icon: '📤', label: 'Send', desc: 'UPI / Bank' },
              { icon: '📷', label: 'Pay', desc: 'Scan QR' },
            ].map((s, i) => (
              <div key={i} className="card p-3 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="font-semibold text-gray-900 text-xs">{s.label}</p>
                <p className="text-gray-400 text-[10px]">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Live converter */}
          <Converter amount={amount} setAmount={setAmount} currency={currency} setCurrency={setCurrency} />

          {/* Convert button */}
          <button
            className="btn-primary w-full justify-center py-4 text-base"
            onClick={handleConvert}
            disabled={converting || !amount || amount <= 0}
          >
            {converting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Converting on Solana...
              </span>
            ) : `Convert ${FLAGS[currency]} ${amount} → ₹${inrAmount.toLocaleString('en-IN')} →`}
          </button>

          <p className="text-center text-xs text-gray-400">
            Money converts instantly via Solana USDC · Held in your INR wallet
          </p>
        </div>
      )}

      {/* ── WALLET VIEW ── */}
      {view === 'wallet' && (
        <div className="animate-fade-in space-y-4">

          {/* Wallet balance */}
          <WalletCard
            balance={walletBalance}
            currency={currency}
            onSend={() => setShowSend(true)}
            onPay={() => setShowQR(true)}
          />

          {/* Options info */}
          <div className="card p-4 space-y-3">
            <h3 className="font-display font-semibold text-gray-900 text-sm">What can you do?</h3>

            <button
              onClick={() => setShowSend(true)}
              className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl flex-shrink-0">📤</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Send to someone in India</p>
                <p className="text-gray-400 text-xs">Via UPI ID · Phone number · Bank account</p>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </button>

            <button
              onClick={() => setShowQR(true)}
              className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">📷</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Pay via UPI QR scan</p>
                <p className="text-gray-400 text-xs">Scan any merchant QR · Pay directly from wallet</p>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </button>

            <button
              onClick={() => setShowSend(true)}
              className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">🏦</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Send to bank account</p>
                <p className="text-gray-400 text-xs">IMPS · NEFT · RTGS · Account + IFSC</p>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </button>
          </div>

          {/* Convert more */}
          <button
            onClick={() => setView('convert')}
            className="btn-outline w-full justify-center"
          >
            ← Convert more money
          </button>
        </div>
      )}

      {/* ── SUCCESS VIEW ── */}
      {view === 'success' && (
        <SuccessScreen
          txHash={txHash}
          inrAmount={successAmount}
          mode={successMode}
          onReset={handleReset}
        />
      )}

      {/* Send Modal */}
      {showSend && (
        <SendModal
          balance={walletBalance}
          onClose={() => setShowSend(false)}
          onSuccess={handleSendSuccess}
        />
      )}

      {/* QR Modal */}
      {showQR && (
        <QRModal
          onClose={() => setShowQR(false)}
          onPay={handleQRPay}
        />
      )}
    </div>
  )
}

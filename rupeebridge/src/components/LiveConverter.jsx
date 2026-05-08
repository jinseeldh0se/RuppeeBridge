import { useLiveRates } from '../hooks/useLiveRates'
import { FLAGS, FEMA_THRESHOLDS } from '../utils/constants'
import clsx from 'clsx'

export default function LiveConverter({ amount, setAmount, currency, setCurrency, compact = false }) {
  const { rates, flash } = useLiveRates(3000)

  const rate = rates[currency] || 83.50
  const fee = (amount || 0) * 0.005
  const netAmt = (amount || 0) - fee
  const inrAmount = Math.round(netAmt * rate)
  const threshold = FEMA_THRESHOLDS.find(t => inrAmount <= t.limit)

  return (
    <div className="bg-[#0a0f1e] rounded-2xl p-5 space-y-4">

      {/* YOU SEND box */}
      <div>
        <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-2">You send</p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 items-center focus-within:border-orange-500 transition-colors">
          <span className="text-2xl flex-shrink-0">{FLAGS[currency]}</span>
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
              <option key={c} value={c} style={{ background: '#1e2d4a', color: 'white' }}>
                {f} {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rate info */}
      <div className="flex items-center justify-between text-xs text-white/40 px-1">
        <span>1 {currency} = <span className={clsx('font-semibold transition-colors duration-300', flash ? 'text-green-400' : 'text-white/70')}>₹{rate.toFixed(2)}</span></span>
        <span>Fee: <span className="text-white/60">{FLAGS[currency]} {fee.toFixed(2)}</span></span>
        <span className="flex items-center gap-1 text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Swap icon */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/8" />
        <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/40 text-sm">⇅</div>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* RECIPIENT GETS box */}
      <div>
        <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-2">Family receives</p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">🇮🇳</span>
          <span className={clsx(
            'text-2xl font-bold flex-1 transition-colors duration-500',
            flash ? 'text-green-400' : 'text-orange-400'
          )}>
            ₹{inrAmount.toLocaleString('en-IN')}
          </span>
          <span className="bg-white/10 text-white/50 text-xs px-2.5 py-1.5 rounded-lg flex-shrink-0">INR</span>
        </div>
      </div>

      {/* FEMA threshold badge */}
      {amount > 0 && threshold && (
        <div className={clsx('rounded-xl px-3.5 py-2.5 text-xs font-medium border flex items-start gap-2', threshold.color)}>
          <span className="flex-shrink-0 mt-0.5">
            {threshold.severity === 'low' ? '✓' : threshold.severity === 'critical' ? '⚠️' : 'ℹ️'}
          </span>
          <span><strong>{threshold.label}:</strong> {threshold.desc}</span>
        </div>
      )}

      {/* Solana rail badge */}
      <div className="flex items-center gap-2.5 bg-white/4 rounded-xl px-3.5 py-2.5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-green-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">S</div>
        <div className="flex-1 min-w-0">
          <p className="text-green-400 text-xs font-semibold">Powered by Solana USDC</p>
          <p className="text-white/30 text-[10px]">USD → USDC on Solana → INR via UPI · &lt;5 min</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
      </div>
    </div>
  )
}

import { useLiveRates } from '../hooks/useLiveRates'
import { FLAGS } from '../utils/constants'

export default function RateTicker() {
  const { rates } = useLiveRates(2500)

  const items = Object.entries(rates).map(
    ([cur, rate]) => `${FLAGS[cur]} 1 ${cur} = ₹${rate.toFixed(2)}`
  )
  const doubled = [...items, ...items]

  return (
    <div className="bg-navy-2 border-b border-white/5 py-1.5 overflow-hidden">
      <div className="flex items-center gap-4 px-4">
        <span className="flex items-center gap-1.5 text-brand text-[11px] font-semibold flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-brand live-dot" />
          LIVE
        </span>
        <div className="overflow-hidden flex-1 mask-gradient">
          <div className="ticker-track text-[11px] text-white/45 font-mono">
            {doubled.map((item, i) => (
              <span key={i} className="flex-shrink-0 px-4">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

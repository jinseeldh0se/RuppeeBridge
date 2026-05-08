import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveRates } from '../hooks/useLiveRates'
import PurposeSelector from '../components/PurposeSelector'
import { FLAGS, generateTxHash, getSolanaExplorerUrl } from '../utils/constants'
import clsx from 'clsx'

const STEPS = ['Invoice', 'Purpose & Docs', 'Receive']

function DocUploadItem({ label, required, hint }) {
  const [status, setStatus] = useState('idle')
  return (
    <div className={clsx('flex items-center gap-3 rounded-xl border p-3 transition-all', status === 'done' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50')}>
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0', status === 'done' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500')}>
        {status === 'done' ? '✓' : '📄'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
          {label}
          {required ? <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded">required</span> : <span className="text-[10px] text-gray-400">optional</span>}
        </p>
        {status === 'uploading' && <p className="text-xs text-orange-500 mt-0.5">🔍 Detecting document type...</p>}
        {status === 'done' && <p className="text-xs text-green-600 mt-0.5">✓ Verified — {label}</p>}
        {status === 'idle' && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      {status !== 'done' && (
        <button onClick={() => { setStatus('uploading'); setTimeout(() => setStatus('done'), 1400) }}
          disabled={status === 'uploading'}
          className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:border-orange-400 hover:text-orange-500 transition-all flex-shrink-0 disabled:opacity-40">
          {status === 'uploading' ? '...' : 'Upload'}
        </button>
      )}
    </div>
  )
}

export default function FreelancerPage() {
  const navigate = useNavigate()
  const { rates, flash } = useLiveRates(3000)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ clientName: '', amountUSD: 1000, currency: 'USD', description: 'Software development services', freelancerName: '' })
  const [purposeCode, setPurposeCode] = useState('P0802')
  const [receiving, setReceiving] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [invoiceId] = useState(`RB-${new Date().getFullYear()}-${Math.floor(Math.random()*900)+100}`)

  const rate = rates[form.currency] || 83.50
  const fee = form.amountUSD * 0.005
  const inrAmount = Math.round((form.amountUSD - fee) * rate)

  const handleReceive = () => {
    setReceiving(true)
    setTimeout(() => {
      setTxHash(generateTxHash())
      setReceiving(false)
      setStep(3)
    }, 2500)
  }

  return (
    <div className="page max-w-lg mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">‹</button>
        <div>
          <h2 className="font-display font-bold text-xl text-gray-900">Freelancer Payments</h2>
          <p className="text-gray-400 text-sm">Receive international payments · FEMA P0802</p>
        </div>
      </div>

      {step < 3 && (
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all', i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-200 text-gray-400')}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className={clsx('text-[10px] mt-1.5 font-medium whitespace-nowrap', i + 1 === step ? 'text-orange-500' : 'text-gray-400')}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={clsx('flex-1 h-0.5 mx-2 mb-4 transition-all', i + 1 < step ? 'bg-green-400' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>
      )}

      {/* ─── STEP 1: Invoice Builder ─── */}
      {step === 1 && (
        <div className="animate-fade-in space-y-4">

          {/* Speed comparison */}
          <div className="card p-4">
            <h3 className="font-display font-semibold text-gray-900 mb-3 text-sm">Settlement speed</h3>
            {[
              { name: 'PayPal', time: '5 days', pct: 100, color: 'bg-red-400' },
              { name: 'Wise', time: '1–2 days', pct: 55, color: 'bg-yellow-400' },
              { name: 'Skydo', time: '24–48 hrs', pct: 35, color: 'bg-orange-400' },
              { name: 'RupeeBridge ✦', time: '~2 hrs', pct: 8, color: 'bg-green-500' },
            ].map(r => (
              <div key={r.name} className="flex items-center gap-3 mb-2 last:mb-0">
                <span className={clsx('text-xs w-28 flex-shrink-0', r.name.includes('✦') ? 'text-orange-500 font-semibold' : 'text-gray-500')}>{r.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div className={`${r.color} h-full rounded-full flex items-center justify-end pr-2`} style={{ width: `${r.pct}%` }}>
                    <span className="text-white text-[10px] font-medium whitespace-nowrap">{r.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Invoice form */}
          <div className="card p-5 space-y-4">
            <h3 className="font-display font-semibold text-gray-900">Build your invoice</h3>

            <div>
              <label className="label">Your name / business</label>
              <input className="input" placeholder="Ravi Kumar / RK Dev Studio" value={form.freelancerName} onChange={e => setForm({ ...form, freelancerName: e.target.value })} />
            </div>
            <div>
              <label className="label">Client name</label>
              <input className="input" placeholder="Acme Corp, USA" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} />
            </div>
            <div>
              <label className="label">Description of work</label>
              <input className="input" placeholder="Software development services" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Amount + currency boxes */}
            <div>
              <label className="label">Invoice amount</label>
              <div className="bg-[#0a0f1e] rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">{FLAGS[form.currency]}</span>
                    <input
                      type="number"
                      value={form.amountUSD}
                      onChange={e => setForm({ ...form, amountUSD: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white/8 border border-white/10 rounded-lg pl-10 pr-3 py-3 text-white font-bold text-xl outline-none focus:border-orange-400"
                    />
                  </div>
                  <select
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value })}
                    className="bg-white/10 border border-white/10 rounded-lg px-3 text-white text-sm outline-none"
                    style={{ fontFamily: 'DM Sans' }}
                  >
                    {Object.entries(FLAGS).map(([c, f]) => (
                      <option key={c} value={c} style={{ background: '#1e2d4a', color: 'white' }}>{f} {c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span>1 {form.currency} = <span className={clsx('font-semibold', flash ? 'text-green-400' : 'text-white/70')}>₹{rate.toFixed(2)}</span></span>
                  <span>Fee: {FLAGS[form.currency]} {fee.toFixed(2)}</span>
                  <span className="flex items-center gap-1 text-green-400"><span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />Live</span>
                </div>
                <div className="border-t border-white/8 pt-2 flex justify-between items-center">
                  <span className="text-white/40 text-sm">You receive</span>
                  <span className={clsx('font-display font-bold text-2xl transition-colors duration-300', flash ? 'text-green-400' : 'text-orange-400')}>
                    ₹{inrAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice preview */}
          {form.clientName && (
            <div className="card p-5 border-2 border-dashed border-gray-200">
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                <div>
                  <p className="font-display font-bold text-gray-900 text-lg">RupeeBridge</p>
                  <p className="text-gray-400 text-xs">Invoice #{invoiceId}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-lg font-medium">Export · GST Exempt</span>
              </div>
              {[
                ['From', form.freelancerName || 'Your Name · India'],
                ['To', form.clientName],
                ['Service', form.description],
                ['Amount', `${FLAGS[form.currency]} ${form.amountUSD} ${form.currency}`],
                ['Platform fee (0.5%)', `${FLAGS[form.currency]} ${fee.toFixed(2)}`],
                ['Exchange rate', `₹${rate.toFixed(2)} per ${form.currency}`],
                ['FEMA purpose', 'P0802 — IT/Software services'],
                ['GST status', 'Export of services · LUT filed · Zero rated'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-medium text-gray-800 text-right">{v}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t-2 border-gray-200 flex justify-between">
                <span className="font-bold text-gray-900">You receive (INR)</span>
                <span className="font-display font-bold text-green-600 text-xl">₹{inrAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          <button className="btn-primary w-full justify-center py-4 text-base" onClick={() => setStep(2)}>
            Next — Choose purpose & upload docs →
          </button>
        </div>
      )}

      {/* ─── STEP 2: Purpose + Docs ─── */}
      {step === 2 && (
        <div className="animate-fade-in space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-gray-900 mb-1">FEMA purpose code</h3>
            <p className="text-gray-400 text-xs mb-5 leading-relaxed">
              RBI requires every inward payment to have a purpose code. We auto-detect from your invoice.
              For software services, P0802 is pre-selected. Upload your invoice for verification.
            </p>
            <PurposeSelector selected={purposeCode} onSelect={setPurposeCode} inrAmount={inrAmount} />
          </div>

          {/* Always show invoice upload for freelancers */}
          <div className="card p-5 space-y-3">
            <h3 className="font-display font-semibold text-gray-900 text-sm">Supporting documents</h3>
            <p className="text-xs text-gray-400">Upload once. We auto-detect doc type and match FEMA code.</p>
            <DocUploadItem label="Invoice to Client" required={true} hint="Your invoice with service details and USD amount" />
            <DocUploadItem label="Service Contract / Agreement" required={false} hint="Contract or SOW — strengthens compliance" />
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 border border-blue-100">
              📌 e-FIRA (Foreign Inward Remittance Advice) will be auto-generated the moment payment arrives. No bank chasing needed.
            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn-outline flex-1" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary flex-1 justify-center py-4" onClick={handleReceive} disabled={receiving}>
              {receiving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing on Solana...
                </span>
              ) : `Receive ₹${inrAmount.toLocaleString('en-IN')} →`}
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Success ─── */}
      {step === 3 && (
        <div className="animate-fade-in text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 border-4 border-green-400 flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Payment received!</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            <strong className="text-green-600">₹{inrAmount.toLocaleString('en-IN')}</strong> will hit your bank in ~2 hours via IMPS.
          </p>

          {/* Solana tx hash */}
          <div className="bg-[#0a0f1e] rounded-2xl p-4 text-left mb-4">
            <p className="text-[10px] text-white/25 mb-1.5 font-mono uppercase tracking-wide">Solana Transaction Hash · Devnet · USDC-SPL</p>
            <p className="text-green-400 font-mono text-xs break-all leading-relaxed">{txHash}</p>
            <div className="flex justify-between mt-3">
              <span className="text-[10px] text-white/20 font-mono">{new Date().toLocaleTimeString()}</span>
              <a href={getSolanaExplorerUrl(txHash)} target="_blank" rel="noreferrer" className="text-xs text-purple-400 hover:underline">View on Solana Explorer ↗</a>
            </div>
          </div>

          {/* e-FIRA */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">📄</div>
            <div className="flex-1">
              <p className="font-semibold text-green-800 text-sm">e-FIRA Generated Automatically</p>
              <p className="text-green-600 text-xs">Foreign Inward Remittance Advice ready for ITR filing</p>
            </div>
            <button onClick={() => alert('e-FIRA downloaded!\n\nUse this document for:\n• Income tax return (ITR)\n• GST export proof\n• Bank compliance')} className="text-xs text-green-600 font-semibold underline flex-shrink-0">Download</button>
          </div>

          {/* GST invoice */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">🧾</div>
            <div className="flex-1">
              <p className="font-semibold text-blue-800 text-sm">GST Invoice #{invoiceId}</p>
              <p className="text-blue-600 text-xs">Export of services · Zero rated · LUT filed</p>
            </div>
            <button onClick={() => alert('GST Invoice downloaded!\n\nThis invoice is:\n• GST compliant\n• Export of services\n• Zero rated (no GST charged)')} className="text-xs text-blue-600 font-semibold underline flex-shrink-0">Download</button>
          </div>

          {/* Timeline */}
          <div className="card p-4 text-left space-y-3 mb-6">
            {[
              { dot: 'bg-green-500', title: `${form.amountUSD} ${form.currency} received from ${form.clientName || 'client'}`, time: 'Just now', done: true },
              { dot: 'bg-purple-500', title: 'USDC minted on Solana · ' + txHash.slice(0, 10) + '...', time: '~8 seconds', done: true },
              { dot: 'bg-green-400', title: 'FEMA purpose code filed · ' + purposeCode, time: 'Auto-filed', done: true },
              { dot: 'bg-orange-400', title: `₹${inrAmount.toLocaleString('en-IN')} IMPS to your bank`, time: 'Expected in ~2 hrs', done: false },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full ${item.dot} mt-1.5 flex-shrink-0 ${!item.done ? 'animate-pulse' : ''}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title} {item.done && '✓'}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="btn-outline flex-1" onClick={() => { setStep(1); setTxHash('') }}>New invoice</button>
            <button className="btn-primary flex-1 justify-center" onClick={() => navigate('/dashboard')}>Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

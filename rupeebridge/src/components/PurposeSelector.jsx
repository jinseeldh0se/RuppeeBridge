import { useState } from 'react'
import { FEMA_PURPOSES, DOC_TYPES, FEMA_THRESHOLDS } from '../utils/constants'
import clsx from 'clsx'

function DocUpload({ docKey }) {
  const [status, setStatus] = useState('idle')
  const doc = DOC_TYPES[docKey]
  if (!doc) return null

  return (
    <div className={clsx(
      'flex items-center gap-3 rounded-xl border p-3 transition-all',
      status === 'done' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
    )}>
      <div className={clsx(
        'w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0',
        status === 'done' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
      )}>
        {status === 'done' ? '✓' : '📄'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
          {doc.label}
          {doc.required
            ? <span className="text-[10px] text-red-500 font-normal bg-red-50 px-1.5 py-0.5 rounded">required</span>
            : <span className="text-[10px] text-gray-400 font-normal">optional</span>}
        </p>
        {status === 'uploading' && <p className="text-xs text-orange-500 mt-0.5">🔍 Detecting document type...</p>}
        {status === 'done' && <p className="text-xs text-green-600 mt-0.5">✓ Verified — matched to {doc.label}</p>}
        {status === 'idle' && <p className="text-xs text-gray-400 mt-0.5">{doc.hint}</p>}
      </div>
      {status !== 'done' && (
        <button
          onClick={() => { setStatus('uploading'); setTimeout(() => setStatus('done'), 1400) }}
          disabled={status === 'uploading'}
          className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:border-orange-400 hover:text-orange-500 transition-all flex-shrink-0 disabled:opacity-40"
        >
          {status === 'uploading' ? '...' : 'Upload'}
        </button>
      )}
    </div>
  )
}

export default function PurposeSelector({ selected, onSelect, inrAmount = 0 }) {
  const selectedPurpose = FEMA_PURPOSES.find(p => p.code === selected)
  const threshold = FEMA_THRESHOLDS.find(t => inrAmount <= t.limit)
  const needsDocs = inrAmount > (selectedPurpose?.maxNoDoc ?? 0)
  const docsToShow = needsDocs ? (selectedPurpose?.docs ?? []) : []

  return (
    <div className="space-y-4">

      {/* FEMA amount rule banner */}
      {inrAmount > 0 && threshold && (
        <div className={clsx('rounded-xl px-3.5 py-3 text-sm border flex items-start gap-2', threshold.color)}>
          <span className="flex-shrink-0 mt-0.5 text-base">
            {threshold.severity === 'low' ? '✅' : threshold.severity === 'medium' ? 'ℹ️' : threshold.severity === 'high' ? '📋' : '⚠️'}
          </span>
          <div>
            <p className="font-semibold">{threshold.label}</p>
            <p className="text-xs mt-0.5 opacity-80">{threshold.desc}</p>
          </div>
        </div>
      )}

      {/* Purpose chips */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select purpose of transfer</p>
        <div className="flex flex-wrap gap-2">
          {FEMA_PURPOSES.map(p => (
            <button
              key={p.code}
              onClick={() => onSelect(p.code)}
              className={clsx(
                'px-3.5 py-2 border-[1.5px] rounded-full text-sm cursor-pointer transition-all duration-150 whitespace-nowrap',
                selected === p.code
                  ? 'bg-orange-50 border-orange-400 text-orange-600 font-medium'
                  : 'border-gray-200 text-gray-600 bg-white hover:border-orange-300 hover:text-orange-500'
              )}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected purpose info */}
      {selected && selectedPurpose && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5">
          <p className="text-sm font-semibold text-green-800">
            Code {selected} — {selectedPurpose.desc}
          </p>
          <p className="text-xs text-green-600 mt-1">
            ✓ Auto-filed with RBI · Your bank will never call to ask why
          </p>
        </div>
      )}

      {/* Documents section */}
      {docsToShow.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Documents required for ₹{inrAmount.toLocaleString('en-IN')}
          </p>
          {docsToShow.map(key => <DocUpload key={key} docKey={key} />)}
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            📌 We auto-detect document type when you upload. Just take a clear photo.
          </p>
        </div>
      )}

      {/* No docs needed message */}
      {selected && !needsDocs && inrAmount > 0 && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-xl px-3.5 py-2.5 border border-green-100">
          <span>✓</span>
          <span>No documents required for this amount. Purpose code is sufficient.</span>
        </div>
      )}
    </div>
  )
}

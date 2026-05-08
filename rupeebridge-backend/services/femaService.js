// FEMA purpose codes and validation rules
const PURPOSE_CODES = {
  P1301: { label: 'Family maintenance', docsRequired: [], maxNoDoc: Infinity },
  P1302: { label: 'Gift or donation',   docsRequired: ['gift_declaration'], maxNoDoc: 50000 },
  P1401: { label: 'Salary / employment', docsRequired: ['employment_contract', 'payslip'], maxNoDoc: 0 },
  P1000: { label: 'Medical expenses',   docsRequired: ['hospital_bill'],    maxNoDoc: 50000 },
  P1100: { label: 'Education fees',     docsRequired: ['fee_receipt'],      maxNoDoc: 50000 },
  P0802: { label: 'IT / software services', docsRequired: ['invoice'],     maxNoDoc: 0 },
  P1006: { label: 'Consulting services', docsRequired: ['invoice'],         maxNoDoc: 0 },
  P1007: { label: 'Design / creative',  docsRequired: ['invoice'],          maxNoDoc: 0 },
}

const THRESHOLDS = [
  { limit: 50000,    level: 'low',      rbiRequired: false, supplementary: false },
  { limit: 100000,   level: 'medium',   rbiRequired: true,  supplementary: false },
  { limit: 500000,   level: 'high',     rbiRequired: true,  supplementary: false },
  { limit: Infinity, level: 'critical', rbiRequired: true,  supplementary: true  },
]

export function validateTransfer({ purposeCode, amountINR, uploadedDocs = [] }) {
  const errors = []
  const warnings = []

  // 1. Valid purpose code?
  const purpose = PURPOSE_CODES[purposeCode]
  if (!purpose) {
    errors.push(`Invalid FEMA purpose code: ${purposeCode}`)
    return { valid: false, errors, warnings, threshold: null }
  }

  // 2. Which threshold?
  const threshold = THRESHOLDS.find(t => amountINR <= t.limit)

  // 3. Check required documents
  if (amountINR > (purpose.maxNoDoc ?? 0)) {
    purpose.docsRequired.forEach(doc => {
      if (!uploadedDocs.includes(doc)) {
        errors.push(`Missing required document: ${doc} for purpose ${purposeCode}`)
      }
    })
  }

  // 4. Supplementary RBI R-Return above ₹5 lakh
  if (threshold.supplementary) {
    warnings.push('Amount above ₹5 lakh — RBI R-Return supplementary statement will be auto-filed')
  }

  // 5. LRS limit check (USD equivalent) — $250,000/year per person
  // In production: check against user's annual transfer history
  if (amountINR > 20900000) { // ~$250k at ₹83.5
    errors.push('Amount exceeds RBI Liberalised Remittance Scheme (LRS) limit of $250,000/year')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    threshold,
    purpose,
    requiresSupplementary: threshold.supplementary,
    requiresRBI: threshold.rbiRequired,
  }
}

export function generateFIRA({ txId, senderName, senderCountry, amountForeign, currency, amountINR, purposeCode, rate }) {
  const purpose = PURPOSE_CODES[purposeCode]
  return {
    firaId: `FIRA-${txId}-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    remitterName: senderName,
    remitterCountry: senderCountry,
    amountForeign,
    currency,
    amountINR,
    exchangeRate: rate,
    purposeCode,
    purposeDescription: purpose?.label ?? 'Inward remittance',
    adBank: 'RupeeBridge (via AD-II partner)',
    status: 'Generated',
    validForITR: true,
    note: 'Auto-generated e-FIRA. Valid for ITR filing under Section 195.',
  }
}

export function generateGSTInvoice({ invoiceId, fromName, toName, description, amountUSD, currency, amountINR, rate }) {
  return {
    invoiceId,
    generatedAt: new Date().toISOString(),
    from: { name: fromName, country: 'India' },
    to: { name: toName },
    description,
    amountForeign: amountUSD,
    currency,
    exchangeRate: rate,
    amountINR,
    gstStatus: 'Export of services — Zero rated (LUT filed)',
    purposeCode: 'P0802',
    notes: 'This is an export invoice. GST is nil-rated under IGST Act Section 16.',
  }
}

export { PURPOSE_CODES, THRESHOLDS }

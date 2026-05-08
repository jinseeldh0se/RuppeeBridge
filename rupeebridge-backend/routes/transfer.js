import express from 'express'
import { getRate, calculateTransfer } from '../services/fxService.js'
import { validateTransfer, generateFIRA } from '../services/femaService.js'
import { simulateReceiveUSDC } from '../solana/usdc.js'
import { routePayout } from '../services/payoutService.js'

const router = express.Router()

function makeRef() {
  return `RB-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

// ── POST /api/transfer ────────────────────────────────────────────────────────
// Main NRI remittance flow
router.post('/', async (req, res) => {
  const {
    amountForeign,
    currency = 'USD',
    method,           // 'upi' | 'phone' | 'bank'
    recipientFields,  // { upi_id } | { phone } | { account_number, ifsc, account_name }
    recipientName,
    purposeCode,
    uploadedDocs = [],
    senderName,
    senderCountry,
  } = req.body

  // ── 1. Validate inputs ────────────────────────────────────────────────────
  if (!amountForeign || amountForeign <= 0)
    return res.status(400).json({ error: 'Invalid amount' })
  if (!purposeCode)
    return res.status(400).json({ error: 'FEMA purpose code required' })
  if (!method || !recipientFields)
    return res.status(400).json({ error: 'Recipient details required' })

  const referenceId = makeRef()

  try {
    // ── 2. Get live FX rate ───────────────────────────────────────────────
    const rate = await getRate(currency)
    const { fee, amountINR } = calculateTransfer({ amountForeign, currency, rate })

    // ── 3. FEMA validation ────────────────────────────────────────────────
    const fema = validateTransfer({ purposeCode, amountINR, uploadedDocs })
    if (!fema.valid) {
      return res.status(422).json({
        error: 'FEMA validation failed',
        details: fema.errors,
        warnings: fema.warnings,
      })
    }

    // ── 4. Receive USDC on Solana ─────────────────────────────────────────
    // In production: user sends USDC → platformWallet from Circle/exchange
    // For demo: we simulate the receipt
    const solanaResult = await simulateReceiveUSDC(amountForeign, senderName || 'user')
    if (!solanaResult.success) {
      return res.status(500).json({ error: 'Solana USDC receipt failed' })
    }

    // ── 5. Pay INR to recipient ───────────────────────────────────────────
    const payout = await routePayout({ method, recipientFields, amountINR, referenceId, recipientName })

    // ── 6. Generate e-FIRA ────────────────────────────────────────────────
    const fira = generateFIRA({
      txId: referenceId,
      senderName: senderName || 'Remitter',
      senderCountry: senderCountry || 'Unknown',
      amountForeign,
      currency,
      amountINR,
      purposeCode,
      rate,
    })

    console.log(`✅ Transfer complete: ${referenceId} | ${amountForeign} ${currency} → ₹${amountINR}`)

    res.json({
      success: true,
      referenceId,
      transfer: {
        sent: { amount: amountForeign, currency },
        fee: { amount: fee, currency },
        received: { amount: amountINR, currency: 'INR' },
        rate,
        purposeCode,
        method,
      },
      solana: {
        txSignature: solanaResult.signature,
        explorerUrl: solanaResult.explorerUrl,
        network: process.env.SOLANA_NETWORK || 'devnet',
      },
      payout,
      fira,
      femaValidation: { warnings: fema.warnings, requiresSupplementary: fema.requiresSupplementary },
      estimatedArrival: method === 'bank' ? '10–30 minutes via IMPS' : 'Under 5 minutes via UPI',
    })

  } catch (err) {
    console.error('Transfer error:', err)
    res.status(500).json({ error: 'Transfer failed', details: err.message })
  }
})

export default router

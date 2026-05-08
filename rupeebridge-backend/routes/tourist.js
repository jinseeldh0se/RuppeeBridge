import express from 'express'
import { getRate } from '../services/fxService.js'
import { simulateReceiveUSDC } from '../solana/usdc.js'

const router = express.Router()

// POST /api/tourist/load — Load tourist wallet
router.post('/load', async (req, res) => {
  const { amountForeign, currency = 'USD', passportNumber, visaExpiry } = req.body

  if (!passportNumber || !visaExpiry)
    return res.status(400).json({ error: 'Passport and visa expiry required for KYC' })
  if (!amountForeign || amountForeign <= 0)
    return res.status(400).json({ error: 'Invalid amount' })

  // Max tourist wallet: ₹50,000 equivalent
  const rate = await getRate(currency)
  const amountINR = Math.round(amountForeign * rate * 0.985)
  if (amountINR > 50000)
    return res.status(400).json({ error: 'Tourist wallet limit is ₹50,000 per entry. Split across multiple loads.' })

  const solana = await simulateReceiveUSDC(amountForeign, `tourist-${passportNumber.slice(0, 4)}`)

  res.json({
    success: true,
    wallet: {
      balanceINR: amountINR,
      loadedForeign: amountForeign,
      currency,
      rate,
      visaExpiry,
      solanaSignature: solana.signature,
      explorerUrl: solana.explorerUrl,
    },
    message: `Wallet loaded with ₹${amountINR.toLocaleString('en-IN')}. Active until ${visaExpiry}.`,
  })
})

// POST /api/tourist/spend — Record UPI spend
router.post('/spend', async (req, res) => {
  const { amountINR, merchantUPI, description } = req.body
  const refId = `TXN-${Date.now()}`
  res.json({
    success: true,
    referenceId: refId,
    spent: { amountINR, merchantUPI, description },
    message: `₹${amountINR} paid to ${merchantUPI}`,
  })
})

// POST /api/tourist/refund — Refund leftover to card
router.post('/refund', async (req, res) => {
  const { balanceINR, currency = 'USD' } = req.body
  const rate = await getRate(currency)
  const refundForeign = parseFloat((balanceINR / rate).toFixed(2))
  res.json({
    success: true,
    refund: { balanceINR, refundForeign, currency, rate },
    message: `₹${balanceINR} will be refunded as ${refundForeign} ${currency} to your original card in 3–5 days`,
    note: 'Processed via Airwallex reverse transfer',
  })
})

// POST /api/tourist/donate — Donate leftover
router.post('/donate', async (req, res) => {
  const { balanceINR, charity, touristName } = req.body
  res.json({
    success: true,
    donation: { balanceINR, charity, touristName },
    certificate: {
      id: `CERT-${Date.now()}`,
      amount: balanceINR,
      charity,
      donor: touristName || 'Anonymous Tourist',
      date: new Date().toISOString(),
      reward: '0.5% fee waived on next India visit',
    },
    message: `₹${balanceINR} donated to ${charity}. Certificate will be emailed.`,
  })
})

export default router

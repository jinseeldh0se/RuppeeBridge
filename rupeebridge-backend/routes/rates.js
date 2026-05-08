import express from 'express'
import { getLiveRates, getRate, calculateTransfer } from '../services/fxService.js'

const router = express.Router()

// GET /api/rates — All live rates
router.get('/', async (req, res) => {
  const rates = await getLiveRates()
  res.json({ success: true, rates, updatedAt: new Date().toISOString() })
})

// GET /api/rates/calculate?amount=500&currency=USD&fee=0.5
router.get('/calculate', async (req, res) => {
  const { amount, currency = 'USD', fee = 0.5 } = req.query
  if (!amount) return res.status(400).json({ error: 'amount required' })

  const rate = await getRate(currency)
  const result = calculateTransfer({
    amountForeign: parseFloat(amount),
    currency,
    rate,
    feePct: parseFloat(fee) / 100,
  })

  res.json({ success: true, currency, ...result, displayRate: `1 ${currency} = ₹${rate}` })
})

export default router

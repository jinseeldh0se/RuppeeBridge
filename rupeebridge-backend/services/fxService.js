import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

// Fallback rates (used when API key not set)
const FALLBACK_RATES = {
  USD: 83.50, AED: 22.73, GBP: 108.20,
  EUR: 90.15, AUD: 54.30, CAD: 61.20,
}

// Cache so we don't hammer the API
let rateCache = { rates: { ...FALLBACK_RATES }, fetchedAt: 0 }
const CACHE_TTL_MS = 60 * 1000 // 1 minute

export async function getLiveRates() {
  const now = Date.now()
  if (now - rateCache.fetchedAt < CACHE_TTL_MS) {
    return rateCache.rates
  }

  const apiKey = process.env.FIXER_API_KEY
  if (!apiKey) {
    // Simulate slight movement for demo
    const rates = {}
    Object.entries(FALLBACK_RATES).forEach(([k, v]) => {
      rates[k] = parseFloat((v + (Math.random() - 0.5) * 0.1).toFixed(2))
    })
    return rates
  }

  try {
    // Fixer.io returns EUR-based rates, we convert to INR per unit
    const res = await axios.get(
      `http://data.fixer.io/api/latest?access_key=${apiKey}&base=EUR&symbols=INR,USD,AED,GBP,AUD,CAD`,
      { timeout: 5000 }
    )
    const { INR, USD, AED, GBP, AUD, CAD } = res.data.rates
    const rates = {
      USD: parseFloat((INR / USD).toFixed(2)),
      AED: parseFloat((INR / AED).toFixed(2)),
      GBP: parseFloat((INR / GBP).toFixed(2)),
      EUR: parseFloat((INR).toFixed(2)), // 1 EUR in INR directly
      AUD: parseFloat((INR / AUD).toFixed(2)),
      CAD: parseFloat((INR / CAD).toFixed(2)),
    }
    rateCache = { rates, fetchedAt: now }
    console.log('✅ FX rates refreshed from Fixer.io')
    return rates
  } catch (err) {
    console.warn('⚠️  Fixer.io failed, using cached/fallback rates:', err.message)
    return rateCache.rates
  }
}

export async function getRate(currency) {
  const rates = await getLiveRates()
  return rates[currency] ?? FALLBACK_RATES[currency] ?? 83.50
}

export function calculateTransfer({ amountForeign, currency, rate, feePct = 0.005 }) {
  const fee = amountForeign * feePct
  const netForeign = amountForeign - fee
  const amountINR = Math.round(netForeign * rate)
  return { fee, netForeign, amountINR, rate, feePct }
}

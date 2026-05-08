import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import { connection, platformWallet, NETWORK } from './solana/config.js'
import { getPlatformBalance } from './solana/usdc.js'
import transferRoutes from './routes/transfer.js'
import touristRoutes from './routes/tourist.js'
import freelancerRoutes from './routes/freelancer.js'
import ratesRoutes from './routes/rates.js'

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/rates',      ratesRoutes)
app.use('/api/transfer',   transferRoutes)
app.use('/api/tourist',    touristRoutes)
app.use('/api/freelancer', freelancerRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const slot = await connection.getSlot()
    const balances = await getPlatformBalance()
    res.json({
      status: 'ok',
      solana: {
        network: NETWORK,
        connected: true,
        currentSlot: slot,
        platformWallet: platformWallet.publicKey.toString(),
        balances,
      },
      services: {
        fxRates:   process.env.FIXER_API_KEY    ? 'live' : 'demo',
        payouts:   process.env.RAZORPAY_KEY     ? 'live' : 'demo',
        solana:    NETWORK,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(503).json({ status: 'degraded', error: err.message })
  }
})

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.path}` }))

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n🌉 RupeeBridge Backend')
  console.log(`   Port      : ${PORT}`)
  console.log(`   Network   : ${NETWORK}`)
  console.log(`   Wallet    : ${platformWallet.publicKey.toString()}`)
  console.log(`   Frontend  : ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  console.log('\n📡 Endpoints:')
  console.log('   GET  /api/health')
  console.log('   GET  /api/rates')
  console.log('   GET  /api/rates/calculate?amount=500&currency=USD')
  console.log('   POST /api/transfer')
  console.log('   POST /api/tourist/load')
  console.log('   POST /api/tourist/spend')
  console.log('   POST /api/tourist/refund')
  console.log('   POST /api/tourist/donate')
  console.log('   POST /api/freelancer/invoice')
  console.log('\n💡 Devnet setup:')
  console.log('   Fund SOL  : https://faucet.solana.com')
  console.log('   Fund USDC : https://faucet.circle.com')
  console.log('   Explorer  : https://explorer.solana.com?cluster=devnet\n')
})

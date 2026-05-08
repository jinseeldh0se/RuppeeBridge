import express from 'express'
import { getRate, calculateTransfer } from '../services/fxService.js'
import { validateTransfer, generateFIRA, generateGSTInvoice } from '../services/femaService.js'
import { simulateReceiveUSDC } from '../solana/usdc.js'
import { routePayout } from '../services/payoutService.js'

const router = express.Router()

function makeInvoiceId() {
  return `RB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
}

// POST /api/freelancer/invoice — Generate invoice + receive payment
router.post('/invoice', async (req, res) => {
  const {
    freelancerName,
    clientName,
    description,
    amountForeign,
    currency = 'USD',
    purposeCode = 'P0802',
    uploadedDocs = [],
    bankDetails, // { accountNumber, ifsc, accountName }
  } = req.body

  if (!amountForeign || amountForeign <= 0)
    return res.status(400).json({ error: 'Invalid invoice amount' })

  const invoiceId = makeInvoiceId()
  const referenceId = `FL-${Date.now()}`

  try {
    const rate = await getRate(currency)
    const { fee, amountINR } = calculateTransfer({ amountForeign, currency, rate })

    // FEMA validation
    const fema = validateTransfer({ purposeCode, amountINR, uploadedDocs })
    if (!fema.valid) {
      return res.status(422).json({ error: 'FEMA validation failed', details: fema.errors })
    }

    // Simulate USDC receipt on Solana
    const solana = await simulateReceiveUSDC(amountForeign, clientName || 'client')

    // Payout to freelancer's bank
    let payout = null
    if (bankDetails) {
      payout = await routePayout({
        method: 'bank',
        recipientFields: {
          account_number: bankDetails.accountNumber,
          ifsc: bankDetails.ifsc,
          account_name: bankDetails.accountName || freelancerName,
        },
        amountINR,
        referenceId,
        recipientName: freelancerName,
      })
    }

    // Generate documents
    const fira = generateFIRA({
      txId: referenceId,
      senderName: clientName,
      senderCountry: 'Abroad',
      amountForeign,
      currency,
      amountINR,
      purposeCode,
      rate,
    })

    const gstInvoice = generateGSTInvoice({
      invoiceId,
      fromName: freelancerName,
      toName: clientName,
      description,
      amountUSD: amountForeign,
      currency,
      amountINR,
      rate,
    })

    res.json({
      success: true,
      invoiceId,
      referenceId,
      invoice: {
        id: invoiceId,
        from: freelancerName,
        to: clientName,
        description,
        amountForeign,
        currency,
        fee,
        rate,
        amountINR,
        purposeCode,
        gstStatus: 'Export — Zero rated',
      },
      solana: {
        txSignature: solana.signature,
        explorerUrl: solana.explorerUrl,
        network: process.env.SOLANA_NETWORK || 'devnet',
      },
      payout,
      fira,
      gstInvoice,
      femaValidation: { warnings: fema.warnings },
      estimatedSettlement: '~2 hours via IMPS',
    })
  } catch (err) {
    console.error('Freelancer invoice error:', err)
    res.status(500).json({ error: 'Failed to process invoice', details: err.message })
  }
})

export default router

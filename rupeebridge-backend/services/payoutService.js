import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const RAZORPAY_KEY = process.env.RAZORPAY_KEY
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET
const RAZORPAY_ACCOUNT = process.env.RAZORPAY_ACCOUNT_NUMBER

function getAuth() {
  return Buffer.from(`${RAZORPAY_KEY}:${RAZORPAY_SECRET}`).toString('base64')
}

// ── Send INR via UPI ──────────────────────────────────────────────────────────
export async function payoutUPI({ upiId, amountINR, referenceId, narration }) {
  if (!RAZORPAY_KEY) return demoPayoutResponse('upi', upiId, amountINR, referenceId)

  const { data } = await axios.post(
    'https://api.razorpay.com/v1/payouts',
    {
      account_number: RAZORPAY_ACCOUNT,
      fund_account: {
        account_type: 'vpa',
        vpa: { address: upiId },
        contact: { name: narration, type: 'customer' },
      },
      amount: Math.round(amountINR * 100), // paise
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      reference_id: referenceId,
      narration,
    },
    {
      headers: {
        Authorization: `Basic ${getAuth()}`,
        'Content-Type': 'application/json',
        'X-Payout-Idempotency': referenceId,
      },
    }
  )
  return { success: true, payoutId: data.id, status: data.status, mode: 'UPI' }
}

// ── Send INR via Phone (UPI linked) ──────────────────────────────────────────
export async function payoutPhone({ phone, amountINR, referenceId, narration }) {
  if (!RAZORPAY_KEY) return demoPayoutResponse('phone', phone, amountINR, referenceId)

  const { data } = await axios.post(
    'https://api.razorpay.com/v1/payouts',
    {
      account_number: RAZORPAY_ACCOUNT,
      fund_account: {
        account_type: 'vpa',
        vpa: { address: phone + '@upi' },
        contact: { name: narration, type: 'customer', contact: phone },
      },
      amount: Math.round(amountINR * 100),
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      reference_id: referenceId,
      narration,
    },
    {
      headers: {
        Authorization: `Basic ${getAuth()}`,
        'Content-Type': 'application/json',
        'X-Payout-Idempotency': referenceId,
      },
    }
  )
  return { success: true, payoutId: data.id, status: data.status, mode: 'UPI_PHONE' }
}

// ── Send INR via Bank Account (IMPS/NEFT) ────────────────────────────────────
export async function payoutBank({ accountName, accountNumber, ifsc, amountINR, referenceId, narration }) {
  if (!RAZORPAY_KEY) return demoPayoutResponse('bank', accountNumber, amountINR, referenceId)

  // Step 1: Create contact
  const { data: contact } = await axios.post(
    'https://api.razorpay.com/v1/contacts',
    { name: accountName, type: 'customer' },
    { headers: { Authorization: `Basic ${getAuth()}`, 'Content-Type': 'application/json' } }
  )

  // Step 2: Create fund account
  const { data: fundAccount } = await axios.post(
    'https://api.razorpay.com/v1/fund_accounts',
    {
      contact_id: contact.id,
      account_type: 'bank_account',
      bank_account: { name: accountName, ifsc, account_number: accountNumber },
    },
    { headers: { Authorization: `Basic ${getAuth()}`, 'Content-Type': 'application/json' } }
  )

  // Step 3: Payout
  const mode = amountINR >= 200000 ? 'RTGS' : amountINR >= 2 ? 'IMPS' : 'NEFT'
  const { data } = await axios.post(
    'https://api.razorpay.com/v1/payouts',
    {
      account_number: RAZORPAY_ACCOUNT,
      fund_account_id: fundAccount.id,
      amount: Math.round(amountINR * 100),
      currency: 'INR',
      mode,
      purpose: 'payout',
      reference_id: referenceId,
      narration,
    },
    {
      headers: {
        Authorization: `Basic ${getAuth()}`,
        'Content-Type': 'application/json',
        'X-Payout-Idempotency': referenceId,
      },
    }
  )
  return { success: true, payoutId: data.id, status: data.status, mode }
}

// ── Demo fallback (no API keys) ───────────────────────────────────────────────
function demoPayoutResponse(method, destination, amountINR, referenceId) {
  console.log(`📤 [DEMO] INR payout: ₹${amountINR} → ${destination} via ${method}`)
  return {
    success: true,
    payoutId: `demo_payout_${Date.now()}`,
    status: 'processing',
    mode: method.toUpperCase(),
    referenceId,
    note: 'Demo mode — add RAZORPAY_KEY to .env for real payouts',
  }
}

// ── Route to correct payout method ───────────────────────────────────────────
export async function routePayout({ method, recipientFields, amountINR, referenceId, recipientName }) {
  const narration = `RupeeBridge-${referenceId.slice(0, 8)}`
  switch (method) {
    case 'upi':
      return payoutUPI({ upiId: recipientFields.upi_id, amountINR, referenceId, narration })
    case 'phone':
      return payoutPhone({ phone: recipientFields.phone, amountINR, referenceId, narration })
    case 'bank':
      return payoutBank({
        accountName: recipientFields.account_name || recipientName,
        accountNumber: recipientFields.account_number,
        ifsc: recipientFields.ifsc,
        amountINR, referenceId, narration,
      })
    default:
      throw new Error(`Unknown payout method: ${method}`)
  }
}

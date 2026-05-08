# RupeeBridge Backend — Solana USDC Integration

## Quick Start (Demo — no keys needed)

```bash
cd rupeebridge-backend
npm install
node scripts/generate-wallet.js   # generates your platform wallet once
npm run dev                        # starts on port 3001
```

## Full Setup

### 1. Generate platform wallet
```bash
node scripts/generate-wallet.js
```
Copy the secret key output into `.env` as `PLATFORM_SECRET_KEY`.

### 2. Create `.env` from template
```bash
cp .env.example .env
# Fill in your keys
```

### 3. Fund devnet wallet
- SOL (for transaction fees): https://faucet.solana.com
- USDC (for testing): https://faucet.circle.com

### 4. Start server
```bash
npm run dev
```

## API Reference

### Health check
```
GET /api/health
```

### Live FX rates
```
GET /api/rates
GET /api/rates/calculate?amount=500&currency=USD
```

### NRI Transfer (full flow)
```
POST /api/transfer
{
  "amountForeign": 500,
  "currency": "USD",
  "method": "upi",              // "upi" | "phone" | "bank"
  "recipientFields": {
    "upi_id": "name@paytm"      // for UPI
    // "phone": "+919876543210"  // for phone
    // "account_number": "...", "ifsc": "SBIN0001", "account_name": "..." // for bank
  },
  "recipientName": "Priya Kumar",
  "purposeCode": "P1301",
  "uploadedDocs": [],
  "senderName": "Ravi Kumar",
  "senderCountry": "UAE"
}
```

### Tourist wallet
```
POST /api/tourist/load    { amountForeign, currency, passportNumber, visaExpiry }
POST /api/tourist/spend   { amountINR, merchantUPI, description }
POST /api/tourist/refund  { balanceINR, currency }
POST /api/tourist/donate  { balanceINR, charity, touristName }
```

### Freelancer invoice
```
POST /api/freelancer/invoice
{
  "freelancerName": "Ravi Kumar",
  "clientName": "Acme Corp",
  "description": "Software development services",
  "amountForeign": 1000,
  "currency": "USD",
  "purposeCode": "P0802",
  "uploadedDocs": ["invoice"],
  "bankDetails": { "accountNumber": "...", "ifsc": "SBIN0001", "accountName": "Ravi Kumar" }
}
```

## Money Flow (Production)

```
Client pays USD
    │
    ▼
Airwallex virtual USD account
    │
    ▼
Circle API → USDC minted
    │
    ▼
Solana blockchain (USDC transfer to platformWallet)
    │
    ▼
Coinbase Prime OTC → sell USDC → INR (batch every 4–6 hrs)
    │
    ▼
RazorpayX INR pool → UPI/IMPS payout → recipient bank
```

## FEMA Purpose Codes
| Code  | Purpose                  | Docs required        |
|-------|--------------------------|----------------------|
| P1301 | Family maintenance       | None                 |
| P1302 | Gift                     | Gift declaration     |
| P1401 | Salary                   | Contract + payslip   |
| P1000 | Medical                  | Hospital bill        |
| P1100 | Education                | Fee receipt          |
| P0802 | IT/Software services     | Invoice              |
| P1006 | Consulting               | Invoice              |
| P1007 | Design/Creative          | Invoice              |

export const FX_RATES = {
  USD: 83.50, AED: 22.73, GBP: 108.20, EUR: 90.15, AUD: 54.30, CAD: 61.20,
}
export const FLAGS = {
  USD: '🇺🇸', AED: '🇦🇪', GBP: '🇬🇧', EUR: '🇪🇺', AUD: '🇦🇺', CAD: '🇨🇦',
}
export const CURRENCY_NAMES = {
  USD: 'US Dollar', AED: 'UAE Dirham', GBP: 'British Pound',
  EUR: 'Euro', AUD: 'Australian Dollar', CAD: 'Canadian Dollar',
}

export const TRANSFER_METHODS = [
  { id: 'upi', label: 'UPI ID', icon: '📱', hint: 'Instant · 24/7', fields: [{ key: 'upi_id', label: 'UPI ID', placeholder: 'name@paytm · name@ybl · name@okaxis' }] },
  { id: 'phone', label: 'Phone / UPI', icon: '☎️', hint: 'Linked to any UPI app', fields: [{ key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' }] },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦', hint: 'IMPS · NEFT · RTGS', fields: [
    { key: 'account_name', label: 'Account Holder Name', placeholder: 'Full name as in bank' },
    { key: 'account_number', label: 'Account Number', placeholder: '12-digit account number' },
    { key: 'ifsc', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' },
  ]},
]

export const FEMA_PURPOSES = [
  { code: 'P1301', label: 'Family maintenance', desc: 'Support for parents, spouse, children in India', icon: '👨‍👩‍👧', docs: [], maxNoDoc: Infinity },
  { code: 'P1302', label: 'Gift or donation', desc: 'Personal gift to relative or close friend', icon: '🎁', docs: ['gift_declaration'], maxNoDoc: 50000 },
  { code: 'P1401', label: 'Salary / employment', desc: 'Compensation from employer based abroad', icon: '💼', docs: ['employment_contract', 'payslip'], maxNoDoc: 0 },
  { code: 'P1000', label: 'Medical expenses', desc: 'Hospital bills, treatment, medicines', icon: '🏥', docs: ['hospital_bill', 'prescription'], maxNoDoc: 50000 },
  { code: 'P1100', label: 'Education fees', desc: 'Tuition, hostel, course or exam fees', icon: '🎓', docs: ['fee_receipt', 'admission_letter'], maxNoDoc: 50000 },
  { code: 'P0802', label: 'IT / software services', desc: 'Freelance coding, software development', icon: '💻', docs: ['invoice', 'contract'], maxNoDoc: 0 },
  { code: 'P1006', label: 'Consulting services', desc: 'Professional advisory consulting', icon: '📊', docs: ['invoice', 'contract'], maxNoDoc: 0 },
  { code: 'P1007', label: 'Design / creative', desc: 'Branding, content, marketing work', icon: '🎨', docs: ['invoice', 'work_order'], maxNoDoc: 0 },
]

export const DOC_TYPES = {
  gift_declaration: { label: 'Gift Declaration Letter', required: false, hint: 'Signed letter stating relationship with recipient' },
  employment_contract: { label: 'Employment Contract', required: true, hint: 'Your contract with the employer' },
  payslip: { label: 'Recent Payslip', required: true, hint: 'Latest 1–3 months payslip' },
  hospital_bill: { label: 'Hospital / Medical Bill', required: true, hint: 'Original bill or estimate from hospital' },
  prescription: { label: "Doctor's Prescription", required: false, hint: 'Prescription supporting the treatment' },
  fee_receipt: { label: 'Fee Receipt / Challan', required: true, hint: 'Official fee receipt from institution' },
  admission_letter: { label: 'Admission / Offer Letter', required: false, hint: 'Letter of admission from institution' },
  invoice: { label: 'Invoice to Client', required: true, hint: 'Your invoice with service details and USD amount' },
  contract: { label: 'Service Contract', required: false, hint: 'Contract or statement of work with client' },
  work_order: { label: 'Purchase Order / Work Order', required: false, hint: 'PO or work order issued by client' },
}

export const FEMA_THRESHOLDS = [
  { limit: 50000, label: 'Under ₹50,000', desc: 'Purpose code only — no documents needed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', severity: 'low' },
  { limit: 100000, label: '₹50,000 – ₹1 lakh', desc: 'Purpose code + basic declaration required', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', severity: 'medium' },
  { limit: 500000, label: '₹1 lakh – ₹5 lakh', desc: 'Purpose code + supporting document required', color: 'text-orange-700 bg-orange-50 border-orange-200', severity: 'high' },
  { limit: Infinity, label: 'Above ₹5 lakh', desc: 'Purpose code + documents + supplementary RBI R-Return statement', color: 'text-red-700 bg-red-50 border-red-200', severity: 'critical' },
]

export const COMPETITORS = [
  { name: 'Western Union', fee: '3–5%', fx: '2–3% markup', settlement: '1–3 days', fira: '❌', you: false },
  { name: 'PayPal', fee: '4.4% +', fx: '3–4% markup', settlement: '3–5 days', fira: '❌', you: false },
  { name: 'Wise', fee: '1.6–1.9%', fx: 'Mid-market', settlement: '1–2 days', fira: '$2.50 each', you: false },
  { name: 'Skydo', fee: '$19 flat', fx: 'Mid-market', settlement: '24–48 hrs', fira: '✓ Free', you: false },
  { name: 'Xflow', fee: '1%', fx: 'Mid-market', settlement: 'Next day', fira: '✓ Free', you: false },
  { name: 'RupeeBridge', fee: '0.5%', fx: 'Mid-market', settlement: '< 5 min ⚡', fira: '✓ Instant', you: true },
]

export const SOLANA_CONFIG = {
  network: 'devnet',
  usdcMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  explorerBase: 'https://explorer.solana.com/tx',
  cluster: 'devnet',
}

export function generateTxHash() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function getSolanaExplorerUrl(hash) {
  return `${SOLANA_CONFIG.explorerBase}/${hash}?cluster=${SOLANA_CONFIG.cluster}`
}

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  return res.json()
}

export const api = {
  health: () => get('/api/health'),
  rates: () => get('/api/rates'),
  calculate: (amount, currency) => get(`/api/rates/calculate?amount=${amount}&currency=${currency}`),

  transfer: (body) => post('/api/transfer', body),

  touristLoad: (body) => post('/api/tourist/load', body),
  touristSpend: (body) => post('/api/tourist/spend', body),
  touristRefund: (body) => post('/api/tourist/refund', body),
  touristDonate: (body) => post('/api/tourist/donate', body),

  freelancerInvoice: (body) => post('/api/freelancer/invoice', body),
}

import { useState, useEffect } from 'react'
import { FX_RATES } from '../utils/constants'

export function useLiveRates(intervalMs = 3000) {
  const [rates, setRates] = useState({ ...FX_RATES })
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setRates(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(k => {
          const delta = (Math.random() - 0.5) * 0.08
          updated[k] = parseFloat((updated[k] + delta).toFixed(2))
        })
        return updated
      })
      setFlash(true)
      setTimeout(() => setFlash(false), 500)
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return { rates, flash }
}

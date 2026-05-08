import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from '@solana/web3.js'
import dotenv from 'dotenv'
dotenv.config()

// ── Network ──────────────────────────────────────────────────────────────────
export const NETWORK = process.env.SOLANA_NETWORK || 'devnet'

export const connection = new Connection(
  NETWORK === 'mainnet-beta'
    ? clusterApiUrl('mainnet-beta')
    : clusterApiUrl('devnet'),
  'confirmed'
)

// ── USDC Mint addresses ───────────────────────────────────────────────────────
export const USDC_MINT_ADDRESS = {
  devnet:       '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  'mainnet-beta': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
}

export const USDC_MINT = new PublicKey(USDC_MINT_ADDRESS[NETWORK])

// ── Platform wallet ───────────────────────────────────────────────────────────
function loadPlatformWallet() {
  const raw = process.env.PLATFORM_SECRET_KEY
  if (!raw || raw === '[]') {
    // Demo mode — generate ephemeral wallet
    const wallet = Keypair.generate()
    console.log('⚠️  Demo mode: ephemeral wallet generated')
    console.log('   Run: node scripts/generate-wallet.js  to create a persistent one')
    console.log('   Platform address:', wallet.publicKey.toString())
    return wallet
  }
  try {
    const secretKey = Uint8Array.from(JSON.parse(raw))
    const wallet = Keypair.fromSecretKey(secretKey)
    console.log('✅ Platform wallet loaded:', wallet.publicKey.toString())
    return wallet
  } catch {
    throw new Error('Invalid PLATFORM_SECRET_KEY in .env — run scripts/generate-wallet.js')
  }
}

export const platformWallet = loadPlatformWallet()

// ── Explorer URL ──────────────────────────────────────────────────────────────
export function explorerUrl(signature) {
  return `https://explorer.solana.com/tx/${signature}?cluster=${NETWORK}`
}

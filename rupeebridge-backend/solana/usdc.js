import {
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import {
  getOrCreateAssociatedTokenAccount,
  getAccount,
  transfer,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { connection, USDC_MINT, platformWallet, explorerUrl } from './config.js'

// ── USDC has 6 decimal places ─────────────────────────────────────────────────
const USDC_DECIMALS = 6
const toRaw = (amount) => Math.round(amount * Math.pow(10, USDC_DECIMALS))
const toHuman = (raw) => raw / Math.pow(10, USDC_DECIMALS)

// ── Get USDC balance for any wallet ──────────────────────────────────────────
export async function getUSDCBalance(walletAddress) {
  try {
    const walletPubkey = new PublicKey(walletAddress)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: USDC_MINT }
    )
    if (!tokenAccounts.value.length) return 0
    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
    return balance || 0
  } catch (err) {
    console.error('getUSDCBalance error:', err.message)
    return 0
  }
}

// ── Get platform USDC balance ─────────────────────────────────────────────────
export async function getPlatformBalance() {
  const sol = await connection.getBalance(platformWallet.publicKey)
  const usdc = await getUSDCBalance(platformWallet.publicKey.toString())
  return {
    sol: sol / LAMPORTS_PER_SOL,
    usdc,
    address: platformWallet.publicKey.toString(),
  }
}

// ── Get or create USDC token account for a wallet ────────────────────────────
export async function getTokenAccount(ownerPublicKey) {
  const owner = new PublicKey(ownerPublicKey)
  const account = await getOrCreateAssociatedTokenAccount(
    connection,
    platformWallet,   // payer for account creation fee
    USDC_MINT,
    owner
  )
  return account
}

// ── Transfer USDC from platform wallet to any address ────────────────────────
export async function sendUSDC(toAddress, amountUSDC) {
  try {
    const toPubkey = new PublicKey(toAddress)

    // Get token accounts
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      platformWallet,
      USDC_MINT,
      platformWallet.publicKey
    )

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      platformWallet,   // payer
      USDC_MINT,
      toPubkey
    )

    const rawAmount = toRaw(amountUSDC)

    const signature = await transfer(
      connection,
      platformWallet,                 // payer + authority
      fromTokenAccount.address,       // from
      toTokenAccount.address,         // to
      platformWallet,                 // owner
      rawAmount
    )

    await connection.confirmTransaction(signature, 'confirmed')

    console.log(`✅ USDC sent: ${amountUSDC} USDC → ${toAddress}`)
    console.log(`   Signature: ${signature}`)

    return {
      success: true,
      signature,
      explorerUrl: explorerUrl(signature),
      amount: amountUSDC,
      to: toAddress,
    }
  } catch (err) {
    console.error('sendUSDC error:', err.message)
    return { success: false, error: err.message }
  }
}

// ── Transfer USDC between two arbitrary wallets ───────────────────────────────
// (Used when a user's keypair is managed server-side)
export async function transferUSDC({ fromKeypair, toAddress, amountUSDC }) {
  try {
    const toPubkey = new PublicKey(toAddress)

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection, platformWallet, USDC_MINT, fromKeypair.publicKey
    )
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection, platformWallet, USDC_MINT, toPubkey
    )

    const signature = await transfer(
      connection,
      platformWallet,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromKeypair,
      toRaw(amountUSDC)
    )

    await connection.confirmTransaction(signature, 'confirmed')

    return {
      success: true,
      signature,
      explorerUrl: explorerUrl(signature),
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// ── Simulate USDC receipt (demo: platform sends USDC to itself as "received") ──
// In production: user sends USDC from their Circle/exchange wallet to platformWallet
export async function simulateReceiveUSDC(amountUSDC, senderLabel = 'user') {
  console.log(`📥 Simulating receipt of ${amountUSDC} USDC from ${senderLabel}`)
  // In real production flow:
  // 1. Give user the platform wallet address
  // 2. User sends USDC from their wallet (Circle, Coinbase, etc.)
  // 3. You monitor platformWallet for incoming USDC via websocket
  // For demo: we record the "receipt" and return a mock signature
  const mockSig = Array.from({ length: 88 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
      Math.floor(Math.random() * 58)
    ]
  ).join('')

  return {
    success: true,
    signature: mockSig,
    explorerUrl: explorerUrl(mockSig),
    amountUSDC,
    note: 'Demo mode — in production user sends USDC to platform wallet',
  }
}

// ── Watch platform wallet for incoming USDC (webhook style) ──────────────────
export async function watchIncomingUSDC(callbackFn) {
  const platformTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    platformWallet.publicKey
  )

  console.log(`👁️  Watching for USDC on: ${platformTokenAccount.toString()}`)

  const subscriptionId = connection.onAccountChange(
    platformTokenAccount,
    async (accountInfo) => {
      try {
        const account = await getAccount(connection, platformTokenAccount)
        const balance = toHuman(Number(account.amount))
        console.log(`💰 USDC balance changed → ${balance} USDC`)
        callbackFn({ balance })
      } catch (err) {
        console.error('Watch error:', err.message)
      }
    },
    'confirmed'
  )

  return subscriptionId
}

export { toHuman, toRaw }

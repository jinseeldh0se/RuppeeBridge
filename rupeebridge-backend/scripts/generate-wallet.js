/**
 * RupeeBridge — Generate Platform Wallet
 * 
 * Run this ONCE to create your platform master wallet:
 *   node scripts/generate-wallet.js
 * 
 * Copy the output into your .env file as PLATFORM_SECRET_KEY
 * NEVER commit the .env file to git
 */

import { Keypair } from '@solana/web3.js'

const wallet = Keypair.generate()

console.log('\n🔐 RupeeBridge Platform Wallet Generated\n')
console.log('Public Key (wallet address):')
console.log(wallet.publicKey.toString())
console.log('\nSecret Key (paste into .env as PLATFORM_SECRET_KEY):')
console.log(JSON.stringify(Array.from(wallet.secretKey)))
console.log('\n⚠️  Save this secret key safely. You cannot recover it.')
console.log('📋 Fund this wallet with devnet SOL at: https://faucet.solana.com')
console.log('📋 Fund with devnet USDC at: https://faucet.circle.com\n')

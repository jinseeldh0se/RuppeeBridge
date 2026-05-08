export default function ArchitectureDiagram() {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <svg
        viewBox="0 0 700 230"
        className="w-full max-w-2xl mx-auto block min-w-[500px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="arrowOrg" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#f97316"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#14f195"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrowPurple" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#9945ff"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* YOU */}
        <rect x="10" y="75" width="110" height="65" rx="10" fill="#1e2d4a" stroke="#243858" strokeWidth="1" />
        <text x="65" y="101" textAnchor="middle" fill="white" fontSize="11" fontFamily="Syne" fontWeight="600">You</text>
        <text x="65" y="117" textAnchor="middle" fill="#f97316" fontSize="10" fontFamily="DM Sans">USD / AED / GBP</text>
        <text x="65" y="130" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="DM Sans">Airwallex</text>

        {/* Arrow 1 */}
        <line x1="120" y1="108" x2="164" y2="108" stroke="#f97316" strokeWidth="1.5" markerEnd="url(#arrowOrg)" strokeDasharray="4 3" />
        <text x="142" y="101" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="DM Sans">USD in</text>

        {/* CIRCLE */}
        <rect x="166" y="75" width="110" height="65" rx="10" fill="#2d1b4e" stroke="#9945ff" strokeWidth="1" />
        <text x="221" y="101" textAnchor="middle" fill="#a78bfa" fontSize="11" fontFamily="Syne" fontWeight="600">Circle API</text>
        <text x="221" y="117" textAnchor="middle" fill="#14f195" fontSize="10" fontFamily="DM Sans">USDC Mint</text>
        <text x="221" y="130" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="DM Sans">~10 seconds</text>

        {/* Arrow 2 */}
        <line x1="276" y1="108" x2="318" y2="108" stroke="#9945ff" strokeWidth="1.5" markerEnd="url(#arrowPurple)" strokeDasharray="4 3" />
        <text x="297" y="101" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="DM Sans">USDC</text>

        {/* SOLANA */}
        <rect x="320" y="55" width="120" height="108" rx="12" fill="#0f1a2e" stroke="#14f195" strokeWidth="1.5" />
        <text x="380" y="84" textAnchor="middle" fill="#14f195" fontSize="13" fontFamily="Syne" fontWeight="700">Solana</text>
        <text x="380" y="101" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10" fontFamily="DM Sans">Blockchain</text>
        <text x="380" y="117" textAnchor="middle" fill="#9945ff" fontSize="10" fontFamily="DM Sans">USDC Transfer</text>
        <text x="380" y="132" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="DM Sans">~$0.001 fee</text>
        <text x="380" y="148" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="DM Sans">Devnet / Mainnet</text>

        {/* Arrow 3 */}
        <line x1="440" y1="108" x2="483" y2="108" stroke="#14f195" strokeWidth="1.5" markerEnd="url(#arrowGreen)" strokeDasharray="4 3" />
        <text x="462" y="101" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="DM Sans">Sell USDC</text>

        {/* INR POOL */}
        <rect x="485" y="75" width="110" height="65" rx="10" fill="#0c2310" stroke="#10b981" strokeWidth="1" />
        <text x="540" y="101" textAnchor="middle" fill="#34d399" fontSize="11" fontFamily="Syne" fontWeight="600">INR Pool</text>
        <text x="540" y="117" textAnchor="middle" fill="white" fontSize="10" fontFamily="DM Sans">RazorpayX</text>
        <text x="540" y="130" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="DM Sans">UPI instant</text>

        {/* Arrow down */}
        <line x1="540" y1="140" x2="540" y2="168" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />

        {/* RECIPIENT */}
        <rect x="465" y="170" width="150" height="45" rx="8" fill="#1a2e1a" stroke="#10b981" strokeWidth="0.8" />
        <text x="540" y="190" textAnchor="middle" fill="#34d399" fontSize="11" fontFamily="Syne" fontWeight="600">Family gets ₹INR</text>
        <text x="540" y="206" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="DM Sans">Bank · Under 5 minutes</text>

        {/* Replenishment arc */}
        <path d="M540 75 Q540 28 380 28 Q270 28 221 75"
          fill="none" stroke="rgba(249,115,22,0.25)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="375" y="20" textAnchor="middle" fill="rgba(249,115,22,0.4)" fontSize="9" fontFamily="DM Sans">
          Pool replenishment every 4–6 hrs (Coinbase Prime OTC)
        </text>
      </svg>
    </div>
  )
}

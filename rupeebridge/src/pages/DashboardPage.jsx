import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
  {
    id: 'nri', icon: '🇮🇳', title: 'NRI / Family Remittance',
    desc: 'Send money to family in India from UAE, UK, USA, Australia',
    features: ['Auto FEMA purpose codes', 'e-FIRA auto-generated', 'Under 5 minutes'],
    active: true, path: '/nri',
    gradient: 'from-orange-50 to-amber-50', border: 'border-orange-200 hover:border-orange-400',
  },
  {
    id: 'tourist', icon: '✈️', title: 'Tourist Wallet',
    desc: 'Visiting India? Load wallet, pay via UPI, refund leftover on exit',
    features: ['Visa-linked expiry', 'UPI QR scanner', 'Auto refund / donate'],
    active: true, path: '/tourist',
    gradient: 'from-blue-50 to-indigo-50', border: 'border-blue-200 hover:border-blue-400',
  },
]

export default function DashboardPage({ user }) {
  const navigate = useNavigate()
  return (
    <div className="page max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name?.split(' ')[0] || 'there'} 👋
        </h2>
        <p className="text-gray-500">How will you use RupeeBridge today?</p>
      </div>
      <div className="space-y-4">
        {CATEGORIES.map(cat => (
          <div key={cat.id} onClick={() => navigate(cat.path)}
            className={`card bg-gradient-to-r ${cat.gradient} border ${cat.border} p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}>
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0 leading-none mt-0.5">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-gray-900 text-lg mb-1">{cat.title}</h3>
                <p className="text-gray-500 text-sm mb-3">{cat.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.features.map((f, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/80 text-gray-600">✓ {f}</span>
                  ))}
                </div>
              </div>
              <span className="text-gray-300 text-2xl self-center">›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

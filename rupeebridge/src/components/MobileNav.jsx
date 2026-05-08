import { useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'

const items = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/nri', icon: '💸', label: 'Send' },
  { path: '/tourist', icon: '🛂', label: 'Tourist' },
  { path: '/dashboard', icon: '⚡', label: 'More' },
]

export default function MobileNav({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  if (!user) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden safe-bottom">
      <div className="flex justify-around py-2 pb-safe">
        {items.map(item => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all',
                active ? 'text-brand' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={clsx('text-[10px] font-medium', active && 'text-brand')}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

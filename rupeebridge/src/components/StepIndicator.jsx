import clsx from 'clsx'

export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
              i + 1 < current ? 'bg-green-500 text-white' :
              i + 1 === current ? 'bg-brand text-white shadow-lg shadow-brand/30' :
              'bg-gray-200 text-gray-400'
            )}>
              {i + 1 < current ? '✓' : i + 1}
            </div>
            <span className={clsx(
              'text-[10px] mt-1.5 font-medium whitespace-nowrap',
              i + 1 === current ? 'text-brand' : 'text-gray-400'
            )}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={clsx(
              'flex-1 h-0.5 mx-2 mb-4 transition-all duration-300',
              i + 1 < current ? 'bg-green-400' : 'bg-gray-200'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

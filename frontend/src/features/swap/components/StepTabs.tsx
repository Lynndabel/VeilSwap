import { SWAP_STEPS, type SwapStep } from '../steps'

type StepTabsProps = {
  current: SwapStep
  onSelect?: (step: SwapStep) => void
}

export function StepTabs({ current, onSelect }: StepTabsProps) {
  return (
    <nav className="flex flex-wrap gap-2">
      {SWAP_STEPS.map((step, index) => {
        const active = step.id === current
        return (
          <button
            key={step.id}
            onClick={() => onSelect?.(step.id)}
            className={[
              'group flex min-w-[140px] flex-1 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
              active
                ? 'border-indigo-400/60 bg-indigo-500/10 text-indigo-100 shadow-[0_0_30px_-12px_rgba(99,102,241,0.8)]'
                : 'border-white/5 bg-white/5 text-slate-300 hover:border-indigo-400/40 hover:text-indigo-100'
            ].join(' ')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-current/30 text-sm font-semibold">
              {index + 1}
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold uppercase tracking-wide">{step.label}</div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300">{step.description}</p>
            </div>
          </button>
        )
      })}
    </nav>
  )
}

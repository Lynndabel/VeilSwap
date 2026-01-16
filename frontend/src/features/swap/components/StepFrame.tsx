import { ReactNode } from 'react'
import { SWAP_STEPS, type SwapStep } from '../steps'

type StepFrameProps = {
  step: SwapStep
  children: ReactNode
  onBack?: () => void
  onNext?: () => void
  nextDisabled?: boolean
  backDisabled?: boolean
  nextLabel?: string
  backLabel?: string
  footer?: ReactNode
  statusBadge?: ReactNode
}

export function StepFrame({
  step,
  children,
  onBack,
  onNext,
  nextDisabled,
  backDisabled,
  nextLabel = 'Next',
  backLabel = 'Back',
  footer,
  statusBadge
}: StepFrameProps) {
  const meta = SWAP_STEPS.find((s) => s.id === step)
  const stepIndex = SWAP_STEPS.findIndex((s) => s.id === step)

  return (
    <div className="rounded-3xl border border-white/5 bg-slate-950/60 p-8 shadow-lg shadow-indigo-950/20">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
              {meta?.label ?? 'Step'}
            </span>
            <h3 className="mt-2 text-2xl font-semibold text-slate-50">{meta?.description ?? ''}</h3>
          </div>
          {statusBadge}
        </header>

        <div className="space-y-6 text-sm text-slate-300">{children}</div>

        <footer className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Step {stepIndex + 1}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" aria-hidden />
            <span>{meta?.description}</span>
          </div>
          <div className="flex items-center justify-end gap-3">
            {onBack && (
              <button
                onClick={onBack}
                disabled={backDisabled}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-white/20 hover:text-slate-200 disabled:opacity-30"
              >
                {backLabel}
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                disabled={nextDisabled}
                className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-50 transition hover:bg-indigo-500/90 disabled:opacity-40"
              >
                {nextLabel}
              </button>
            )}
          </div>
        </footer>

        {footer}
      </div>
    </div>
  )
}

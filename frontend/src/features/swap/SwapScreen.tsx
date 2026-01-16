import { useCallback, useMemo } from 'react'
import { Layout } from '../../components/Layout'
import { StepTabs } from './components/StepTabs'
import { useSwap } from './state'
import { SWAP_STEPS, getNextStep, getPreviousStep } from './steps'

function StepPlaceholder() {
  const {
    state: { step },
    dispatch
  } = useSwap()

  const meta = useMemo(() => SWAP_STEPS.find((s) => s.id === step), [step])
  const previous = getPreviousStep(step)
  const next = getNextStep(step)

  const canGoBack = previous !== step
  const canAdvance = next !== step

  const onBack = useCallback(() => {
    if (!canGoBack) return
    dispatch({ type: 'SET_STEP', step: previous })
  }, [canGoBack, dispatch, previous])

  const onNext = useCallback(() => {
    if (!canAdvance) return
    dispatch({ type: 'SET_STEP', step: next })
  }, [canAdvance, dispatch, next])

  return (
    <div className="rounded-3xl border border-white/5 bg-slate-950/60 p-8 shadow-lg shadow-indigo-950/20">
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">{meta?.label}</div>
          <h3 className="mt-2 text-2xl font-semibold text-slate-50">Step coming soon</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
            We&apos;re constructing the full privacy-preserving swap flow. This step will house interactive controls
            tailored to the <span className="font-semibold text-indigo-200">{meta?.label}</span> experience soon.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 disabled:opacity-30"
          >
            Back
          </button>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Step {SWAP_STEPS.findIndex((s) => s.id === step) + 1}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" aria-hidden />
            <span>{meta?.description}</span>
          </div>
          <button
            onClick={onNext}
            disabled={!canAdvance}
            className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-50 hover:bg-indigo-500/90 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

function InsightsPlaceholder() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-inner shadow-black/40">
        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">Insights</h4>
        <p className="mt-2 text-sm text-slate-400">
          Analytics, reserve snapshots, and privacy explainers will land here to guide your private swap decisions.
        </p>
      </div>
      <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
        <h5 className="text-sm font-semibold text-slate-200">What to expect</h5>
        <ul className="mt-3 space-y-2 text-xs text-slate-400">
          <li>• Live reserve ratios and slippage insights</li>
          <li>• Activity feed for recent shielded swaps</li>
          <li>• Educational modules on encrypted transaction flows</li>
        </ul>
      </div>
    </div>
  )
}

function SwapLeftRail() {
  const {
    state: { step },
    dispatch
  } = useSwap()

  return (
    <div className="space-y-8">
      <StepTabs current={step} onSelect={(selected) => dispatch({ type: 'SET_STEP', step: selected })} />
      <StepPlaceholder />
    </div>
  )
}

export function SwapScreen() {
  return <Layout left={<SwapLeftRail />} right={<InsightsPlaceholder />} />
}

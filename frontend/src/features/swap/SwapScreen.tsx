import { useMemo } from 'react'
import { Layout } from '../../components/Layout'
import { StepTabs } from './components/StepTabs'
import { useSwap } from './state'
import { SWAP_STEPS, type SwapStep } from './steps'
import { ConnectStep } from './steps/ConnectStep'
import { ConfigureStep } from './steps/ConfigureStep'
import { ReviewStep } from './steps/ReviewStep'
import { ConfirmedStep } from './steps/ConfirmedStep'
import { useInsights } from './insights'

function StepPlaceholder({ step }: Readonly<{ step: SwapStep }>) {
  const meta = useMemo(() => SWAP_STEPS.find((s) => s.id === step), [step])
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
      </div>
    </div>
  )
}

function InsightsPanel() {
  const { status, reserves, recentSwaps } = useInsights()

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-inner shadow-black/40">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">Pool reserves</h4>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            {status === 'loading' ? 'Loading…' : status === 'ready' ? 'Live' : 'Snapshot'}
          </span>
        </div>
        <div className="mt-4 space-y-3 text-xs text-slate-300">
          {reserves.length === 0 ? (
            <p>No reserve data available yet.</p>
          ) : (
            reserves.map((reserve) => (
              <div
                key={`${reserve.tokenA.symbol}-${reserve.tokenB.symbol}`}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  <span>
                    {reserve.tokenA.symbol}/{reserve.tokenB.symbol}
                  </span>
                  <span>{new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(-Math.round((Date.now() - reserve.updatedAt) / (1000 * 60)), 'minute')}</span>
                </div>
                <div className="mt-2 grid gap-2 text-sm text-slate-100 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-slate-500">Reserve {reserve.tokenA.symbol}</div>
                    <div className="font-semibold">{reserve.reserveA}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Reserve {reserve.tokenB.symbol}</div>
                    <div className="font-semibold">{reserve.reserveB}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-semibold text-slate-200">Recent shielded swaps</h5>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Preview</span>
        </div>
        <div className="mt-4 space-y-3 text-xs text-slate-300">
          {recentSwaps.length === 0 ? (
            <p>No historical swaps yet.</p>
          ) : (
            recentSwaps.map((swap) => (
              <div key={swap.hash} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  <span>
                    {swap.tokenIn.symbol} → {swap.tokenOut.symbol}
                  </span>
                  <span>{swap.privacyEnabled ? 'Shielded' : 'Public'}</span>
                </div>
                <div className="mt-2 flex flex-col gap-1 text-sm text-slate-100">
                  <span>
                    {swap.amountIn} {swap.tokenIn.symbol} ⇢ {swap.amountOut} {swap.tokenOut.symbol}
                  </span>
                  <span className="text-[11px] text-slate-500">{new Date(swap.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function SwapLeftRail() {
  const {
    state: { step },
    dispatch
  } = useSwap()

  const content = useMemo(() => {
    switch (step) {
      case 'connect':
        return <ConnectStep />
      case 'configure':
        return <ConfigureStep />
      case 'review':
        return <ReviewStep />
      case 'confirmed':
        return <ConfirmedStep />
      default:
        return <StepPlaceholder step={step} />
    }
  }, [step])

  return (
    <div className="space-y-8">
      <StepTabs current={step} onSelect={(selected) => dispatch({ type: 'SET_STEP', step: selected })} />
      {content}
    </div>
  )
}

export function SwapScreen() {
  return <Layout left={<SwapLeftRail />} right={<InsightsPanel />} />
}

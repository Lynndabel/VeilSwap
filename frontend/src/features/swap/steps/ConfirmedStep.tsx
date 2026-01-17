import { useCallback, useMemo } from 'react'
import { StepFrame } from '../components/StepFrame'
import { useSwap } from '../state'

const SNOWTRACE_BASE = 'https://testnet.snowtrace.io/tx/'

function buildExplorerUrl(hash: string) {
  return `${SNOWTRACE_BASE}${hash}`
}

export function ConfirmedStep() {
  const {
    state: { lastTx, pair },
    dispatch
  } = useSwap()

  const hasReceipt = Boolean(lastTx)

  const summary = useMemo(() => {
    if (!lastTx) return null
    return {
      pair: `${lastTx.tokenIn.symbol} → ${lastTx.tokenOut.symbol}`,
      input: `${lastTx.amountIn} ${lastTx.tokenIn.symbol}`,
      output: lastTx.amountOut ? `${lastTx.amountOut} ${lastTx.tokenOut.symbol}` : 'Pending output',
      timestamp: new Date(lastTx.timestamp * 1000).toLocaleString(),
      hash: lastTx.hash,
      explorer: buildExplorerUrl(lastTx.hash)
    }
  }, [lastTx])

  const onNewSwap = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: 'configure' })
  }, [dispatch])

  const onBackToReview = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: 'review' })
  }, [dispatch])

  return (
    <StepFrame
      step="confirmed"
      onBack={hasReceipt ? onBackToReview : undefined}
      backLabel="Review"
      nextLabel="Start new swap"
      onNext={onNewSwap}
      nextDisabled={false}
      statusBadge={
        <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
          Completed
        </span>
      }
    >
      {hasReceipt && summary ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Swap summary</div>
            <div className="mt-4 grid gap-4 text-sm text-slate-100 md:grid-cols-2">
              <div>
                <div className="text-xs text-slate-500">Pair</div>
                <div className="text-base font-semibold text-slate-50">{summary.pair}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Executed</div>
                <div className="text-base font-semibold text-slate-50">{summary.timestamp}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Input</div>
                <div className="text-base font-semibold text-slate-50">{summary.input}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Output</div>
                <div className="text-base font-semibold text-slate-50">{summary.output}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction hash</span>
              <a
                href={summary.explorer}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-300 transition hover:text-indigo-100"
              >
                View on Snowtrace
              </a>
            </div>
            <div className="mt-3 break-all rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-[11px] text-slate-200">
              {summary.hash}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          <div className="text-lg font-semibold text-slate-100">No transaction recorded yet</div>
          <p className="text-xs text-slate-400">
            Complete a swap to view its receipt here. Head back to configuration to stage your next private trade.
          </p>
          <button
            type="button"
            onClick={onNewSwap}
            className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-50 transition hover:bg-indigo-500/90"
          >
            Configure swap
          </button>
        </div>
      )}
    </StepFrame>
  )
}

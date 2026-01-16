import { useCallback, useEffect, useMemo } from 'react'
import { parseUnits } from 'ethers'
import { StepFrame } from '../components/StepFrame'
import { TokenSelect } from '../components/TokenSelect'
import { PrivacyToggle } from '../../../components/PrivacyToggle'
import { useSwap } from '../state'
import { DEFAULT_TOKENS } from '../tokenCatalog'
import { useTokenBalance } from '../hooks/useTokenBalance'
import type { SwapToken } from '../types'

function ensureDefaults(token?: SwapToken, fallback?: SwapToken) {
  return token ?? fallback
}

export function ConfigureStep() {
  const {
    state: { pair, amounts, privacyEnabled },
    dispatch
  } = useSwap()

  const tokenIn = ensureDefaults(pair.tokenIn, DEFAULT_TOKENS[0])
  const tokenOut = ensureDefaults(pair.tokenOut, DEFAULT_TOKENS[1])

  useEffect(() => {
    dispatch({ type: 'SET_PAIR', pair: { tokenIn, tokenOut } })
  }, [dispatch, tokenIn, tokenOut])

  const balanceIn = useTokenBalance(tokenIn)

  const amountIn = amounts.amountIn ?? ''

  const parsedAmountIn = useMemo(() => {
    if (!tokenIn || !amountIn) return undefined
    try {
      return parseUnits(amountIn, tokenIn.decimals)
    } catch (_) {
      return undefined
    }
  }, [amountIn, tokenIn])

  const amountValid = Boolean(parsedAmountIn && parsedAmountIn > 0n)
  const hasBalance = useMemo(() => {
    if (!parsedAmountIn) return false
    if (!balanceIn.canQuery || balanceIn.balance === undefined) return true
    return parsedAmountIn <= balanceIn.balance
  }, [balanceIn.balance, balanceIn.canQuery, parsedAmountIn])

  const canAdvance = amountValid && hasBalance && tokenIn && tokenOut && tokenIn.address !== tokenOut.address

  const onAmountChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_AMOUNTS', amounts: { amountIn: value } })
    },
    [dispatch]
  )

  const onMax = useCallback(() => {
    if (!balanceIn.formatted || balanceIn.formatted === '--') return
    onAmountChange(balanceIn.formatted)
  }, [balanceIn.formatted, onAmountChange])

  const onSwapTokens = useCallback(() => {
    dispatch({ type: 'SET_PAIR', pair: { tokenIn: tokenOut, tokenOut: tokenIn } })
  }, [dispatch, tokenIn, tokenOut])

  const onSelectIn = useCallback(
    (next: SwapToken) => {
      dispatch({ type: 'SET_PAIR', pair: { tokenIn: next } })
    },
    [dispatch]
  )

  const onSelectOut = useCallback(
    (next: SwapToken) => {
      dispatch({ type: 'SET_PAIR', pair: { tokenOut: next } })
    },
    [dispatch]
  )

  const onTogglePrivacy = useCallback(
    (enabled: boolean) => {
      dispatch({ type: 'TOGGLE_PRIVACY', enabled })
    },
    [dispatch]
  )

  const onNext = useCallback(() => {
    if (!canAdvance) return
    dispatch({ type: 'SET_STEP', step: 'review' })
  }, [canAdvance, dispatch])

  const onBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: 'connect' })
  }, [dispatch])

  return (
    <StepFrame
      step="configure"
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!canAdvance}
      nextLabel="Review"
      statusBadge={
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            privacyEnabled
              ? 'border-indigo-400/40 bg-indigo-400/10 text-indigo-200'
              : 'border-white/10 bg-white/5 text-slate-300'
          }`}
        >
          {privacyEnabled ? 'Shielded' : 'Public'}
        </span>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <TokenSelect label="From" token={tokenIn} onSelect={onSelectIn} />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Amount</span>
                <button
                  type="button"
                  onClick={onMax}
                  className="rounded-full border border-white/10 px-3 py-1 font-semibold uppercase tracking-wide text-slate-300 transition hover:border-white/20 hover:text-slate-100"
                >
                  Max
                </button>
              </div>
              <input
                className="mt-3 w-full bg-transparent text-3xl font-semibold text-slate-50 outline-none placeholder:text-slate-600"
                placeholder="0.0"
                value={amountIn}
                onChange={(event) => onAmountChange(event.target.value)}
                inputMode="decimal"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Balance: {balanceIn.isLoading ? 'Loading…' : balanceIn.formatted}
                  {balanceIn.error ? <span className="ml-2 text-rose-300">{balanceIn.error}</span> : null}
                </span>
                {!hasBalance && amountValid ? <span className="text-rose-300">Insufficient balance</span> : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSwapTokens}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-white/20 hover:text-slate-100"
          >
            Swap tokens
          </button>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Privacy</div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
              <div>
                <div className="text-sm font-semibold text-slate-200">Shield transaction amount</div>
                <div className="text-xs text-slate-500">
                  When enabled, the on-chain payload hides the exact input amount using encrypted bytes.
                </div>
              </div>
              <PrivacyToggle value={privacyEnabled} onChange={onTogglePrivacy} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <TokenSelect label="To" token={tokenOut} onSelect={onSelectOut} />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
            <div className="font-semibold text-slate-200">Estimated output</div>
            <p className="mt-2 text-xs">
              Final amount will be calculated during review once quotes and privacy constraints are evaluated.
            </p>
          </div>
        </div>
      </div>
    </StepFrame>
  )
}

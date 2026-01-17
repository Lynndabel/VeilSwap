import { useCallback, useMemo, useState } from 'react'
import { encodePacked, parseUnits } from 'viem'
import { StepFrame } from '../components/StepFrame'
import { useSwap } from '../state'
import { useQuote } from '../hooks/useQuote'
import { useAllowance } from '../hooks/useAllowance'
import { useWallet } from '../../wallet/WalletProvider'
import { Contract } from 'ethers'
import { PRIVATE_AMM_ABI } from '../../../lib/abi/PrivateAMM'
import { DEFAULT_TOKENS } from '../tokenCatalog'

const SWAP_STATUS = ['idle', 'preparing', 'pending', 'confirming', 'success', 'error'] as const

export type SwapStatus = (typeof SWAP_STATUS)[number]

type SwapFeedback = {
  status: SwapStatus
  message?: string
}

export function ReviewStep() {
  const {
    state: { pair, amounts, privacyEnabled, quote },
    dispatch
  } = useSwap()
  const { signer, address } = useWallet()
  const { status: quoteStatus, error: quoteError, refresh: refreshQuote } = useQuote()
  const {
    allowance,
    status: allowanceStatus,
    approvalStatus,
    needsApproval,
    approve,
    error: allowanceError,
    refresh: refreshAllowance
  } = useAllowance()

  const tokenIn = pair.tokenIn ?? DEFAULT_TOKENS[0]
  const tokenOut = pair.tokenOut ?? DEFAULT_TOKENS[1]
  const amountIn = amounts.amountIn ?? ''
  const minAmountOut = amounts.minAmountOut ?? quote?.formattedMin ?? '--'

  const [swapFeedback, setSwapFeedback] = useState<SwapFeedback>({ status: 'idle' })

  const amountInWei = useMemo(() => {
    if (!tokenIn || !amountIn) return undefined
    try {
      return parseUnits(amountIn, tokenIn.decimals)
    } catch (err) {
      console.warn('Failed to parse amountIn for swap', err)
      return undefined
    }
  }, [amountIn, tokenIn])

  const isQuoteReady = quoteStatus === 'success' && quote?.amountOutWei && quote.amountOutWei > 0n
  const canSwap = Boolean(
    !needsApproval &&
      isQuoteReady &&
      amountInWei &&
      amountInWei > 0n &&
      tokenIn &&
      tokenOut &&
      tokenIn.address !== tokenOut.address &&
      signer &&
      address
  )

  const priceImpact = useMemo(() => {
    if (!quote?.priceImpactBps) return undefined
    return quote.priceImpactBps / 100
  }, [quote?.priceImpactBps])

  const onBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: 'configure' })
  }, [dispatch])

  const handleApprove = useCallback(async () => {
    try {
      await approve()
    } catch (err) {
      console.error('Approval failed', err)
    }
  }, [approve])

  const handleSwap = useCallback(async () => {
    if (!signer || !tokenIn || !tokenOut || !amountInWei || !quote?.minAmountOutWei || !address) {
      setSwapFeedback({ status: 'error', message: 'Swap prerequisites missing' })
      return
    }

    try {
      setSwapFeedback({ status: 'preparing', message: 'Encoding private payload…' })
      const encryptedAmountA = encodePacked(['uint256'], [amountInWei])
      const contract = new Contract(tokenIn.address, ['function decimals() view returns (uint8)'], signer)
      const ammContract = new Contract(
        (import.meta as unknown as { env: { VITE_CONTRACT_ADDRESS: `0x${string}` } }).env.VITE_CONTRACT_ADDRESS,
        PRIVATE_AMM_ABI,
        signer
      )

      setSwapFeedback({ status: 'pending', message: 'Submitting swap transaction…' })
      const tx = await ammContract.swapPrivate(
        tokenIn.address,
        tokenOut.address,
        encryptedAmountA,
        quote.minAmountOutWei,
        address
      )

      setSwapFeedback({ status: 'confirming', message: 'Waiting for confirmation…' })
      const receipt = await tx.wait()

      const hash = receipt?.hash ?? tx.hash
      setSwapFeedback({ status: 'success', message: 'Swap confirmed!' })

      dispatch({
        type: 'SET_LAST_TX',
        payload: {
          hash,
          timestamp: Math.floor(Date.now() / 1000),
          amountIn: amountIn,
          amountOut: quote.formatted,
          tokenIn,
          tokenOut
        }
      })

      dispatch({ type: 'SET_STEP', step: 'confirmed' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Swap failed'
      console.error('Swap failed', err)
      setSwapFeedback({ status: 'error', message })
    }
  }, [address, amountIn, amountInWei, dispatch, quote, signer, tokenIn, tokenOut])

  const allowanceSummary = useMemo(() => {
    if (!amountInWei || amountInWei <= 0n) return 'Enter an amount above to review allowance.'
    if (allowanceStatus === 'checking') return 'Checking token allowance…'
    if (allowanceStatus === 'error') return allowanceError ?? 'Allowance check failed.'
    if (allowance === undefined) return 'Allowance unavailable.'
    return `Allowance: ${allowance.toString()}`
  }, [allowance, allowanceError, allowanceStatus, amountInWei])

  const quoteSummary = useMemo(() => {
    if (quoteStatus === 'loading') return 'Fetching quote…'
    if (quoteStatus === 'error') return quoteError ?? 'Unable to fetch quote.'
    if (!isQuoteReady) return 'Provide amount and tokens to fetch a quote.'
    return null
  }, [isQuoteReady, quoteError, quoteStatus])

  return (
    <StepFrame
      step="review"
      onBack={onBack}
      backLabel="Edit"
      statusBadge={
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
          Review Details
        </span>
      }
      footer={
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-slate-400">
              {swapFeedback.message ?? (needsApproval ? 'Approve the token before swapping.' : 'Ready to submit swap when satisfied.')}
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={refreshAllowance}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-white/20 hover:text-slate-100"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={!needsApproval || approvalStatus === 'waiting'}
                className="rounded-full border border-indigo-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-200 transition enabled:hover:border-indigo-300/60 enabled:hover:text-indigo-100 disabled:opacity-40"
              >
                {approvalStatus === 'waiting' ? 'Approving…' : 'Approve' }
              </button>
              <button
                type="button"
                onClick={handleSwap}
                disabled={!canSwap || swapFeedback.status === 'pending' || swapFeedback.status === 'confirming'}
                className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-50 transition hover:bg-indigo-500/90 disabled:opacity-40"
              >
                {swapFeedback.status === 'pending' || swapFeedback.status === 'confirming' ? 'Swapping…' : 'Swap'}
              </button>
            </div>
          </div>
        </div>
      }
    >
      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
          <span>Swap Pair</span>
          <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold text-slate-300">
            {privacyEnabled ? 'Shielded' : 'Public'}
          </span>
        </div>
        <div className="flex flex-col gap-3 text-sm text-slate-100 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-50">
              {amountIn || '0.0'} {tokenIn.symbol}
            </div>
            <div className="text-xs text-slate-500">Spending token</div>
          </div>
          <div className="text-xs text-slate-500">→</div>
          <div>
            <div className="text-lg font-semibold text-slate-50">
              {quote?.formatted ?? '--'} {tokenOut.symbol}
            </div>
            <div className="text-xs text-slate-500">Estimated received</div>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quote Details</span>
          <button
            type="button"
            onClick={refreshQuote}
            className="text-xs font-semibold uppercase tracking-wide text-indigo-300 transition hover:text-indigo-200"
          >
            Refresh
          </button>
        </div>
        {quoteSummary ? (
          <p className="text-xs text-slate-400">{quoteSummary}</p>
        ) : (
          <div className="grid gap-2 text-sm text-slate-100 md:grid-cols-2">
            <div>
              <div className="text-xs text-slate-500">Output</div>
              <div className="text-base font-semibold text-slate-50">{quote?.formatted ?? '--'} {tokenOut.symbol}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Minimum received (0.5% slippage)</div>
              <div className="text-base font-semibold text-slate-50">{minAmountOut} {tokenOut.symbol}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Price impact (approx)</div>
              <div className="text-base font-semibold text-slate-50">{priceImpact ? `${priceImpact.toFixed(2)}%` : '<0.01%'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Allowance status</div>
              <div className="text-base font-semibold text-slate-50">
                {needsApproval ? 'Needs approval' : 'Sufficient'}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
        <div className="font-semibold uppercase tracking-[0.2em] text-slate-500">Allowance</div>
        <div>{allowanceSummary}</div>
        {allowanceError ? <div className="text-rose-300">{allowanceError}</div> : null}
      </section>

      {swapFeedback.status === 'error' ? (
        <section className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-200">
          {swapFeedback.message}
        </section>
      ) : null}
    </StepFrame>
  )
}

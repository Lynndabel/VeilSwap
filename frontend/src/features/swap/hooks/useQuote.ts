import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserProvider, Contract, JsonRpcProvider, formatUnits, parseUnits } from 'ethers'
import { PRIVATE_AMM_ABI } from '../../../lib/abi/PrivateAMM'
import { useWallet } from '../../wallet/WalletProvider'
import { useSwap } from '../state'

const SLIPPAGE_BPS = 50 // 0.5%

function getReadProvider(walletProvider?: BrowserProvider | null) {
  if (walletProvider) return walletProvider
  const url = import.meta.env.VITE_RPC_URL as string | undefined
  if (url && url.length > 0) {
    return new JsonRpcProvider(url)
  }
  if (typeof window !== 'undefined' && (window as any)?.ethereum) {
    return new BrowserProvider((window as any).ethereum)
  }
  throw new Error('No provider available for fetching quotes')
}

type QuoteStatus = 'idle' | 'loading' | 'success' | 'error'

type UseQuoteResult = {
  status: QuoteStatus
  error?: string
  refresh: () => Promise<void>
}

export function useQuote(): UseQuoteResult {
  const {
    state: { pair, amounts },
    dispatch
  } = useSwap()
  const { provider: walletProvider } = useWallet()

  const tokenIn = pair.tokenIn
  const tokenOut = pair.tokenOut
  const amountIn = amounts.amountIn ?? ''

  const amountInWei = useMemo(() => {
    if (!tokenIn || !amountIn) return undefined
    try {
      return parseUnits(amountIn, tokenIn.decimals)
    } catch (err) {
      console.warn('Failed to parse amountIn', err)
      return undefined
    }
  }, [amountIn, tokenIn])

  const [status, setStatus] = useState<QuoteStatus>('idle')
  const [error, setError] = useState<string | undefined>(undefined)

  const fetchQuote = useCallback(async () => {
    if (!tokenIn || !tokenOut || !amountInWei || amountInWei <= 0n) {
      dispatch({ type: 'SET_QUOTE', quote: undefined })
      setStatus('idle')
      setError(undefined)
      return
    }

    const ammAddress = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}` | undefined
    if (!ammAddress) {
      setStatus('error')
      setError('Contract address missing')
      dispatch({ type: 'SET_QUOTE', quote: undefined })
      return
    }

    setStatus('loading')
    setError(undefined)

    try {
      const readProvider = getReadProvider(walletProvider)
      const contract = new Contract(ammAddress, PRIVATE_AMM_ABI, readProvider)
      const [reserveA, reserveB] = await contract.getReserves(tokenIn.address, tokenOut.address)

      const reserveIn = reserveA as bigint
      const reserveOut = reserveB as bigint

      if (reserveIn === 0n || reserveOut === 0n) {
        throw new Error('Insufficient liquidity for this pair')
      }

      const amountOutWei = (amountInWei * reserveOut) / (reserveIn + amountInWei)
      if (amountOutWei <= 0n) {
        throw new Error('Quoted output amount is zero')
      }

      const minAmountOutWei = (amountOutWei * BigInt(10_000 - SLIPPAGE_BPS)) / 10_000n
      const formatted = formatUnits(amountOutWei, tokenOut.decimals)
      const formattedMin = formatUnits(minAmountOutWei, tokenOut.decimals)
      const priceImpactBps = Number((amountOutWei * 10_000n) / reserveOut)

      dispatch({
        type: 'SET_QUOTE',
        quote: {
          amountOutWei,
          minAmountOutWei,
          formatted,
          formattedMin,
          priceImpactBps
        }
      })
      dispatch({ type: 'SET_AMOUNTS', amounts: { minAmountOut: formattedMin, amountOut: formatted } })
      setStatus('success')
      setError(undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch quote'
      setStatus('error')
      setError(message)
      dispatch({ type: 'SET_QUOTE', quote: undefined })
    }
  }, [amountInWei, dispatch, tokenIn, tokenOut, walletProvider])

  useEffect(() => {
    void fetchQuote()
  }, [fetchQuote])

  return {
    status,
    error,
    refresh: fetchQuote
  }
}

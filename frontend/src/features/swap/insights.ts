import { useMemo } from 'react'
import type { SwapToken } from './types'
import { DEFAULT_TOKENS } from './tokenCatalog'

type ReserveRatio = {
  tokenA: SwapToken
  tokenB: SwapToken
  reserveA: string
  reserveB: string
  updatedAt: number
}

type RecentSwap = {
  hash: string
  tokenIn: SwapToken
  tokenOut: SwapToken
  amountIn: string
  amountOut: string
  privacyEnabled: boolean
  timestamp: number
}

type InsightStatus = 'idle' | 'loading' | 'ready'

type InsightsData = {
  status: InsightStatus
  reserves: ReserveRatio[]
  recentSwaps: RecentSwap[]
}

function createPlaceholderInsights(): InsightsData {
  const [tokenA, tokenB] = DEFAULT_TOKENS
  return {
    status: 'idle',
    reserves: [
      {
        tokenA,
        tokenB,
        reserveA: '10,000',
        reserveB: '300,000',
        updatedAt: Date.now() - 1000 * 60 * 3
      }
    ],
    recentSwaps: [
      {
        hash: '0xplaceholderhash',
        tokenIn: tokenA,
        tokenOut: tokenB,
        amountIn: '120.00',
        amountOut: '3,540.00',
        privacyEnabled: true,
        timestamp: Date.now() - 1000 * 60 * 12
      }
    ]
  }
}

export function useInsights(): InsightsData {
  return useMemo(() => createPlaceholderInsights(), [])
}

export type { ReserveRatio, RecentSwap, InsightsData }

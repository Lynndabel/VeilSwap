import type { SwapToken } from './types'

export const DEFAULT_TOKENS: SwapToken[] = [
  { address: '0x0000000000000000000000000000000000000000', symbol: 'pAVAX', decimals: 18 },
  { address: '0x0000000000000000000000000000000000000001', symbol: 'pUSDC', decimals: 6 }
]

export function getTokenBySymbol(symbol: string): SwapToken | undefined {
  return DEFAULT_TOKENS.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase())
}

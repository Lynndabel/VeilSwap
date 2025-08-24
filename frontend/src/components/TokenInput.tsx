import { useMemo } from 'react'

type Token = {
  address: `0x${string}`
  symbol: string
  decimals: number
}

type Props = {
  label: string
  token: Token
  amount: string
  onAmountChange: (v: string) => void
  onTokenChange?: (t: Token) => void
  privacy: boolean
}

const DEFAULT_TOKENS: Token[] = [
  { address: '0x0000000000000000000000000000000000000000', symbol: 'pAVAX', decimals: 18 },
  { address: '0x0000000000000000000000000000000000000000', symbol: 'pUSDC', decimals: 6 },
]

export function TokenInput({ label, token, amount, onAmountChange, onTokenChange, privacy }: Props) {
  const display = useMemo(() => (privacy && amount ? '••••••' : amount), [privacy, amount])
  return (
    <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
      <div className="flex justify-between mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-gray-500">{token.symbol}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          className="flex-1 bg-transparent outline-none text-2xl placeholder:text-gray-600"
          placeholder="0.0"
          value={display}
          onChange={(e) => onAmountChange(e.target.value)}
          inputMode="decimal"
        />
        {onTokenChange && (
          <select
            className="bg-gray-800 rounded-lg px-3 py-2 text-sm"
            value={token.symbol}
            onChange={(e) => {
              const next = DEFAULT_TOKENS.find((t) => t.symbol === e.target.value)!
              onTokenChange(next)
            }}
          >
            {DEFAULT_TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}

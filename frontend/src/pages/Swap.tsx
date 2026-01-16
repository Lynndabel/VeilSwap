import { useState } from 'react'
import { TokenInput } from '../components/TokenInput'
import { PrivacyToggle } from '../components/PrivacyToggle'
import { SwapButton } from '../components/SwapButton'

 type Token = { address: `0x${string}`; symbol: string; decimals: number }

const PAVAX: Token = { address: '0x0000000000000000000000000000000000000000', symbol: 'pAVAX', decimals: 18 }
const PUSDC: Token = { address: '0x0000000000000000000000000000000000000000', symbol: 'pUSDC', decimals: 6 }

export function Swap() {
  const [tokenA, setTokenA] = useState<Token>(PAVAX)
  const [tokenB, setTokenB] = useState<Token>(PUSDC)
  const [amountA, setAmountA] = useState('')
  const [privacy, setPrivacy] = useState(true)

  const flip = () => {
    setTokenA(tokenB)
    setTokenB(tokenA)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Swap</h2>
          <PrivacyToggle value={privacy} onChange={setPrivacy} />
        </div>
        <TokenInput
          label="From"
          token={tokenA}
          amount={amountA}
          onAmountChange={setAmountA}
          onTokenChange={setTokenA}
          privacy={privacy}
        />
        <div className="flex justify-center">
          <button onClick={flip} className="text-sm text-gray-400 hover:text-gray-200">⇅</button>
        </div>
        <TokenInput
          label="To (estimated)"
          token={tokenB}
          amount={''}
          onAmountChange={() => {}}
          onTokenChange={setTokenB}
          privacy={privacy}
        />
        <SwapButton tokenA={tokenA} tokenB={tokenB} amountA={amountA} privacy={privacy} />
        <div className="text-xs text-gray-500">
          {privacy ? 'Private swap: amount hidden' : 'Public swap: amount invisible'}
        </div>
      </div>
    </div>
  )
}

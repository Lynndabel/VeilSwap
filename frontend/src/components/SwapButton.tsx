import { useState } from 'react'
import { ensureConnected, getContract } from '../lib/eth'
import { encodePacked, parseUnits } from 'viem'

// Optional: eERC SDK hook placeholder (API surface may vary)
// import { useEERC } from '@avalabs/eerc-sdk'

type Props = {
  tokenA: { address: `0x${string}`; symbol: string; decimals: number }
  tokenB: { address: `0x${string}`; symbol: string; decimals: number }
  amountA: string
  privacy: boolean
}

export function SwapButton({ tokenA, tokenB, amountA, privacy }: Props) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const doSwap = async () => {
    try {
      setStatus('pending');
      setMessage('Connecting wallet...')
      const account = await ensureConnected()

      setMessage('Preparing transaction...')

      // Prepare encrypted bytes payload
      // MVP: pack uint256 amount as first 32 bytes to match contract decoder
      const amount = parseUnits(amountA || '0', tokenA.decimals)

      // If using eERC SDK, replace the following with SDK-produced ciphertext bytes
      // const { encrypt } = useEERC() // example; actual API may differ
      // const encryptedAmountA = await encrypt(amount)
      const encryptedAmountA = encodePacked(['uint256'], [amount])

      const { contract } = getContract()

      // Approvals should be handled in a real flow; skipping here for MVP brevity
      // await erc20(tokenA.address).approve(contract.target, amount)

      setMessage('Submitting transaction...')
      const tx = await contract.swapPrivate(
        tokenA.address,
        tokenB.address,
        encryptedAmountA,
        0n, // minAmountB
        account
      )
      setMessage('Waiting for confirmation...')
      await tx.wait()
      setStatus('success')
      setMessage('Swap confirmed!')
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err?.shortMessage || err?.message || 'Swap failed')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={doSwap}
        className="w-full px-4 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 font-semibold"
        disabled={!amountA || Number(amountA) <= 0 || status === 'pending'}
      >
        {status === 'pending' ? 'Swapping…' : privacy ? 'Swap (Private)' : 'Swap'}
      </button>
      {!!message && (
        <div className="text-xs text-gray-400 break-words">{message}</div>
      )}
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserProvider, Contract, JsonRpcProvider, parseUnits } from 'ethers'
import { useWallet } from '../../wallet/WalletProvider'
import { useSwap } from '../state'

const ERC20_ALLOWANCE_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
] as const

const ALLOWANCE_STATUS = ['idle', 'checking', 'ready', 'error'] as const
const APPROVAL_STATUS = ['idle', 'waiting', 'success', 'error'] as const

export type AllowanceStatus = (typeof ALLOWANCE_STATUS)[number]
export type ApprovalStatus = (typeof APPROVAL_STATUS)[number]

type UseAllowanceResult = {
  allowance?: bigint
  status: AllowanceStatus
  approvalStatus: ApprovalStatus
  needsApproval: boolean
  approve: () => Promise<string>
  refresh: () => Promise<void>
  error?: string
}

type Env = ImportMeta & { env: { VITE_CONTRACT_ADDRESS?: string; VITE_RPC_URL?: string } }

function getSpenderAddress(): `0x${string}` {
  const env = (import.meta as Env).env
  const addr = env.VITE_CONTRACT_ADDRESS
  if (!addr) throw new Error('Contract address missing')
  return addr as `0x${string}`
}

function resolveReadProvider(walletProvider?: BrowserProvider | null) {
  if (walletProvider) return walletProvider
  const env = (import.meta as Env).env
  const rpcUrl = env.VITE_RPC_URL
  if (rpcUrl && rpcUrl.length > 0) {
    return new JsonRpcProvider(rpcUrl)
  }
  const ethereum = (globalThis as any)?.ethereum
  if (ethereum) {
    return new BrowserProvider(ethereum)
  }
  throw new Error('No provider available for allowance checks')
}

export function useAllowance(): UseAllowanceResult {
  const {
    state: { pair, amounts },
  } = useSwap()
  const { address, provider, signer } = useWallet()

  const tokenIn = pair.tokenIn
  const amountIn = amounts.amountIn ?? ''

  const amountInWei = useMemo(() => {
    if (!tokenIn || !amountIn) return undefined
    try {
      return parseUnits(amountIn, tokenIn.decimals)
    } catch (err) {
      console.warn('Failed to parse amountIn for allowance', err)
      return undefined
    }
  }, [amountIn, tokenIn])

  const [allowance, setAllowance] = useState<bigint | undefined>(undefined)
  const [status, setStatus] = useState<AllowanceStatus>('idle')
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('idle')
  const [error, setError] = useState<string | undefined>(undefined)

  const spender = useMemo(() => {
    try {
      return getSpenderAddress()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Missing contract address')
      return undefined
    }
  }, [])

  const fetchAllowance = useCallback(async () => {
    if (!tokenIn || !address || !amountInWei || amountInWei <= 0n || !spender) {
      setAllowance(undefined)
      setStatus('idle')
      setError(undefined)
      return
    }

    try {
      setStatus('checking')
      setError(undefined)
      const readProvider = resolveReadProvider(provider ?? null)
      const contract = new Contract(tokenIn.address, ERC20_ALLOWANCE_ABI, readProvider)
      const result: bigint = await contract.allowance(address, spender)
      setAllowance(result)
      setStatus('ready')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load allowance'
      setAllowance(undefined)
      setStatus('error')
      setError(message)
    }
  }, [address, amountInWei, provider, spender, tokenIn])

  useEffect(() => {
    setApprovalStatus('idle')
    void fetchAllowance()
  }, [fetchAllowance])

  const needsApproval = useMemo(() => {
    if (!amountInWei || amountInWei <= 0n) return false
    if (!allowance || allowance === 0n) return true
    return allowance < amountInWei
  }, [allowance, amountInWei])

  const approve = useCallback(async () => {
    if (!tokenIn || !signer || !amountInWei || amountInWei <= 0n || !spender) {
      throw new Error('Approval prerequisites missing')
    }

    try {
      setApprovalStatus('waiting')
      setError(undefined)
      const writeContract = new Contract(tokenIn.address, ERC20_ALLOWANCE_ABI, signer)
      const tx = await writeContract.approve(spender, amountInWei)
      const receipt = await tx.wait()
      setApprovalStatus('success')
      await fetchAllowance()

      return receipt?.hash ?? tx.hash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Approval failed'
      setApprovalStatus('error')
      setError(message)
      throw err
    }
  }, [amountInWei, fetchAllowance, signer, spender, tokenIn])

  return {
    allowance,
    status,
    approvalStatus,
    needsApproval,
    approve,
    refresh: fetchAllowance,
    error
  }
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Contract, formatUnits, isAddress } from 'ethers'
import type { SwapToken } from '../types'
import { useWallet } from '../../wallet/WalletProvider'

const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)'] as const
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

type TokenBalanceState = {
  balance?: bigint
  formatted: string
  isLoading: boolean
  error?: string
}

export function useTokenBalance(token?: SwapToken) {
  const { provider, address } = useWallet()
  const [state, setState] = useState<TokenBalanceState>({
    balance: undefined,
    formatted: '--',
    isLoading: false
  })

  const canQuery = useMemo(() => {
    return Boolean(
      token &&
        provider &&
        address &&
        token.address !== ZERO_ADDRESS &&
        isAddress(token.address)
    )
  }, [address, provider, token])

  const load = useCallback(async () => {
    if (!canQuery || !token || !provider || !address) {
      setState((prev) => ({ ...prev, balance: undefined, formatted: '--', isLoading: false, error: undefined }))
      return
    }
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }))
      const contract = new Contract(token.address, ERC20_ABI, provider)
      const result: bigint = await contract.balanceOf(address)
      setState({
        balance: result,
        formatted: formatUnits(result, token.decimals),
        isLoading: false,
        error: undefined
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch balance'
      setState({ balance: undefined, formatted: '--', isLoading: false, error: message })
    }
  }, [address, canQuery, provider, token])

  useEffect(() => {
    void load()
  }, [load])

  return {
    balance: state.balance,
    formatted: state.formatted,
    isLoading: state.isLoading,
    error: state.error,
    refresh: load,
    canQuery
  }
}

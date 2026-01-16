import {
  BrowserProvider,
  JsonRpcSigner,
  formatEther
} from 'ethers'
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

const FUJI_CHAIN_ID = 43113

type WalletStatus = 'disconnected' | 'connecting' | 'ready' | 'unsupported' | 'error'

type WalletState = {
  status: WalletStatus
  address?: string
  network?: { chainId: number; name?: string }
  balance?: { native: string; raw: bigint }
  provider?: BrowserProvider
  signer?: JsonRpcSigner
  error?: string
  isFuji: boolean
}

const INITIAL_STATE: WalletState = {
  status: 'disconnected',
  isFuji: false
}

type WalletContextValue = WalletState & {
  connect: () => Promise<void>
  disconnect: () => void
  refresh: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

type WalletProviderProps = { children: ReactNode }

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, setState] = useState<WalletState>(INITIAL_STATE)
  const providerRef = useRef<BrowserProvider | null>(null)
  const addressRef = useRef<string | undefined>(undefined)

  const hydrate = useCallback(async (provider: BrowserProvider, account: string) => {
    try {
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      const signer = await provider.getSigner(account)
      const balanceRaw = await provider.getBalance(account)
      const isFuji = chainId === FUJI_CHAIN_ID

      addressRef.current = account
      providerRef.current = provider

      setState({
        status: isFuji ? 'ready' : 'unsupported',
        address: account,
        network: { chainId, name: network.name },
        balance: { native: formatEther(balanceRaw), raw: balanceRaw },
        provider,
        signer,
        error: undefined,
        isFuji
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load wallet'
      setState((prev: WalletState) => ({
        ...prev,
        status: 'error',
        error: message
      }))
    }
  }, [])

  const reset = useCallback(() => {
    providerRef.current = null
    addressRef.current = undefined
    setState(INITIAL_STATE)
  }, [])

  const connect = useCallback(async () => {
    const eth = (globalThis as any)?.ethereum
    if (!eth) {
      setState({
        ...INITIAL_STATE,
        status: 'error',
        error: 'MetaMask not detected'
      })
      return
    }

    setState((prev: WalletState) => ({ ...prev, status: 'connecting', error: undefined }))

    try {
      const provider = new BrowserProvider(eth)
      providerRef.current = provider
      const accounts: string[] = await provider.send('eth_requestAccounts', [])
      if (!accounts || accounts.length === 0) {
        setState({
          ...INITIAL_STATE,
          status: 'error',
          error: 'No accounts returned from wallet'
        })
        return
      }
      await hydrate(provider, accounts[0])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet'
      setState({
        ...INITIAL_STATE,
        status: 'error',
        error: message
      })
    }
  }, [hydrate])

  const disconnect = useCallback(() => {
    reset()
  }, [reset])

  const refresh = useCallback(async () => {
    const provider = providerRef.current
    const account = addressRef.current
    if (!provider || !account) return
    await hydrate(provider, account)
  }, [hydrate])

  useEffect(() => {
    const eth = (globalThis as any)?.ethereum
    if (!eth) return

    const provider = new BrowserProvider(eth)
    providerRef.current = provider

    provider
      .send('eth_accounts', [])
      .then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          hydrate(provider, accounts[0])
        }
      })
      .catch(() => {
        /* ignore */
      })

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        reset()
        return
      }
      const nextProvider = providerRef.current ?? new BrowserProvider(eth)
      hydrate(nextProvider, accounts[0])
    }

    const handleChainChanged = () => {
      const nextProvider = new BrowserProvider(eth)
      providerRef.current = nextProvider
      nextProvider
        .send('eth_accounts', [])
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            hydrate(nextProvider, accounts[0])
          } else {
            reset()
          }
        })
        .catch(() => {
          reset()
        })
    }

    eth.on('accountsChanged', handleAccountsChanged)
    eth.on('chainChanged', handleChainChanged)

    return () => {
      eth.removeListener('accountsChanged', handleAccountsChanged)
      eth.removeListener('chainChanged', handleChainChanged)
    }
  }, [hydrate, reset])

  const value = useMemo<WalletContextValue>(
    () => ({
      ...state,
      connect,
      disconnect,
      refresh
    }),
    [state, connect, disconnect, refresh]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}

export type { WalletStatus }

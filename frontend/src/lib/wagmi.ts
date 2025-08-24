import { createConfig, http } from 'wagmi'
import { avalancheFuji } from 'viem/chains'

export const wagmiConfig = createConfig({
  chains: [avalancheFuji],
  transports: {
    [avalancheFuji.id]: http(import.meta.env.VITE_RPC_URL)
  }
})

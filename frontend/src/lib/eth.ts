import { ethers } from 'ethers'
import { PRIVATE_AMM_ABI } from './abi/PrivateAMM'

export function getContract() {
  const addr = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`
  if (!addr || /^0x0{40}$/i.test(addr)) throw new Error('Contract address not set')
  const provider = new ethers.BrowserProvider((window as any).ethereum)
  const contract = new ethers.Contract(addr, PRIVATE_AMM_ABI, provider)
  return { provider, contract }
}

export async function ensureConnected(): Promise<string> {
  const eth = (window as any).ethereum
  if (!eth) throw new Error('MetaMask not found')
  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' })
  if (!accounts || accounts.length === 0) throw new Error('No account connected')
  return accounts[0]
}

export async function getSigner() {
  const provider = new ethers.BrowserProvider((window as any).ethereum)
  const signer = await provider.getSigner()
  return { provider, signer }
}

export async function getWriteContract() {
  const addr = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`
  if (!addr || /^0x0{40}$/i.test(addr)) throw new Error('Contract address not set')
  const { provider, signer } = await getSigner()
  const contract = new ethers.Contract(addr, PRIVATE_AMM_ABI, signer)
  return { provider, signer, contract }
}

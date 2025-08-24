export const PRIVATE_AMM_ABI = [
  {
    "type": "function",
    "name": "swapPrivate",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "tokenA", "type": "address" },
      { "name": "tokenB", "type": "address" },
      { "name": "encryptedAmountA", "type": "bytes" },
      { "name": "minAmountB", "type": "uint256" },
      { "name": "to", "type": "address" }
    ],
    "outputs": [ { "name": "amountB", "type": "uint256" } ]
  },
  {
    "type": "function",
    "name": "addLiquidity",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "tokenA", "type": "address" },
      { "name": "tokenB", "type": "address" },
      { "name": "encryptedAmountA", "type": "bytes" },
      { "name": "encryptedAmountB", "type": "bytes" },
      { "name": "to", "type": "address" }
    ],
    "outputs": [ { "name": "liquidity", "type": "uint256" } ]
  },
  {
    "type": "function",
    "name": "getReserves",
    "stateMutability": "view",
    "inputs": [
      { "name": "tokenA", "type": "address" },
      { "name": "tokenB", "type": "address" }
    ],
    "outputs": [
      { "name": "reserveA", "type": "uint256" },
      { "name": "reserveB", "type": "uint256" }
    ]
  },
  {
    "type": "event",
    "name": "SwapPrivate",
    "inputs": [
      { "name": "user", "type": "address", "indexed": true },
      { "name": "tokenA", "type": "address", "indexed": true },
      { "name": "tokenB", "type": "address", "indexed": true },
      { "name": "encryptedAmountA", "type": "bytes", "indexed": false },
      { "name": "amountB", "type": "uint256", "indexed": false },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ],
    "anonymous": false
  }
] as const;

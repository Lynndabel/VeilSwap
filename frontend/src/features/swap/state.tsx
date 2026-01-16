import { ReactNode, createContext, useContext, useMemo, useReducer, type Dispatch } from 'react'
import { SwapStep, STEP_ORDER } from './steps'

type SwapPair = {
  tokenIn?: { address: `0x${string}`; symbol: string; decimals: number }
  tokenOut?: { address: `0x${string}`; symbol: string; decimals: number }
}

type SwapAmounts = {
  amountIn?: string
  amountOut?: string
}

type SwapState = {
  step: SwapStep
  pair: SwapPair
  amounts: SwapAmounts
  privacyEnabled: boolean
}

type SwapAction =
  | { type: 'SET_STEP'; step: SwapStep }
  | { type: 'NEXT_STEP' }
  | { type: 'SET_PAIR'; pair: SwapPair }
  | { type: 'SET_AMOUNTS'; amounts: SwapAmounts }
  | { type: 'TOGGLE_PRIVACY'; enabled: boolean }
  | { type: 'RESET' }

const INITIAL_STATE: SwapState = {
  step: 'connect',
  pair: {},
  amounts: {},
  privacyEnabled: true
}

function getNextStep(current: SwapStep): SwapStep {
  const idx = STEP_ORDER.indexOf(current)
  if (idx === -1) return STEP_ORDER[0]
  return idx === STEP_ORDER.length - 1 ? current : STEP_ORDER[idx + 1]
}

function reducer(state: SwapState, action: any): SwapState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'NEXT_STEP':
      return { ...state, step: getNextStep(state.step) }
    case 'SET_PAIR':
      return { ...state, pair: { ...state.pair, ...action.pair } }
    case 'SET_AMOUNTS':
      return { ...state, amounts: { ...state.amounts, ...action.amounts } }
    case 'TOGGLE_PRIVACY':
      return { ...state, privacyEnabled: action.enabled }
    case 'RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

type SwapContextValue = {
  state: SwapState
  dispatch: Dispatch<SwapAction>
}

const SwapContext = createContext<SwapContextValue | undefined>(undefined)

type SwapProviderProps = { children: ReactNode }

export function SwapProvider({ children }: SwapProviderProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>
}

export function useSwap() {
  const ctx = useContext(SwapContext)
  if (!ctx) throw new Error('useSwap must be used within SwapProvider')
  return ctx
}

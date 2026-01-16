import { ReactNode, createContext, useContext, useMemo, useReducer, type Dispatch } from 'react'
import { SwapStep, getNextStep } from './steps'
import type { SwapToken } from './types'

type SwapPair = {
  tokenIn?: SwapToken
  tokenOut?: SwapToken
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

function reducer(state: SwapState, action: SwapAction): SwapState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'NEXT_STEP': {
      const next = getNextStep(state.step)
      if (next === state.step) return state
      return { ...state, step: next }
    }
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

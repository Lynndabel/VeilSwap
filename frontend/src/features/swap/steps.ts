export type SwapStep = 'connect' | 'configure' | 'review' | 'confirmed'

export type SwapStepMeta = {
  id: SwapStep
  label: string
  description: string
}

export const SWAP_STEPS: SwapStepMeta[] = [
  {
    id: 'connect',
    label: 'Connect',
    description: 'Link your wallet and verify the Fuji network.'
  },
  {
    id: 'configure',
    label: 'Configure',
    description: 'Select tokens, set amounts, and choose privacy.'
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Confirm approvals, quotes, and recipient before sending.'
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    description: 'Track transaction status and share your receipt.'
  }
]

export const STEP_ORDER: SwapStep[] = SWAP_STEPS.map((step) => step.id)

export function getNextStep(current: SwapStep): SwapStep {
  const idx = STEP_ORDER.indexOf(current)
  if (idx === -1) return STEP_ORDER[0]
  return idx === STEP_ORDER.length - 1 ? current : STEP_ORDER[idx + 1]
}

export function getPreviousStep(current: SwapStep): SwapStep {
  const idx = STEP_ORDER.indexOf(current)
  if (idx <= 0) return STEP_ORDER[0]
  return STEP_ORDER[idx - 1]
}

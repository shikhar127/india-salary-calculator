import { STATES } from './constants'

export type ProfessionalTaxMode = 'state' | 'manual'

export interface ProfessionalTaxOptions {
  stateName: string
  annualGross: number
  mode?: ProfessionalTaxMode
  manualAnnualTax?: number
}

// State PT in this app is still an estimate. To avoid clear overestimation for
// lower monthly gross values, we apply PT only above a coarse threshold.
const MONTHLY_PT_THRESHOLD = 15000

export const calculateProfessionalTaxAnnual = ({
  stateName,
  annualGross,
  mode = 'state',
  manualAnnualTax = 0,
}: ProfessionalTaxOptions): number => {
  if (mode === 'manual') {
    return Math.max(0, Math.round(manualAnnualTax))
  }

  const stateData = STATES.find((s) => s.name === stateName) || STATES[0]
  const annualEstimate = stateData.pt
  if (annualEstimate <= 0) return 0

  const monthlyGross = annualGross / 12
  if (monthlyGross < MONTHLY_PT_THRESHOLD) return 0

  return annualEstimate
}


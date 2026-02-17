import { NEW_REGIME_SLABS, OLD_REGIME_SLABS } from './constants'

export interface TaxResult {
  taxableIncome: number
  tax: number
  cess: number
  totalTax: number
  breakdown: { slab: string; amount: number }[]
}

export const calculateTax = (income: number, regime: 'old' | 'new'): TaxResult => {
  const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS
  const standardDeduction = regime === 'new' ? 75000 : 50000

  const taxableIncome = Math.max(0, income - standardDeduction)
  let remainingIncome = taxableIncome
  let previousLimit = 0
  let tax = 0
  const breakdown: { slab: string; amount: number }[] = []

  for (const slab of slabs) {
    if (remainingIncome <= 0) break

    const slabRange = slab.limit === Infinity ? remainingIncome : slab.limit - previousLimit
    const taxableAtThisSlab = Math.min(remainingIncome, slabRange)

    if (taxableAtThisSlab > 0 && slab.rate > 0) {
      const taxForSlab = taxableAtThisSlab * slab.rate
      tax += taxForSlab
      breakdown.push({
        slab: `${(previousLimit / 100000).toFixed(1)}L - ${slab.limit === Infinity ? 'Above' : (slab.limit / 100000).toFixed(1) + 'L'}`,
        amount: taxForSlab,
      })
    }

    remainingIncome -= slabRange
    previousLimit = slab.limit
  }

  // Apply Rebate u/s 87A
  let rebate = 0
  if (regime === 'new' && taxableIncome <= 1200000) {
    rebate = Math.min(tax, 60000)
  } else if (regime === 'old' && taxableIncome <= 500000) {
    rebate = Math.min(tax, 12500)
  }

  tax = Math.max(0, tax - rebate)
  const cess = tax * 0.04
  const totalTax = tax + cess

  return { taxableIncome, tax, cess, totalTax, breakdown }
}

export const calculateHRAExemption = (
  basic: number,
  hraReceived: number,
  rentPaid: number,
  isMetro: boolean,
): number => {
  if (rentPaid <= 0) return 0
  const condition1 = hraReceived
  const condition2 = isMetro ? basic * 0.5 : basic * 0.4
  const condition3 = Math.max(0, rentPaid - basic * 0.1)
  return Math.min(condition1, condition2, condition3)
}

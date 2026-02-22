import { describe, expect, it } from 'vitest'
import { calculateProfessionalTaxAnnual } from './professionalTax'

describe('calculateProfessionalTaxAnnual', () => {
  it('returns manual annual PT when manual mode is selected', () => {
    const pt = calculateProfessionalTaxAnnual({
      stateName: 'Maharashtra',
      annualGross: 1200000,
      mode: 'manual',
      manualAnnualTax: 1800,
    })
    expect(pt).toBe(1800)
  })

  it('returns 0 for low monthly gross in state estimate mode', () => {
    const pt = calculateProfessionalTaxAnnual({
      stateName: 'Maharashtra',
      annualGross: 120000, // 10,000 per month
      mode: 'state',
    })
    expect(pt).toBe(0)
  })

  it('returns configured state estimate for higher monthly gross', () => {
    const pt = calculateProfessionalTaxAnnual({
      stateName: 'Maharashtra',
      annualGross: 1200000,
      mode: 'state',
    })
    expect(pt).toBe(2500)
  })
})

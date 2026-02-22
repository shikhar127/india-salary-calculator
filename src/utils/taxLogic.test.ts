import { describe, expect, it } from 'vitest'
import { calculateTax } from './taxLogic'

describe('calculateTax', () => {
  it('applies full rebate for new regime at taxable income 12L', () => {
    const income = 1275000 // taxable income = 12,00,000 after standard deduction
    const result = calculateTax(income, 'new')
    expect(result.tax).toBe(0)
    expect(result.cess).toBe(0)
    expect(result.totalTax).toBe(0)
  })

  it('applies full rebate for old regime at taxable income 5L', () => {
    const income = 550000 // taxable income = 5,00,000 after standard deduction
    const result = calculateTax(income, 'old')
    expect(result.tax).toBe(0)
    expect(result.cess).toBe(0)
    expect(result.totalTax).toBe(0)
  })

  it('applies marginal relief in new regime including cess', () => {
    const income = 1275001 // taxable = 12,00,001, excess above threshold = 1
    const result = calculateTax(income, 'new')
    expect(result.totalTax).toBeLessThanOrEqual(1)
    expect(result.totalTax).toBeGreaterThan(0)
  })

  it('keeps tax non-decreasing as income increases around rebate threshold', () => {
    const lower = calculateTax(1275001, 'new').totalTax
    const higher = calculateTax(1285000, 'new').totalTax
    expect(higher).toBeGreaterThanOrEqual(lower)
  })
})

import { calculateTax, calcPF } from './taxLogic'
import { calculateProfessionalTaxAnnual, ProfessionalTaxMode } from './professionalTax'

export type TaxRegime = 'old' | 'new'
export type PfMode = 'capped' | 'full'

export interface SalaryCalcOptions {
  ctc: number
  basicPercent: number
  variablePay: number
  isMetro: boolean
  stateName: string
  pfMode: PfMode
  taxRegime: TaxRegime
  professionalTaxMode?: ProfessionalTaxMode
  manualProfessionalTaxAnnual?: number
  additionalOldRegimeDeductions?: number
}

export interface SalaryBreakdown {
  monthlyInHand: number
  annualInHand: number
  annualBasic: number
  annualHRA: number
  annualSpecial: number
  annualGross: number
  annualEmployeePF: number
  annualEmployerPF: number
  annualPT: number
  annualTax: number
  annualDeductions: number
  annualEmployeeESI: number
  annualEmployerESI: number
  annualVariableTaxImpact: number
  annualVariableNet: number
}

const getTaxableIncomeForRegime = (
  gross: number,
  regime: TaxRegime,
  annualPT: number,
  additionalOldRegimeDeductions: number,
): number => {
  if (regime === 'old') {
    return Math.max(0, gross - annualPT - Math.max(0, additionalOldRegimeDeductions))
  }
  return Math.max(0, gross)
}

export const calculateSalaryBreakdown = ({
  ctc,
  basicPercent,
  variablePay,
  isMetro,
  stateName,
  pfMode,
  taxRegime,
  professionalTaxMode = 'state',
  manualProfessionalTaxAnnual = 0,
  additionalOldRegimeDeductions = 0,
}: SalaryCalcOptions): SalaryBreakdown => {
  const annualBasic = (ctc * basicPercent) / 100
  const annualHRA = annualBasic * (isMetro ? 0.5 : 0.4)

  const annualEmployerPF = pfMode === 'capped' ? calcPF(annualBasic) : annualBasic * 0.12
  const annualEmployeePF = pfMode === 'capped' ? calcPF(annualBasic) : annualBasic * 0.12

  const annualGross = ctc - annualEmployerPF
  const annualSpecial = Math.max(0, annualGross - annualBasic - annualHRA - variablePay)

  const annualPT = calculateProfessionalTaxAnnual({
    stateName,
    annualGross,
    mode: professionalTaxMode,
    manualAnnualTax: manualProfessionalTaxAnnual,
  })

  const monthlyGross = annualGross / 12
  const annualEmployeeESI = monthlyGross <= 21000 ? annualGross * 0.0075 : 0
  const annualEmployerESI = monthlyGross <= 21000 ? annualGross * 0.0325 : 0

  const taxableIncome = getTaxableIncomeForRegime(
    annualGross,
    taxRegime,
    annualPT,
    additionalOldRegimeDeductions,
  )
  const annualTax = calculateTax(taxableIncome, taxRegime).totalTax

  const annualDeductions = annualEmployeePF + annualPT + annualEmployeeESI + annualTax
  const annualInHand = annualGross - annualDeductions

  let annualVariableTaxImpact = 0
  let annualVariableNet = 0
  if (variablePay > 0) {
    const annualGrossWithoutVariable = Math.max(0, annualGross - variablePay)
    const taxableWithoutVariable = getTaxableIncomeForRegime(
      annualGrossWithoutVariable,
      taxRegime,
      annualPT,
      additionalOldRegimeDeductions,
    )
    const annualTaxWithoutVariable = calculateTax(taxableWithoutVariable, taxRegime).totalTax
    annualVariableTaxImpact = Math.max(0, annualTax - annualTaxWithoutVariable)
    annualVariableNet = Math.max(0, variablePay - annualVariableTaxImpact)
  }

  const monthlyInHand =
    variablePay > 0 ? (annualInHand - annualVariableNet) / 12 : annualInHand / 12

  return {
    monthlyInHand: Math.max(0, monthlyInHand),
    annualInHand,
    annualBasic,
    annualHRA,
    annualSpecial,
    annualGross,
    annualEmployeePF,
    annualEmployerPF,
    annualPT,
    annualTax,
    annualDeductions,
    annualEmployeeESI,
    annualEmployerESI,
    annualVariableTaxImpact,
    annualVariableNet,
  }
}


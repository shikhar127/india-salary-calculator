import React, { useMemo, useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount } from '../ui/DisplayAmount'
import { formatIndianCurrency, formatNumber } from '../../utils/formatting'
import { STATES } from '../../utils/constants'
import { calculateSalaryBreakdown, TaxRegime } from '../../utils/salaryLogic'
import { ProfessionalTaxMode } from '../../utils/professionalTax'

export function ReverseCalculator() {
  const [targetValue, setTargetValue] = useState<number>(0)
  const [targetInput, setTargetInput] = useState<string>('')
  const [pfMode, setPfMode] = useState<'capped' | 'full'>('capped')
  const [selectedState, setSelectedState] = useState<string>('Maharashtra')
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const [basicPercent, setBasicPercent] = useState<number>(50)
  const [variablePay, setVariablePay] = useState<number>(0)
  const [isMetro, setIsMetro] = useState<boolean>(true)
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new')
  const [professionalTaxMode, setProfessionalTaxMode] = useState<ProfessionalTaxMode>('state')
  const [manualProfessionalTaxAnnualInput, setManualProfessionalTaxAnnualInput] = useState<string>('')
  const [manualProfessionalTaxAnnual, setManualProfessionalTaxAnnual] = useState<number>(0)

  const targetInHand = targetValue

  const result = useMemo(() => {
    if (targetValue <= 0) return null

    const targetAnnualNet = targetInHand * 12
    let low = targetAnnualNet
    let high = targetAnnualNet * 3
    let ctc = (low + high) / 2

    const getNet = (candidateCtc: number) => {
      const breakdown = calculateSalaryBreakdown({
        ctc: candidateCtc,
        basicPercent,
        variablePay,
        isMetro,
        stateName: selectedState,
        pfMode,
        taxRegime,
        professionalTaxMode,
        manualProfessionalTaxAnnual,
      })
      return breakdown.annualInHand
    }

    for (let i = 0; i < 30; i++) {
      ctc = (low + high) / 2
      const net = getNet(ctc)
      if (Math.abs(net - targetAnnualNet) < 100) break
      if (net < targetAnnualNet) low = ctc
      else high = ctc
    }

    const breakdown = calculateSalaryBreakdown({
      ctc,
      basicPercent,
      variablePay,
      isMetro,
      stateName: selectedState,
      pfMode,
      taxRegime,
      professionalTaxMode,
      manualProfessionalTaxAnnual,
    })

    return {
      ctc,
      tax: breakdown.annualTax,
      pf: breakdown.annualEmployeePF,
      pt: breakdown.annualPT,
    }
  }, [
    targetValue,
    pfMode,
    selectedState,
    targetInHand,
    basicPercent,
    variablePay,
    isMetro,
    taxRegime,
    professionalTaxMode,
    manualProfessionalTaxAnnual,
  ])

  return (
    <div className="space-y-6 pb-24 pt-4">
      <h2 className="text-2xl font-bold">Reverse Calculator</h2>
      <p className="text-secondary text-sm">Calculate required CTC for your desired monthly in-hand salary.</p>

      <Card>
        <div className="space-y-5">
          <Input
            label="Desired Monthly In-Hand"
            prefix="₹"
            type="text"
            inputMode="numeric"
            suffix="/mo"
            suffixClassName="text-primary font-extrabold tracking-wide text-base"
            value={targetInput}
            onChange={(e) => {
              const stripped = e.target.value.replace(/[^0-9]/g, '')
              const noLeadingZeros = stripped.replace(/^0+/, '') || (stripped.length > 0 ? '0' : '')
              setTargetInput(noLeadingZeros)
              setTargetValue(Number(noLeadingZeros))
            }}
            onFocus={(e) => setTargetInput(e.target.value.replace(/,/g, ''))}
            onBlur={(e) => {
              const n = Number(e.target.value.replace(/,/g, ''))
              setTargetInput(n > 0 ? formatNumber(n) : '')
            }}
            placeholder="e.g. 1,00,000"
          />

          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wide text-secondary pt-1"
          >
            <span>Advanced Options</span>
            <span className="text-base leading-none">{showAdvanced ? '−' : '+'}</span>
          </button>

          {!showAdvanced && (
            <p className="text-xs text-secondary -mt-1">
              {taxRegime === 'new' ? 'New' : 'Old'} regime · {isMetro ? 'Metro' : 'Non-Metro'} · State: {selectedState} · PF: {pfMode === 'capped' ? '₹1,800 /mo' : '12% of basic'}
            </p>
          )}

          {showAdvanced && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Tax Regime"
                    value={taxRegime}
                    onChange={(e) => setTaxRegime(e.target.value as TaxRegime)}
                    options={[
                      { label: 'New Regime', value: 'new' },
                      { label: 'Old Regime', value: 'old' },
                    ]}
                  />
                  <p className="text-[11px] text-secondary mt-1">Default: New Regime (recommended for most users)</p>
                </div>
                <Select
                  label="State"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  options={STATES.map((s) => ({ label: s.name, value: s.name }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="City Type"
                  value={isMetro ? 'metro' : 'non-metro'}
                  onChange={(e) => setIsMetro(e.target.value === 'metro')}
                  options={[
                    { label: 'Metro', value: 'metro' },
                    { label: 'Non-Metro', value: 'non-metro' },
                  ]}
                />
                <Input
                  label="Basic Salary %"
                  suffix="%"
                  type="number"
                  value={basicPercent}
                  onChange={(e) => setBasicPercent(Number(e.target.value))}
                  placeholder="40–60%"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Variable Pay (Annual)"
                  prefix="₹"
                  type="number"
                  value={variablePay}
                  onChange={(e) => setVariablePay(Number(e.target.value))}
                />
                <Select
                  label="Professional Tax"
                  value={professionalTaxMode}
                  onChange={(e) => setProfessionalTaxMode(e.target.value as ProfessionalTaxMode)}
                  options={[
                    { label: 'State estimate', value: 'state' },
                    { label: 'Manual annual', value: 'manual' },
                  ]}
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-1">PF Calculation</p>
                  <Toggle
                    value={pfMode === 'full'}
                    onChange={(v) => setPfMode(v ? 'full' : 'capped')}
                    leftLabel="₹1,800/mo"
                    rightLabel="12% of basic"
                  />
                </div>
              </div>

              {professionalTaxMode === 'manual' && (
                <Input
                  label="Professional Tax (Annual)"
                  prefix="₹"
                  type="text"
                  inputMode="numeric"
                  value={manualProfessionalTaxAnnualInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '')
                    setManualProfessionalTaxAnnualInput(cleaned)
                    setManualProfessionalTaxAnnual(Number(cleaned))
                  }}
                  onFocus={(e) => setManualProfessionalTaxAnnualInput(e.target.value.replace(/,/g, ''))}
                  onBlur={(e) => {
                    const n = Number(e.target.value.replace(/,/g, ''))
                    setManualProfessionalTaxAnnualInput(n > 0 ? formatNumber(n) : '')
                  }}
                />
              )}
            </>
          )}
        </div>
      </Card>

      {targetValue === 0 ? (
        <div className="text-center py-16 px-6">
          <h3 className="text-2xl font-bold mb-3">Find Your Required CTC</h3>
          <p className="text-secondary text-sm mb-8 max-w-sm mx-auto">
            Enter your desired monthly in-hand salary to calculate the CTC you need
          </p>
        </div>
      ) : (
        result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center py-6">
              <p className="text-secondary text-xs font-semibold uppercase tracking-[0.15em] mb-3">You need a CTC of</p>
              <DisplayAmount amount={result.ctc} size="hero" suffix="/yr" showWords />
            </div>

            <Card className="bg-bg-secondary border-transparent">
              <h3 className="font-bold mb-3 text-sm">Estimated Deductions ({taxRegime === 'new' ? 'New' : 'Old'} Regime)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-secondary">Income Tax</span>
                  <span className="font-semibold">{formatIndianCurrency(result.tax)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-secondary">Provident Fund {pfMode === 'capped' ? '(statutory cap)' : '(12% of basic)'}</span>
                  <span className="font-semibold">{formatIndianCurrency(result.pf)}</span>
                </div>
                {result.pt > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary">Professional Tax ({selectedState})</span>
                    <span className="font-semibold">{formatIndianCurrency(result.pt)}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )
      )}
    </div>
  )
}

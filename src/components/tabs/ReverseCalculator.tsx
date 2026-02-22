import React, { useMemo, useState } from 'react'
import { Card } from '../ui/Card'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount } from '../ui/DisplayAmount'
import { formatIndianCurrency } from '../../utils/formatting'
import { calculateTax, calcPF } from '../../utils/taxLogic'
import { STATES } from '../../utils/constants'

export function ReverseCalculator() {
  const [targetValue, setTargetValue] = useState<number>(100)
  const [unit, setUnit] = useState<'thousand' | 'lakh'>('thousand')
  const [pfMode, setPfMode] = useState<'capped' | 'full'>('capped')
  const [selectedState, setSelectedState] = useState<string>('Maharashtra')

  const targetInHand = unit === 'lakh' ? targetValue * 100000 : targetValue * 1000

  const handleUnitToggle = (toLakh: boolean) => {
    const newUnit = toLakh ? 'lakh' : 'thousand'
    if (toLakh && unit === 'thousand') {
      setTargetValue(Math.round(targetValue / 100))
    } else if (!toLakh && unit === 'lakh') {
      setTargetValue(targetValue * 100)
    }
    setUnit(newUnit)
  }

  const result = useMemo(() => {
    if (targetValue <= 0) return null
    const stateData = STATES.find((s) => s.name === selectedState) || STATES[0]
    const annualPT = stateData.pt
    const targetAnnualNet = targetInHand * 12
    let low = targetAnnualNet
    let high = targetAnnualNet * 2.5
    let ctc = (low + high) / 2

    const getNet = (c: number) => {
      const basic = c * 0.5
      const employerPF = pfMode === 'capped' ? calcPF(basic) : basic * 0.12
      const gross = c - employerPF
      const employeePF = pfMode === 'capped' ? calcPF(basic) : basic * 0.12
      const tax = calculateTax(gross, 'new').totalTax
      return gross - employeePF - annualPT - tax
    }

    for (let i = 0; i < 25; i++) {
      ctc = (low + high) / 2
      const net = getNet(ctc)
      if (Math.abs(net - targetAnnualNet) < 100) break
      if (net < targetAnnualNet) {
        low = ctc
      } else {
        high = ctc
      }
    }

    const basic = ctc * 0.5
    const employerPF = pfMode === 'capped' ? calcPF(basic) : basic * 0.12
    const gross = ctc - employerPF

    return {
      ctc,
      tax: calculateTax(gross, 'new').totalTax,
      pf: pfMode === 'capped' ? calcPF(basic) : basic * 0.12,
      pt: annualPT,
    }
  }, [targetValue, unit, pfMode, selectedState, targetInHand])

  return (
    <div className="space-y-6 pb-24 pt-4">
      <h2 className="text-2xl font-bold">Reverse Calculator</h2>
      <p className="text-secondary text-sm">
        Calculate required CTC for your desired monthly in-hand salary.
      </p>

      {/* Result on top */}
      {result ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center py-6">
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              You need a CTC of
            </p>
            <DisplayAmount amount={result.ctc} size="hero" suffix="/yr" showWords />
          </div>

          <Card className="bg-bg-secondary border-transparent">
            <h3 className="font-bold mb-3 text-sm">Estimated Deductions (New Regime)</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Income Tax</span>
                <span className="font-semibold">{formatIndianCurrency(result.tax)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">
                  Provident Fund {pfMode === 'capped' ? '(statutory cap)' : '(12% of basic)'}
                </span>
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
      ) : (
        <div className="text-center py-10">
          <p className="text-secondary text-sm">Enter a desired salary below to calculate</p>
        </div>
      )}

      {/* Inputs below */}
      <Card>
        <div className="space-y-5">
          {/* Amount entry */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-3">
              Desired Monthly In-Hand
            </p>
            <div className="flex items-center flex-1 border border-border-default rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-black">
              <span className="text-secondary font-semibold mr-2">₹</span>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="flex-1 bg-transparent outline-none text-lg font-bold w-full min-w-0"
                placeholder="0"
                min={0}
              />
              <span className="text-secondary font-semibold ml-2 text-sm whitespace-nowrap">
                {unit === 'lakh' ? 'L' : 'K'}
              </span>
            </div>
            {/* Unit toggle */}
            <div className="mt-3">
              <Toggle
                value={unit === 'lakh'}
                onChange={handleUnitToggle}
                leftLabel="Thousands (₹K)"
                rightLabel="Lakhs (₹L)"
              />
            </div>
            {/* Preview */}
            {targetValue > 0 && (
              <p className="text-xs text-secondary mt-2 text-center">
                = {formatIndianCurrency(targetInHand)} per month
              </p>
            )}
          </div>

          {/* State */}
          <Select
            label="State"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            options={STATES.map((s) => ({ label: s.name, value: s.name }))}
          />

          {/* PF mode */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-1">PF Calculation</p>
            <p className="text-xs text-secondary mb-2">Most employers cap EPF at ₹1,800/month. Select '12% of basic' only if your offer letter specifies so.</p>
            <Toggle
              value={pfMode === 'full'}
              onChange={(v) => setPfMode(v ? 'full' : 'capped')}
              leftLabel="₹1,800/mo"
              rightLabel="12% of basic"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

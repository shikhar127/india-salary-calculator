import React, { useMemo, useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount } from '../ui/DisplayAmount'
import { formatIndianCurrency, formatNumber } from '../../utils/formatting'
import { calculateTax, calcPF } from '../../utils/taxLogic'
import { STATES } from '../../utils/constants'

export function ReverseCalculator() {
  const [targetValue, setTargetValue] = useState<number>(100000)
  const [targetInput, setTargetInput] = useState<string>(formatNumber(100000))
  const [pfMode, setPfMode] = useState<'capped' | 'full'>('capped')
  const [selectedState, setSelectedState] = useState<string>('Maharashtra')

  const targetInHand = targetValue

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
  }, [targetValue, pfMode, selectedState, targetInHand])

  return (
    <div className="space-y-6 pb-24 pt-4">
      <h2 className="text-2xl font-bold">Reverse Calculator</h2>
      <p className="text-secondary text-sm">
        Calculate required CTC for your desired monthly in-hand salary.
      </p>

      {/* Inputs first */}
      <Card>
        <div className="space-y-5">
          <Input
            label="Desired Monthly In-Hand"
            prefix="₹"
            type="text"
            inputMode="numeric"
            value={targetInput}
            onChange={(e) => {
              const stripped = e.target.value.replace(/[^0-9]/g, '')
              setTargetInput(stripped)
              setTargetValue(Number(stripped))
            }}
            onFocus={(e) => setTargetInput(e.target.value.replace(/,/g, ''))}
            onBlur={(e) => {
              const n = Number(e.target.value.replace(/,/g, ''))
              setTargetInput(n > 0 ? formatNumber(n) : '')
            }}
            placeholder="e.g. 1,00,000"
          />

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
        )
      )}
    </div>
  )
}

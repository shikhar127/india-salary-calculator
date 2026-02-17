import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount } from '../ui/DisplayAmount'
import { formatIndianCurrency } from '../../utils/formatting'
import { calculateTax, calcPF } from '../../utils/taxLogic'
import { STATES } from '../../utils/constants'
import { TrendingUp, ArrowRight } from 'lucide-react'

export function HikeCompare() {
  const [currentCtc, setCurrentCtc] = useState<number>(1200000)
  const [hikePercent, setHikePercent] = useState<number>(30)
  const [basicPercent, setBasicPercent] = useState<number>(50)
  const [selectedState, setSelectedState] = useState<string>('Maharashtra')
  const [pfMode, setPfMode] = useState<'capped' | 'full'>('capped')

  const calcInHand = (ctc: number): number => {
    const basic = ctc * (basicPercent / 100)
    const employerPF = pfMode === 'capped' ? calcPF(basic) : basic * 0.12
    const gross = ctc - employerPF
    const employeePF = pfMode === 'capped' ? calcPF(basic) : basic * 0.12
    const stateData = STATES.find((s) => s.name === selectedState) || STATES[0]
    const pt = stateData.pt
    const tax = calculateTax(gross, 'new').totalTax
    return (gross - employeePF - pt - tax) / 12
  }

  const newCtc = currentCtc * (1 + hikePercent / 100)
  const currentInHand = calcInHand(currentCtc)
  const newInHand = calcInHand(newCtc)
  const diff = newInHand - currentInHand

  return (
    <div className="space-y-6 pb-24 pt-4">
      <h2 className="text-2xl font-bold">Hike Calculator</h2>

      {/* Result card — on top */}
      <div className="bg-black text-white rounded-2xl p-6">
        <div className="flex items-center gap-2 text-accent-green mb-5">
          <TrendingUp className="h-5 w-5" />
          <span className="font-bold text-xs uppercase tracking-[0.12em]">Projected Growth</span>
        </div>

        {/* Current → After Hike */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Current</p>
            <p className="text-xl font-bold text-gray-400">
              {formatIndianCurrency(currentInHand)}
              <span className="text-sm font-normal text-gray-600 ml-0.5">/mo</span>
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <div className="flex-1 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">After Hike</p>
            <p className="text-xl font-bold text-white">
              {formatIndianCurrency(newInHand)}
              <span className="text-sm font-normal text-gray-400 ml-0.5">/mo</span>
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-500">Monthly Increase</span>
          <span className="text-xl font-bold text-accent-green">+{formatIndianCurrency(diff)}</span>
        </div>
      </div>

      {/* New Annual CTC — below result, above inputs */}
      <div className="text-center py-2">
        <p className="text-secondary text-xs font-semibold uppercase tracking-[0.12em] mb-2">
          New Annual CTC
        </p>
        <DisplayAmount amount={newCtc} size="md" showWords />
      </div>

      {/* Inputs */}
      <Card>
        <div className="space-y-4">
          <Input
            label="Current Annual CTC"
            prefix="₹"
            type="number"
            value={currentCtc}
            onChange={(e) => setCurrentCtc(Number(e.target.value))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expected Hike %"
              suffix="%"
              type="number"
              value={hikePercent}
              onChange={(e) => setHikePercent(Number(e.target.value))}
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
          <Select
            label="State"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            options={STATES.map((s) => ({ label: s.name, value: s.name }))}
          />
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

      <div className="bg-bg-secondary p-4 rounded-xl">
        <p className="text-xs text-secondary text-center">
          *Estimates based on New Tax Regime FY 2025-26. Actual in-hand may vary.
        </p>
      </div>
    </div>
  )
}

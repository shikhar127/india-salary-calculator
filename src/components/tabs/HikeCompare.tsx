import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount } from '../ui/DisplayAmount'
import { formatIndianCurrency } from '../../utils/formatting'
import { calculateTax, calcPF } from '../../utils/taxLogic'
import { STATES } from '../../utils/constants'
import { TrendingUp } from 'lucide-react'

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

      {/* Inputs first */}
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

      {/* Result card */}
      <Card className="bg-black text-white">
        <div className="flex items-center space-x-2 text-accent-green mb-4">
          <TrendingUp className="h-5 w-5" />
          <span className="font-bold text-xs uppercase tracking-[0.12em]">Projected Growth</span>
        </div>
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current</p>
            <DisplayAmount amount={currentInHand} size="md" suffix="/mo" color="text-gray-400" showWords />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">After Hike</p>
            <DisplayAmount amount={newInHand} size="md" suffix="/mo" color="text-white" showWords />
          </div>
        </div>
        <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-500">Monthly Increase</span>
          <span className="display-delta text-lg text-accent-green font-bold">
            +{formatIndianCurrency(diff)}
          </span>
        </div>
      </Card>

      <div className="flex items-center justify-center py-4">
        <div className="text-center">
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.12em] mb-2">
            New Annual CTC
          </p>
          <DisplayAmount amount={newCtc} size="md" showWords />
        </div>
      </div>

      <div className="bg-bg-secondary p-4 rounded-xl">
        <p className="text-xs text-secondary text-center">
          *Estimates based on New Tax Regime FY 2025-26. Actual in-hand may vary.
        </p>
      </div>
    </div>
  )
}

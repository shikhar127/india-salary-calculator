import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { DisplayAmount } from '../ui/DisplayAmount'
import { formatIndianCurrency } from '../../utils/formatting'
import { calculateTax, calcPF } from '../../utils/taxLogic'
import { TrendingUp } from 'lucide-react'

export function HikeCompare() {
  const [currentCtc, setCurrentCtc] = useState<number>(1200000)
  const [hikePercent, setHikePercent] = useState<number>(30)

  const calcInHand = (ctc: number): number => {
    const basic = ctc * 0.5
    const employerPF = calcPF(basic)
    const gratuity = basic * 0.0481
    const gross = ctc - employerPF - gratuity
    const employeePF = calcPF(basic)
    const pt = 2500
    const tax = calculateTax(gross, 'new').totalTax
    return (gross - employeePF - pt - tax) / 12
  }

  const calculateHike = () => {
    const newCtc = currentCtc * (1 + hikePercent / 100)
    const currentInHand = calcInHand(currentCtc)
    const newInHand = calcInHand(newCtc)
    return { newCtc, currentInHand, newInHand, diff: newInHand - currentInHand }
  }

  const result = calculateHike()

  return (
    <div className="space-y-6 pb-24 pt-4">
      <h2 className="text-2xl font-bold">Hike Calculator</h2>

      <Card className="bg-black text-white">
        <div className="flex items-center space-x-2 text-accent-green mb-3">
          <TrendingUp className="h-5 w-5" />
          <span className="font-bold text-xs uppercase tracking-[0.12em]">Projected Growth</span>
        </div>
        <div className="flex items-baseline">
          <DisplayAmount amount={result.newInHand} size="lg" suffix="/mo" color="text-white" />
        </div>
        <div className="mt-5 pt-4 border-t border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-500">Monthly Increase</span>
          <span className="display-delta text-lg text-accent-green">
            +{formatIndianCurrency(result.diff)}
          </span>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <Input
            label="Current Annual CTC"
            prefix="₹"
            type="number"
            value={currentCtc}
            onChange={(e) => setCurrentCtc(Number(e.target.value))}
          />
          <Input
            label="Expected Hike %"
            suffix="%"
            type="number"
            value={hikePercent}
            onChange={(e) => setHikePercent(Number(e.target.value))}
          />
        </div>
      </Card>

      <div className="flex items-center justify-center py-4">
        <div className="text-center">
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.12em] mb-2">
            New Annual CTC
          </p>
          <DisplayAmount amount={result.newCtc} size="md" />
        </div>
      </div>

      <div className="bg-bg-secondary p-4 rounded-xl">
        <p className="text-xs text-secondary text-center">
          *Estimates based on New Tax Regime FY 2025-26, 50% basic, statutory PF cap. Actual in-hand may vary.
        </p>
      </div>
    </div>
  )
}

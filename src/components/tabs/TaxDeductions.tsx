import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount } from '../ui/DisplayAmount'
import { calculateTax, calculateHRAExemption } from '../../utils/taxLogic'
import { CheckCircle2 } from 'lucide-react'

export function TaxDeductions() {
  const [income, setIncome] = useState<number>(1500000)
  const [section80C, setSection80C] = useState<number>(150000)
  const [section80D, setSection80D] = useState<number>(25000)
  const [hraReceived, setHraReceived] = useState<number>(200000)
  const [rentPaid, setRentPaid] = useState<number>(180000)
  const [basicSalary, setBasicSalary] = useState<number>(750000)
  const [isMetro, setIsMetro] = useState<boolean>(true)
  const [nps, setNps] = useState<number>(50000)
  const [comparison, setComparison] = useState<any>(null)

  useEffect(() => {
    const newRegimeResult = calculateTax(income, 'new')
    const hraExemption = calculateHRAExemption(basicSalary, hraReceived, rentPaid, isMetro)
    const ded80C = Math.min(section80C, 150000)
    const ded80D = Math.min(section80D, 25000)
    const dedNPS = Math.min(nps, 50000)
    const totalExemptions = hraExemption + ded80C + ded80D + dedNPS
    const oldRegimeTaxable = Math.max(0, income - totalExemptions)
    const oldRegimeResult = calculateTax(oldRegimeTaxable, 'old')

    setComparison({
      new: newRegimeResult,
      old: oldRegimeResult,
      savings: Math.abs(newRegimeResult.totalTax - oldRegimeResult.totalTax),
      better: newRegimeResult.totalTax < oldRegimeResult.totalTax ? 'new' : 'old',
    })
  }, [income, section80C, section80D, hraReceived, rentPaid, basicSalary, isMetro, nps])

  if (!comparison) return null

  return (
    <div className="space-y-6 pb-24">
      <div className="pt-4">
        <h2 className="text-2xl font-bold mb-4">Regime Comparison</h2>

        {/* Recommendation Card */}
        <div
          className={`p-6 rounded-2xl mb-6 ${comparison.better === 'new' ? 'bg-black text-white' : 'bg-white border border-border-default'}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.12em] mb-1 ${comparison.better === 'new' ? 'text-gray-500' : 'text-secondary'}`}>
                Recommendation
              </p>
              <h3 className="text-xl font-bold">
                Choose {comparison.better === 'new' ? 'New' : 'Old'} Regime
              </h3>
            </div>
            {comparison.better === 'new' && (
              <CheckCircle2 className="text-accent-green h-6 w-6" />
            )}
          </div>
          <div className="mt-4">
            <DisplayAmount
              amount={comparison.savings}
              size="lg"
              color="text-accent-green"
            />
            <span className="text-sm font-medium ml-2 opacity-60">saved</span>
          </div>
        </div>

        {/* Side by Side */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className={comparison.better === 'new' ? 'ring-2 ring-accent-green' : ''}>
            <p className="text-xs text-secondary uppercase font-bold tracking-wide mb-2">New Regime</p>
            <DisplayAmount amount={comparison.new.totalTax} size="md" />
            <p className="text-xs text-secondary mt-1.5">Tax Payable</p>
          </Card>
          <Card className={comparison.better === 'old' ? 'ring-2 ring-accent-green' : ''}>
            <p className="text-xs text-secondary uppercase font-bold tracking-wide mb-2">Old Regime</p>
            <DisplayAmount amount={comparison.old.totalTax} size="md" />
            <p className="text-xs text-secondary mt-1.5">Tax Payable</p>
          </Card>
        </div>

        {/* Income Input */}
        <h3 className="text-lg font-bold mb-3">Income Details</h3>
        <Card className="space-y-4 mb-6">
          <Input
            label="Gross Annual Income"
            prefix="₹"
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
          />
        </Card>

        {/* Deductions */}
        <h3 className="text-lg font-bold mb-3">Deductions (Old Regime)</h3>
        <Card className="space-y-4">
          <div className="bg-bg-secondary p-3 rounded-lg mb-4">
            <p className="text-xs text-secondary mb-2">HRA Calculation Params</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Basic Salary"
                prefix="₹"
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
              />
              <Input
                label="Rent Paid"
                prefix="₹"
                type="number"
                value={rentPaid}
                onChange={(e) => setRentPaid(Number(e.target.value))}
              />
            </div>
            <div className="mt-3">
              <Toggle
                value={isMetro}
                onChange={setIsMetro}
                leftLabel="Non-Metro"
                rightLabel="Metro"
              />
            </div>
          </div>

          <Input
            label="Section 80C (EPF, LIC, ELSS)"
            prefix="₹"
            type="number"
            value={section80C}
            onChange={(e) => setSection80C(Number(e.target.value))}
            suffix="/ 1.5L"
          />
          <Input
            label="Section 80D (Health Ins)"
            prefix="₹"
            type="number"
            value={section80D}
            onChange={(e) => setSection80D(Number(e.target.value))}
          />
          <Input
            label="NPS (80CCD 1B)"
            prefix="₹"
            type="number"
            value={nps}
            onChange={(e) => setNps(Number(e.target.value))}
            suffix="/ 50k"
          />
        </Card>
      </div>
    </div>
  )
}

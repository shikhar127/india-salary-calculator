import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount } from '../ui/DisplayAmount'
import { calculateTax, calculateHRAExemption } from '../../utils/taxLogic'
import {
  SENIOR_OLD_REGIME_SLABS,
  VERY_SENIOR_OLD_REGIME_SLABS,
} from '../../utils/constants'
import { CheckCircle2 } from 'lucide-react'

type AgeGroup = 'below60' | '60to79' | '80plus'

export function TaxDeductions() {
  const [income, setIncome] = useState<number>(1500000)
  const [section80C, setSection80C] = useState<number>(150000)
  const [section80D, setSection80D] = useState<number>(25000)
  const [hraReceived, setHraReceived] = useState<number>(200000)
  const [rentPaid, setRentPaid] = useState<number>(180000)
  const [basicSalary, setBasicSalary] = useState<number>(750000)
  const [isMetro, setIsMetro] = useState<boolean>(true)
  const [nps, setNps] = useState<number>(50000)
  const [employerNps, setEmployerNps] = useState<number>(0)
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('below60')
  const [comparison, setComparison] = useState<any>(null)

  const ded80DMax = ageGroup === 'below60' ? 25000 : 50000

  useEffect(() => {
    const dedEmployerNps = Math.min(employerNps, basicSalary * 0.10)

    // New regime: 80CCD(2) employer NPS is deductible even in new regime
    const newRegimeIncome = Math.max(0, income - dedEmployerNps)
    const newRegimeResult = calculateTax(newRegimeIncome, 'new')

    const hraExemption = calculateHRAExemption(basicSalary, hraReceived, rentPaid, isMetro)
    const ded80C = Math.min(section80C, 150000)
    const ded80D = Math.min(section80D, ded80DMax)
    const dedNPS = Math.min(nps, 50000)
    const totalExemptions = hraExemption + ded80C + ded80D + dedNPS + dedEmployerNps
    const oldRegimeTaxable = Math.max(0, income - totalExemptions)

    // Pick old regime slabs based on age
    const oldSlabs =
      ageGroup === '80plus'
        ? VERY_SENIOR_OLD_REGIME_SLABS
        : ageGroup === '60to79'
        ? SENIOR_OLD_REGIME_SLABS
        : undefined

    const oldRegimeResult = calculateTax(oldRegimeTaxable, 'old', oldSlabs)

    setComparison({
      new: newRegimeResult,
      old: oldRegimeResult,
      savings: Math.abs(newRegimeResult.totalTax - oldRegimeResult.totalTax),
      better: newRegimeResult.totalTax < oldRegimeResult.totalTax ? 'new' : 'old',
    })
  }, [income, section80C, section80D, hraReceived, rentPaid, basicSalary, isMetro, nps, employerNps, ageGroup])

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
              showWords
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

        {/* Income & Profile */}
        <h3 className="text-lg font-bold mb-3">Income Details</h3>
        <Card className="space-y-4 mb-6">
          <Input
            label="Gross Annual Income"
            prefix="₹"
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
          />
          <Select
            label="Age Group"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
            options={[
              { label: 'Below 60', value: 'below60' },
              { label: '60–79 (Senior Citizen)', value: '60to79' },
              { label: '80+ (Very Senior)', value: '80plus' },
            ]}
          />
        </Card>

        {/* Deductions */}
        <h3 className="text-lg font-bold mb-3">Deductions</h3>
        <Card className="space-y-4">
          <div className="bg-bg-secondary p-3 rounded-lg">
            <p className="text-xs text-secondary mb-2">HRA Exemption (Old Regime)</p>
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
            label={`Section 80D (Health Ins) — max ₹${(ded80DMax / 1000).toFixed(0)}k`}
            prefix="₹"
            type="number"
            value={section80D}
            onChange={(e) => setSection80D(Number(e.target.value))}
          />
          <Input
            label="NPS Employee (80CCD 1B)"
            prefix="₹"
            type="number"
            value={nps}
            onChange={(e) => setNps(Number(e.target.value))}
            suffix="/ 50k"
          />
          <Input
            label="Employer NPS (80CCD 2) — both regimes"
            prefix="₹"
            type="number"
            value={employerNps}
            onChange={(e) => setEmployerNps(Number(e.target.value))}
            suffix={`/ ${((basicSalary * 0.1) / 1000).toFixed(0)}k`}
          />
        </Card>
      </div>
    </div>
  )
}

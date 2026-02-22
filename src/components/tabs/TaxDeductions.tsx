import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount } from '../ui/DisplayAmount'
import { calculateTax, calculateHRAExemption } from '../../utils/taxLogic'
import { numberToWords, formatNumber } from '../../utils/formatting'
import {
  SENIOR_OLD_REGIME_SLABS,
  VERY_SENIOR_OLD_REGIME_SLABS,
  STATES,
} from '../../utils/constants'
import { CheckCircle2 } from 'lucide-react'

type AgeGroup = 'below60' | '60to79' | '80plus'

export function TaxDeductions() {
  // Numeric states for calculations
  const [income, setIncome] = useState<number>(1500000)
  const [section80C, setSection80C] = useState<number>(150000)
  const [section80D, setSection80D] = useState<number>(25000)
  const [receivesHRA, setReceivesHRA] = useState<boolean>(false)
  const [hraReceived, setHraReceived] = useState<number>(200000)
  const [rentPaid, setRentPaid] = useState<number>(0)
  const [basicSalary, setBasicSalary] = useState<number>(750000)
  const [isMetro, setIsMetro] = useState<boolean>(true)
  const [nps, setNps] = useState<number>(50000)
  const [employerNps, setEmployerNps] = useState<number>(0)
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('below60')
  const [selectedState, setSelectedState] = useState<string>('Maharashtra')
  const [comparison, setComparison] = useState<any>(null)

  // String states for formatted display
  const [incomeInput, setIncomeInput] = useState<string>(formatNumber(1500000))
  const [section80CInput, setSection80CInput] = useState<string>(formatNumber(150000))
  const [section80DInput, setSection80DInput] = useState<string>(formatNumber(25000))
  const [hraReceivedInput, setHraReceivedInput] = useState<string>(formatNumber(200000))
  const [rentPaidInput, setRentPaidInput] = useState<string>(formatNumber(0))
  const [basicSalaryInput, setBasicSalaryInput] = useState<string>(formatNumber(750000))
  const [npsInput, setNpsInput] = useState<string>(formatNumber(50000))
  const [employerNpsInput, setEmployerNpsInput] = useState<string>(formatNumber(0))

  const ded80DMax = ageGroup === 'below60' ? 25000 : 50000

  // Sync 80D cap when age group changes
  useEffect(() => {
    const max = ageGroup === 'below60' ? 25000 : 50000
    if (section80D > max) setSection80D(max)
  }, [ageGroup])

  useEffect(() => {
    // 80CCD(2) limits are regime-specific (FY 2025-26):
    // New Regime → 14% of Basic, Old Regime → 10% of Basic
    const dedEmployerNpsNew = Math.min(employerNps, basicSalary * 0.14)
    const dedEmployerNpsOld = Math.min(employerNps, basicSalary * 0.10)

    const stateData = STATES.find((s) => s.name === selectedState) || STATES[0]
    const annualPT = stateData.pt

    // New regime: employer NPS (80CCD(2)) deductible; PT not deductible
    const newRegimeIncome = Math.max(0, income - dedEmployerNpsNew)
    const newRegimeResult = calculateTax(newRegimeIncome, 'new')

    const hraExemption = receivesHRA ? calculateHRAExemption(basicSalary, hraReceived, rentPaid, isMetro) : 0
    const ded80C = Math.min(section80C, 150000)
    const ded80D = Math.min(section80D, ded80DMax)
    const dedNPS = Math.min(nps, 50000)
    // Old regime: PT deductible under Section 16(iii); standard deduction applied inside calculateTax
    const totalExemptions = hraExemption + annualPT + ded80C + ded80D + dedNPS + dedEmployerNpsOld
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
  }, [income, section80C, section80D, hraReceived, rentPaid, basicSalary, isMetro, nps, employerNps, ageGroup, receivesHRA, selectedState])

  if (!comparison) return null

  return (
    <div className="space-y-6 pb-24">
      <div className="pt-4">
        <h2 className="text-2xl font-bold mb-4">Regime Comparison</h2>

        {/* Recommendation Card — on top */}
        <div
          className={`p-6 rounded-2xl mb-4 ${comparison.better === 'new' ? 'bg-black text-white' : 'bg-white border border-border-default'}`}
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
          <div className="mt-4 flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <DisplayAmount
                amount={comparison.savings}
                size="lg"
                color="text-accent-green"
              />
              <span className="text-sm font-medium opacity-60">saved</span>
            </div>
            <span className={`text-[0.62rem] font-medium tracking-widest uppercase opacity-40 ${comparison.better === 'new' ? '' : 'text-accent-green'}`}>
              {numberToWords(comparison.savings)}
            </span>
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

        {/* Income Details — inputs below result */}
        <h3 className="text-lg font-bold mb-3">Income Details</h3>
        <Card className="space-y-4 mb-6">
          <div>
            <Input
              label="Gross Annual Income"
              prefix="₹"
              type="text"
              inputMode="numeric"
              value={incomeInput}
              onChange={(e) => {
                const stripped = e.target.value.replace(/[^0-9]/g, '')
                setIncomeInput(stripped)
                setIncome(Number(stripped))
              }}
              onFocus={(e) => setIncomeInput(e.target.value.replace(/,/g, ''))}
              onBlur={(e) => {
                const n = Number(e.target.value.replace(/,/g, ''))
                setIncomeInput(n > 0 ? formatNumber(n) : '0')
              }}
            />
            <p className="text-xs text-secondary mt-1">≈ CTC minus Employer PF contribution</p>
          </div>
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
          <div>
            <Select
              label="State"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              options={STATES.map((s) => ({ label: s.name, value: s.name }))}
            />
            <p className="text-xs text-secondary mt-1">Professional Tax is deductible in Old Regime (Section 16(iii))</p>
          </div>
        </Card>

        {/* Deductions */}
        <h3 className="text-lg font-bold mb-3">Deductions</h3>
        <Card className="space-y-4">
          {/* HRA section */}
          <div className="bg-bg-secondary p-3 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-semibold text-secondary">HRA Exemption (Old Regime)</p>
              <Toggle
                value={receivesHRA}
                onChange={setReceivesHRA}
                leftLabel="Own home"
                rightLabel="Renting"
              />
            </div>
            {receivesHRA && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Basic Salary"
                    prefix="₹"
                    type="text"
                    inputMode="numeric"
                    value={basicSalaryInput}
                    onChange={(e) => {
                      const stripped = e.target.value.replace(/[^0-9]/g, '')
                      setBasicSalaryInput(stripped)
                      setBasicSalary(Number(stripped))
                    }}
                    onFocus={(e) => setBasicSalaryInput(e.target.value.replace(/,/g, ''))}
                    onBlur={(e) => {
                      const n = Number(e.target.value.replace(/,/g, ''))
                      setBasicSalaryInput(n > 0 ? formatNumber(n) : '0')
                    }}
                  />
                  <Input
                    label="Rent Paid"
                    prefix="₹"
                    type="text"
                    inputMode="numeric"
                    value={rentPaidInput}
                    onChange={(e) => {
                      const stripped = e.target.value.replace(/[^0-9]/g, '')
                      setRentPaidInput(stripped)
                      setRentPaid(Number(stripped))
                    }}
                    onFocus={(e) => setRentPaidInput(e.target.value.replace(/,/g, ''))}
                    onBlur={(e) => {
                      const n = Number(e.target.value.replace(/,/g, ''))
                      setRentPaidInput(n > 0 ? formatNumber(n) : '0')
                    }}
                  />
                </div>
                <Toggle
                  value={isMetro}
                  onChange={setIsMetro}
                  leftLabel="Non-Metro"
                  rightLabel="Metro"
                />
              </div>
            )}
          </div>

          <Input
            label="Section 80C (EPF, LIC, ELSS)"
            prefix="₹"
            type="text"
            inputMode="numeric"
            value={section80CInput}
            onChange={(e) => {
              const stripped = e.target.value.replace(/[^0-9]/g, '')
              setSection80CInput(stripped)
              setSection80C(Number(stripped))
            }}
            onFocus={(e) => setSection80CInput(e.target.value.replace(/,/g, ''))}
            onBlur={(e) => {
              const n = Number(e.target.value.replace(/,/g, ''))
              setSection80CInput(n > 0 ? formatNumber(n) : '0')
            }}
            suffix="/ 1.5L"
          />
          <Input
            label={`Section 80D (Health Ins) — max ₹${(ded80DMax / 1000).toFixed(0)}k`}
            prefix="₹"
            type="text"
            inputMode="numeric"
            value={section80DInput}
            onChange={(e) => {
              const stripped = e.target.value.replace(/[^0-9]/g, '')
              setSection80DInput(stripped)
              setSection80D(Number(stripped))
            }}
            onFocus={(e) => setSection80DInput(e.target.value.replace(/,/g, ''))}
            onBlur={(e) => {
              const n = Number(e.target.value.replace(/,/g, ''))
              setSection80DInput(n > 0 ? formatNumber(n) : '0')
            }}
          />
          <div>
            <Input
              label="NPS — Voluntary Contribution (80CCD 1B)"
              prefix="₹"
              type="text"
              inputMode="numeric"
              value={npsInput}
              onChange={(e) => {
                const stripped = e.target.value.replace(/[^0-9]/g, '')
                setNpsInput(stripped)
                setNps(Number(stripped))
              }}
              onFocus={(e) => setNpsInput(e.target.value.replace(/,/g, ''))}
              onBlur={(e) => {
                const n = Number(e.target.value.replace(/,/g, ''))
                setNpsInput(n > 0 ? formatNumber(n) : '0')
              }}
              suffix="/ 50k"
            />
            <p className="text-xs text-secondary mt-1">Your personal top-up contribution to NPS, separate from employer's.</p>
          </div>
          <div>
            <Input
              label="Employer NPS — also deductible in New Regime (80CCD 2)"
              prefix="₹"
              type="text"
              inputMode="numeric"
              value={employerNpsInput}
              onChange={(e) => {
                const stripped = e.target.value.replace(/[^0-9]/g, '')
                setEmployerNpsInput(stripped)
                setEmployerNps(Number(stripped))
              }}
              onFocus={(e) => setEmployerNpsInput(e.target.value.replace(/,/g, ''))}
              onBlur={(e) => {
                const n = Number(e.target.value.replace(/,/g, ''))
                setEmployerNpsInput(n > 0 ? formatNumber(n) : '0')
              }}
              suffix={`/ ${((basicSalary * 0.14) / 1000).toFixed(0)}k`}
            />
            <p className="text-xs text-secondary mt-1">New Regime cap: 14% of Basic · Old Regime cap: 10% of Basic</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

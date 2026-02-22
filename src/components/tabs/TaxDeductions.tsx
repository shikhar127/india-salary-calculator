import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount } from '../ui/DisplayAmount'
import { calculateTax, calculateHRAExemption } from '../../utils/taxLogic'
import { numberToWords, formatNumber, formatIndianCurrency } from '../../utils/formatting'
import {
  SENIOR_OLD_REGIME_SLABS,
  VERY_SENIOR_OLD_REGIME_SLABS,
  STATES,
} from '../../utils/constants'
import { CheckCircle2 } from 'lucide-react'

type AgeGroup = 'below60' | '60to79' | '80plus'

export function TaxDeductions() {
  // CTC and PF mode states
  const [ctc, setCtc] = useState<number>(0)
  const [ctcInput, setCtcInput] = useState<string>('0')
  const [pfMode, setPfMode] = useState<'capped' | 'full'>('capped')
  const [showDeductions, setShowDeductions] = useState<boolean>(false)

  // Numeric states for calculations
  const [section80C, setSection80C] = useState<number>(0)
  const [section80D, setSection80D] = useState<number>(0)
  const [receivesHRA, setReceivesHRA] = useState<boolean>(false)
  const [hraReceived, setHraReceived] = useState<number>(0)
  const [rentPaid, setRentPaid] = useState<number>(0)
  const [isMetro, setIsMetro] = useState<boolean>(true)
  const [nps, setNps] = useState<number>(0)
  const [employerNps, setEmployerNps] = useState<number>(0)
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('below60')
  const [selectedState, setSelectedState] = useState<string>('Maharashtra')
  const [comparison, setComparison] = useState<any>(null)

  // String states for formatted display
  const [section80CInput, setSection80CInput] = useState<string>('0')
  const [section80DInput, setSection80DInput] = useState<string>('0')
  const [hraReceivedInput, setHraReceivedInput] = useState<string>('0')
  const [rentPaidInput, setRentPaidInput] = useState<string>('0')
  const [npsInput, setNpsInput] = useState<string>('0')
  const [employerNpsInput, setEmployerNpsInput] = useState<string>('0')

  // Calculate derived values from CTC
  const basicSalary = ctc * 0.5
  const employerPF = pfMode === 'capped'
    ? Math.min(1800 * 12, basicSalary * 0.12)
    : basicSalary * 0.12
  const income = ctc - employerPF

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

        {/* Primary Inputs - Always Visible */}
        <Card className="space-y-4 mb-6">
          <div>
            <Input
              label="Annual CTC"
              prefix="₹"
              type="text"
              inputMode="numeric"
              value={ctcInput}
              onChange={(e) => {
                const stripped = e.target.value.replace(/[^0-9]/g, '')
                setCtcInput(stripped)
                setCtc(Number(stripped))
              }}
              onFocus={(e) => setCtcInput(e.target.value.replace(/,/g, ''))}
              onBlur={(e) => {
                const n = Number(e.target.value.replace(/,/g, ''))
                setCtcInput(n > 0 ? formatNumber(n) : '0')
              }}
            />
            <p className="text-xs text-secondary mt-1">Your total Cost to Company</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide">
                PF Calculation
              </label>
            </div>
            <Toggle
              value={pfMode === 'full'}
              onChange={(val) => setPfMode(val ? 'full' : 'capped')}
              leftLabel="₹18,000 cap"
              rightLabel="12% of basic"
            />
            <p className="text-xs text-secondary mt-1">
              {pfMode === 'capped'
                ? 'Most companies cap Employer PF at ₹1,800/month (₹21,600/year)'
                : 'Some companies contribute full 12% of basic salary'}
            </p>
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

        {ctc === 0 ? (
          <div className="text-center py-16 px-6">
            <h3 className="text-2xl font-bold mb-3">Compare Tax Regimes</h3>
            <p className="text-secondary text-sm mb-8 max-w-sm mx-auto">
              Enter your Annual CTC to see which tax regime saves you more
            </p>
          </div>
        ) : (
          <>
            {/* Recommendation Card */}
            <div
              className={`p-6 rounded-2xl mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${comparison.better === 'new' ? 'bg-black text-white' : 'bg-white border border-border-default'}`}
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

            {/* Customize Deductions Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowDeductions(!showDeductions)}
                className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wide text-secondary pt-1 hover:text-text-primary transition-colors"
              >
                <span>Customize Deductions {!showDeductions && '(Optional)'}</span>
                <span className="text-base leading-none">{showDeductions ? '−' : '+'}</span>
              </button>

              {!showDeductions && (section80C > 0 || section80D > 0 || nps > 0 || receivesHRA) && (
                <p className="text-xs text-secondary mt-2">
                  Current deductions: 80C: {formatIndianCurrency(section80C)}, 80D: {formatIndianCurrency(section80D)}, NPS: {formatIndianCurrency(nps)}
                  {receivesHRA && ', HRA exemption applied'}
                </p>
              )}
            </div>

            {/* Deductions Card - Collapsible */}
            {showDeductions && (
        <Card className="space-y-4">
          <h3 className="text-lg font-bold">Deductions (Old Regime)</h3>

          {/* HRA section */}
          <div className="bg-bg-secondary p-3 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-semibold text-secondary">HRA Exemption</p>
              <Toggle
                value={receivesHRA}
                onChange={setReceivesHRA}
                leftLabel="Own home"
                rightLabel="Renting"
              />
            </div>
            {receivesHRA && (
              <div className="space-y-3">
                <div>
                  <Input
                    label="HRA Received"
                    prefix="₹"
                    type="text"
                    inputMode="numeric"
                    value={hraReceivedInput}
                    onChange={(e) => {
                      const stripped = e.target.value.replace(/[^0-9]/g, '')
                      setHraReceivedInput(stripped)
                      setHraReceived(Number(stripped))
                    }}
                    onFocus={(e) => setHraReceivedInput(e.target.value.replace(/,/g, ''))}
                    onBlur={(e) => {
                      const n = Number(e.target.value.replace(/,/g, ''))
                      setHraReceivedInput(n > 0 ? formatNumber(n) : '0')
                    }}
                  />
                  <p className="text-xs text-secondary mt-1">Annual HRA component from your salary</p>
                </div>
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
                <Toggle
                  value={isMetro}
                  onChange={setIsMetro}
                  leftLabel="Non-Metro"
                  rightLabel="Metro"
                />
                <p className="text-xs text-secondary">Basic salary assumed as 50% of CTC: {formatIndianCurrency(basicSalary)}</p>
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
            )}
        </>
        )}
      </div>
    </div>
  )
}

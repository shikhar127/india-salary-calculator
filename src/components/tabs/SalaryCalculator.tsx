import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts'
import { Share2, Download, Info } from 'lucide-react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount, RowAmount } from '../ui/DisplayAmount'
import { STATES } from '../../utils/constants'
import { formatIndianCurrency, formatShorthand } from '../../utils/formatting'
import { calculateSalaryBreakdown, SalaryBreakdown, TaxRegime } from '../../utils/salaryLogic'
import { formatLakhValue, lakhInputToRupees, sanitizeLakhInput } from '../../utils/ctcInput'

const COLORS = ['#000000', '#6B6B6B', '#999999', '#E5E5E5']
type OldRegimeAgeGroup = 'below60' | '60plus'

export function SalaryCalculator({ savedCtc, onCtcChange }: { savedCtc?: number | null; onCtcChange?: (ctc: number) => void }) {
  const initialCtc = savedCtc && savedCtc > 0 ? savedCtc : 0
  const [ctcLakhInput, setCtcLakhInput] = useState<string>(initialCtc > 0 ? formatLakhValue(initialCtc) : '')
  const [ctc, setCtc] = useState<number>(initialCtc)
  const [basicPercent, setBasicPercent] = useState<number>(50)
  const [variablePay, setVariablePay] = useState<number>(0)
  const [isMetro, setIsMetro] = useState<boolean>(true)
  const [selectedState, setSelectedState] = useState<string>('Maharashtra')
  const [showAnnual, setShowAnnual] = useState<boolean>(false)
  const [pfMode, setPfMode] = useState<'capped' | 'full'>('capped')
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new')
  const [oldRegimeAgeGroup, setOldRegimeAgeGroup] = useState<OldRegimeAgeGroup>('below60')
  const [old80C, setOld80C] = useState<number>(0)
  const [old80D, setOld80D] = useState<number>(0)
  const [oldNps, setOldNps] = useState<number>(0)
  const [oldHomeLoanInterest, setOldHomeLoanInterest] = useState<number>(0)
  const [oldEducationLoanInterest, setOldEducationLoanInterest] = useState<number>(0)
  const [oldSavingsInterest, setOldSavingsInterest] = useState<number>(0)
  const [oldHraExemption, setOldHraExemption] = useState<number>(0)
  const [results, setResults] = useState<SalaryBreakdown | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const old80DMax = oldRegimeAgeGroup === 'below60' ? 25000 : 50000
  const oldSavingsMax = oldRegimeAgeGroup === 'below60' ? 10000 : 50000

  const additionalOldRegimeDeductions =
    Math.min(Math.max(old80C, 0), 150000) +
    Math.min(Math.max(old80D, 0), old80DMax) +
    Math.min(Math.max(oldNps, 0), 50000) +
    Math.min(Math.max(oldHomeLoanInterest, 0), 200000) +
    Math.max(oldEducationLoanInterest, 0) +
    Math.min(Math.max(oldSavingsInterest, 0), oldSavingsMax) +
    Math.max(oldHraExemption, 0)

  useEffect(() => {
    if (old80D > old80DMax) {
      setOld80D(old80DMax)
    }
    if (oldSavingsInterest > oldSavingsMax) {
      setOldSavingsInterest(oldSavingsMax)
    }
  }, [old80D, old80DMax, oldSavingsInterest, oldSavingsMax])

  useEffect(() => {
    const timer = setTimeout(() => {
      setCtc(lakhInputToRupees(ctcLakhInput))
    }, 300)
    return () => clearTimeout(timer)
  }, [ctcLakhInput])

  useEffect(() => {
    if (savedCtc && savedCtc > 0) {
      setCtc(savedCtc)
      setCtcLakhInput(formatLakhValue(savedCtc))
    }
  }, [savedCtc])

  useEffect(() => {
    if (onCtcChange) {
      onCtcChange(ctc)
    }
  }, [ctc, onCtcChange])

  useEffect(() => {
    if (ctc <= 0) {
      setResults(null)
      return
    }

    const breakdown = calculateSalaryBreakdown({
      ctc,
      basicPercent,
      variablePay,
      isMetro,
      stateName: selectedState,
      pfMode,
      taxRegime,
      professionalTaxMode: 'state',
      manualProfessionalTaxAnnual: 0,
      additionalOldRegimeDeductions: taxRegime === 'old' ? additionalOldRegimeDeductions : 0,
    })

    setResults(breakdown)
  }, [
    ctc,
    basicPercent,
    variablePay,
    isMetro,
    selectedState,
    pfMode,
    taxRegime,
    additionalOldRegimeDeductions,
  ])

  const handleShare = async () => {
    const text = `My salary breakdown (CTC: ${formatIndianCurrency(ctc)})\nMonthly In-Hand: ${formatIndianCurrency(results?.monthlyInHand ?? 0)}\nCalculated via SalaryFit`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Salary Breakdown', text })
      } catch {
        // User cancelled or share failed.
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        setCopied(false)
      }
    }
  }

  const handlePDF = async () => {
    if (!results) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('SalaryFit — Salary Breakdown', 20, 20)
    doc.setFontSize(12)
    doc.text(`Annual CTC: ${formatIndianCurrency(ctc)}`, 20, 40)
    doc.text(`Monthly In-Hand: ${formatIndianCurrency(results.monthlyInHand)}`, 20, 52)
    doc.text(`Annual In-Hand: ${formatIndianCurrency(results.annualInHand)}`, 20, 64)
    doc.text('--- Salary Components ---', 20, 80)
    doc.text(`Basic Salary: ${formatIndianCurrency(results.annualBasic)}`, 20, 92)
    doc.text(`HRA: ${formatIndianCurrency(results.annualHRA)}`, 20, 104)
    doc.text(`Special Allowance: ${formatIndianCurrency(results.annualSpecial)}`, 20, 116)
    doc.text(`Gross Salary: ${formatIndianCurrency(results.annualGross)}`, 20, 128)
    doc.text('--- Deductions ---', 20, 144)
    doc.text(`Employee PF: ${formatIndianCurrency(results.annualEmployeePF)}`, 20, 156)
    doc.text(`Professional Tax: ${formatIndianCurrency(results.annualPT)}`, 20, 168)
    doc.text(`Income Tax (${taxRegime === 'new' ? 'New' : 'Old'} Regime): ${formatIndianCurrency(results.annualTax)}`, 20, 180)
    doc.text(`Total Deductions: ${formatIndianCurrency(results.annualDeductions)}`, 20, 192)
    doc.save('salary-breakdown.pdf')
  }

  const chartData = results
    ? [
        { name: 'In-Hand', value: results.annualInHand },
        { name: 'Tax', value: results.annualTax },
        { name: 'PF & Other', value: results.annualEmployeePF + results.annualPT + results.annualEmployeeESI },
        { name: 'Employer Contrib', value: results.annualEmployerPF + results.annualEmployerESI },
      ]
    : []

  const basicWarning = basicPercent > 0 && (basicPercent < 30 || basicPercent > 70)

  return (
    <div className="space-y-6 pb-24">
      {ctc > 0 && (
        <div className="text-center space-y-1 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.15em]">
            {showAnnual ? 'Annual Take Home' : 'Monthly In-Hand'}
          </p>
          <div className="py-2">
            {results ? (
              <DisplayAmount
                amount={showAnnual ? results.annualInHand : results.monthlyInHand}
                size="hero"
                suffix={showAnnual ? '/yr' : '/mo'}
                showWords
              />
            ) : (
              <p className="text-secondary text-sm py-6">Calculating...</p>
            )}
          </div>
          {results && (
            <div className="flex justify-center pt-1">
              <span className="text-xs font-medium px-3 py-1 bg-bg-secondary rounded-full text-secondary">
                {taxRegime === 'new' ? 'New' : 'Old'} tax regime
              </span>
            </div>
          )}
          <div className="flex justify-center pt-3">
            <Toggle
              value={showAnnual}
              onChange={setShowAnnual}
              leftLabel="Monthly"
              rightLabel="Annual"
            />
          </div>
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Annual CTC"
              type="text"
              inputMode="decimal"
              value={ctcLakhInput}
              onChange={(e) => setCtcLakhInput(sanitizeLakhInput(e.target.value))}
              onBlur={(e) => {
                setCtcLakhInput(formatLakhValue(lakhInputToRupees(e.target.value)))
              }}
              placeholder="e.g. 12.5"
              suffix="LAKH"
              suffixClassName="text-primary font-black tracking-wide text-lg"
              inputClassName="text-xl font-bold py-4"
            />
            <div>
              <Input
                label="Basic Salary (%)"
                suffix="%"
                type="number"
                value={basicPercent}
                onChange={(e) => setBasicPercent(Number(e.target.value))}
                placeholder="40–60%"
                suffixClassName="text-primary font-black text-lg"
                inputClassName="text-xl font-bold py-4"
              />
              {basicWarning && <p className="text-xs text-amber-600 mt-1">Typical range is 30–70%</p>}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-1">PF Calculation</p>
            <Toggle
              value={pfMode === 'full'}
              onChange={(v) => setPfMode(v ? 'full' : 'capped')}
              leftLabel="₹1,800/mo"
              rightLabel="12% of basic"
            />
          </div>

          <Input
            label="Variable Pay (Annual)"
            prefix="₹"
            type="number"
            value={variablePay}
            onChange={(e) => setVariablePay(Number(e.target.value))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tax Regime"
              value={taxRegime}
              onChange={(e) => setTaxRegime(e.target.value as TaxRegime)}
              options={[
                { label: 'New Regime', value: 'new' },
                { label: 'Old Regime', value: 'old' },
              ]}
            />
            <Select
              label="City Type"
              value={isMetro ? 'metro' : 'non-metro'}
              onChange={(e) => setIsMetro(e.target.value === 'metro')}
              options={[
                { label: 'Metro', value: 'metro' },
                { label: 'Non-Metro', value: 'non-metro' },
              ]}
            />
          </div>

          <Select
            label="State"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            options={STATES.map((s) => ({ label: s.name, value: s.name }))}
          />
          <p className="text-xs text-secondary -mt-1">
            Professional tax is auto-estimated from selected state.
          </p>

          {taxRegime === 'old' && (
            <Card className="bg-bg-secondary border-border-default space-y-3">
              <h4 className="text-sm font-bold">Old Regime Deductions (Optional)</h4>
              <p className="text-xs text-secondary -mt-1">Add annual deductions you are eligible for (80C etc.).</p>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Age Group"
                  value={oldRegimeAgeGroup}
                  onChange={(e) => setOldRegimeAgeGroup(e.target.value as OldRegimeAgeGroup)}
                  options={[
                    { label: 'Below 60', value: 'below60' },
                    { label: '60+', value: '60plus' },
                  ]}
                />
                <Input
                  label="80C"
                  prefix="₹"
                  type="number"
                  value={old80C || ''}
                  onChange={(e) => setOld80C(Number(e.target.value || 0))}
                  placeholder="Max 1,50,000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={`80D (max ₹${old80DMax.toLocaleString('en-IN')})`}
                  prefix="₹"
                  type="number"
                  value={old80D || ''}
                  onChange={(e) => setOld80D(Number(e.target.value || 0))}
                />
                <Input
                  label="NPS (80CCD 1B)"
                  prefix="₹"
                  type="number"
                  value={oldNps || ''}
                  onChange={(e) => setOldNps(Number(e.target.value || 0))}
                  placeholder="Max 50,000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Home Loan Interest (24b)"
                  prefix="₹"
                  type="number"
                  value={oldHomeLoanInterest || ''}
                  onChange={(e) => setOldHomeLoanInterest(Number(e.target.value || 0))}
                  placeholder="Max 2,00,000"
                />
                <Input
                  label="Education Loan Interest (80E)"
                  prefix="₹"
                  type="number"
                  value={oldEducationLoanInterest || ''}
                  onChange={(e) => setOldEducationLoanInterest(Number(e.target.value || 0))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={`Savings Interest (${oldRegimeAgeGroup === 'below60' ? '80TTA' : '80TTB'})`}
                  prefix="₹"
                  type="number"
                  value={oldSavingsInterest || ''}
                  onChange={(e) => setOldSavingsInterest(Number(e.target.value || 0))}
                  placeholder={`Max ${oldSavingsMax.toLocaleString('en-IN')}`}
                />
                <Input
                  label="HRA Exemption"
                  prefix="₹"
                  type="number"
                  value={oldHraExemption || ''}
                  onChange={(e) => setOldHraExemption(Number(e.target.value || 0))}
                  placeholder="If applicable"
                />
              </div>

              <p className="text-xs text-secondary">
                Total extra old-regime deductions considered: {formatIndianCurrency(additionalOldRegimeDeductions)}
              </p>
            </Card>
          )}
        </div>
      </Card>

      {ctc === 0 ? (
        <div className="text-center pt-6 pb-10 px-6">
          <h3 className="text-2xl font-bold mb-3">Calculate Your Take-Home Salary</h3>
          <p className="text-secondary text-sm mb-8 max-w-sm mx-auto">
            Enter your Annual CTC below to see your detailed salary breakdown with tax calculations
          </p>
        </div>
      ) : (
        <>
          {results && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-bold px-1">Salary Breakdown</h3>
                <Card className="space-y-3">
                  <BreakdownRow label="Basic Salary" value={results.annualBasic} showAnnual={showAnnual} />
                  <BreakdownRow label="HRA" value={results.annualHRA} showAnnual={showAnnual} />
                  <BreakdownRow
                    label="Special Allowance"
                    value={results.annualSpecial}
                    showAnnual={showAnnual}
                    info="Whatever's left after allocating Basic, HRA, and Variable Pay from Gross. Most companies park unallocated amounts here."
                  />
                  {variablePay > 0 && (
                    <BreakdownRow
                      label="Variable Pay"
                      value={variablePay}
                      showAnnual={showAnnual}
                      note={!showAnnual ? `Paid annually. Net annual payout estimate: ${formatIndianCurrency(results.annualVariableNet)}` : undefined}
                    />
                  )}
                  <div className="h-px bg-border-default" />
                  <BreakdownRow label="Gross Salary" value={results.annualGross} showAnnual={showAnnual} bold />
                </Card>

                <h3 className="text-lg font-bold px-1 pt-2">Deductions</h3>
                <Card className="space-y-3">
                  <BreakdownRow label="Employee PF" value={results.annualEmployeePF} showAnnual={showAnnual} />
                  <BreakdownRow label="Professional Tax" value={results.annualPT} showAnnual={showAnnual} />
                  {results.annualEmployeeESI > 0 && (
                    <BreakdownRow
                      label="Employee State Insurance (ESI)"
                      value={results.annualEmployeeESI}
                      showAnnual={showAnnual}
                      info="Applicable because your gross is below ₹21,000/month. Employee contributes 0.75%."
                    />
                  )}
                  <BreakdownRow label={`Income Tax (${taxRegime === 'new' ? 'New' : 'Old'} Regime)`} value={results.annualTax} showAnnual={showAnnual} danger />
                  <div className="h-px bg-border-default" />
                  <BreakdownRow label="Total Deductions" value={results.annualDeductions} showAnnual={showAnnual} bold />
                </Card>
              </div>

              <Card>
                <h3 className="text-sm font-bold mb-4">CTC Distribution</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <Label
                          value={formatShorthand(ctc)}
                          position="center"
                          style={{ fontSize: '13px', fontWeight: 700, fill: '#000' }}
                        />
                      </Pie>
                      <Tooltip formatter={(value: number) => formatIndianCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
                  {chartData.map((entry, index) => (
                    <div key={index} className="flex items-start text-xs">
                      <div className="w-3 h-3 rounded-full mr-2 mt-0.5 flex-shrink-0" style={{ backgroundColor: COLORS[index] }} />
                      <div>
                        <span className="text-secondary block">{entry.name}</span>
                        <span className="font-semibold block">{formatIndianCurrency(entry.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" /> {copied ? 'Copied!' : 'Share'}
                </Button>
                <Button variant="secondary" onClick={handlePDF}>
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function BreakdownRow({
  label,
  value,
  showAnnual,
  bold = false,
  danger = false,
  info,
  note,
}: {
  label: string
  value: number
  showAnnual: boolean
  bold?: boolean
  danger?: boolean
  info?: string
  note?: string
}) {
  const [showInfo, setShowInfo] = useState(false)
  const displayVal = showAnnual ? value : value / 12
  return (
    <div className="py-0.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm ${bold ? 'font-bold text-primary' : 'text-secondary font-medium'}`}>
            {label}
          </span>
          {info && (
            <button
              onClick={() => setShowInfo((v) => !v)}
              className="text-secondary opacity-70 hover:opacity-100 transition-opacity"
            >
              <Info className="w-5 h-5" />
            </button>
          )}
        </div>
        <RowAmount amount={displayVal} bold={bold} danger={danger} />
      </div>
      {note && <p className="text-xs text-secondary mt-0.5">{note}</p>}
      {info && showInfo && <p className="text-xs text-secondary mt-1.5 leading-relaxed">{info}</p>}
    </div>
  )
}

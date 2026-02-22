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
import { formatIndianCurrency, formatShorthand, formatNumber } from '../../utils/formatting'
import { calculateTax, calcPF } from '../../utils/taxLogic'

const COLORS = ['#000000', '#6B6B6B', '#999999', '#E5E5E5']

export function SalaryCalculator({ savedCtc, onCtcChange }: { savedCtc?: number | null; onCtcChange?: (ctc: number) => void }) {
  const initialCtc = savedCtc && savedCtc > 0 ? savedCtc : 0
  const [ctcInput, setCtcInput] = useState<string>(initialCtc > 0 ? formatNumber(initialCtc) : '')
  const [ctc, setCtc] = useState<number>(initialCtc)
  const [basicPercent, setBasicPercent] = useState<number>(50)
  const [variablePay, setVariablePay] = useState<number>(0)
  const [isMetro, setIsMetro] = useState<boolean>(true)
  const [selectedState, setSelectedState] = useState<string>('Maharashtra')
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const [showAnnual, setShowAnnual] = useState<boolean>(false)
  const [pfMode, setPfMode] = useState<'capped' | 'full'>('capped')
  const [results, setResults] = useState<any>(null)
  const [copied, setCopied] = useState<boolean>(false)

  // Debounce ctcInput → ctc (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const val = Number(ctcInput.replace(/,/g, ''))
      if (val > 0) setCtc(val)
      else setCtc(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [ctcInput])

  // Sync savedCtc from onboarding on mount
  useEffect(() => {
    if (savedCtc && savedCtc > 0 && ctc === 0) {
      setCtc(savedCtc)
      setCtcInput(formatNumber(savedCtc))
    }
  }, [savedCtc])

  // Notify parent when CTC changes
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
    calculateSalary()
  }, [ctc, basicPercent, variablePay, isMetro, selectedState, pfMode])

  const calculateSalary = () => {
    const annualBasic = (ctc * basicPercent) / 100
    const annualHRA = annualBasic * (isMetro ? 0.5 : 0.4)

    const annualEmployerPF = pfMode === 'capped' ? calcPF(annualBasic) : annualBasic * 0.12
    const annualGross = ctc - annualEmployerPF
    const annualSpecial = Math.max(0, annualGross - annualBasic - annualHRA - variablePay)
    const annualEmployeePF = pfMode === 'capped' ? calcPF(annualBasic) : annualBasic * 0.12

    const stateData = STATES.find((s) => s.name === selectedState) || STATES[0]
    const annualPT = stateData.pt

    const monthlyGross = annualGross / 12
    const annualEmployeeESI = monthlyGross <= 21000 ? annualGross * 0.0075 : 0
    const annualEmployerESI = monthlyGross <= 21000 ? annualGross * 0.0325 : 0

    const { totalTax: annualTax } = calculateTax(annualGross, 'new')

    const annualDeductions = annualEmployeePF + annualPT + annualEmployeeESI + annualTax
    const annualInHand = annualGross - annualDeductions
    const monthlyInHand = annualInHand / 12

    setResults({
      monthlyInHand,
      annualInHand,
      annualBasic,
      annualHRA,
      annualSpecial,
      annualGross,
      annualEmployeePF,
      annualEmployerPF,
      annualPT,
      annualTax,
      annualDeductions,
      annualEmployeeESI,
      annualEmployerESI,
    })
  }

  const handleShare = async () => {
    const text = `My salary breakdown (CTC: ${formatIndianCurrency(ctc)})\nMonthly In-Hand: ${formatIndianCurrency(results?.monthlyInHand ?? 0)}\nCalculated via SalaryFit`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Salary Breakdown', text })
      } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
    doc.text(`Income Tax (New Regime): ${formatIndianCurrency(results.annualTax)}`, 20, 180)
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
      {/* Inputs */}
      <Card>
        <div className="space-y-4">
          <Input
            label="Annual CTC"
            prefix="₹"
            type="text"
            inputMode="numeric"
            value={ctcInput}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9]/g, '')
              const noLeadingZeros = cleaned.replace(/^0+/, '') || (cleaned.length > 0 ? '0' : '')
              setCtcInput(noLeadingZeros)
            }}
            onFocus={(e) => setCtcInput(e.target.value.replace(/,/g, ''))}
            onBlur={(e) => {
              const n = Number(e.target.value.replace(/,/g, ''))
              setCtcInput(n > 0 ? formatNumber(n) : '')
            }}
            placeholder="e.g. 12,00,000"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Basic Salary (%)"
                suffix="%"
                type="number"
                value={basicPercent}
                onChange={(e) => setBasicPercent(Number(e.target.value))}
                placeholder="40–60%"
              />
              {basicWarning && (
                <p className="text-xs text-amber-600 mt-1">Typical range is 30–70%</p>
              )}
            </div>
            <Input
              label="Variable Pay"
              prefix="₹"
              type="number"
              value={variablePay}
              onChange={(e) => setVariablePay(Number(e.target.value))}
            />
          </div>
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wide text-secondary pt-1"
          >
            <span>More Options</span>
            <span className="text-base leading-none">{showAdvanced ? '−' : '+'}</span>
          </button>
          {!showAdvanced && (
            <p className="text-xs text-secondary -mt-1">
              {isMetro ? 'Metro' : 'Non-Metro'} · {selectedState} · PF {pfMode === 'capped' ? '₹1,800/mo' : '12% of basic'}
            </p>
          )}
          {showAdvanced && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="City Type"
                  value={isMetro ? 'metro' : 'non-metro'}
                  onChange={(e) => setIsMetro(e.target.value === 'metro')}
                  options={[
                    { label: 'Metro', value: 'metro' },
                    { label: 'Non-Metro', value: 'non-metro' },
                  ]}
                />
                <Select
                  label="State"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  options={STATES.map((s) => ({ label: s.name, value: s.name }))}
                />
              </div>
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
            </>
          )}
        </div>
      </Card>

      {ctc === 0 ? (
        <div className="text-center py-16 px-6">
          <h3 className="text-2xl font-bold mb-3">Calculate Your Take-Home Salary</h3>
          <p className="text-secondary text-sm mb-8 max-w-sm mx-auto">
            Enter your Annual CTC below to see your detailed salary breakdown with tax calculations
          </p>
        </div>
      ) : (
        <>
          {/* Hero Section */}
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
                  New tax regime · compare in Tax tab
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

          {results && (
        <>
          {/* Salary Breakdown */}
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
                  note={!showAnnual ? `Annual total: ${formatIndianCurrency(variablePay)} · paid at year-end` : undefined}
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
              <BreakdownRow label="Income Tax (New Regime)" value={results.annualTax} showAnnual={showAnnual} danger />
              <div className="h-px bg-border-default" />
              <BreakdownRow label="Total Deductions" value={results.annualDeductions} showAnnual={showAnnual} bold />
            </Card>
          </div>

          {/* Chart */}
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

          {/* Actions */}
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
      {info && showInfo && (
        <p className="text-xs text-secondary mt-1.5 leading-relaxed">{info}</p>
      )}
    </div>
  )
}

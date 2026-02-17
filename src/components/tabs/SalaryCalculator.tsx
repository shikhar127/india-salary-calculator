import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Share2, Download } from 'lucide-react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount, RowAmount } from '../ui/DisplayAmount'
import { STATES } from '../../utils/constants'
import { formatIndianCurrency } from '../../utils/formatting'
import { calculateTax } from '../../utils/taxLogic'

const COLORS = ['#000000', '#6B6B6B', '#999999', '#E5E5E5']

export function SalaryCalculator() {
  const [ctc, setCtc] = useState<number>(1200000)
  const [basicPercent, setBasicPercent] = useState<number>(50)
  const [variablePay, setVariablePay] = useState<number>(0)
  const [isMetro, setIsMetro] = useState<boolean>(true)
  const [selectedState, setSelectedState] = useState<string>('Maharashtra')
  const [showAnnual, setShowAnnual] = useState<boolean>(false)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    calculateSalary()
  }, [ctc, basicPercent, variablePay, isMetro, selectedState])

  const calculateSalary = () => {
    const annualBasic = (ctc * basicPercent) / 100
    const annualHRA = annualBasic * (isMetro ? 0.5 : 0.4)
    const annualEmployerPF = annualBasic * 0.12
    const annualGratuity = annualBasic * 0.0481
    const annualGross = ctc - annualEmployerPF - annualGratuity
    const annualSpecial = Math.max(0, annualGross - annualBasic - annualHRA - variablePay)
    const annualEmployeePF = annualBasic * 0.12
    const stateData = STATES.find((s) => s.name === selectedState) || STATES[0]
    const annualPT = stateData.pt
    const monthlyGross = annualGross / 12
    const annualESI = monthlyGross <= 21000 ? annualGross * 0.0075 : 0
    const { totalTax: annualTax } = calculateTax(annualGross - annualPT, 'new')
    const annualDeductions = annualEmployeePF + annualPT + annualESI + annualTax
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
      annualGratuity,
      annualPT,
      annualTax,
      annualDeductions,
    })
  }

  const handleShare = async () => {
    const text = `My salary breakdown (CTC: ${formatIndianCurrency(ctc)})\nMonthly In-Hand: ${formatIndianCurrency(results.monthlyInHand)}\nCalculated via SalaryFit`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Salary Breakdown', text })
      } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  const handlePDF = async () => {
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

  if (!results) return null

  const chartData = [
    { name: 'In-Hand', value: results.annualInHand },
    { name: 'Tax', value: results.annualTax },
    { name: 'PF & Other', value: results.annualEmployeePF + results.annualPT },
    { name: 'Employer Contrib', value: results.annualEmployerPF + results.annualGratuity },
  ]

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Section */}
      <div className="text-center space-y-1 pt-6">
        <p className="text-secondary text-xs font-semibold uppercase tracking-[0.15em]">
          {showAnnual ? 'Annual Take Home' : 'Monthly In-Hand'}
        </p>
        <div className="py-2">
          <DisplayAmount
            amount={showAnnual ? results.annualInHand : results.monthlyInHand}
            size="hero"
            suffix={showAnnual ? '/yr' : '/mo'}
          />
        </div>
        <div className="flex justify-center pt-3">
          <Toggle
            value={showAnnual}
            onChange={setShowAnnual}
            leftLabel="Monthly"
            rightLabel="Annual"
          />
        </div>
      </div>

      {/* Inputs */}
      <Card>
        <div className="space-y-4">
          <Input
            label="Annual CTC"
            prefix="₹"
            type="number"
            value={ctc}
            onChange={(e) => setCtc(Number(e.target.value))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Basic Salary (%)"
              suffix="%"
              type="number"
              value={basicPercent}
              onChange={(e) => setBasicPercent(Number(e.target.value))}
            />
            <Input
              label="Variable Pay"
              prefix="₹"
              type="number"
              value={variablePay}
              onChange={(e) => setVariablePay(Number(e.target.value))}
            />
          </div>
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
        </div>
      </Card>

      {/* Salary Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold px-1">Salary Breakdown</h3>
        <Card className="space-y-3">
          <BreakdownRow label="Basic Salary" value={results.annualBasic} showAnnual={showAnnual} />
          <BreakdownRow label="HRA" value={results.annualHRA} showAnnual={showAnnual} />
          <BreakdownRow label="Special Allowance" value={results.annualSpecial} showAnnual={showAnnual} />
          {variablePay > 0 && (
            <BreakdownRow label="Variable Pay" value={variablePay} showAnnual={showAnnual} />
          )}
          <div className="h-px bg-border-default" />
          <BreakdownRow label="Gross Salary" value={results.annualGross} showAnnual={showAnnual} bold />
        </Card>

        <h3 className="text-lg font-bold px-1 pt-2">Deductions</h3>
        <Card className="space-y-3">
          <BreakdownRow label="Employee PF" value={results.annualEmployeePF} showAnnual={showAnnual} />
          <BreakdownRow label="Professional Tax" value={results.annualPT} showAnnual={showAnnual} />
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
              </Pie>
              <Tooltip formatter={(value: number) => formatIndianCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center text-xs">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }} />
              <span className="text-secondary">{entry.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="secondary" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
        <Button variant="secondary" onClick={handlePDF}>
          <Download className="w-4 h-4 mr-2" /> PDF
        </Button>
      </div>
    </div>
  )
}

function BreakdownRow({
  label,
  value,
  showAnnual,
  bold = false,
  danger = false,
}: {
  label: string
  value: number
  showAnnual: boolean
  bold?: boolean
  danger?: boolean
}) {
  const displayVal = showAnnual ? value : value / 12
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className={`text-sm ${bold ? 'font-bold text-primary' : 'text-secondary font-medium'}`}>
        {label}
      </span>
      <RowAmount amount={displayVal} bold={bold} danger={danger} />
    </div>
  )
}

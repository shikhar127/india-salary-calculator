import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Toggle } from '../ui/Toggle'
import { DisplayAmount } from '../ui/DisplayAmount'
import { formatIndianCurrency, formatNumber } from '../../utils/formatting'
import { STATES } from '../../utils/constants'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { calculateSalaryBreakdown, TaxRegime } from '../../utils/salaryLogic'
import { ProfessionalTaxMode } from '../../utils/professionalTax'
import { formatLakhValue, lakhInputToRupees, sanitizeLakhInput } from '../../utils/ctcInput'

type HikeMode = '5' | '10' | '20' | '30' | 'custom'

export function HikeCompare({ savedCtc, sharedCtc }: { savedCtc?: number | null; sharedCtc?: number }) {
  const initialCtc = sharedCtc || savedCtc || 0
  const [currentCtc, setCurrentCtc] = useState<number>(initialCtc)
  const [currentCtcLakhInput, setCurrentCtcLakhInput] = useState<string>(initialCtc > 0 ? formatLakhValue(initialCtc) : '')
  const [hikePercent, setHikePercent] = useState<number>(30)
  const [hikeMode, setHikeMode] = useState<HikeMode>('30')
  const [customHikeInput, setCustomHikeInput] = useState<string>('30')
  const [basicPercent, setBasicPercent] = useState<number>(50)
  const [selectedState, setSelectedState] = useState<string>('Maharashtra')
  const [pfMode, setPfMode] = useState<'capped' | 'full'>('capped')
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new')
  const [professionalTaxMode, setProfessionalTaxMode] = useState<ProfessionalTaxMode>('state')
  const [manualProfessionalTaxAnnualInput, setManualProfessionalTaxAnnualInput] = useState<string>('')
  const [manualProfessionalTaxAnnual, setManualProfessionalTaxAnnual] = useState<number>(0)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)

  useEffect(() => {
    if (sharedCtc && sharedCtc > 0) {
      setCurrentCtc(sharedCtc)
      setCurrentCtcLakhInput(formatLakhValue(sharedCtc))
    }
  }, [sharedCtc])

  const calcInHand = (ctc: number): number => {
    const result = calculateSalaryBreakdown({
      ctc,
      basicPercent,
      variablePay: 0,
      isMetro: true,
      stateName: selectedState,
      pfMode,
      taxRegime,
      professionalTaxMode,
      manualProfessionalTaxAnnual,
    })
    return result.monthlyInHand
  }

  const newCtc = currentCtc * (1 + hikePercent / 100)
  const currentInHand = calcInHand(currentCtc)
  const newInHand = calcInHand(newCtc)
  const diff = newInHand - currentInHand
  const presetHikes = [5, 10, 20, 30]

  const selectPresetHike = (value: number) => {
    setHikeMode(String(value) as HikeMode)
    setHikePercent(value)
  }

  const selectCustomHike = () => {
    setHikeMode('custom')
    const parsed = Number(customHikeInput)
    if (Number.isFinite(parsed) && parsed >= 0) {
      setHikePercent(parsed)
    }
  }

  const onCustomHikeChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '')
    const merged = cleaned.split('.').slice(0, 2).join('.')
    const limited = merged.replace(/^(\d*\.?\d{0,2}).*$/, '$1')
    setCustomHikeInput(limited)
    const parsed = Number(limited)
    if (limited === '') {
      setHikePercent(0)
      return
    }
    if (Number.isFinite(parsed) && parsed >= 0) {
      setHikePercent(parsed)
    }
  }

  return (
    <div className="space-y-6 pb-24 pt-4">
      <h2 className="text-2xl font-bold">Hike Calculator</h2>

      {currentCtc > 0 && (
        <div className="bg-black text-white rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 text-accent-green mb-5">
            <TrendingUp className="h-5 w-5" />
            <span className="font-bold text-xs uppercase tracking-[0.12em]">Projected Growth</span>
          </div>

          <div className="mb-5 pb-5 border-b border-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Annual Hike</p>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-bold text-accent-green">+{formatIndianCurrency(newCtc - currentCtc)}</p>
              <p className="text-lg font-semibold text-gray-400">({hikePercent}%)</p>
            </div>
          </div>

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
      )}

      <Card className="border-2 border-border-default">
        <div className="space-y-5">
          {currentCtc > 0 && (
            <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary mb-1.5">New Annual CTC</p>
              <DisplayAmount amount={newCtc} size="md" />
            </div>
          )}

          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">Inputs</p>

          <Input
            label="Current Annual CTC"
            type="text"
            inputMode="decimal"
            value={currentCtcLakhInput}
            onChange={(e) => {
              const sanitized = sanitizeLakhInput(e.target.value)
              setCurrentCtcLakhInput(sanitized)
              setCurrentCtc(lakhInputToRupees(sanitized))
            }}
            onBlur={(e) => setCurrentCtcLakhInput(formatLakhValue(lakhInputToRupees(e.target.value)))}
            suffix="LAKH"
            suffixClassName="text-primary font-black tracking-wide text-lg"
            placeholder="e.g. 18"
            inputClassName="text-xl font-bold py-4"
          />

          <div>
            <p className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">Expected Hike %</p>
            <div className="grid grid-cols-5 gap-2">
              {presetHikes.map((value) => {
                const key = String(value) as HikeMode
                const active = hikeMode === key
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectPresetHike(value)}
                    className={`h-10 rounded-xl text-sm font-semibold border transition-colors ${
                      active
                        ? 'bg-black text-white border-black'
                        : 'bg-bg-secondary text-primary border-border-default'
                    }`}
                  >
                    {value}%
                  </button>
                )
              })}
              <button
                type="button"
                onClick={selectCustomHike}
                className={`h-10 rounded-xl text-sm font-semibold border transition-colors ${
                  hikeMode === 'custom'
                    ? 'bg-black text-white border-black'
                    : 'bg-bg-secondary text-primary border-border-default'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {hikeMode === 'custom' && (
            <Input
              label="Custom Hike %"
              suffix="%"
              type="text"
              inputMode="decimal"
              value={customHikeInput}
              onChange={(e) => onCustomHikeChange(e.target.value)}
              suffixClassName="text-primary font-black text-lg"
              inputClassName="text-xl font-bold py-4"
              placeholder="e.g. 12.5"
            />
          )}

          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wide text-secondary pt-1"
          >
            <span>Advanced Options</span>
            <span className="text-base leading-none">{showAdvanced ? '−' : '+'}</span>
          </button>
          {!showAdvanced && (
            <p className="text-xs text-secondary -mt-1">
              {taxRegime === 'new' ? 'New' : 'Old'} regime · {selectedState} · PF: {pfMode === 'capped' ? '₹1,800/mo' : '12% of basic'}
              {pfMode === 'full' && ` · Basic: ${basicPercent}%`}
            </p>
          )}

          {showAdvanced && (
            <>
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
                  label="State"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  options={STATES.map((s) => ({ label: s.name, value: s.name }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Professional Tax"
                  value={professionalTaxMode}
                  onChange={(e) => setProfessionalTaxMode(e.target.value as ProfessionalTaxMode)}
                  options={[
                    { label: 'State estimate', value: 'state' },
                    { label: 'Manual annual', value: 'manual' },
                  ]}
                />
                {pfMode === 'full' ? (
                  <Input
                    label="Basic Salary %"
                    suffix="%"
                    type="number"
                    value={basicPercent}
                    onChange={(e) => setBasicPercent(Number(e.target.value))}
                    placeholder="40–60%"
                  />
                ) : (
                  <div />
                )}
              </div>

              {professionalTaxMode === 'manual' && (
                <Input
                  label="Professional Tax (Annual)"
                  prefix="₹"
                  type="text"
                  inputMode="numeric"
                  value={manualProfessionalTaxAnnualInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '')
                    setManualProfessionalTaxAnnualInput(cleaned)
                    setManualProfessionalTaxAnnual(Number(cleaned))
                  }}
                  onFocus={(e) => setManualProfessionalTaxAnnualInput(e.target.value.replace(/,/g, ''))}
                  onBlur={(e) => {
                    const n = Number(e.target.value.replace(/,/g, ''))
                    setManualProfessionalTaxAnnualInput(n > 0 ? formatNumber(n) : '')
                  }}
                />
              )}

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

      {currentCtc === 0 ? (
        <div className="text-center py-16 px-6">
          <h3 className="text-2xl font-bold mb-3">Project Your Salary Growth</h3>
          <p className="text-secondary text-sm mb-8 max-w-sm mx-auto">
            Enter your current CTC and expected hike percentage to see your new salary
          </p>
        </div>
      ) : (
        <>
          <div className="bg-bg-secondary p-4 rounded-xl">
            <p className="text-xs text-secondary text-center">
              *Estimates based on {taxRegime === 'new' ? 'New' : 'Old'} Tax Regime FY 2025-26. Actual in-hand may vary.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

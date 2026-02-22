import React, { useState } from 'react'
import { Input } from './ui/Input'
import { SuggestionChips } from './ui/SuggestionChips'
import { formatIndianCurrency } from '../utils/formatting'
import { formatLakhValue, lakhInputToRupees, sanitizeLakhInput } from '../utils/ctcInput'

interface OnboardingModalProps {
  onComplete: (ctc: number | null) => void
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [ctcLakhInput, setCtcLakhInput] = useState<string>('')
  const [ctc, setCtc] = useState<number>(0)
  const ctcIncrementOptions = [
    { label: '+25K', value: '25000' },
    { label: '+1L', value: '100000' },
    { label: '+5L', value: '500000' },
    { label: '+20L', value: '2000000' },
  ]

  const handleContinue = () => {
    if (ctc > 0) {
      onComplete(ctc)
    } else {
      onComplete(null)
    }
  }

  const handleSkip = () => {
    onComplete(null)
  }

  const applyCtcIncrement = (incrementValue: string) => {
    const incrementRupees = Number(incrementValue)
    const baseRupees = lakhInputToRupees(ctcLakhInput)
    const nextRupees = Math.max(0, baseRupees + incrementRupees)
    setCtcLakhInput(formatLakhValue(nextRupees))
    setCtc(nextRupees)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Welcome to SalaryFit</h2>
        <p className="text-secondary text-sm mb-6">
          Let's personalize your experience. What is your Annual CTC? (Optional)
        </p>

        <div className="mb-6">
          <Input
            label="Annual CTC"
            type="text"
            inputMode="decimal"
            value={ctcLakhInput}
            onChange={(e) => {
              const sanitized = sanitizeLakhInput(e.target.value)
              setCtcLakhInput(sanitized)
              setCtc(lakhInputToRupees(sanitized))
            }}
            onBlur={(e) => setCtcLakhInput(formatLakhValue(lakhInputToRupees(e.target.value)))}
            placeholder="e.g. 12.5"
            suffix="LAKH"
            suffixClassName="text-primary font-extrabold tracking-wide text-base"
          />
          <p className="text-xs text-secondary mt-1">
            Enter CTC in lakhs (e.g. 12.5 = {formatIndianCurrency(1250000)})
          </p>
          <SuggestionChips
            label="Quick add"
            options={ctcIncrementOptions}
            onPick={applyCtcIncrement}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-3 rounded-full font-semibold text-sm text-secondary hover:bg-bg-secondary transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 px-6 py-3 rounded-full font-semibold text-sm bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { formatNumber } from '../utils/formatting'

interface OnboardingModalProps {
  onComplete: (ctc: number | null) => void
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [ctcInput, setCtcInput] = useState<string>('')
  const [ctc, setCtc] = useState<number>(0)

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Welcome to SalaryFit</h2>
        <p className="text-secondary text-sm mb-6">
          Let's personalize your experience. What is your Annual CTC? (Optional)
        </p>

        <div className="mb-6">
          <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">
            Annual CTC
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-secondary text-sm">₹</span>
            </div>
            <input
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
                setCtcInput(n > 0 ? formatNumber(n) : '')
              }}
              placeholder="e.g. 12,00,000"
              className="block w-full rounded-xl border-transparent bg-bg-secondary text-primary font-medium shadow-sm focus:border-primary focus:ring-1 focus:ring-primary pl-7 pr-4 py-3 text-sm outline-none"
            />
          </div>
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

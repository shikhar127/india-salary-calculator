import React from 'react'

interface SuggestionOption {
  label: string
  value: string
}

interface SuggestionChipsProps {
  label?: string
  options: SuggestionOption[]
  activeValue?: string
  onPick: (value: string) => void
}

export function SuggestionChips({
  label = 'Quick picks',
  options,
  activeValue,
  onPick,
}: SuggestionChipsProps) {
  return (
    <div className="mt-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = activeValue === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onPick(option.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-black text-white'
                  : 'bg-bg-secondary border border-border-default text-primary hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

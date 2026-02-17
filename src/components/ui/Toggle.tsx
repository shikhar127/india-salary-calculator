import React from 'react'

interface ToggleProps {
  value: boolean
  onChange: (value: boolean) => void
  leftLabel: string
  rightLabel: string
}

export function Toggle({ value, onChange, leftLabel, rightLabel }: ToggleProps) {
  return (
    <div className="bg-bg-secondary p-1 rounded-full flex items-center relative w-full">
      <button
        onClick={() => onChange(false)}
        className={`relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors text-center ${!value ? 'text-primary' : 'text-secondary'}`}
      >
        {leftLabel}
      </button>
      <button
        onClick={() => onChange(true)}
        className={`relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors text-center ${value ? 'text-primary' : 'text-secondary'}`}
      >
        {rightLabel}
      </button>
      <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${value ? 'translate-x-[calc(100%+4px)]' : 'translate-x-1'}`} />
    </div>
  )
}

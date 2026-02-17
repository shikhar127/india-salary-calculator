import React from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { label: string; value: string | number }[]
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className="appearance-none block w-full rounded-xl border-transparent bg-bg-secondary text-primary font-medium py-3 pl-4 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-secondary">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

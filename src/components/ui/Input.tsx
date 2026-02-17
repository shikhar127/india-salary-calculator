import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: string
  prefix?: string
}

export function Input({ label, error, suffix, prefix, className = '', id, ...props }: InputProps) {
  const inputId = id || Math.random().toString(36).substr(2, 9)
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-secondary text-sm">{prefix}</span>
          </div>
        )}
        <input
          id={inputId}
          className={`
            block w-full rounded-xl border-transparent bg-bg-secondary
            text-primary font-medium shadow-sm focus:border-primary focus:ring-1 focus:ring-primary
            disabled:bg-gray-100 disabled:text-gray-400
            ${prefix ? 'pl-7' : 'pl-4'}
            ${suffix ? 'pr-12' : 'pr-4'}
            py-3 text-sm outline-none
            ${error ? 'border border-accent-danger' : ''}
          `}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-secondary text-sm">{suffix}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-accent-danger">{error}</p>}
    </div>
  )
}

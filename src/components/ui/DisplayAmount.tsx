import React from 'react'
import { formatNumber, numberToWords } from '../../utils/formatting'

interface DisplayAmountProps {
  amount: number
  size?: 'hero' | 'lg' | 'md' | 'sm'
  suffix?: string
  showSign?: boolean
  className?: string
  color?: string
  showWords?: boolean
}

export function DisplayAmount({ amount, size = 'hero', suffix, showSign = false, className = '', color, showWords = false }: DisplayAmountProps) {
  const formatted = formatNumber(Math.abs(amount))
  const isNegative = amount < 0
  const sign = showSign ? (isNegative ? '−' : '+') : isNegative ? '−' : ''

  const sizeClasses = {
    hero: 'text-[3.25rem] display-hero',
    lg: 'text-[2rem] display-lg',
    md: 'text-[1.375rem] display-md',
    sm: 'text-[0.9375rem] display-sm',
  }

  // Always a span so it doesn't break flex/inline contexts
  return (
    <span className={`inline-flex flex-col items-center ${color || 'text-primary'} ${className}`}>
      <span className={`inline-flex items-baseline ${sizeClasses[size]}`}>
        {sign && (
          <span className="text-[0.6em] font-extrabold opacity-85 mr-[0.04em]" style={{ verticalAlign: '0.1em' }}>
            {sign}
          </span>
        )}
        <span className="text-[0.6em] font-extrabold opacity-85 mr-[0.04em]" style={{ verticalAlign: '0.1em' }}>
          ₹
        </span>
        <span>{formatted}</span>
        {suffix && (
          <span className="text-[0.3em] font-semibold tracking-wide opacity-50 ml-[0.15em]" style={{ verticalAlign: '0.15em' }}>
            {suffix}
          </span>
        )}
      </span>
      {showWords && (
        <span className="text-[0.62rem] font-medium tracking-widest opacity-40 mt-0.5 uppercase">
          {numberToWords(amount)}
        </span>
      )}
    </span>
  )
}

export function RowAmount({ amount, bold = false, danger = false, className = '' }: {
  amount: number
  bold?: boolean
  danger?: boolean
  className?: string
}) {
  const formatted = formatNumber(Math.abs(amount))
  return (
    <span className={`display-sm text-sm ${bold ? 'font-bold text-primary' : 'font-semibold'} ${danger ? 'text-accent-danger' : bold ? '' : 'text-primary'} ${className}`}>
      ₹{formatted}
    </span>
  )
}

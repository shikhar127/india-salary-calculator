import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'flat'
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-white border border-border-default',
    elevated: 'bg-white shadow-elevated border-transparent',
    flat: 'bg-bg-secondary border-transparent',
  }
  return (
    <div className={`rounded-2xl p-5 ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}

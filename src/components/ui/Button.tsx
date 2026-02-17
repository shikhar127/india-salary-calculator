import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({ children, variant = 'primary', size = 'md', fullWidth = false, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-full font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary text-white hover:bg-gray-800 active:scale-95',
    secondary: 'bg-white text-primary border border-border-default hover:bg-gray-50 active:scale-95',
    ghost: 'bg-transparent text-primary hover:bg-gray-100',
    link: 'bg-transparent text-accent-green hover:underline p-0 h-auto',
  }
  const sizes = { sm: 'h-8 px-4 text-xs', md: 'h-12 px-6 text-sm', lg: 'h-14 px-8 text-base' }
  return (
    <button className={`${base} ${variants[variant]} ${variant !== 'link' ? sizes[size] : ''} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {children}
    </button>
  )
}

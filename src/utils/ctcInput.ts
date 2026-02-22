const RUPEES_PER_LAKH = 100000

export const formatLakhValue = (ctcRupees: number): string => {
  if (!ctcRupees || ctcRupees <= 0) return ''
  const inLakhs = ctcRupees / RUPEES_PER_LAKH
  return inLakhs % 1 === 0 ? String(inLakhs) : inLakhs.toFixed(2).replace(/\.?0+$/, '')
}

export const sanitizeLakhInput = (raw: string): string => {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  const merged = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : parts[0]
  const limited = merged.replace(/^(\d*\.?\d{0,2}).*$/, '$1')
  if (limited === '') return ''
  if (limited.startsWith('0.') || limited === '0' || limited === '.') return limited
  return limited.replace(/^0+/, '') || ''
}

export const lakhInputToRupees = (lakhInput: string): number => {
  const valueInLakhs = Number(lakhInput)
  if (!Number.isFinite(valueInLakhs) || valueInLakhs <= 0) return 0
  return Math.round(valueInLakhs * RUPEES_PER_LAKH)
}

export const formatIndianCurrency = (num: number): string => {
  if (num === undefined || num === null) return '₹0'
  const x = Math.round(num).toString()
  let lastThree = x.substring(x.length - 3)
  const otherNumbers = x.substring(0, x.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

export const formatShorthand = (num: number): string => {
  if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + 'Cr'
  if (num >= 100000) return '₹' + (num / 100000).toFixed(2) + 'L'
  return formatIndianCurrency(num)
}

export const parseIndianCurrency = (str: string): number => {
  if (!str) return 0
  return Number(str.replace(/[^0-9.]/g, ''))
}

export const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return '0'
  const x = Math.round(num).toString()
  let lastThree = x.substring(x.length - 3)
  const otherNumbers = x.substring(0, x.length - 3)
  if (otherNumbers !== '') lastThree = ',' + lastThree
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigitWords(n: number): string {
  if (n === 0) return ''
  if (n < 20) return ONES[n]
  return (TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')).trim()
}

function threeDigitWords(n: number): string {
  if (n === 0) return ''
  if (n < 100) return twoDigitWords(n)
  return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigitWords(n % 100) : '')
}

export function numberToWords(num: number): string {
  const n = Math.round(Math.abs(num))
  if (n === 0) return 'Zero'

  const crore = Math.floor(n / 10000000)
  const lakh = Math.floor((n % 10000000) / 100000)
  const thousand = Math.floor((n % 100000) / 1000)
  const remainder = n % 1000

  const parts: string[] = []
  if (crore) parts.push(threeDigitWords(crore) + ' Crore')
  if (lakh) parts.push(twoDigitWords(lakh) + ' Lakh')
  if (thousand) parts.push(twoDigitWords(thousand) + ' Thousand')
  if (remainder) parts.push(threeDigitWords(remainder))

  return (num < 0 ? 'Minus ' : '') + parts.join(' ')
}

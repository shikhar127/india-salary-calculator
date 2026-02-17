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

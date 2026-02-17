export const STATES = [
  { name: 'Maharashtra', pt: 2500 },
  { name: 'Tamil Nadu', pt: 2500 },
  { name: 'Madhya Pradesh', pt: 2500 },
  { name: 'Karnataka', pt: 2400 },
  { name: 'West Bengal', pt: 2400 },
  { name: 'Telangana', pt: 2400 },
  { name: 'Andhra Pradesh', pt: 2400 },
  { name: 'Gujarat', pt: 2400 },
  { name: 'Kerala', pt: 1200 },
  { name: 'Delhi', pt: 0 },
  { name: 'Uttar Pradesh', pt: 0 },
  { name: 'Punjab', pt: 0 },
  { name: 'Haryana', pt: 0 },
  { name: 'Rajasthan', pt: 0 },
  { name: 'Other', pt: 0 },
]

export const NEW_REGIME_SLABS = [
  { limit: 400000, rate: 0 },
  { limit: 800000, rate: 0.05 },
  { limit: 1200000, rate: 0.10 },
  { limit: 1600000, rate: 0.15 },
  { limit: 2000000, rate: 0.20 },
  { limit: 2400000, rate: 0.25 },
  { limit: Infinity, rate: 0.30 },
]

export const OLD_REGIME_SLABS = [
  { limit: 250000, rate: 0 },
  { limit: 500000, rate: 0.05 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 },
]

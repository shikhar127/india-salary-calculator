export const STATES = [
  { name: 'Andhra Pradesh', pt: 2400 },
  { name: 'Delhi', pt: 0 },
  { name: 'Gujarat', pt: 2400 },
  { name: 'Haryana', pt: 0 },
  { name: 'Karnataka', pt: 2500 },
  { name: 'Kerala', pt: 1200 },
  { name: 'Madhya Pradesh', pt: 2500 },
  { name: 'Maharashtra', pt: 2500 },
  { name: 'Punjab', pt: 0 },
  { name: 'Rajasthan', pt: 0 },
  { name: 'Tamil Nadu', pt: 2500 },
  { name: 'Telangana', pt: 2400 },
  { name: 'Uttar Pradesh', pt: 0 },
  { name: 'West Bengal', pt: 2400 },
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

// Senior citizen (60–79 yrs): basic exemption ₹3L
export const SENIOR_OLD_REGIME_SLABS = [
  { limit: 300000, rate: 0 },
  { limit: 500000, rate: 0.05 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 },
]

// Very senior citizen (80+ yrs): basic exemption ₹5L, no 5% slab
export const VERY_SENIOR_OLD_REGIME_SLABS = [
  { limit: 500000, rate: 0 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 },
]

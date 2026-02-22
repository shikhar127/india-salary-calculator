# SalaryFit — Calculation Issues

FY 2025-26. Reviewed across `taxLogic.ts`, `constants.ts`, and all 4 tab components.

---

## 🔴 Critical / Significantly Wrong

### 1. EPF Not Capped at Statutory Limit
**File**: `SalaryCalculator.tsx` (lines 32, 36)

```ts
const annualEmployerPF = annualBasic * 0.12
const annualEmployeePF = annualBasic * 0.12
```

EPF contributions are legally capped at 12% of ₹15,000/month (the EPF wage ceiling) = **₹1,800/month = ₹21,600/year**. For anyone with basic > ₹15k/month, this is wrong.

**Example**: CTC ₹12L, basic 50% = ₹50,000/month. Actual PF = ₹21,600/year. Code computes ₹72,000/year — **overstates by ₹50,400/year**, reducing shown take-home by ₹4,200/month.

*Note: Some companies voluntarily contribute on full basic, but statutory minimum is capped. This should at least be disclosed or made an option.*

---

### 2. Professional Tax Deducted from New Regime Taxable Income (Wrong)
**File**: `SalaryCalculator.tsx` (line 41)

```ts
const { totalTax: annualTax } = calculateTax(annualGross - annualPT, 'new')
```

In the **new tax regime**, Professional Tax is NOT deductible. Only Section 16(ii) standard deduction (₹75k) is allowed. PT deduction under Section 16(iii) is available only in the old regime.

**Fix**: Should be `calculateTax(annualGross, 'new')` — the standard deduction is already applied inside `calculateTax`.

**Impact**: For Maharashtra (PT = ₹2,500), the current code understates taxable income by ₹2,500, reducing computed tax slightly.

---

### 3. Marginal Relief (87A Rebate Cliff) Not Implemented
**File**: `taxLogic.ts` (lines 42–46)

```ts
if (regime === 'new' && taxableIncome <= 1200000) {
  rebate = Math.min(tax, 60000)
}
```

For new regime, someone with taxable income of ₹12L pays ₹0 tax. Someone with taxable income of ₹12.01L pays ~₹63,180 (full tax + cess). A person earning ₹1,000 more pays ₹63,000 more in tax — this is the cliff effect.

**Marginal relief rule**: If `tax > (taxableIncome - 1,200,000)`, then `tax = taxableIncome - 1,200,000`.

Applies to gross incomes roughly between ₹12.75L and ₹14.1L. The app shows wildly incorrect tax for this range.

---

### 4. HikeCompare Ignores PF and Employer Contributions
**File**: `HikeCompare.tsx` (lines 15–18)

```ts
const currentInHand = (currentCtc - currentTax - 2500) / 12
const newInHand = (newCtc - newTax - 2500) / 12
```

Only subtracts PT (hardcoded ₹2,500). Does not subtract:
- Employee PF (~6% of CTC for 50% basic structure)
- Employer PF + Gratuity (~6.8% of CTC) — needed to derive gross from CTC first

Also, `calculateTax(currentCtc, 'new')` passes full CTC as income — but tax should be on gross (CTC minus employer PF and gratuity), not CTC. This understates tax for high earners.

**Example**: ₹12L CTC, 30% hike. Actual monthly in-hand ≈ ₹66,000. App shows ≈ ₹90,000+ — overstated by ~35%.

---

### 5. Reverse Calculator Uses CTC as Taxable Income
**File**: `ReverseCalculator.tsx` (lines 21–24)

```ts
const tax = calculateTax(ctc, 'new').totalTax
const pf = ctc * 0.5 * 0.12
const net = ctc - tax - pt - pf
```

Passes full CTC to `calculateTax` instead of gross salary (CTC − employer PF − gratuity). Tax is computed on a higher base than actual. Additionally, PF is not capped (same issue as #1).

---

## 🟡 Moderate Issues

### 6. Kerala Professional Tax Wrong ✅ FIXED
**File**: `constants.ts` (line 10)

~~```ts
{ name: 'Kerala', pt: 2400 },
```~~

Kerala's maximum Professional Tax is **₹1,200/year** (₹100/month for salary > ₹12,000/month). ~~The app shows ₹2,400 — **double the correct value**.~~

**Fixed:** Now correctly shows ₹1,200.

---

### 7. ESI Missing from Pie Chart
**File**: `SalaryCalculator.tsx` (lines 98–103)

ESI is calculated and included in `annualDeductions` (reduces in-hand), but is not a separate slice in the chart. The 4 chart segments (In-Hand + Tax + PF & Other + Employer Contrib) sum to `CTC − ESI`, not `CTC`. Chart totals will be wrong for employees with monthly gross ≤ ₹21,000.

---

### 8. 80D Cap Is Too High
**File**: `TaxDeductions.tsx` (line 24)

```ts
const ded80D = Math.min(section80D, 100000)
```

80D limit is capped at ₹1L. Actual limits:
- Self + family (non-senior): **₹25,000**
- Self + family (self senior citizen): **₹50,000**
- Self + family + parents (both senior): **₹1,00,000** (max)

Using ₹1L as the blanket cap overstates the deduction for most users (who aren't senior citizens).

---

### 9. Variable Pay Shown as Monthly (Misleading)
**File**: `SalaryCalculator.tsx` (line 183) + `BreakdownRow`

```ts
const displayVal = showAnnual ? value : value / 12
```

When Monthly toggle is active, Variable Pay is divided by 12. But variable pay is typically paid as an annual bonus or quarterly payout — showing ₹1,00,000 bonus as ₹8,333/month implies it's a monthly component, which it is not.

---

### 10. Employer ESI Not Included in CTC Breakdown
**File**: `SalaryCalculator.tsx`

Employer pays ESI at **3.25% of gross** (when applicable). This forms part of the CTC for employees below the ₹21k/month gross threshold. Not calculated or shown anywhere.

---

## 🔵 Minor Issues

### 11. HikeCompare PT Hardcoded to ₹2,500
**File**: `HikeCompare.tsx` (line 16)

```ts
const currentInHand = (currentCtc - currentTax - 2500) / 12
```

PT is hardcoded as ₹2,500 regardless of state. Should either ask for state input or use ₹0 as a neutral default.

---

### 12. NPS Only Considers 80CCD(1B) — Misses 80CCD(1)
**File**: `TaxDeductions.tsx`

Only the extra ₹50k NPS deduction (80CCD 1B) is covered. Employer NPS contribution (80CCD(2): up to 10% of basic, uncapped in new regime) and employee's own 80CCD(1) contribution (part of ₹1.5L 80C limit in old regime) are not modelled.

---

### 13. Old Regime Misses Senior Citizen Slab
**File**: `constants.ts` (lines 29–34)

```ts
export const OLD_REGIME_SLABS = [
  { limit: 250000, rate: 0 },
  ...
```

The ₹2.5L basic exemption applies to individuals below 60. Senior citizens (60–80): ₹3L. Very senior citizens (80+): ₹5L. The app uses a single slab set for all ages.

---

## Summary Table

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 1 | 🔴 Critical | SalaryCalculator | EPF not capped at ₹21,600/year |
| 2 | 🔴 Critical | SalaryCalculator | PT deducted from new regime taxable income |
| 3 | 🔴 Critical | taxLogic | No marginal relief for 87A rebate cliff |
| 4 | 🔴 Critical | HikeCompare | No PF subtracted; CTC used as taxable income |
| 5 | 🔴 Critical | ReverseCalculator | CTC used as taxable income, PF uncapped |
| 6 | 🟡 Moderate | constants | Kerala PT = ₹2,400 (should be ₹1,200) |
| 7 | 🟡 Moderate | SalaryCalculator | ESI missing from pie chart |
| 8 | 🟡 Moderate | TaxDeductions | 80D blanket ₹1L cap too high |
| 9 | 🟡 Moderate | SalaryCalculator | Variable pay /12 is misleading as monthly |
| 10 | 🟡 Moderate | SalaryCalculator | Employer ESI not in CTC |
| 11 | 🔵 Minor | HikeCompare | PT hardcoded ₹2,500 |
| 12 | 🔵 Minor | TaxDeductions | 80CCD(1) and 80CCD(2) not modelled |
| 13 | 🔵 Minor | constants | No senior citizen slab variant |

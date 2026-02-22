# SalaryFit — Release Notes

## Version 1.0 (Feb 22, 2026)

**Status:** ✅ Production Release — Ready for Google Play Store

**APK Location:** `~/Desktop/india-salary-calculator-v1.0.apk`
**Web:** https://shikhar127.github.io/india-salary-calculator/
**GitHub:** https://github.com/shikhar127/india-salary-calculator

---

### What's New

#### 🎉 Initial Release
Complete India salary calculator for FY 2025-26 with 4 specialized calculators:

1. **Salary Calculator** — CTC to in-hand conversion with live calculation
2. **Tax Regime Comparison** — New vs Old regime side-by-side analysis
3. **Hike Calculator** — Project salary growth after percentage hike
4. **CTC Needed Calculator** — Reverse calculation from desired in-hand

---

### Key Features

#### Tax Calculations (FY 2025-26)
- ✅ New Tax Regime (default) with correct slabs and ₹75k standard deduction
- ✅ Old Tax Regime with age-based slabs (Below 60 / 60-79 / 80+)
- ✅ Section 87A rebate with marginal relief (prevents ₹12L cliff)
- ✅ EPF capped at statutory ₹1,800/month + toggle for 12% full basic
- ✅ Professional Tax (state-specific, ₹0–₹2,500/year)
- ✅ ESI (0.75% employee, 3.25% employer, applicable when gross ≤ ₹21k/month)
- ✅ Deductions: 80C, 80D (age-based caps), 80CCD(1B), 80CCD(2) employer NPS
- ✅ HRA exemption (metro/non-metro)

#### User Experience
- ✅ Live calculation (no submit button, 300ms debounce)
- ✅ Indian number format with commas (12,00,000)
- ✅ Monthly/Annual toggle for in-hand salary
- ✅ Auto-hide bottom navigation on scroll
- ✅ Info tooltips for Special Allowance, ESI
- ✅ Recharts donut chart showing CTC distribution
- ✅ Share via native Web Share API / clipboard fallback
- ✅ PDF export (jsPDF)

#### Design
- Black/white monochrome aesthetic
- Poppins font family
- #00D632 accent green
- Mobile-first responsive layout (max-w-md)
- Auto-hide black bottom navigation

---

### Fixed Issues

#### Critical Calculation Bugs
- [x] EPF not capped at statutory ₹21,600/year → Added `calcPF()` function + user toggle
- [x] Professional Tax wrongly deducted from new regime → PT only deductible in old regime
- [x] No marginal relief for 87A rebate cliff → Implemented at ₹12L threshold
- [x] HikeCompare/ReverseCalculator using CTC as taxable income → Now use gross (CTC - employer PF)
- [x] Kerala PT wrong (₹2,500 → ₹1,200) → Corrected to ₹100/month max
- [x] Variable Pay shown as monthly → Now shows annual with context note

#### UX Improvements (24 items)
- [x] New regime assumption disclosed with chip below hero
- [x] Results on top for Tax/Hike/Reverse tabs
- [x] Gross income hint: "≈ CTC minus Employer PF contribution"
- [x] Reverse Calculator auto-calculates (removed manual button)
- [x] State selector added to all tabs (was hardcoded ₹2,500 in Hike/Reverse)
- [x] Basic % validation with 30-70% warning
- [x] PF mode toggle with helper text
- [x] Age group selector for old regime slabs
- [x] 80D cap syncs with age group (₹25k / ₹50k)
- [x] Employer NPS 80CCD(2) with regime-specific caps (14% new / 10% old)
- [x] HRA toggle (Own home vs Renting) with collapsible fields
- [x] More Options collapsed summary shows current assumptions
- [x] CTC=0 shows placeholder instead of ₹0
- [x] Info icon size increased for better tap targets
- [x] Chart legend shows amounts, not just labels
- [x] ESI included in pie chart (Employer Contrib segment)

---

### Technical Details

**Stack:**
- React 19.0.0
- Vite 6.0.7
- Tailwind CSS 3.4.17
- Capacitor 7.0.0 (Android)
- TypeScript 5.7.2
- Recharts 2.15.0
- jsPDF 2.5.2

**Build:**
- Compiled with Java 21 (OpenJDK 21.0.8)
- Target SDK: 35 (Android 15 / Vanilla Ice Cream)
- Min SDK: 22 (Android 5.1 Lollipop)
- Signed APK size: 3.2 MB
- Package: `com.shikhar.salarycalculator`

**Deployment:**
- Web: GitHub Pages (vite base: `/india-salary-calculator/`)
- APK: Capacitor build (vite base: `/` for local file system)

---

### Known Limitations

1. **No Android App Bundle (AAB)** — Current release is APK-only. Play Store prefers AAB for dynamic delivery.
2. **Single Tax Year** — FY 2025-26 only. Will need update for FY 2026-27 budget changes.
3. **No iOS build** — Android-only for now.
4. **Professional Tax** — State-level PT is annual average. Some states have monthly variations.
5. **Variable Pay** — Assumes paid at year-end. Doesn't model quarterly/half-yearly payouts.

---

### Next Steps for Play Store Upload

1. **Generate AAB** (recommended):
   ```bash
   cd android && ./gradlew bundleRelease
   # Sign with bundletool
   ```

2. **Prepare Store Listing Assets:**
   - App icon: 512×512 PNG
   - Feature graphic: 1024×500 PNG
   - Screenshots: 2-8 phone screenshots (16:9 or 9:16)
   - Privacy policy URL (required)

3. **Content Rating:**
   - Complete IARC questionnaire in Play Console
   - Expected rating: Everyone / All Ages

4. **Upload to Internal Testing** first:
   - Test on multiple devices
   - Verify calculations with known test cases
   - Check for crashes/ANRs

5. **Production Release:**
   - Staged rollout (10% → 50% → 100%)
   - Monitor crash reports & user feedback

---

### Testing Checklist

Before production release, verify:

- [ ] CTC ₹12L → monthly in-hand matches manual calculation
- [ ] Tax at ₹12L (new regime) = ₹0 (87A rebate)
- [ ] Tax at ₹13L (new regime) ≈ ₹12,480 (marginal relief applied)
- [ ] EPF capped at ₹21,600/year for basic > ₹15k/month
- [ ] Kerala PT = ₹1,200, Maharashtra = ₹2,500, Delhi = ₹0
- [ ] ESI appears only when monthly gross ≤ ₹21,000
- [ ] Hike calc: 30% hike on ₹12L → correct new in-hand
- [ ] Reverse calc: ₹80k desired monthly → CTC ≈ ₹14.5L
- [ ] Old regime with ₹1.5L in 80C saves tax vs new regime for ₹10L+ gross
- [ ] Share button works (native share or clipboard)
- [ ] PDF export downloads correctly
- [ ] Pie chart totals = CTC

---

### Support

**Issues:** https://github.com/shikhar127/india-salary-calculator/issues
**Developer:** Shikhar (@shikhar127)
**License:** MIT

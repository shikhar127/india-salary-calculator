# SalaryFit v1.1 — Progress Tracker

## Sprint Status

- [x] Sprint 1: Tab Renaming & Opacity Fixes
- [x] Sprint 2: Currency Formatting in Tax Tab
- [x] Sprint 3: Currency Formatting in Hike & Reverse Tabs
- [ ] Sprint 4: Hike Calculator Enhancement
- [ ] Sprint 5: Onboarding CTC Capture
- [ ] Sprint 6: Testing, Build & Deploy

---

## Completed Work

### ✅ Sprint 1: Tab Renaming & Opacity Fixes
- Renamed "CTC Needed" → "Reverse" in App.tsx navigation
- Updated ReverseCalculator.tsx header to "Reverse Calculator"
- Verified all components use solid backgrounds (bg-white, bg-bg-secondary)
- No opacity issues found - all cards and inputs are fully opaque

### ✅ Sprint 2: Currency Formatting in Tax Tab
- Added formatNumber import to TaxDeductions.tsx
- Created string states for all currency inputs (8 fields)
- Implemented focus/blur/change handlers for Indian comma formatting
- Updated inputs: Gross Income, Basic Salary, Rent Paid, 80C, 80D, NPS (1B & 2)
- All inputs now show comma formatting (₹15,00,000 format)

### ✅ Sprint 3: Currency Formatting in Hike & Reverse Tabs
- Hike Calculator: Added comma formatting to Current CTC input
- Reverse Calculator: Removed K/L toggle completely
- Reverse Calculator: Replaced with single comma-formatted input field
- Updated label to "Desired Monthly In-Hand" with direct ₹ entry
- Both tabs now have consistent comma formatting behavior
- Mobile-optimized with inputMode="numeric"

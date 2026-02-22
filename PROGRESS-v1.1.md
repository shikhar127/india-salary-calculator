# SalaryFit v1.1 — Progress Tracker

## Sprint Status

- [x] Sprint 1: Tab Renaming & Opacity Fixes
- [x] Sprint 2: Currency Formatting in Tax Tab
- [x] Sprint 3: Currency Formatting in Hike & Reverse Tabs
- [x] Sprint 4: Hike Calculator Enhancement
- [x] Sprint 5: Onboarding CTC Capture
- [x] Sprint 6: Testing, Build & Deploy

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

### ✅ Sprint 4: Hike Calculator Enhancement
- Added prominent "Annual Hike" section at top of result card
- Displays absolute hike amount in accent-green: +₹X,XX,XXX
- Shows hike percentage alongside: (XX%)
- Positioned above Current → After Hike section with border separator
- Improved visual hierarchy for key metrics

### ✅ Sprint 5: Onboarding CTC Capture
- Created OnboardingModal component with CTC input
- Implemented localStorage check for first-launch detection
- Added "Skip" and "Continue" buttons
- Integrated modal into App.tsx with state management
- Pre-fill SalaryCalculator with saved CTC
- Pre-fill HikeCompare with saved CTC
- Modal appears only on first visit
- CTC persists across sessions via localStorage

### ✅ Sprint 6: Testing, Build & Deploy
- Updated package.json version to 1.1.0
- Built web app with GitHub Pages base
- Built APK with Capacitor base (3.2 MB)
- Built AAB with Capacitor base (3.0 MB)
- Signed both APK and AAB with release keystore
- Generated SHA256 checksums for verification
- Copied v1.1 releases to ~/SalaryFit-Releases/
- Deployed web app to GitHub Pages
- All 6 enhancements successfully implemented and shipped!

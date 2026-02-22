# SalaryFit v1.1 — Ralph Plan File

## Project
Implement 6 enhancement requirements from PRD to improve UX, consistency, and onboarding.

## Sprints

### Sprint 1: Tab Renaming & Opacity Fixes
**Goal:** Rename "CTC Needed" to "Reverse" and fix all translucent components

**Tasks:**
- [ ] Rename "CTC Needed" → "Reverse" in App.tsx (tab label, navigation)
- [ ] Update ReverseCalculator.tsx header title
- [ ] Fix opacity on all cards, inputs, overlays (ensure `bg-white` or `bg-bg-primary`, not translucent)
- [ ] Test across all 4 tabs for see-through issues

### Sprint 2: Currency Formatting in Tax Tab
**Goal:** Add Indian comma formatting to all Tax Calculator inputs

**Tasks:**
- [ ] Import `formatNumber` in TaxDeductions.tsx
- [ ] Add comma formatting to Gross Income input (focus/blur handlers)
- [ ] Add comma formatting to Section 80C input
- [ ] Add comma formatting to Section 80D input
- [ ] Add comma formatting to NPS inputs (80CCD 1B and 80CCD 2)
- [ ] Add comma formatting to HRA fields (Basic Salary, Rent Paid)
- [ ] Test all inputs: focus strips commas, blur adds them back

### Sprint 3: Currency Formatting in Hike & Reverse Tabs
**Goal:** Add comma formatting to Hike and Reverse calculators

**Tasks:**
- [ ] Hike tab: Add comma formatting to Current CTC input
- [ ] Reverse tab: Replace K/L toggle with single comma-formatted input
- [ ] Remove `unit` state and `handleUnitToggle` from ReverseCalculator
- [ ] Update `targetInHand` calculation to use direct input value
- [ ] Update input to type="text", inputMode="numeric" with comma formatting
- [ ] Test: Reverse calc should accept full amounts like ₹1,25,000 directly

### Sprint 4: Hike Calculator Enhancement
**Goal:** Show calculated hike % and absolute amount prominently

**Tasks:**
- [ ] Calculate absolute hike amount: `newCtc - currentCtc`
- [ ] Calculate hike percentage (verify it matches user input)
- [ ] Add display section at top of black result card
- [ ] Format: "Hike: +₹X,XX,XXX (XX%)"
- [ ] Style with accent-green for positive values
- [ ] Test with various CTC and hike % combinations

### Sprint 5: Onboarding CTC Capture
**Goal:** First-launch modal to capture CTC and pre-fill calculators

**Tasks:**
- [ ] Create OnboardingModal component (modal overlay, CTC input, Skip button)
- [ ] Add localStorage check in App.tsx: `hasSeenOnboarding`
- [ ] Store CTC in localStorage: `savedCtc`
- [ ] Pre-fill Salary Calculator CTC input from localStorage
- [ ] Pre-fill Hike Calculator Current CTC from localStorage
- [ ] Add "Skip" and "Continue" buttons to modal
- [ ] Test: first launch shows modal, subsequent launches skip it
- [ ] Test: skipping doesn't pre-fill, entering CTC pre-fills both tabs

### Sprint 6: Testing, Build & Deploy
**Goal:** Full integration test, build APK+AAB, deploy to web & releases folder

**Tasks:**
- [ ] Manual test all 6 enhancements across all tabs
- [ ] Verify comma formatting works on all currency inputs
- [ ] Test onboarding flow (clear localStorage, reload)
- [ ] Build with base: '/' for APK/AAB
- [ ] Build APK and AAB
- [ ] Sign both
- [ ] Build with base: '/india-salary-calculator/' for web
- [ ] Deploy to GitHub Pages
- [ ] Copy APK+AAB to ~/SalaryFit-Releases/
- [ ] Update version to 1.1 in package.json
- [ ] Commit all changes
- [ ] Push to GitHub

---

## Design Notes

**Opacity Fix:**
- Use `bg-white` or `bg-bg-primary` for all cards
- Ensure overlays have solid backgrounds
- Check Card component for any opacity settings

**Comma Formatting Pattern:**
```tsx
const [input, setInput] = useState<string>(formatNumber(initialValue))

<Input
  type="text"
  inputMode="numeric"
  value={input}
  onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ''))}
  onFocus={(e) => setInput(e.target.value.replace(/,/g, ''))}
  onBlur={(e) => {
    const n = Number(e.target.value.replace(/,/g, ''))
    setInput(n > 0 ? formatNumber(n) : '')
  }}
/>
```

**Onboarding Modal:**
- Black overlay with 50% opacity backdrop
- White card in center
- CTC input with comma formatting
- "Skip" (ghost) + "Continue" (primary) buttons
- Store `hasSeenOnboarding: true` in localStorage after any action

---

## Success Criteria

- [ ] All 6 PRD requirements implemented
- [ ] No translucent components remain
- [ ] All currency inputs have Indian comma formatting
- [ ] "Reverse" tab renamed everywhere
- [ ] Reverse calculator uses single input (no K/L toggle)
- [ ] Onboarding modal works on first launch
- [ ] Hike calculator shows hike amount and %
- [ ] APK+AAB built and signed
- [ ] Web deployed to GitHub Pages
- [ ] Version bumped to 1.1

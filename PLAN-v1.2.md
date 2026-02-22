# SalaryFit v1.2 — Ralph Plan File

## Project
Implement progressive UX enhancements: empty states, minimal inputs, progressive reveal, and simplified Tax tab flow.

## Sprints

### Sprint 1: Empty State Detection & Primary Input Highlighting
**Goal:** Detect empty states and highlight primary inputs across all tabs

**Tasks:**
- [ ] Create `EmptyState` component (hero CTA, primary input focus)
- [ ] Salary Calculator: Detect CTC === 0, show empty state
- [ ] Tax Calculator: Detect income === 0, show empty state
- [ ] Hike Calculator: Detect currentCtc === 0, show empty state
- [ ] Reverse Calculator: Detect targetValue === 0, show empty state
- [ ] Add smooth transitions when moving from empty → filled state

### Sprint 2: Minimal Input & Smart Defaults - Salary Tab
**Goal:** Implement minimal input principle in Salary Calculator

**Changes:**
- [ ] Hide "More Options" section by default (already implemented, verify)
- [ ] Default Basic % to 50% (already done)
- [ ] Default Variable Pay to 0 (already done)
- [ ] Show only CTC input initially
- [ ] After CTC entered, reveal results + "Customize" button for advanced options
- [ ] Test: CTC input → immediate results with defaults

### Sprint 3: Progressive Reveal - Hike & Reverse Tabs
**Goal:** Progressive disclosure in Hike and Reverse calculators

**Hike Tab:**
- [ ] Initially show only: Current CTC input
- [ ] After CTC entered, reveal: Hike % input + results
- [ ] Collapse State/PF options into "Advanced" section
- [ ] Reveal advanced section only after user shows interest

**Reverse Tab:**
- [ ] Initially show only: Desired In-Hand input
- [ ] After amount entered, reveal: Results + State/PF refinement options
- [ ] Make State/PF optional with smart defaults

### Sprint 4: Tax Tab - Simplified Flow (Part 1)
**Goal:** Redesign Tax tab with CTC-first flow

**New Flow:**
- [ ] Step 1: Ask for CTC only (large hero input)
- [ ] Step 2: PF choice (toggle or radio: ₹18,000 cap vs 12% of basic)
- [ ] Auto-calculate:
  - Employer PF from CTC + PF choice
  - Gross = CTC - Employer PF
  - Taxable income (New: Gross - ₹75k std, Old: Gross - ₹50k std)
  - Compare regimes with zero deductions as baseline
- [ ] Show recommendation: "You save ₹X with [New/Old] Regime"

### Sprint 5: Tax Tab - Progressive Deductions (Part 2)
**Goal:** Allow optional deduction customization

**Progressive Reveal:**
- [ ] Show regime recommendation first (from Sprint 4)
- [ ] Add "Customize Deductions" button
- [ ] On click, expand to show:
  - 80C slider (₹0 to ₹1.5L)
  - 80D slider (₹0 to ₹25k/₹50k based on age)
  - HRA toggle + inputs (collapsed by default)
  - NPS inputs (collapsed by default)
- [ ] Update comparison live as deductions change
- [ ] Keep collapsed state persistent (don't overwhelm)

### Sprint 6: Polish, Testing & Deploy
**Goal:** Final testing and deployment of v1.2

**Tasks:**
- [ ] Test all empty state transitions
- [ ] Verify defaults work correctly
- [ ] Test progressive reveal flows on all tabs
- [ ] Ensure Tax tab CTC flow works smoothly
- [ ] Build APK + AAB
- [ ] Deploy to web
- [ ] Update version to 1.2.0
- [ ] Copy releases to ~/SalaryFit-Releases/
- [ ] Commit and push to GitHub

---

## Design Patterns

### Empty State Component
```tsx
<div className="text-center py-12">
  <h3 className="text-xl font-bold mb-2">Let's calculate your salary</h3>
  <p className="text-secondary text-sm mb-6">
    Enter your Annual CTC to get started
  </p>
  {/* Primary input here */}
</div>
```

### Progressive Reveal Pattern
```tsx
{ctc > 0 && (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Results and advanced options */}
  </div>
)}
```

### Smart Defaults
- Basic %: 50%
- Variable Pay: ₹0
- City Type: Metro
- State: Maharashtra
- PF Mode: Capped (₹1,800/mo)
- Age Group: Below 60
- All deductions: ₹0

---

## Success Criteria

- [ ] All tabs show empty state when no input
- [ ] Primary inputs are highlighted and focused
- [ ] Smart defaults used for optional inputs
- [ ] Results appear immediately after first valid input
- [ ] Advanced options revealed progressively
- [ ] Tax tab simplified to CTC → PF → Recommendation flow
- [ ] Deductions are optional customizations in Tax tab
- [ ] Smooth animations for state transitions
- [ ] APK + AAB built and deployed
- [ ] Version bumped to 1.2.0

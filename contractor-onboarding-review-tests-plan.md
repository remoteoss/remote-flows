# Plan: Add Review Step Tests to ContractorOnboarding.test.tsx

## Overview
Add comprehensive tests for the review step in ContractorOnboarding flow, similar to the tests in OnboardingFlow.test.tsx. These tests will ensure proper auto-navigation to the review step when employment status is "readonly" (invited), verify data display, and prevent UI flickering.

## Current State Analysis

### Existing Test (line 830-892)
```typescript
it.each(['invited'])(
  'should automatically navigate to review step when employment status is %s',
  async (status) => {
    // Only verifies navigation occurs
    await screen.findByText(/Step: Review/i);
  },
);
```

**Limitations:**
- ❌ Doesn't verify employment data is displayed
- ❌ Doesn't test for flickering/intermediate steps
- ❌ Doesn't test with country selection step included
- ❌ Doesn't verify all collected data from previous steps

## Required Tests

### 1. Enhanced Auto-Navigation with Data Verification (PRIORITY: HIGH)

**Test Name:** `should automatically navigate to review step when employment status is invited and display employment data`

**What to Test:**
- Auto-navigation to review step when status is 'invited'
- Basic information data is displayed in review
- Pricing plan data is displayed in review
- Contract details data is displayed in review
- Contract preview/signature status is displayed

**Implementation Steps:**
1. Mock employment response with status 'invited'
2. Include all employment data (basic_information, contract_details, contractor_type, etc.)
3. Render ContractorOnboardingFlow with employmentId
4. Assert navigation to review step
5. Assert data from each step is visible:
   - Name from basic information: `mockContractorEmploymentResponse.data.employment.basic_information.name`
   - Email from basic information: `mockContractorEmploymentResponse.data.employment.personal_email`
   - Contractor type/subscription (if applicable)
   - Contract details (service duration, rate, etc.)

**Files to Reference:**
- `OnboardingFlow.test.tsx` lines 1146-1211
- `mockContractorEmploymentResponse` fixture for data structure

**Estimated Effort:** 2-3 hours

---

### 2. No Flickering Test (PRIORITY: HIGH)

**Test Name:** `should not show intermediate steps when automatically navigating to review (no flickering)`

**What to Test:**
- When employment status is 'invited', only the review step renders
- No intermediate steps (Basic Information, Pricing Plan, Contract Details, Contract Preview) are shown
- Loading state transitions directly to review

**Implementation Steps:**
1. Create a `renderSequence` array to track all renders
2. Mock employment with status 'invited'
3. Customize mockRender to track each render in the sequence
4. Assert that only 'Review' appears in non-loading renders
5. Assert no intermediate steps appear

**Key Verification:**
```typescript
const nonLoadingRenders = renderSequence
  .filter((render) => !render.isLoading)
  .map((render) => render.step);

expect(nonLoadingRenders).toEqual(['Review']);
```

**Files to Reference:**
- `OnboardingFlow.test.tsx` lines 1274-1358

**Estimated Effort:** 2-3 hours

---

### 3. Auto-Navigation with Country Selection (PRIORITY: MEDIUM)

**Test Name:** `should automatically navigate to review step when employment status is invited (with country selection)`

**What to Test:**
- Same as test #1 but with `select_country` step in the flow
- Verifies auto-navigation works regardless of step configuration

**Implementation Steps:**
1. Use `MultiStepFormWithCountry` instead of `MultiStepFormWithoutCountry`
2. DO NOT skip select_country step
3. Mock employment with status 'invited'
4. Assert navigation to review
5. Assert employment data is displayed

**Files to Reference:**
- `OnboardingFlow.test.tsx` lines 1213-1272

**Estimated Effort:** 1-2 hours

---

## Mock Data Requirements

### Employment Response Structure
Ensure `mockContractorEmploymentResponse` includes:
```typescript
{
  data: {
    employment: {
      id: employmentId,
      status: 'invited', // or other readonly statuses
      basic_information: {
        name: 'Test Contractor Name',
        // ... other fields
      },
      personal_email: 'contractor@example.com',
      work_email: 'contractor@company.com',
      contractor_type: 'standard' | 'plus',
      contract_details: {
        // service duration, rate, etc.
      },
      // ... other relevant fields
    }
  }
}
```

### Review Component Expectations
The Review component should display:
- Basic Information section with employment data
- Pricing Plan section with subscription info
- Contract Details section with contract data
- Contract status/signature info
- "Invite Contractor" button

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review OnboardingFlow.test.tsx tests (lines 1146-1358)
- [ ] Review ContractorOnboarding Review component implementation
- [ ] Identify what data Review component displays
- [ ] Verify mockContractorEmploymentResponse fixture has complete data

### Test 1: Data Verification
- [ ] Duplicate existing invited status test
- [ ] Rename to include "and display employment data"
- [ ] Add assertions for basic_information.name
- [ ] Add assertions for personal_email
- [ ] Add assertions for contractor_type/subscription
- [ ] Add assertions for contract_details fields
- [ ] Run test and verify it passes

### Test 2: No Flickering
- [ ] Create new test with renderSequence tracking
- [ ] Mock employment with invited status
- [ ] Customize mockRender to track renders
- [ ] Add assertion for nonLoadingRenders === ['Review']
- [ ] Add assertion that hasIntermediateSteps === false
- [ ] Run test and verify it passes

### Test 3: With Country Selection
- [ ] Create variant of test 1 using MultiStepFormWithCountry
- [ ] Remove skipSteps configuration
- [ ] Verify auto-navigation still works
- [ ] Add data display assertions
- [ ] Run test and verify it passes

### Post-Implementation
- [ ] Run all ContractorOnboarding tests: `npm test ContractorOnboarding.test.tsx`
- [ ] Verify no regressions in existing tests
- [ ] Compare test coverage with OnboardingFlow tests
- [ ] Update this plan with any learnings

---

## Key Differences: Contractor vs Employee Onboarding

### Different Steps
**Contractor Flow:**
1. Select Country (optional)
2. Basic Information
3. **Pricing Plan** (unique to contractors)
4. Contract Details
5. **Contract Preview** (unique to contractors)
6. Review

**Employee Flow:**
1. Select Country (optional)
2. Basic Information
3. Contract Details
4. **Benefits** (unique to employees)
5. Review

### Different Data to Verify
**Contractor-specific:**
- `contractor_type`: 'standard' | 'plus'
- Contract document creation/signing status
- Service duration vs employment dates
- Hourly/daily rate vs salary

**Employee-specific:**
- Benefits selections
- Salary in annual gross
- Seniority date

---

## Potential Edge Cases to Consider

### Additional Readonly Statuses
- Check if contractors have other readonly statuses besides 'invited'
- Similar to employees: 'created_awaiting_reserve', 'created_reserve_paid'
- May need to expand test.each() array

### Contract Document State
- Verify contract document ID is displayed if exists
- Verify signature status if contract was signed
- Consider testing unsigned vs signed contract states

### Subscription State
- Verify 'standard' subscription displays correctly
- Verify 'plus' subscription displays correctly
- Check if subscription can be changed in review (likely not)

---

## Testing Strategy

### Run Tests Incrementally
1. Implement Test 1 → Run → Fix → Commit
2. Implement Test 2 → Run → Fix → Commit
3. Implement Test 3 → Run → Fix → Commit

### Debugging Tips
- Use `screen.debug()` to see what's rendered
- Check `renderSequence` array if flickering test fails
- Verify mock data structure matches actual API response
- Use `waitFor()` for async assertions
- Check `data-testid` attributes in Review component

---

## Success Criteria

### Test Coverage
- ✅ Auto-navigation to review verified
- ✅ Employment data display verified
- ✅ No intermediate steps shown (flickering prevented)
- ✅ Works with and without country selection step

### Code Quality
- ✅ Tests follow existing patterns in OnboardingFlow.test.tsx
- ✅ Clear test names describing what is tested
- ✅ Proper use of waitFor/waitForElementToBeRemoved
- ✅ No flaky tests (all assertions stable)

### Documentation
- ✅ Test names are self-documenting
- ✅ Comments added for complex logic
- ✅ This plan updated with learnings

---

## Timeline Estimate

- **Test 1 (Data Verification):** 2-3 hours
- **Test 2 (No Flickering):** 2-3 hours
- **Test 3 (With Country):** 1-2 hours
- **Testing & Debugging:** 1-2 hours
- **Total:** 6-10 hours

---

## References

### Files to Study
- `/src/flows/Onboarding/tests/OnboardingFlow.test.tsx` (lines 1146-1358)
- `/src/flows/ContractorOnboarding/tests/ContractorOnboarding.test.tsx` (line 830-892)
- `/src/flows/ContractorOnboarding/tests/fixtures.ts` (mockContractorEmploymentResponse)
- `/src/flows/ContractorOnboarding/ContractorOnboarding.tsx` (Review component implementation)

### Key Patterns from OnboardingFlow
1. Use `it.each(['status1', 'status2'])` for testing multiple statuses
2. Create dedicated test for flickering using renderSequence
3. Test both with/without skipped steps
4. Verify actual data display, not just navigation

---

## Notes

- Keep tests focused and isolated
- Reuse existing helpers (generateUniqueEmploymentId, TestProviders)
- Match assertion style with existing tests
- Consider future maintenance when writing tests

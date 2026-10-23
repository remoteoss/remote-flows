# Loading State Aggregation Pattern

## Flow hooks.tsx Pattern

When adding new queries to flow hooks (Onboarding, ContractorOnboarding, CreateCompany, etc.), **always** remember to:

1. **Destructure the loading state** from the query hook:

   ```typescript
   const { data, isLoading: isLoadingSomething } = useSomeQuery({ ... });
   ```

2. **Add it to the `initialLoading` aggregation** (typically around line 966-976 in flow hooks):
   
   ```typescript
   const initialLoading =
     isLoadingCountries ||
     isLoadingBasicInformationForm ||
     // ... other loading states ...
     isLoadingSomething;  // <-- Don't forget this!
   ```

3. **Why this matters:**
   - The `initialLoading` is used to compute the final `isLoading` state returned from the flow
   - Missing loading states can cause premature step transitions or missing loading indicators
   - The loading state gates navigation in `isNavigatingToReview` logic

## Quick Checklist

When adding a new query to a flow:

- [ ] Query hook returns `isLoading: isLoadingSomething`
- [ ] `isLoadingSomething` is added to `initialLoading` aggregation
- [ ] Query has proper `enabled` condition to prevent unnecessary calls

## Example

```typescript
// 1. Add query with loading state
const { data: invoiceSchedules, isLoading: isLoadingInvoiceSchedules } =
  useGetInvoiceSchedules({
    employmentId: internalEmploymentId as string,
    options: {
      queryOptions: {
        enabled:
          includeInvoiceSchedule &&
          stepState.currentStep.name === 'invoice_schedule' &&
          Boolean(internalEmploymentId),
      },
    },
  });

// 2. Add to initialLoading aggregation
const initialLoading =
  isLoadingCountries ||
  isLoadingBasicInformationForm ||
  isLoadingEmployment ||
  isLoadingContractorOnboardingDetailsForm ||
  isLoadingContractorSubscriptions ||
  isLoadingDocumentPreviewForm ||
  isLoadingIR35File ||
  isLoadingContractDocuments ||
  isLoadingEligibilityQuestionnaire ||
  isLoadingCreateInvoiceScheduleForm ||
  isLoadingInvoiceSchedules;  // <-- Added here
```

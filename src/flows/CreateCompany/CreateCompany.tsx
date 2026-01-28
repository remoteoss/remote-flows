
import { useId, useRef, useMemo } from 'react';
export const CreateCompanyFlow = ({
  render,
  countryCode,
  options,
}: CreateCompanyFlowProps) => {
  const createCompanyBag = useCreateCompany({
    options,
    countryCode,
  });
  const formId = useId();
  // Store form's setValue method in ref to allow sibling components
  return (
    <CreateCompanyContext.Provider
      value={{ createCompanyBag, formId }}
    >
      {render({
        createCompanyBag,
        components: {
          SelectCountryStep: SelectCountryStep,
          BackButton: OnboardingBack,
          SubmitButton: OnboardingSubmit,
        },
      })}
    </CreateCompanyContext.Provider>
  );
};

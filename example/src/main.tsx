import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CostCalculatorWithPremiumBenefits } from './CostCalculatorWithPremiumBenefits.tsx';
import { ContractorOnboardingWithProps } from './ContractorOnboarding.tsx';
import App from './App.tsx';

const RenderApplication = () => {
  if (import.meta.env.VITE_NEW_PREMIUM_BENEFITS === 'true') {
    return <CostCalculatorWithPremiumBenefits />;
  }

  if (import.meta.env.VITE_CONTRACTOR_ONBOARDING === 'true') {
    return <ContractorOnboardingWithProps />;
  }

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RenderApplication />
  </StrictMode>,
);

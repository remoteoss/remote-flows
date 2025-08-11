import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CostCalculatorWithPremiumBenefits } from './CostCalculatorWithPremiumBenefits.tsx';
import App from './App.tsx';

const RenderPremiumBenefits = () => {
  if (import.meta.env.VITE_NEW_PREMIUM_BENEFITS) {
    return <CostCalculatorWithPremiumBenefits />;
  }
  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RenderPremiumBenefits />
  </StrictMode>,
);

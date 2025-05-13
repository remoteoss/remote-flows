import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { OnboardingEOR } from './Onboarding.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OnboardingEOR />
  </StrictMode>,
);

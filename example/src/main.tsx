import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
//import App from './App.tsx';
import { RouteApp } from './routes.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouteApp />
  </StrictMode>,
);

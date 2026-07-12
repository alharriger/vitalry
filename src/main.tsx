import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@phosphor-icons/web/bold';
import '@phosphor-icons/web/fill';
import './styles/styles.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

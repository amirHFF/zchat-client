import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import './index.css'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import React from 'react'
import AppRouter from './router/Router.tsx';
import AppProviders from './i18n/AppProviders.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)

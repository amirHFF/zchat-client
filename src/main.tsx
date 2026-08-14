import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import React from 'react'
import AppRouter from './router/Router.tsx';
import { ThemeProvider } from '@emotion/react';
import { simorqTheme } from './muiTheme.ts';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={simorqTheme}>
      <AppRouter />
    </ThemeProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import React from 'react'

import LandingPage from './LandingPage.tsx';
import keycloak from "./auth/Keycloak.ts";
import AppRouter from './router/Router.tsx';

await keycloak.init({
    onLoad: "check-sso",
    flow: "implicit",
    redirectUri: "http://localhost:5173"
});




createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter/>
  </StrictMode>,
)

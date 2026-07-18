import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import React from 'react'
import keycloak from "./auth/Keycloak.ts";
import AppRouter from './router/Router.tsx';

const apiUrl = import.meta.env.VITE_API_URL;

await keycloak.init({
    onLoad: "check-sso",
    flow: "implicit",
    redirectUri: apiUrl
});




createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter/>
  </StrictMode>,
)

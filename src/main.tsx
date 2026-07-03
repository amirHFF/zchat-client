import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import React from 'react'
import Keycloak from "keycloak-js";
import ReactDOM from "react-dom/client";
import { ChatServiceFacade } from './xmpp/ChatServiceFacade.ts';

const chatFacade:ChatServiceFacade = ChatServiceFacade.getInstance();

const keycloak = new Keycloak({
    url: "http://130.185.121.173:8081",
    realm: "project-z",
    clientId: "z-chat",
})
await keycloak.init({
    onLoad: "login-required",
    flow: "implicit",
        redirectUri: "http://localhost:5173",
}).then(async (authenticated) => {
        if (!authenticated) {
            keycloak.login();
            return;
        }
        
        await chatFacade.login("nafiseh@zchat.ir","123")

        ReactDOM.createRoot(document.getElementById("root")!).render(
            <App />
        );
    });

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

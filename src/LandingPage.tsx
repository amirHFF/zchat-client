import Keycloak from "keycloak-js";
import React from "react";
import { ChatServiceFacade } from './xmpp/ChatServiceFacade.ts';

const chatFacade: ChatServiceFacade = ChatServiceFacade.getInstance();

const keycloak = new Keycloak({
    url: "http://130.185.121.173:8081",
    realm: "project-z",
    clientId: "z-chat",
})


export default function LandingPage() {

    async function login(){
        
        await keycloak.init({
            onLoad: "login-required",
            flow: "implicit",
            redirectUri: "http://localhost:5173",
        }).then(async (authenticated) => {
            if (!authenticated) {
                keycloak.login();
                return;
            }

            await chatFacade.login("nafiseh@zchat.ir", "123")


        });
    }


    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "20px"
            }}
        >
            <button onClick={login}>
                ورود
            </button>

            <button onClick={register}>
                ثبت نام
            </button>

        </div>
    );
}
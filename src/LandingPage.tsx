import React, { useEffect } from "react";
import "./LandingPage.css";
import keycloak from "./auth/Keycloak.ts";
import { useNavigate } from "react-router-dom";


async function register() {

    await keycloak.register();
}

export default function LandingPage() {
    const navigate = useNavigate();

    if(keycloak.authenticated){
        navigate("/chat");
    }

    async function login() {
        console.log("login on landing")
        if (!keycloak.authenticated) {
            keycloak.login({redirectUri: "http://localhost:5173/chat"});
            const jid = `${keycloak.tokenParsed?.preferred_username}@zchat.ir`;
            console.log("user logged in successfully ... : "+jid)
        }else{
                    navigate("/chat");
        }

    }


    return (
        <div className="landing-page">

            <div className="gradient gradient1"></div>
            <div className="gradient gradient2"></div>
            <div className="gradient gradient3"></div>

            <div className="hero">

                <h1>Z Chat</h1>

                <p>
                    Secure enterprise messaging powered by
                    XMPP & Keycloak.
                </p>

                <div className="buttons">

                    <button
                        className="primary"
                        onClick={login}
                    >
                        ورود
                    </button>

                    <button
                        className="secondary"
                        onClick={register}
                    >
                        ثبت نام
                    </button>

                </div>

            </div>

        </div>
    );
}
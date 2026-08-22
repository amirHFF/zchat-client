import React, { useEffect } from "react";
import "./LandingPage.css";
import keycloak from "./auth/Keycloak.ts";
import { useNavigate } from "react-router-dom";
import logo from "./assets/simorq-logo.png"; // فایل لوگو رو اینجا قرار بده
const apiUrl = import.meta.env.VITE_API_URL;

async function register() {
    await keycloak.register();
}

export default function LandingPage() {
    const navigate = useNavigate();
    
    useEffect(() => {
        if (keycloak.authenticated) {
            navigate("/chat");
        }
    }, [navigate]);

    async function login() {
        if (!keycloak.authenticated) {
            keycloak.login({ redirectUri: apiUrl + "/chat" });
            const jid = keycloak.tokenParsed?.preferred_username;
            console.log("user logged in successfully ... : " + jid);
        } else {
            navigate("/chat");
        }
    }

    return (
        <div className="landing-page">

            <div className="gradient gradient1"></div>
            <div className="gradient gradient2"></div>
            <div className="gradient gradient3"></div>

            <div className="hero">

                <div className="logo-wrap">
                    <div className="logo-ring"></div>
                    <img src={logo} alt="Simorq" className="logo-img" />
                </div>

                <p className="eyebrow">Deep Insight</p>

                <h1>SimorQ</h1>

                <p className="subtitle">
                    Secure enterprise messaging, refined by intelligence.
                    <br />
                    Powered by XMPP &amp; Keycloak.
                </p>

                <div className="buttons">
                    <button className="primary" onClick={login}>
                        Sign in
                    </button>

                    <button className="secondary" onClick={register}>
                        Sign up
                    </button>
                </div>

            </div>

        </div>
    );
}
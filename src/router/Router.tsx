import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../LandingPage";
import App from "../App";
import AuthGate from "../components/AuthGate";

export default function AppRouter() {
    return (
        <AuthGate>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/chat" element={<App />} />
                </Routes>
            </BrowserRouter>
        </AuthGate>
    );
}
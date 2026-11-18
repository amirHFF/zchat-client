import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../LandingPage";
import App from "../App";
import AuthGate from "../components/AuthGate";
import TeacherDashboard from "../components/TeacherDashboard";
import SettingsPage from "../components/SettingsPage.tsx";
import HelpPage from "../components/HelpPage";

export default function AppRouter() {
    return (
        <AuthGate>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/chat" element={<App />} />
                    <Route
                        path="/chat/dashboard-teacher"
                        element={<TeacherDashboard />}
                    />
                    <Route path="/chat/settings" element={<SettingsPage />} />
                    <Route path="/chat/help" element={<HelpPage />} />
                </Routes>
            </BrowserRouter>
        </AuthGate>
    );
}

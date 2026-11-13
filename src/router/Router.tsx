import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../LandingPage";
import App from "../App";
import AuthGate from "../components/AuthGate";
import TeacherDashboard from "../components/TeacherDashboard";

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
                </Routes>
            </BrowserRouter>
        </AuthGate>
    );
}

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../LandingPage";
import App from "../App";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                    <Route > 
<Route path="/" element={<LandingPage />} />
                <Route path="/chat" element={<App />} />
                    </Route>
                
            </Routes>
        </BrowserRouter>
    );
}
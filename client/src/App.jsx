import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { PortfolioPage } from "./pages/PortfolioPage.jsx";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/portfolio/:username" element={<PortfolioPage />} />
        <Route path="*" element={<div className="p-8">404</div>} />
      </Route>
    </Routes>
  );
}


// src/App.jsx (Contoh)
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
// import IkanList from "./components/IkanList";
import DashboardPage from "./pages/Dashboard";
// import HalamanLain from './pages/HalamanLain'; // Contoh

function App() {
  return (
    <Router>
      <Routes>
        {/* Arahkan path root ke login atau halaman lain */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Rute lainnya */}
      </Routes>
    </Router>
  );
}

export default App;

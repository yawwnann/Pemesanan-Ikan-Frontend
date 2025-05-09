// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import KatalogPage from "./pages/KatalogPage";
import DetailIkanPage from "./pages/DetailIkanPage";
import KeranjangPage from "./pages/KeranjangPage";
import PesananSuksesPage from "./pages/PesananSuksesPage";
import CheckoutPage from "./pages/CheckoutPage";
import PesananPage from "./pages/PesananPage";
import PesananDetailPage from "./pages/PesananDetailPage";

import "@fontsource/inter";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pesanan/sukses" element={<PesananSuksesPage />} />
        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/katalog" element={<KatalogPage />} />
          <Route path="/ikan/:slug" element={<DetailIkanPage />} />
          <Route path="/keranjang" element={<KeranjangPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pesanan" element={<PesananPage />} />
          <Route
            path="/pesanan/detail/:orderId"
            element={<PesananDetailPage />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

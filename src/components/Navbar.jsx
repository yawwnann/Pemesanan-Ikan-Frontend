import React, { useState, useEffect, Fragment } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon,
  Squares2X2Icon,
  BuildingStorefrontIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import apiClient from "../api/apiClient"; // Pastikan path ini benar
import siteLogo from "../assets/icon-pasifix.png"; // Pastikan path ini benar

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/user");
        // Pastikan response.data memiliki struktur yang benar
        // Jika API Anda mengembalikan user langsung di data: response.data
        // Jika API Anda mengembalikan { user: {...} }: response.data.user
        // Sesuaikan baris berikut jika perlu:
        setUser(response.data.user || response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          localStorage.removeItem("authToken");
          // Hapus juga user jika token tidak valid
          localStorage.removeItem("authUser");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem("authToken");
    if (token) {
      fetchUserData();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      setUser(null);
      // Panggil API logout di background (fire and forget)
      apiClient
        .post("/logout")
        .catch((err) =>
          console.error("Background logout API call failed:", err)
        );
      navigate("/login");
    } catch (error) {
      console.error("Local logout process failed:", error);
      // Tetap arahkan ke login meskipun ada error lokal
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
      setIsMobileMenuOpen(false);
    }
  };

  // ... (fungsi getNavLinkClass dan getMobileNavLinkClass tidak berubah) ...
  const getNavLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
      isActive
        ? "bg-blue-700 text-white"
        : "text-blue-100 hover:bg-blue-700 hover:text-white"
    }`;

  const getMobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center ${
      isActive
        ? "bg-blue-700 text-white"
        : "text-blue-100 hover:bg-blue-700 hover:text-white"
    }`;

  return (
    <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Mobile Menu Button & Logo */}
          <div className="flex items-center">
            {/* ... (kode logo dan tombol mobile tidak berubah) ... */}
            <div className="flex items-center md:hidden mr-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Buka menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
            <div className="flex-shrink-0">
              <NavLink to="/" className="flex items-center space-x-2">
                <img
                  className="h-10 w-auto"
                  src={siteLogo}
                  alt="Pasifix Logo"
                />
                <span className="text-white font-bold text-xl hidden sm:inline">
                  Pasifix
                </span>
              </NavLink>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden md:flex md:justify-center md:flex-1 md:mx-6">
            {/* ... (kode navigasi tengah tidak berubah) ... */}
            <div className="flex items-baseline space-x-4">
              <NavLink to="/dashboard" className={getNavLinkClass}>
                <HomeIcon className="h-5 w-5 mr-1" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/catalog" className={getNavLinkClass}>
                <BuildingStorefrontIcon className="h-5 w-5 mr-1" />
                <span>Katalog</span>
              </NavLink>
              <NavLink to="/categories" className={getNavLinkClass}>
                <Squares2X2Icon className="h-5 w-5 mr-1" />
                <span>Kategori</span>
              </NavLink>
              <NavLink to="/orders" className={getNavLinkClass}>
                <ShoppingCartIcon className="h-5 w-5 mr-1" />
                <span>Pesanan</span>
              </NavLink>
            </div>
          </div>

          {/* Right side: Desktop Profile & Logout / Login Button */}
          <div className="hidden md:ml-4 md:flex md:items-center md:space-x-4">
            {isLoading ? (
              // Skeleton Loader saat isLoading true
              <>
                <div className="h-8 w-8 bg-blue-400 rounded-full animate-pulse"></div>{" "}
                {/* Ukuran disesuaikan */}
                <div className="h-7 w-7 bg-blue-400 rounded-md animate-pulse"></div>{" "}
                {/* Skeleton untuk logout */}
              </>
            ) : user ? (
              // Tampilkan Ikon Asli jika TIDAK loading DAN user ADA
              <>
                <NavLink
                  to="/profile" // Arahkan ke halaman profil
                  className="flex items-center p-1 rounded-full text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
                  title={user.name || "Profile"} // Tampilkan nama user jika ada
                >
                  <span className="sr-only">Profile</span>
                  {/* --- PERUBAHAN DI SINI (DESKTOP) --- */}
                  {user.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt={user.name || "User profile"}
                      className="h-8 w-8 rounded-full object-cover" // Styling untuk gambar profil
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/150?text=Err";
                      }} // Fallback jika URL gambar error
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8" aria-hidden="true" /> // Fallback ke ikon
                  )}
                  {/* Tampilkan nama di samping ikon (opsional) */}
                  {/* <span className="ml-2 text-white text-sm font-medium hidden lg:block">{user.name}</span> */}
                  {/* --- AKHIR PERUBAHAN (DESKTOP) --- */}
                </NavLink>
                <button
                  onClick={handleLogout}
                  type="button"
                  disabled={isLoggingOut}
                  className={`p-1 rounded-full text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white transition-opacity ${
                    isLoggingOut ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  title="Logout"
                >
                  <span className="sr-only">Logout</span>
                  {/* Icon logout tidak perlu loading state kompleks jika proses cepat */}
                  <ArrowRightOnRectangleIcon
                    className="h-7 w-7"
                    aria-hidden="true"
                  />
                </button>
              </>
            ) : (
              // Tampilkan Login jika TIDAK loading DAN user TIDAK ADA
              <NavLink to="/login" className={getNavLinkClass}>
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                <span>Login</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={isMobileMenuOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div
          className="md:hidden absolute w-full bg-blue-600 shadow-md z-40"
          id="mobile-menu"
        >
          {/* Mobile Navigation Links */}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* ... (Navigasi mobile tidak berubah) ... */}
            <NavLink
              key="/"
              to="/"
              className={getMobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              <span>Home</span>
            </NavLink>
            <NavLink
              key="/catalog"
              to="/catalog"
              className={getMobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
              <span>Katalog</span>
            </NavLink>
            <NavLink
              key="/categories"
              to="/categories"
              className={getMobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Squares2X2Icon className="h-5 w-5 mr-2" />
              <span>Kategori</span>
            </NavLink>
            <NavLink
              key="/orders"
              to="/orders"
              className={getMobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              <span>Pesanan</span>
            </NavLink>
          </div>

          {/* Mobile User Profile/Login Section */}
          <div className="pt-4 pb-3 border-t border-blue-700">
            {isLoading ? (
              // Skeleton untuk area profil mobile
              <div className="flex items-center px-5 animate-pulse">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-400 rounded-full"></div>
                <div className="ml-3 flex-1 min-w-0 space-y-1">
                  <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                  <div className="h-3 bg-blue-400 rounded w-1/2"></div>
                </div>
                <div className="ml-auto flex-shrink-0 h-6 w-6 bg-blue-400 rounded-full"></div>
              </div>
            ) : user ? (
              // Tampilkan info user & logout jika TIDAK loading DAN user ADA
              <div className="flex items-center px-5">
                <NavLink
                  to="/profile" // Arahkan ke halaman profil
                  className="flex-shrink-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {/* --- PERUBAHAN DI SINI (MOBILE) --- */}
                  {user.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt={user.name || "User profile"}
                      className="h-10 w-10 rounded-full object-cover" // Ukuran sesuai ikon mobile asli
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/150?text=Err";
                      }}
                    />
                  ) : (
                    <UserCircleIcon
                      className="h-10 w-10 rounded-full text-blue-200"
                      aria-hidden="true"
                    /> // Fallback
                  )}
                  {/* --- AKHIR PERUBAHAN (MOBILE) --- */}
                </NavLink>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="text-base font-medium text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-blue-200 truncate">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  type="button"
                  disabled={isLoggingOut}
                  className={`ml-auto flex-shrink-0 p-1 rounded-full text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white ${
                    isLoggingOut ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  title="Logout"
                >
                  <span className="sr-only">Logout</span>
                  <ArrowRightOnRectangleIcon
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                </button>
              </div>
            ) : (
              // Tampilkan link login jika TIDAK loading DAN user TIDAK ADA
              <div className="px-2 sm:px-3">
                <NavLink
                  to="/login"
                  className={getMobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  <span>Login</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </Transition>
    </nav>
  );
}

export default Navbar;

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

import apiClient from "../api/apiClient";
import siteLogo from "../assets/icon-pasifix.png";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null); // State for storing user data
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from the API
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/user");
        setUser(response.data.user); // Set the user data
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await apiClient.post("/logout");
      console.log("Logout API response:", response.data);

      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.response || error.message);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        alert(
          "Sesi Anda mungkin telah berakhir atau tidak valid. Silakan login kembali."
        );
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        navigate("/login");
      } else {
        alert(
          `Logout gagal (${
            error.response?.status || "Network Error"
          }). Silakan coba lagi.`
        );
      }
    } finally {
      setIsLoggingOut(false);
      setIsMobileMenuOpen(false);
    }
  };

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
          <div className="flex items-center">
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

          <div className="hidden md:flex md:justify-center md:flex-1 md:mx-6">
            <div className="flex items-baseline space-x-4">
              <NavLink to="/" className={getNavLinkClass}>
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

          <div className="hidden md:ml-4 md:flex md:items-center md:space-x-4">
            {user && (
              <span className="text-white font-semibold">
                {user.name} {/* Display user name */}
              </span>
            )}

            <NavLink
              to="/profile"
              className="p-1 rounded-full text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
              title="Profile"
            >
              <span className="sr-only">Profile</span>
              <UserCircleIcon className="h-7 w-7" aria-hidden="true" />
            </NavLink>

            <button
              onClick={handleLogout}
              type="button"
              disabled={isLoggingOut}
              className={`p-1 rounded-full text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white transition-colors ${
                isLoggingOut ? "cursor-not-allowed opacity-50" : ""
              }`}
              title="Logout"
            >
              <span className="sr-only">Logout</span>
              <ArrowRightOnRectangleIcon
                className="h-7 w-7"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="flex items-center px-5">
              <NavLink
                to="/profile"
                className="flex-shrink-0"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserCircleIcon className="h-10 w-10 rounded-full text-blue-200 hover:text-white" />
              </NavLink>
              <div className="ml-3 flex-1 min-w-0">
                <div className="text-base font-medium text-white">
                  {user ? user.name : "Nama User Anda"}
                </div>
                <div className="text-sm font-medium text-blue-200">
                  {user ? user.email : "email@anda.com"}
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
                <ArrowRightOnRectangleIcon
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  );
}

export default Navbar;

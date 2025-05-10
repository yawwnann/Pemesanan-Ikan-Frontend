import React, {
  useState,
  useEffect,
  Fragment,
  useCallback, // Tambahkan useCallback
} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon, // Untuk ikon di modal konfirmasi
} from "@heroicons/react/24/outline";

import apiClient from "../api/apiClient";
import siteLogo from "../assets/icon-pasifix.png";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State untuk modal logout
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const storedUser = localStorage.getItem("authUser");
      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        setUser({
          name: parsedUser?.name || "Pengguna",
          email: parsedUser?.email || "",
          profile_photo_url: parsedUser?.profile_photo_url || null,
        });
      } catch (e) {
        console.error("Gagal parse authUser dari localStorage:", e);
        setUser({ name: "Pengguna", email: "", profile_photo_url: null });
      }
    } else {
      setUser(null);
    }
  }, []);

  // Fungsi untuk membuka modal konfirmasi logout
  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  // Fungsi untuk menutup modal konfirmasi logout
  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  // Fungsi untuk melakukan logout setelah dikonfirmasi
  const confirmLogout = async () => {
    closeLogoutModal(); // Tutup modal dulu
    setIsLoggingOut(true);
    try {
      await apiClient.post("/logout");
      console.log("Logout API call successful (token invalidated on backend).");
    } catch (error) {
      console.error(
        "Logout API call failed, proceeding with local logout:",
        error.response || error
      );
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      setUser(null);
      setIsLoggingOut(false);
      setIsMobileMenuOpen(false); // Tutup menu mobile jika terbuka
      console.log("Local storage cleared, navigating to login.");
      navigate("/login");
    }
  };

  // Memoized NavLink classes
  const getNavLinkClass = useCallback(
    ({ isActive }) =>
      `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
        isActive
          ? "bg-blue-700 text-white shadow-inner" // Warna aktif lebih tegas
          : "text-blue-100 hover:bg-blue-700 hover:text-white"
      }`,
    []
  );

  const getMobileNavLinkClass = useCallback(
    ({ isActive }) =>
      `block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center ${
        isActive
          ? "bg-blue-700 text-white shadow-inner"
          : "text-blue-100 hover:bg-blue-700 hover:text-white"
      }`,
    []
  );

  const handleNavbarImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = "none";
    const altUserIcon = e.target.parentElement.querySelector(".alt-user-icon");
    if (altUserIcon) {
      altUserIcon.style.display = "block";
    }
    console.warn("Gagal memuat foto profil Navbar:", e.target.src);
  };

  return (
    <>
      <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
        {" "}
        {/* Warna utama diubah ke blue */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side */}
            <div className="flex items-center">
              <div className="flex items-center md:hidden mr-2">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  aria-controls="mobile-menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">Buka menu</span>{" "}
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="block h-6 w-6" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" />
                  )}
                </button>
              </div>
              <div className="flex-shrink-0">
                <NavLink
                  to="/dashboard"
                  className="flex items-center space-x-2 group"
                >
                  <img
                    className="h-10 w-auto transition-transform duration-300 group-hover:scale-110" // Efek hover pada logo
                    src={siteLogo}
                    alt="Pasifix Logo"
                  />
                </NavLink>
              </div>
            </div>

            {/* Center Links */}
            <div className="hidden md:flex md:justify-center md:flex-1 md:mx-6">
              <div className="flex items-baseline space-x-4">
                <NavLink to="/dashboard" className={getNavLinkClass}>
                  <HomeIcon className="h-5 w-5 mr-1.5" />{" "}
                  {/* Margin disesuaikan */}
                  <span>Home</span>
                </NavLink>
                <NavLink to="/katalog" className={getNavLinkClass}>
                  <BuildingStorefrontIcon className="h-5 w-5 mr-1.5" />
                  <span>Katalog</span>
                </NavLink>
                <NavLink to="/keranjang" className={getNavLinkClass}>
                  <ShoppingCartIcon className="h-5 w-5 mr-1.5" />
                  <span>Keranjang</span>
                </NavLink>
                <NavLink to="/pesanan" className={getNavLinkClass}>
                  <ArchiveBoxIcon className="h-5 w-5 mr-1.5" />
                  <span>Pesanan</span>
                </NavLink>
              </div>
            </div>

            {/* Right Side */}
            <div className="hidden md:ml-4 md:flex md:items-center md:space-x-4">
              {user ? (
                <>
                  <NavLink
                    to="/profile"
                    className="flex items-center p-1 rounded-full text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white group"
                    title={user.name || "Profile"}
                  >
                    <span className="sr-only">Profile</span>
                    {user.profile_photo_url ? (
                      <img
                        src={user.profile_photo_url}
                        alt={user.name || "User profile"}
                        className="h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-blue-300 transition-colors" // Efek border hover
                        onError={handleNavbarImageError}
                      />
                    ) : (
                      // Ikon UserCircleIcon akan ditampilkan jika foto profil gagal dimuat atau tidak ada
                      <UserCircleIcon
                        className="h-8 w-8 alt-user-icon"
                        aria-hidden="true"
                      />
                    )}
                  </NavLink>
                  <button
                    onClick={openLogoutModal} // Panggil fungsi untuk membuka modal
                    type="button"
                    disabled={isLoggingOut}
                    className={`p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white transition-all duration-150 ${
                      // Warna hover merah untuk logout
                      isLoggingOut ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    title="Logout"
                  >
                    <span className="sr-only">Logout</span>
                    <ArrowRightOnRectangleIcon
                      className="h-6 w-6" // Ukuran ikon disesuaikan
                      aria-hidden="true"
                    />
                  </button>
                </>
              ) : (
                <NavLink to="/login" className={getNavLinkClass}>
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
                  <span>Login</span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
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
            className="md:hidden absolute w-full bg-blue-600 shadow-lg z-40 rounded-b-lg" // Rounded bottom
            id="mobile-menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink
                to="/dashboard"
                className={getMobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HomeIcon className="h-5 w-5 mr-2" /> <span>Home</span>
              </NavLink>
              <NavLink
                to="/katalog"
                className={getMobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BuildingStorefrontIcon className="h-5 w-5 mr-2" />{" "}
                <span>Katalog</span>
              </NavLink>
              <NavLink
                to="/keranjang"
                className={getMobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />{" "}
                <span>Keranjang</span>
              </NavLink>
              <NavLink
                to="/pesanan"
                className={getMobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ArchiveBoxIcon className="h-5 w-5 mr-2" /> <span>Pesanan</span>
              </NavLink>
            </div>
            <div className="pt-4 pb-3 border-t border-blue-700">
              {user ? (
                <div className="flex items-center px-5">
                  <NavLink
                    to="/profile"
                    className="flex-shrink-0"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {user.profile_photo_url ? (
                      <img
                        src={user.profile_photo_url}
                        alt={user.name || "User profile"}
                        className="h-10 w-10 rounded-full object-cover border-2 border-blue-400"
                        onError={handleNavbarImageError}
                      />
                    ) : (
                      <UserCircleIcon
                        className="h-10 w-10 rounded-full text-blue-200 alt-user-icon"
                        aria-hidden="true"
                      />
                    )}
                  </NavLink>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="text-base font-medium text-white truncate">
                      {user.name || "User"}
                    </div>
                    <div className="text-sm font-medium text-blue-200 truncate">
                      {user.email || ""}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false); // Tutup menu dulu
                      openLogoutModal(); // Baru buka modal
                    }}
                    type="button"
                    disabled={isLoggingOut}
                    className={`ml-auto flex-shrink-0 p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white ${
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
              ) : (
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

      {/* Modal Konfirmasi Logout */}
      <Transition appear show={isLogoutModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeLogoutModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-slate-900 flex items-center"
                  >
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                    Konfirmasi Logout
                  </Dialog.Title>
                  <div className="mt-3">
                    <p className="text-sm text-slate-600">
                      Apakah Anda yakin ingin keluar dari akun Anda?
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                      onClick={closeLogoutModal}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      className={`inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors ${
                        isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={confirmLogout}
                    >
                      {isLoggingOut ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Memproses...
                        </div>
                      ) : (
                        "Ya, Keluar"
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default Navbar;

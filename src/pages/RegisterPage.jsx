// src/pages/RegisterPage.jsx
import React, { useState, useEffect, Fragment, useCallback } from "react"; // Import useCallback
import apiClient from "../api/apiClient";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import backgroundImage from "../assets/bg-login.jpg";
import Icon from "../assets/icon-pasifix.png";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline"; // Import EyeIcon dan EyeSlashIcon

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State untuk password
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false); // State untuk konfirmasi password
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fungsi untuk menutup modal dan navigasi ke Login
  // Dibungkus useCallback agar referensinya stabil
  const closeModalAndNavigate = useCallback(() => {
    setIsSuccessModalOpen(false);
    navigate("/login");
  }, [navigate]);

  // Efek untuk auto-close modal registrasi setelah 2 detik
  useEffect(() => {
    let timer;
    if (isSuccessModalOpen) {
      timer = setTimeout(() => {
        closeModalAndNavigate();
      }, 2000); // 2 detik
    }
    return () => clearTimeout(timer);
  }, [isSuccessModalOpen, closeModalAndNavigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal harus 8 karakter.");
      return;
    }
    if (!agree) {
      setError(
        "Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/register", {
        name: name,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      });

      console.log("Registration successful:", response.data);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Registration error:", err.response || err.message);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join(" ");
        setError(`Registrasi gagal: ${errorMessages}`);
      } else {
        setError(
          err.response?.data?.message || "Registrasi gagal. Silakan coba lagi."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 overflow-hidden font-sans">
      <div
        className={`w-full max-w-4xl flex rounded-xl shadow-2xl overflow-hidden transition-all duration-700 ease-out transform ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Left side - Gambar dan Teks */}
        <div
          className="w-1/2 p-8 sm:p-12 flex-col items-start justify-center text-white hidden md:flex relative"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <img
            src={Icon}
            alt="Pasifix Icon"
            className="w-28 h-auto mb-6 sm:mb-8"
          />
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-left leading-tight">
            Bergabung dengan Pasifix!
          </h1>
          <p className="text-base lg:text-lg mb-8 text-left leading-relaxed">
            Daftar sekarang untuk mulai menikmati kemudahan berbelanja seafood
            segar berkualitas langsung dari rumah Anda.
          </p>
          <div className="absolute bottom-8 left-8 text-xs opacity-75">
            &copy; {new Date().getFullYear()} Pasifix. All rights reserved.
          </div>
        </div>

        {/* Right side - Form Registrasi */}
        <div className="w-full md:w-1/2 bg-white p-8 sm:p-12 flex flex-col justify-center space-y-5">
          {" "}
          {/* Mengurangi space-y-6 menjadi space-y-5 */}
          <div className="text-center md:hidden mb-6">
            <img
              src={Icon}
              alt="Pasifix Icon"
              className="w-20 h-auto mx-auto"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center">
            Buat Akun Baru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {" "}
            {/* Mengurangi space-y-6 menjadi space-y-4 */}
            {error && (
              <div
                className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md relative shadow-sm"
                role="alert"
              >
                <strong className="font-bold">Oops!</strong>
                <span className="block sm:inline ml-1">{error}</span>
              </div>
            )}
            <div>
              <label
                htmlFor="name"
                className="block text-slate-700 font-semibold mb-1.5"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white placeholder-slate-400"
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>
            <div>
              <label
                htmlFor="email-register" // ID diubah agar unik dari login jika ada di halaman yang sama (meskipun tidak)
                className="block text-slate-700 font-semibold mb-1.5"
              >
                Email
              </label>
              <input
                type="email"
                id="email-register"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white placeholder-slate-400"
                placeholder="contoh@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="password-register" // ID diubah
                className="block text-slate-700 font-semibold mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password-register"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white placeholder-slate-400 pr-12"
                  placeholder="Kata sandi (min. 8 karakter)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-500 hover:text-indigo-600 focus:outline-none"
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="password_confirmation"
                className="block text-slate-700 font-semibold mb-1.5"
              >
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  id="password_confirmation"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  className="w-full px-5 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white placeholder-slate-400 pr-12"
                  placeholder="Konfirmasi kata sandi Anda"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordConfirmation(!showPasswordConfirmation)
                  }
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-500 hover:text-indigo-600 focus:outline-none"
                  aria-label={
                    showPasswordConfirmation
                      ? "Sembunyikan konfirmasi kata sandi"
                      : "Tampilkan konfirmasi kata sandi"
                  }
                >
                  {showPasswordConfirmation ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-start">
              {" "}
              {/* items-start agar checkbox sejajar dengan awal teks */}
              <input
                type="checkbox"
                id="agree-register" // ID diubah
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded" // mt-1 untuk alignment
              />
              <label
                htmlFor="agree-register"
                className="text-sm text-slate-600"
              >
                Saya setuju dengan{" "}
                <Link // Menggunakan Link
                  to="/terms" // Ganti dengan rute yang benar
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Syarat dan Ketentuan
                </Link>{" "}
                serta{" "}
                <Link // Menggunakan Link
                  to="/privacy" // Ganti dengan rute yang benar
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Kebijakan Privasi
                </Link>
                .
              </label>
            </div>
            <button
              type="submit"
              disabled={loading || !agree}
              className={`w-full py-3 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading || !agree
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                "Buat Akun"
              )}
            </button>
            <p className="text-center text-slate-600 text-sm">
              <span>Sudah punya akun? </span>
              <Link // Menggunakan Link
                to="/login" // Ganti dengan rute yang benar
                className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold"
              >
                Masuk di sini
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* === Modal Sukses Registrasi === */}
      <Transition appear show={isSuccessModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50" // z-index lebih tinggi dari login modal jika ada tumpang tindih
          onClose={() => {
            /* Biarkan kosong */
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 backdrop-blur-sm bg-black/30"
              aria-hidden="true"
            />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl sm:text-2xl font-semibold leading-6 text-slate-900 text-center"
                  >
                    Registrasi Berhasil!
                  </Dialog.Title>
                  <div className="mt-5 flex flex-col items-center">
                    <CheckCircleIcon
                      className="h-20 w-20 sm:h-24 sm:w-24 text-green-500 mb-5"
                      aria-hidden="true"
                    />
                    <p className="text-sm sm:text-base text-slate-600 text-center leading-relaxed">
                      Akun Anda telah berhasil dibuat. Anda akan segera
                      diarahkan ke halaman login.
                    </p>
                  </div>
                  {/* Tombol OK bisa dihilangkan jika auto-redirect sudah cukup */}
                  {/* <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 shadow-sm"
                      onClick={closeModalAndNavigate}
                    >
                      OK
                    </button>
                  </div> */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default RegisterPage;

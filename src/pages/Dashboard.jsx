import React, { useEffect } from "react";
import { gsap } from "gsap"; // Import GSAP
import Navbar from "../components/Navbar";
import laptopImage from "../assets/dashboard/LaptopDashboard.png";

function Dashboard() {
  useEffect(() => {
    // GSAP Animations for elements
    gsap.fromTo(
      ".hero-title",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, delay: 0.2 }
    );

    gsap.fromTo(
      ".hero-description",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.4 }
    );

    gsap.fromTo(
      ".hero-buttons",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.6 }
    );

    gsap.fromTo(
      ".hero-image",
      { opacity: 0, x: 100 },
      { opacity: 1, x: 0, duration: 1, delay: 0.8 }
    );
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <section className="relative w-full bg-blue-600 text-white overflow-hidden">
        <div className="container mx-auto px-6 py-24 md:py-32 lg:py-40 relative z-10">
          <div className="max-w-xl lg:max-w-2xl text-center md:text-left relative z-10">
            <h1 className="hero-title text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4">
              Selamat Datang di Dashboard Pasifix!
            </h1>

            <p className="hero-description text-lg lg:text-xl text-blue-100 mb-8">
              Kelola pesanan ikan segar Anda, lihat produk terbaru, dan atur
              profil Anda dengan mudah di sini.
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Lihat Pesanan
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-transparent text-white font-semibold rounded-lg shadow-md border-2 border-white hover:bg-white hover:text-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Jelajahi Produk
              </button>
            </div>
          </div>
        </div>

        <img
          src={laptopImage}
          alt="Ilustrasi Dashboard"
          className="hero-image absolute right-0 bottom-0 w-3/4 sm:w-2/3 md:w-3/5 lg:w-2/5 xl:w-2/5 h-auto opacity-90 z-0 object-contain pointer-events-none"
        />
      </section>

      <main className="flex-grow container mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Aktivitas Terbaru
        </h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">
            Konten dashboard lainnya akan muncul di sini...
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

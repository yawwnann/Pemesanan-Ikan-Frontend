import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
import laptopImage from "../assets/dashboard/LaptopDashboard.png";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import Skeleton from "react-loading-skeleton";
import {
  CheckCircleIcon,
  ShoppingCartIcon,
  TruckIcon,
  TagIcon,
} from "@heroicons/react/24/solid";

function Dashboard() {
  const [ikanList, setIkanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  const fetchIkan = async (page = 1) => {
    try {
      const response = await apiClient.get(`/ikan?page=${page}`);
      setIkanList(response.data.data);
      setPagination(response.data.links);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIkan();
  }, []);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka);
  };

  const viewDetail = (slug) => {
    navigate(`/ikan/${slug}`);
  };

  useEffect(() => {
    gsap.fromTo(
      ".stats-item",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.3 }
    );
  }, []);

  useEffect(() => {
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
              Selamat Datang di Pasifix Seafood!
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

      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          TUJUAN KAMI ADALAH{" "}
          <span className="text-blue-500">MENINGKATKAN </span>
          DAN <span className="text-blue-500">MENGHADIRKAN</span> PRODUK IKAN
          SEGAR
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          <div className="flex flex-col items-center stats-item">
            <span className="text-5xl font-extrabold text-blue-500">
              Rp 12.5M
            </span>
            <p className="text-xl font-medium text-gray-600 mt-2">
              Total Penjualan Ikan 2001 - 2023
            </p>
          </div>

          <div className="flex flex-col items-center stats-item">
            <span className="text-5xl font-extrabold text-black">12K+</span>
            <p className="text-xl font-medium text-gray-600 mt-2">
              Pesanan Ikan Terselesaikan Setiap Hari
            </p>
          </div>

          <div className="flex flex-col items-center stats-item">
            <span className="text-5xl font-extrabold text-black">725+</span>
            <p className="text-xl font-medium text-gray-600 mt-2">
              Toko dan Kantor di Indonesia dan Luar Negeri
            </p>
          </div>

          <div className="flex flex-col items-center stats-item">
            <span className="text-5xl font-extrabold text-black">1M+</span>
            <p className="text-xl font-medium text-gray-600 mt-2">
              Pelanggan Puas di Seluruh Dunia
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Kenapa Memilih Kami?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl transition duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-left font-bold text-gray-800">
                100% PRODUK ASLI
              </h3>
              <div className="bg-blue-500 p-3 rounded-full text-white flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8" />
              </div>
            </div>

            <p className="text-gray-600 text-left">
              Kami hanya menyediakan ikan berkualitas dengan jaminan keaslian
              dan kesegaran yang terjaga.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl transition duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-left font-bold text-gray-800">
                PENGIRIMAN CEPAT
              </h3>
              <div className="bg-blue-500 p-3 rounded-full text-white flex-shrink-0">
                <TruckIcon className="h-8 w-8" />
              </div>
            </div>
            <p className="text-gray-600 text-left">
              Pengiriman cepat dengan berbagai opsi pengiriman, menjamin ikan
              sampai tepat waktu dan dalam kondisi baik.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl transition duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-left text-gray-800">
                HARGA TERJANGKAU
              </h3>
              <div className="bg-blue-500 p-3 rounded-full text-white flex-shrink-0">
                <TagIcon className="h-8 w-8" />
              </div>
            </div>
            <p className="text-gray-600 text-left">
              Menawarkan harga yang kompetitif dan banyak promo khusus untuk
              setiap pembelian ikan segar.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Katalog Ikan
            </h2>
            {ikanList.length > 8 && (
              <div className="text-center mt-12">
                <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                  Lihat Semua Ikan
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                  >
                    <div className="w-full h-48 bg-gray-300"></div>
                    <div className="p-5">
                      <div className="h-6 w-3/4 bg-gray-300 rounded mb-3"></div>
                      <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 w-5/6 bg-gray-300 rounded mb-4"></div>
                      <div className="h-6 w-1/3 bg-gray-300 rounded mb-5"></div>
                      <div className="h-10 w-full bg-gray-400 rounded-lg"></div>
                    </div>
                  </div>
                ))
              : ikanList.slice(0, 8).map((ikan) => (
                  <div
                    key={ikan.id}
                    className="group bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col h-full"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${ikan.gambar_utama}`}
                        alt={ikan.nama}
                        className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                      />
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                        {ikan.nama}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                        {ikan.deskripsi}
                      </p>
                      <p className="text-2xl font-extrabold text-blue-600 mb-4">
                        {formatRupiah(ikan.harga)}
                      </p>
                      <button
                        onClick={() => viewDetail(ikan.slug)}
                        className="mt-auto w-full py-2.5 px-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
                      >
                        <ShoppingCartIcon className="w-5 h-5" />
                        <span>Lihat Detail</span>
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
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

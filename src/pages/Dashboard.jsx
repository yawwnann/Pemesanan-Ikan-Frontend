// src/pages/DashboardPage.jsx
import React from "react";
import Navbar from "../components/Navbar"; // Pastikan path import benar

function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {" "}
      {/* Latar belakang halaman dashboard */}
      {/* 1. Render Navbar di sini */}
      <Navbar />
      {/* 2. Area Konten Utama Dashboard */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Anda bisa menggunakan layout grid, flex, atau lainnya di sini */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* Contoh Konten Dashboard (Placeholder) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Kartu 1 */}
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ringkasan Pesanan
            </h3>
            <p className="text-gray-600">
              Menampilkan jumlah pesanan terbaru atau status pengiriman.
            </p>
            {/* Tambahkan detail atau link */}
          </div>

          {/* Kartu 2 */}
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Produk Populer
            </h3>
            <p className="text-gray-600">
              Menampilkan produk yang sering dilihat atau dibeli.
            </p>
            {/* Tambahkan daftar produk */}
          </div>

          {/* Kartu 3 */}
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Pengaturan Akun
            </h3>
            <p className="text-gray-600">
              Link cepat ke halaman profil atau pengaturan lainnya.
            </p>
            {/* Tambahkan link */}
          </div>

          {/* Tambahkan lebih banyak kartu atau widget sesuai kebutuhan */}
        </div>
      </main>
      {/* (Opsional) Footer bisa ditambahkan di sini */}
      {/* <footer className="bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Pasifix. Hak Cipta Dilindungi.
        </div>
      </footer> */}
    </div>
  );
}

export default DashboardPage;

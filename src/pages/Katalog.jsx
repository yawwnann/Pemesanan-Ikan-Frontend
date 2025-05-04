import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient"; // Pastikan apiClient sudah diatur dengan benar

function Katalog() {
  const [ikanList, setIkanList] = useState([]); // State untuk menampung data ikan
  const [loading, setLoading] = useState(true); // State untuk status loading
  const [pagination, setPagination] = useState({}); // State untuk pagination

  const fetchIkan = async (page = 1) => {
    try {
      const response = await apiClient.get(`/ikan?page=${page}`); // Mengambil data ikan dari API dengan parameter halaman
      setIkanList(response.data.data); // Menyimpan data ikan ke dalam state
      setPagination(response.data.links); // Menyimpan data pagination ke dalam state
      setLoading(false); // Mengubah status loading menjadi false
    } catch (error) {
      console.error("Error fetching data:", error); // Menangani error jika ada
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIkan(); // Mengambil data ikan saat komponen pertama kali dimuat
  }, []); // [] agar hanya dijalankan sekali saat komponen pertama kali dimuat

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Katalog Ikan
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ikanList.map((ikan) => (
              <div key={ikan.id} className="bg-white p-6 rounded-lg shadow-md">
                <img
                  src={`https://res.cloudinary.com/dm3icigfr/image/upload/${ikan.gambar_utama}`} // Sesuaikan URL jika gambar disimpan di Cloudinary
                  alt={ikan.nama}
                  className="w-full h-56 object-cover mb-4 rounded"
                />
                <h3 className="text-xl font-semibold">{ikan.nama}</h3>
                <p className="text-sm text-gray-500">
                  {ikan.deskripsi.slice(0, 50)}...
                </p>
                <p className="text-lg font-bold text-blue-500">
                  {formatRupiah(ikan.harga)}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between mt-8">
            {pagination.prev && (
              <button
                onClick={() => fetchIkan(pagination.prev.split("page=")[1])}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Prev
              </button>
            )}
            {pagination.next && (
              <button
                onClick={() => fetchIkan(pagination.next.split("page=")[1])}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Katalog;

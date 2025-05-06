import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient"; // Pastikan apiClient diimpor jika masih dipakai (misal: di Navbar atau komponen lain)
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon, // Tetap dipakai untuk ikon tombol
  ArrowsUpDownIcon, // Digunakan di select
  FunnelIcon, // Digunakan di select
  // Icon lain yang mungkin diperlukan oleh Navbar atau komponen lain
} from "@heroicons/react/24/outline";
import { cn } from "../lib/utils"; // Pastikan utilitas cn ada atau ganti dengan cara lain untuk menggabungkan class
import Navbar from "../components/Navbar"; // Asumsi Navbar ada di path ini

//==================================================
// Helper Function: Format Rupiah
//==================================================
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

//==================================================
// Custom Hook: useDebounce
//==================================================
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    // Cleanup timeout jika value atau delay berubah sebelum timeout selesai
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

//==================================================
// Komponen: Ikan Card (Versi: Tombol Keranjang Navigasi ke Detail)
//==================================================
function IkanCard({ ikan }) {
  const navigate = useNavigate();

  // Fungsi navigasi
  const viewDetail = (slug) => navigate(`/ikan/${slug}`);

  const statusBadgeColor =
    ikan.status_ketersediaan?.toLowerCase() === "tersedia"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return (
    <div className="ikan-card group bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-md flex flex-col h-full">
      {/* Bagian Gambar dan Badge */}
      <div
        className="relative overflow-hidden cursor-pointer"
        onClick={() => viewDetail(ikan.slug)}
      >
        <img
          src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${ikan.gambar_utama}`}
          alt={ikan.nama}
          className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
          {ikan.kategori && (
            <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded">
              {ikan.kategori.nama}
            </span>
          )}
          {ikan.status_ketersediaan && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${statusBadgeColor}`}
            >
              {ikan.status_ketersediaan}
            </span>
          )}
        </div>
      </div>

      {/* Bagian Teks dan Tombol */}
      <div className="p-4 flex flex-row justify-between items-end flex-grow">
        {/* Teks Nama dan Harga */}
        <div
          className="flex-grow mr-2 cursor-pointer"
          onClick={() => viewDetail(ikan.slug)}
        >
          <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
            {ikan.nama}
          </h3>
          <p className="text-lg font-bold text-blue-700">
            {formatRupiah(ikan.harga)}
          </p>
        </div>

        {/* Tombol Keranjang (Navigasi ke Detail) */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Hindari trigger onClick dari parent div
            viewDetail(ikan.slug); // Panggil fungsi navigasi
          }}
          // Opsional: disable jika stok habis
          // disabled={ikan.status_ketersediaan?.toLowerCase() !== "tersedia"}
          className={cn(
            "flex-shrink-0 p-2 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            // Styling jika disabled (opsional)
            // ikan.status_ketersediaan?.toLowerCase() !== "tersedia"
            //   ? "bg-gray-400 text-gray-700 opacity-50 cursor-not-allowed"
            //   : "bg-blue-600 text-white hover:bg-blue-700"
            // Styling jika selalu aktif:
            "bg-blue-600 text-white hover:bg-blue-700"
          )}
          title="Lihat Detail Item" // Title diubah
        >
          <ShoppingCartIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

//==================================================
// Komponen: Pagination (Versi yang sudah diperbaiki)
//==================================================
function Pagination({ meta, links, onPageChange }) {
  // Terima links jika diperlukan
  if (!meta || meta.last_page <= 1) return null;

  const getPageNumber = (url) => {
    if (!url) return null; // Kembalikan null jika URL tidak ada
    try {
      // Coba parsing URL lengkap
      const parsedUrl = new URL(url);
      return parsedUrl.searchParams.get("page");
    } catch (e) {
      // Jika gagal (mungkin URL relatif), coba ekstrak manual (kurang robust)
      const match = url.match(/[?&]page=(\d+)/);
      if (match && match[1]) {
        return match[1];
      }
      console.error("Could not parse page number from URL:", url, e);
      return null; // Kembalikan null jika parsing gagal
    }
  };

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-10 py-5">
      {/* Info Jumlah Item */}
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Menampilkan <span className="font-medium">{meta.from || 0}</span> -{" "}
          <span className="font-medium">{meta.to || 0}</span> dari{" "}
          <span className="font-medium">{meta.total || 0}</span> hasil
        </p>
      </div>

      {/* Tombol Navigasi Halaman */}
      <div className="flex flex-1 justify-between sm:justify-end space-x-1">
        {links?.map((link, index) => {
          // Gunakan optional chaining pada links
          const pageNumber = getPageNumber(link.url);
          const isDisabled = !link.url;
          const isCurrent = link.active;

          // Tombol Sebelumnya
          if (link.label.includes("Previous")) {
            return (
              <button
                key={`prev-${index}`}
                onClick={() =>
                  !isDisabled && pageNumber && onPageChange(pageNumber)
                }
                disabled={isDisabled}
                className={cn(
                  "relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
                  isDisabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-900 hover:bg-gray-50 focus:bg-gray-100"
                )}
              >
                Sebelumnya
              </button>
            );
          }
          // Tombol Berikutnya
          else if (link.label.includes("Next")) {
            return (
              <button
                key={`next-${index}`}
                onClick={() =>
                  !isDisabled && pageNumber && onPageChange(pageNumber)
                }
                disabled={isDisabled}
                className={cn(
                  "relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
                  isDisabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-900 hover:bg-gray-50 focus:bg-gray-100"
                )}
              >
                Berikutnya
              </button>
            );
          }
          // Tombol Nomor Halaman & Ellipsis
          else if (pageNumber) {
            const currentPage = meta.current_page;
            const lastPage = meta.last_page;
            const pageNum = parseInt(pageNumber, 10);

            // Logika untuk menampilkan nomor halaman (1, last, current +/- 1)
            const shouldShowPage =
              pageNum === 1 ||
              pageNum === lastPage ||
              Math.abs(pageNum - currentPage) <= 1;

            // Logika untuk menampilkan ellipsis (...)
            const shouldShowEllipsis = Math.abs(pageNum - currentPage) === 2;

            if (shouldShowPage) {
              return (
                <button
                  key={`page-${link.label}-${index}`}
                  onClick={() => !isCurrent && onPageChange(pageNumber)}
                  disabled={isCurrent}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "relative hidden items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 md:inline-flex",
                    isCurrent
                      ? "z-10 bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-default"
                      : "text-gray-900 hover:bg-gray-50 focus:bg-gray-100"
                  )}
                >
                  {link.label.replace(/&laquo;|&raquo;/g, "").trim()}
                </button>
              );
            } else if (shouldShowEllipsis) {
              // Pastikan hanya satu ellipsis yang muncul di antara grup angka
              const prevLink = links[index - 1];
              const prevPageNum = prevLink
                ? parseInt(getPageNumber(prevLink.url) || "0", 10)
                : 0;
              const nextLink = links[index + 1];
              const nextPageNum = nextLink
                ? parseInt(getPageNumber(nextLink.url) || "0", 10)
                : 0;

              // Cek apakah angka sebelumnya atau sesudahnya juga ellipsis atau angka yg jauh
              if (
                Math.abs(pageNum - prevPageNum) > 1 &&
                Math.abs(pageNum - nextPageNum) > 1
              ) {
                return (
                  <span
                    key={`ellipsis-${pageNum}-${index}`}
                    className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 md:inline-flex"
                  >
                    ...
                  </span>
                );
              }
            }
            return null; // Jangan render angka halaman yang tidak perlu
          }
          return null; // Jangan render link yang tidak valid
        })}
      </div>
    </nav>
  );
}

//==================================================
// Komponen Utama Halaman Katalog
//==================================================
function KatalogPage() {
  const [ikanList, setIkanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationData, setPaginationData] = useState({
    meta: null,
    links: [],
  }); // Inisialisasi state pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("terbaru"); // Default sort
  const [selectedAvailability, setSelectedAvailability] = useState(""); // Default filter
  const debouncedSearch = useDebounce(searchQuery, 500); // Debounce pencarian

  // --- Komponen Skeleton Card ---
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // --- Fungsi Fetch Data Katalog ---
  const fetchKatalog = async (page, search, sort, availability) => {
    setLoading(true);
    setError(null);
    const params = { page };
    if (search) params.q = search; // Parameter 'q' untuk search query

    // Logika parameter sort & order
    if (sort === "harga_asc") {
      params.sort = "harga";
      params.order = "asc";
    } else if (sort === "harga_desc") {
      params.sort = "harga";
      params.order = "desc";
    } else {
      // Default sort 'terbaru'
      params.sort = "created_at";
      params.order = "desc";
    }

    if (availability) params.status_ketersediaan = availability;

    console.log("Fetching /ikan with params:", params);
    // Di dalam fungsi fetchKatalog:
    try {
      const response = await apiClient.get("/ikan", { params });
      if (
        response.data &&
        response.data.data &&
        response.data.meta /*&& response.data.links*/
      ) {
        // Anda bisa hapus cek response.data.links di sini jika mau memastikan nilainya di bawah
        setIkanList(response.data.data);
        setPaginationData({
          meta: response.data.meta,
          // PERBAIKAN: Pastikan links adalah array. Jika tidak, gunakan array kosong.
          links: Array.isArray(response.data.links) ? response.data.links : [],
        });
      } else {
        console.error("Format data ikan tidak sesuai:", response.data);
        setIkanList([]);
        // Pastikan reset juga menggunakan array kosong untuk links
        setPaginationData({ meta: null, links: [] });
        setError("Format data dari server tidak sesuai.");
      }
    } catch (err) {
      console.error("Gagal memuat katalog:", err.response || err);
      setError("Gagal memuat data ikan. Silakan coba lagi nanti.");
      setIkanList([]);
      // Pastikan reset juga menggunakan array kosong untuk links
      setPaginationData({ meta: null, links: [] });
    } finally {
      setLoading(false);
    }
  };

  // --- UseEffect untuk fetch data saat dependencies berubah ---
  useEffect(() => {
    // Buat fungsi async di dalam useEffect atau panggil fungsi async
    const loadData = async () => {
      await fetchKatalog(
        currentPage,
        debouncedSearch,
        selectedSort,
        selectedAvailability
      );
    };
    loadData();
  }, [currentPage, debouncedSearch, selectedSort, selectedAvailability]); // Dependensi fetch

  // --- UseEffect untuk reset ke halaman 1 saat filter/pencarian berubah ---
  useEffect(() => {
    // Hanya reset jika halaman saat ini bukan 1
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedSort, selectedAvailability]); // Dependensi filter/search

  // --- Handler untuk perubahan halaman ---
  const handlePageChange = (page) => {
    const pageNum = parseInt(page, 10);
    // Validasi nomor halaman
    if (
      !isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= (paginationData?.meta?.last_page || 1) &&
      pageNum !== currentPage
    ) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll ke atas
    } else if (isNaN(pageNum)) {
      console.warn("Invalid page number requested (NaN):", page);
    }
  };

  // --- Render JSX Komponen KatalogPage ---
  return (
    <div className="bg-gray-50 min-h-screen">
      {" "}
      {/* Background abu-abu muda */}
      <Navbar /> {/* Render Navbar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Halaman dan Kontrol Filter/Search */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Katalog Ikan
            </h1>
          </div>
          {/* Kontrol Filter dan Search */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
            {/* Input Search */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-48 md:w-56">
              <input
                type="text"
                placeholder="Cari nama ikan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {/* Select Sort */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-40 md:w-48">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                aria-label="Urutkan berdasarkan"
              >
                <option value="terbaru">Terbaru</option>
                <option value="harga_asc">Harga Terendah</option>
                <option value="harga_desc">Harga Tertinggi</option>
              </select>
              {/* Ikon dropdown */}
              <svg
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
            {/* Select Availability */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-40 md:w-48">
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                aria-label="Filter berdasarkan ketersediaan"
              >
                <option value="">Semua Status</option>
                <option value="tersedia">Tersedia</option>
                <option value="habis">Habis</option>
              </select>
              {/* Ikon dropdown */}
              <svg
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Pesan Error */}
        {error && (
          <div
            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-md"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {/* Grid Daftar Ikan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {loading
            ? // Tampilkan Skeleton saat loading
              Array.from({ length: paginationData?.meta?.per_page || 12 }).map(
                (_, index) => <SkeletonCard key={`skeleton-${index}`} />
              )
            : ikanList.length > 0
            ? // Tampilkan IkanCard jika ada data
              ikanList.map((ikan) => <IkanCard key={ikan.id} ikan={ikan} />)
            : // Tampilkan pesan jika tidak ada data (dan tidak error)
              !error && (
                <p className="col-span-full text-center text-gray-500 py-10">
                  Tidak ada ikan yang cocok dengan pencarian/filter Anda.
                </p>
              )}
        </div>

        {/* Komponen Pagination */}
        {!loading &&
          paginationData?.meta &&
          paginationData.meta.total > (paginationData.meta.per_page || 0) && (
            <Pagination
              meta={paginationData.meta}
              links={paginationData.links} // Kirim links ke komponen Pagination
              onPageChange={handlePageChange}
            />
          )}
      </div>
      {/* Footer bisa ditambahkan di sini jika perlu */}
      {/* <Footer /> */}
    </div>
  );
}

export default KatalogPage;

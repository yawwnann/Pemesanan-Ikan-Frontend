import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { cn } from "../lib/utils"; // Pastikan path ini benar
import Navbar from "../components/Navbar";

// Helper Function: Format Rupiah (Tetap sama)
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

// Custom Hook: useDebounce (Tetap sama)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Komponen: Ikan Card (Tetap sama)
function IkanCard({ ikan }) {
  const navigate = useNavigate();
  const viewDetail = (slug) => navigate(`/ikan/${slug}`);
  const statusBadgeColor =
    ikan.status_ketersediaan?.toLowerCase() === "tersedia"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  return (
    <div className="ikan-card group bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col h-full transform hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${ikan.gambar_utama}`}
          alt={ikan.nama}
          className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          loading="lazy"
        />
        {ikan.kategori && (
          <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full z-10">
            {ikan.kategori.nama}
          </span>
        )}
        {ikan.status_ketersediaan && (
          <span
            className={`absolute top-2 right-2 text-xs font-bold px-2.5 py-0.5 rounded-full z-10 ${statusBadgeColor}`}
          >
            {ikan.status_ketersediaan}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {ikan.nama}
        </h3>
        <div className="text-sm text-gray-500 mb-3">
          Stok: {ikan.stok ?? "-"}
        </div>
        <p className="text-xl font-extrabold text-blue-600 mb-4">
          {formatRupiah(ikan.harga)}
        </p>
        <button
          onClick={() => viewDetail(ikan.slug)}
          disabled={ikan.status_ketersediaan?.toLowerCase() !== "tersedia"}
          className={`mt-auto w-full py-2.5 px-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500`}
        >
          <ShoppingCartIcon className="w-5 h-5" />
          <span>Lihat Detail</span>
        </button>
      </div>
    </div>
  );
}

// Komponen: Pagination (Tetap sama)
function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;
  const getPageNumber = (url) => {
    if (!url) return;
    try {
      const p = new URL(url);
      return p.searchParams.get("page");
    } catch {
      console.error("Invalid URL for pagination:", url);
      return null;
    }
  };

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-10 py-5">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Menampilkan <span className="font-medium">{meta.from || 0}</span> -{" "}
          <span className="font-medium">{meta.to || 0}</span> dari{" "}
          <span className="font-medium">{meta.total || 0}</span> hasil
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end space-x-1">
        {meta.links?.map((link, index) => {
          const pageNumber = getPageNumber(link.url);
          const isDisabled = !link.url;
          const isCurrent = link.active;
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
          } else if (link.label.includes("Next")) {
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
          } else if (pageNumber) {
            const currentPage = meta.current_page;
            const lastPage = meta.last_page;
            const pageNum = parseInt(pageNumber, 10);
            if (
              pageNum === 1 ||
              pageNum === lastPage ||
              Math.abs(pageNum - currentPage) <= 1
            ) {
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
            } else if (Math.abs(pageNum - currentPage) === 2) {
              return (
                <span
                  key={`ellipsis-${pageNum}-${index}`}
                  className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 md:inline-flex"
                >
                  ...
                </span>
              );
            }
            return null;
          }
          return null;
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
  const [paginationData, setPaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("terbaru");
  const [selectedAvailability, setSelectedAvailability] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Modifikasi fetchKatalog untuk menerima parameter & logging
  const fetchKatalog = async (page, search, sort, availability) => {
    setLoading(true);
    setError(null);
    const params = { page };

    if (search) params.q = search;
    if (sort) {
      if (sort === "harga_asc") {
        params.sort = "harga";
        params.order = "asc";
      } else if (sort === "harga_desc") {
        params.sort = "harga";
        params.order = "desc";
      } else {
        params.sort = "created_at";
        params.order = "desc";
      }
    }
    if (availability) params.status_ketersediaan = availability;

    console.log("Fetching /ikan with params:", params); // Log parameter yang dikirim

    try {
      const response = await apiClient.get("/ikan", { params });
      if (response.data && response.data.data) {
        setIkanList(response.data.data);
        setPaginationData(response.data);
      } else {
        setIkanList([]);
        setPaginationData(null);
        console.error("Format data ikan tidak sesuai:", response.data);
      }
    } catch (err) {
      console.error("Gagal memuat katalog:", err);
      setError("Gagal memuat data ikan. Silakan coba lagi nanti.");
      setIkanList([]);
      setPaginationData(null);
    } finally {
      setLoading(false);
    }
  };

  // Modifikasi useEffect utama untuk memanggil fetchKatalog dengan parameter terbaru
  useEffect(() => {
    // Panggil fetch dengan state saat ini
    fetchKatalog(
      currentPage,
      debouncedSearch,
      selectedSort,
      selectedAvailability
    );
    // Hapus scroll ke atas di sini untuk sementara, fokus pada trigger fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, selectedSort, selectedAvailability]);

  // Efek untuk mereset ke halaman 1 saat filter/sort/search berubah
  useEffect(() => {
    // Hanya reset jika bukan halaman 1
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // Jangan tambahkan currentPage ke dependency array ini
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedSort, selectedAvailability]);

  const handlePageChange = (page) => {
    const pageNum = parseInt(page, 10);
    if (
      !isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= paginationData?.meta?.last_page
    ) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Pindahkan scroll ke sini
    } else {
      console.warn("Invalid page number requested:", page);
    }
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-300"></div>
      <div className="p-5">
        <div className="h-6 w-3/4 bg-gray-300 rounded mb-3"></div>
        <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
        <div className="h-4 w-5/6 bg-gray-300 rounded mb-4"></div>
        <div className="h-6 w-1/3 bg-gray-300 rounded mb-5"></div>
        <div className="h-10 w-full bg-gray-400 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">
          Katalog Ikan Segar
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-white rounded-lg shadow">
          <div className="relative md:col-span-1">
            <input
              type="text"
              placeholder="Cari ikan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="relative md:col-span-1">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="appearance-none w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="terbaru">Urutkan: Terbaru</option>
              <option value="harga_asc">Urutkan: Harga Terendah</option>
              <option value="harga_desc">Urutkan: Harga Tertinggi</option>
            </select>
            <ClockIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative md:col-span-1">
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="appearance-none w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Filter: Semua</option>
              <option value="tersedia">Filter: Tersedia</option>
              <option value="habis">Filter: Habis</option>
            </select>
            <CheckBadgeIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-md">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {loading
            ? Array.from({ length: paginationData?.meta?.per_page || 8 }).map(
                (_, index) => <SkeletonCard key={`skeleton-${index}`} />
              )
            : ikanList.length > 0
            ? ikanList.map((ikan) => <IkanCard key={ikan.id} ikan={ikan} />)
            : !error && (
                <p className="col-span-full text-center text-gray-500 py-10">
                  Tidak ada ikan yang cocok dengan pencarian/filter Anda.
                </p>
              )}
        </div>

        {!loading && paginationData?.meta && paginationData.meta.total > 0 && (
          <Pagination
            meta={paginationData.meta}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default KatalogPage;

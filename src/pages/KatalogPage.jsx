import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient"; // Sesuaikan path
import { useNavigate, Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ArrowPathIcon, // Ikon untuk loading add to cart
} from "@heroicons/react/24/solid"; // Menggunakan solid untuk konsistensi ikon aksi
import {
  ArrowsUpDownIcon,
  FunnelIcon,
  CheckBadgeIcon, // Mungkin tidak terpakai, tapi biarkan jika Pagination butuh
  ClockIcon, // Mungkin tidak terpakai, tapi biarkan jika Pagination butuh
} from "@heroicons/react/24/outline";
import { cn } from "../lib/utils"; // Sesuaikan path

// Helper Function: Format Rupiah
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

// Custom Hook: useDebounce
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

// Komponen: Ikan Card (Dengan Fungsi Add to Cart Terimplementasi)
function IkanCard({ ikan }) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const viewDetail = (slug) => navigate(`/ikan/${slug}`);
  const statusBadgeColor =
    ikan.status_ketersediaan?.toLowerCase() === "tersedia"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    setFeedback({ type: "", message: "" });

    try {
      await apiClient.post("/keranjang", { ikan_id: ikan.id, quantity: 1 });
      setFeedback({ type: "success", message: `${ikan.nama} ditambahkan!` });
      setTimeout(() => setFeedback({ type: "", message: "" }), 2500);
      // Opsional: Update global state/trigger notifikasi lain
    } catch (err) {
      console.error("Gagal menambah ke keranjang:", err);
      let errorMessage = "Gagal menambah ke keranjang.";
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        errorMessage = "Silakan login untuk menambah item.";
      } else if (err.response && err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
      setFeedback({ type: "error", message: errorMessage });
      setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="ikan-card group bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-md flex flex-col h-full relative">
      {feedback.message && (
        <div
          className={`absolute inset-x-0 top-0 z-20 p-2 text-center text-xs font-medium transition-all duration-300 ${
            feedback.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {feedback.message}
        </div>
      )}
      <div
        className="relative overflow-hidden cursor-pointer"
        onClick={() => viewDetail(ikan.slug)}
      >
        <img
          src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${ikan.gambar_utama}`}
          alt={ikan.nama}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
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
        <button
          onClick={handleAddToCart}
          disabled={
            ikan.status_ketersediaan?.toLowerCase() !== "tersedia" || isAdding
          }
          className="absolute bottom-2 right-2 z-10 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          title="Tambah ke Keranjang"
        >
          {isAdding ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <ShoppingCartIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      <div
        className="p-4 flex flex-col flex-grow cursor-pointer"
        onClick={() => viewDetail(ikan.slug)}
      >
        <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
          {ikan.nama}
        </h3>
        <p className="text-lg font-bold text-blue-700 mt-auto pt-2">
          {formatRupiah(ikan.harga)}
        </p>
      </div>
    </div>
  );
}

// Komponen: Pagination
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

// Komponen Utama Halaman Katalog
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

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

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
    console.log("Fetching /ikan with params:", params);
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

  useEffect(() => {
    fetchKatalog(
      currentPage,
      debouncedSearch,
      selectedSort,
      selectedAvailability
    );
  }, [currentPage, debouncedSearch, selectedSort, selectedAvailability]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, selectedSort, selectedAvailability]);

  const handlePageChange = (page) => {
    const pageNum = parseInt(page, 10);
    if (
      !isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= paginationData?.meta?.last_page
    ) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      console.warn("Invalid page number requested:", page);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Katalog Ikan
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-none md:w-64">
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="relative flex-grow md:flex-none">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="terbaru">Terbaru</option>
                <option value="harga_asc">Harga ↑</option>
                <option value="harga_desc">Harga ↓</option>
              </select>
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
            <div className="relative flex-grow md:flex-none">
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Semua</option>
                <option value="tersedia">Tersedia</option>
                <option value="habis">Habis</option>
              </select>
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

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-md">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {loading
            ? Array.from({ length: paginationData?.meta?.per_page || 12 }).map(
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

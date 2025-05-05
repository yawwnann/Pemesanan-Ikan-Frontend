import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Hapus Link jika tidak dipakai
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";
import Footer from "../ui/Footer"; // Sesuaikan path jika perlu
import {
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
// Hapus import cn jika tidak dipakai (tidak dipakai di kode ini)
// import { cn } from '../lib/utils';

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

// Komponen: Ikan Card (Untuk Produk Terkait)
// Pastikan komponen ini didefinisikan dengan benar
function IkanCard({ ikan }) {
  const navigate = useNavigate();
  const viewDetail = (slug) => navigate(`/ikan/${slug}`); // Pergi ke detail ikan yang diklik
  const statusBadgeColor =
    ikan.status_ketersediaan?.toLowerCase() === "tersedia"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  const handleSimpleAddToCart = (e) => {
    e.stopPropagation();
    alert(`Tambah ${ikan.nama} (dari related) (belum implementasi)`);
  };

  return (
    // Pastikan className dan struktur di sini benar
    <div className="ikan-card group bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-md flex flex-col h-full">
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
      </div>
      <div className="p-4 flex flex-row justify-between items-end flex-grow">
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
        <button
          onClick={handleSimpleAddToCart}
          disabled={ikan.status_ketersediaan?.toLowerCase() !== "tersedia"}
          className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          title="Tambah ke Keranjang"
        >
          <ShoppingCartIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Komponen Loading Detail (Skeleton)
// Pastikan tidak ada typo atau tag tidak tertutup di sini
const DetailLoadingSkeleton = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse">
    <div className="mb-6 h-5 w-1/4 bg-gray-300 rounded"></div>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 lg:gap-16">
      <div className="md:col-span-2 w-full aspect-w-1 aspect-h-1 bg-gray-300 rounded-lg"></div>
      <div className="md:col-span-3">
        <div className="h-4 w-1/3 bg-gray-300 rounded mb-3"></div>
        <div className="h-8 w-3/4 bg-gray-300 rounded mb-4"></div>
        <div className="h-10 w-1/2 bg-gray-300 rounded mb-6"></div>
        <div className="h-5 w-1/4 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <div className="h-10 w-24 bg-gray-300 rounded"></div>
          <div className="h-12 w-48 bg-gray-400 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
); // Pastikan kurung tutup ada dan benar

// Komponen Loading Card (Skeleton) untuk related items
// Pastikan tidak ada typo atau tag tidak tertutup di sini
const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
    </div>
  </div>
); // Pastikan kurung tutup ada dan benar

// Komponen Utama Halaman Detail Ikan
function DetailIkanPage() {
  const [ikanDetail, setIkanDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedIkanList, setRelatedIkanList] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);

  const { slug } = useParams();
  const navigate = useNavigate();

  // Fetch data detail ikan utama
  useEffect(() => {
    const fetchDetailIkan = async () => {
      setLoading(true);
      setError(null);
      setIkanDetail(null);
      setRelatedIkanList([]);
      try {
        const response = await apiClient.get(`/ikan/${slug}`);
        if (response.data && response.data.data) {
          setIkanDetail(response.data.data);
        } else {
          setError("Data ikan tidak ditemukan atau format tidak sesuai.");
        }
      } catch (err) {
        console.error(`Gagal memuat detail ikan (slug: ${slug}):`, err);
        if (err.response && err.response.status === 404) {
          setError("Ikan yang Anda cari tidak ditemukan.");
        } else {
          setError("Gagal memuat data ikan. Silakan coba lagi nanti.");
        }
      } finally {
        setLoading(false);
      }
    }; // Pastikan kurung kurawal tertutup
    if (slug) {
      fetchDetailIkan();
    } else {
      setError("Slug ikan tidak ditemukan di URL.");
      setLoading(false);
    }
  }, [slug]); // Pastikan kurung siku tertutup

  // Fetch data ikan terkait
  useEffect(() => {
    const fetchRelatedIkan = async (categorySlug, currentIkanId) => {
      if (!categorySlug) return;
      setRelatedLoading(true);
      setRelatedError(null);
      try {
        const response = await apiClient.get(
          `/ikan?kategori_slug=${categorySlug}&limit=5`
        );
        if (response.data && response.data.data) {
          const relatedItems = response.data.data
            .filter((ikan) => ikan.id !== currentIkanId)
            .slice(0, 4);
          setRelatedIkanList(relatedItems);
        } else {
          setRelatedIkanList([]);
        }
      } catch (err) {
        console.error("Gagal memuat ikan terkait:", err);
        setRelatedError("Gagal memuat produk serupa.");
        setRelatedIkanList([]);
      } finally {
        setRelatedLoading(false);
      }
    }; // Pastikan kurung kurawal tertutup

    if (ikanDetail && ikanDetail.kategori?.slug && ikanDetail.id) {
      fetchRelatedIkan(ikanDetail.kategori.slug, ikanDetail.id);
    }
  }, [ikanDetail]); // Pastikan kurung siku tertutup

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };
  const handleAddToCart = () => {
    if (!ikanDetail) return;
    alert(
      `Menambahkan ${quantity} x ${ikanDetail.nama} ke keranjang (belum implementasi)`
    );
  };

  // --- Render ---
  if (loading) {
    return (
      <>
        {" "}
        <Navbar /> <DetailLoadingSkeleton /> <Footer />{" "}
      </>
    );
  }
  if (error) {
    /* ... render error (pastikan JSX valid) ... */
  }
  if (!ikanDetail) {
    /* ... render fallback (pastikan JSX valid) ... */
  }

  const isAvailable =
    ikanDetail.status_ketersediaan?.toLowerCase() === "tersedia";

  // Pastikan semua return JSX di bawah ini valid
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" /> Kembali
          </button>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 lg:gap-16">
            <div className="md:col-span-2 w-full aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden shadow-md">
              <img
                src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_600,h_600,c_fill,q_auto,f_auto/${ikanDetail.gambar_utama}`}
                alt={ikanDetail.nama}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:col-span-3 flex flex-col">
              {ikanDetail.kategori && (
                <span className="text-sm font-medium text-blue-600 mb-2 inline-block">
                  {ikanDetail.kategori.nama}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {ikanDetail.nama}
              </h1>
              <p className="text-3xl font-bold text-blue-700 mb-5">
                {formatRupiah(ikanDetail.harga)}
              </p>
              <div className="flex items-center space-x-4 mb-5">
                {isAvailable ? (
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-4 w-4 mr-1.5" /> Tersedia
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="h-4 w-4 mr-1.5" /> Habis
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Stok: {ikanDetail.stok ?? "Tidak diketahui"}
                </span>
              </div>
              <div className="text-gray-700 leading-relaxed mb-8 prose prose-sm sm:prose-base max-w-none">
                <p>{ikanDetail.deskripsi || "Deskripsi tidak tersedia."}</p>
              </div>
              <div className="mt-auto pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg w-full sm:w-auto">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Kurangi Kuantitas"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-16 text-center border-l border-r border-gray-300 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      aria-label="Kuantitas"
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Tambah Kuantitas"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className="flex-grow inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400 transition-colors"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2" /> Tambah ke
                    Keranjang
                  </button>
                </div>
              </div>
            </div>
          </div>

          {(relatedIkanList.length > 0 || relatedLoading) && (
            <section className="mt-16 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Produk Serupa{" "}
                {ikanDetail.kategori ? `di ${ikanDetail.kategori.nama}` : ""}
              </h2>
              {relatedError && (
                <p className="text-red-600 mb-4">{relatedError}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {relatedLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <SkeletonCard key={`related-skeleton-${index}`} />
                    ))
                  : relatedIkanList.map((ikan) => (
                      <IkanCard key={`related-${ikan.id}`} ikan={ikan} />
                    ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  ); // Pastikan return utama juga tertutup benar
} // Pastikan function komponen tertutup benar

export default DetailIkanPage; // Pastikan export ada dan benar

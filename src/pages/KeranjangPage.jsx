import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../api/apiClient"; // Sesuaikan path
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingCartIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  InformationCircleIcon,
  CreditCardIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InboxIcon, // Ikon untuk keranjang kosong
  ArrowUturnLeftIcon, // Ikon untuk kembali
} from "@heroicons/react/24/outline";
import { cn } from "../lib/utils"; // Pastikan path ini benar

const formatRupiah = (angka) => {
  const number = typeof angka === "string" ? parseInt(angka, 10) : angka;
  if (isNaN(number) || number === null || number === undefined) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

// Komponen Skeleton Loader untuk item keranjang
const CartItemSkeleton = () => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-5 border-b border-slate-200 animate-pulse">
    <div className="flex items-center space-x-4 flex-grow min-w-0 w-full sm:w-auto mb-4 sm:mb-0">
      <div className="w-20 h-20 bg-slate-200 rounded-md flex-shrink-0"></div>
      <div className="flex-grow min-w-0">
        <div className="h-5 w-3/5 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 w-2/5 bg-slate-200 rounded"></div>
      </div>
    </div>
    <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
      <div className="flex items-center border border-slate-200 rounded-md">
        <div className="p-3 bg-slate-200 h-10"></div> {/* Tombol minus */}
        <div className="px-5 py-2.5 bg-slate-200 border-l border-r h-10"></div>{" "}
        {/* Input qty */}
        <div className="p-3 bg-slate-200 h-10"></div> {/* Tombol plus */}
      </div>
      <div className="h-5 w-24 bg-slate-200 rounded hidden sm:block"></div>{" "}
      {/* Subtotal */}
      <div className="h-8 w-8 bg-slate-200 rounded-md"></div>{" "}
      {/* Tombol hapus */}
    </div>
  </div>
);

function KeranjangPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartSpecificError, setCartSpecificError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const navigate = useNavigate();

  const fetchCartItems = async (showMainLoading = true) => {
    if (showMainLoading) setLoading(true);
    setError(null);
    setCartSpecificError(null);
    try {
      const response = await apiClient.get("/keranjang");
      let items = [];
      if (response.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback jika API Anda mengembalikan array langsung
        items = response.data;
      } else {
        console.warn(
          "Format data keranjang tidak sesuai atau data kosong:",
          response.data
        );
      }
      setCartItems(items);
    } catch (err) {
      console.error("Gagal memuat keranjang:", err);
      let errorMessage = "Gagal memuat data keranjang. Coba lagi nanti.";
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage =
            "Sesi Anda berakhir atau Anda tidak memiliki izin. Silakan login kembali.";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      setError(errorMessage);
      setCartItems([]);
    } finally {
      if (showMainLoading) setLoading(false);
      setUpdatingItemId(null);
      setRemovingItemId(null);
    }
  };

  useEffect(() => {
    fetchCartItems(true);
  }, []);

  // Untuk mengupdate keranjang dari event luar (misal setelah add to cart di IkanCard)
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartItems(false); // Fetch ulang tanpa main loading
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const totalHarga = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const harga = parseInt(item?.ikan?.harga, 10) || 0;
      const quantity = item?.quantity ?? 0;
      return total + harga * quantity;
    }, 0);
  }, [cartItems]);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    const quantityNum = Math.max(1, parseInt(newQuantity, 10)); // Kuantitas minimal 1
    const currentItem = cartItems.find((item) => item.id === cartItemId);

    // Hindari update jika kuantitas tidak berubah
    if (currentItem && currentItem.quantity === quantityNum) return;

    setUpdatingItemId(cartItemId);
    setCartSpecificError(null);
    try {
      await apiClient.put(`/keranjang/${cartItemId}`, {
        quantity: quantityNum,
      });
      await fetchCartItems(false); // Refresh keranjang tanpa full page loading
    } catch (err) {
      console.error(`Gagal update kuantitas item ${cartItemId}:`, err);
      setCartSpecificError(
        err.response?.data?.message || "Gagal update kuantitas."
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (cartItemId, itemName) => {
    const displayNama = itemName || "item ini";
    if (
      window.confirm(
        `Anda yakin ingin menghapus ${displayNama} dari keranjang?`
      )
    ) {
      setRemovingItemId(cartItemId);
      setCartSpecificError(null);
      try {
        await apiClient.delete(`/keranjang/${cartItemId}`);
        await fetchCartItems(false); // Refresh keranjang tanpa full page loading
      } catch (err) {
        console.error(`Gagal hapus item ${cartItemId}:`, err);
        setCartSpecificError(
          err.response?.data?.message || "Gagal menghapus item."
        );
      } finally {
        setRemovingItemId(null);
      }
    }
  };

  const handleCheckout = () => {
    setCartSpecificError(null);
    // Cek ulang ketersediaan sebelum checkout
    const unavailableItems = cartItems.filter(
      (item) =>
        !item.ikan ||
        item.ikan.status_ketersediaan?.toLowerCase() !== "tersedia"
    );

    if (unavailableItems.length > 0) {
      const itemNames = unavailableItems
        .map(
          (item) =>
            item.ikan?.nama_ikan || item.ikan?.nama || "Item tidak dikenal"
        )
        .join(", ");
      setCartSpecificError(
        `Item berikut mungkin tidak tersedia atau stoknya habis: ${itemNames}. Harap perbarui keranjang Anda.`
      );
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col font-sans">
      {/* Navbar bisa diletakkan di MainLayout jika ada */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Keranjang Belanja
          </h1>
          {!loading && cartItems.length > 0 && (
            <p className="text-sm md:text-base text-slate-600">
              Total{" "}
              <span className="font-semibold text-slate-800">
                {cartItems.length}
              </span>{" "}
              jenis ikan di keranjang Anda.
            </p>
          )}
        </div>

        {/* Pesan Error Global */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-md">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">
                  Terjadi Kesalahan
                </h3>
                <p className="text-sm">{error}</p>
                {(error.includes("login") || error.includes("Sesi")) && (
                  <button
                    onClick={() =>
                      navigate("/login", { state: { from: "/keranjang" } })
                    }
                    className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  >
                    Login Sekarang
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pesan Error Spesifik Keranjang */}
        {cartSpecificError && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-md shadow-md">
            <div className="flex items-start">
              <InformationCircleIcon className="h-6 w-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900">Perhatian</h3>
                <p className="text-sm">{cartSpecificError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
          ) : cartItems.length === 0 && !error ? ( // Tambahkan !error agar tidak tampil jika ada error global
            <div className="text-center p-10 py-16 md:py-24">
              <InboxIcon className="mx-auto h-16 w-16 md:h-20 md:w-20 text-slate-300" />
              <h3 className="mt-4 text-xl md:text-2xl font-semibold text-slate-800">
                Keranjang Anda Masih Kosong
              </h3>
              <p className="mt-2 text-sm md:text-base text-slate-500 max-w-md mx-auto">
                Ayo temukan ikan segar berkualitas dan tambahkan ke keranjang
                belanja Anda!
              </p>
              <Link
                to="/katalog"
                className="inline-flex items-center mt-8 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2 -ml-1" />
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-slate-200">
              {cartItems.map((item) => {
                const isUpdatingThisItem = updatingItemId === item.id;
                const isRemovingThisItem = removingItemId === item.id;
                const currentItemLoading =
                  isUpdatingThisItem || isRemovingThisItem;
                const isItemAvailable =
                  item.ikan?.status_ketersediaan?.toLowerCase() === "tersedia";
                const itemName =
                  item.ikan?.nama_ikan ||
                  item.ikan?.nama ||
                  "Nama Ikan Tidak Tersedia";
                const itemPrice = parseInt(item.ikan?.harga, 10) || 0;
                const itemImage = item.ikan?.gambar_utama;
                const itemSlug = item.ikan?.slug || item.ikan?.id;

                return (
                  <li
                    key={item.id}
                    className={cn(
                      "px-4 py-5 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4 transition-opacity duration-300",
                      currentItemLoading &&
                        "opacity-60 bg-slate-50 pointer-events-none",
                      !isItemAvailable && item.ikan && "bg-red-50/50" // Background merah samar jika tidak tersedia
                    )}
                  >
                    {/* Detail Item (Gambar, Nama, Harga Satuan) */}
                    <div className="flex items-center space-x-4 flex-grow min-w-0 w-full sm:w-auto">
                      <Link
                        to={itemSlug ? `/ikan/${itemSlug}` : "#"}
                        className="flex-shrink-0"
                      >
                        <img
                          src={
                            itemImage
                              ? `https://res.cloudinary.com/dm3icigfr/image/upload/w_120,h_120,c_fill,q_auto,f_auto/${itemImage}`
                              : "https://placehold.co/120x120/e2e8f0/94a3b8?text=Gbr"
                          }
                          alt={itemName}
                          className="w-20 h-20 rounded-lg object-cover bg-slate-200 shadow-sm hover:ring-2 hover:ring-blue-500 transition-all"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/120x120/fecaca/991b1b?text=Err";
                          }}
                        />
                      </Link>
                      <div className="flex-grow min-w-0">
                        <Link
                          to={itemSlug ? `/ikan/${itemSlug}` : "#"}
                          className="text-sm sm:text-base font-semibold text-slate-800 hover:text-blue-600 truncate transition-colors block leading-tight"
                        >
                          {itemName}
                        </Link>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                          {formatRupiah(itemPrice)}
                        </p>
                        {!isItemAvailable && item.ikan && (
                          <p className="text-xs text-red-600 font-semibold mt-1 rounded-full bg-red-100 px-2 py-0.5 inline-block">
                            Stok Habis
                          </p>
                        )}
                        {/* Subtotal di mobile */}
                        <p className="text-sm font-semibold text-slate-700 mt-2 sm:hidden">
                          Subtotal:{" "}
                          <span className="text-blue-600">
                            {formatRupiah(itemPrice * item.quantity)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Kontrol Kuantitas, Subtotal (Desktop), Hapus */}
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center border border-slate-300 rounded-md shadow-sm">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || currentItemLoading}
                          className="px-2.5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                          aria-label="Kurangi jumlah item"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span
                          className={cn(
                            "px-3 text-sm font-medium border-l border-r border-slate-300 w-12 text-center h-full flex items-center justify-center leading-none py-2.5",
                            isUpdatingThisItem
                              ? "animate-pulse text-transparent bg-slate-100"
                              : "text-slate-800"
                          )}
                        >
                          {isUpdatingThisItem ? ".." : item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={currentItemLoading || !isItemAvailable}
                          className="px-2.5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                          aria-label="Tambah jumlah item"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Subtotal di desktop */}
                      <p className="text-sm sm:text-base font-semibold text-blue-700 w-auto sm:w-28 text-right hidden sm:block">
                        {formatRupiah(itemPrice * item.quantity)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id, itemName)}
                        disabled={currentItemLoading}
                        className="text-slate-400 hover:text-red-600 transition-colors p-2.5 rounded-md hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Hapus Item dari Keranjang"
                      >
                        {isRemovingThisItem ? (
                          <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Ringkasan Belanja dan Tombol Checkout */}
        {!loading && cartItems.length > 0 && (
          <div className="mt-8 md:mt-10 bg-white rounded-xl shadow-xl p-6 sm:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-1">
              Ringkasan Belanja
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Total harga untuk semua item di keranjang Anda.
            </p>

            <div className="space-y-3 border-b border-slate-200 pb-6 mb-6">
              <div className="flex justify-between text-base text-slate-700">
                <p>Subtotal ({cartItems.length} item)</p>
                <p className="font-semibold text-slate-900">
                  {formatRupiah(totalHarga)}
                </p>
              </div>
              {/* Anda bisa tambahkan info Ongkos Kirim di sini jika sudah ada */}
            </div>

            <div className="flex justify-between text-lg md:text-xl font-bold text-slate-900 mb-6">
              <p>Total Pembayaran</p>
              <p className="text-blue-600">{formatRupiah(totalHarga)}</p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={
                cartItems.length === 0 ||
                cartItems.some(
                  (item) =>
                    !item.ikan ||
                    item.ikan.status_ketersediaan?.toLowerCase() !== "tersedia"
                )
              }
              className="w-full py-3.5 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 flex items-center justify-center text-base disabled:opacity-70 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              <CreditCardIcon className="h-5 w-5 mr-2.5" />
              Lanjut ke Pembayaran ({cartItems.length} Item)
            </button>
            {cartItems.some(
              (item) =>
                !item.ikan ||
                item.ikan.status_ketersediaan?.toLowerCase() !== "tersedia"
            ) && (
              <p className="mt-3 text-xs text-center text-red-600">
                Beberapa item tidak tersedia. Harap hapus item tersebut untuk
                melanjutkan.
              </p>
            )}

            <p className="mt-4 text-xs text-center text-slate-500">
              <InformationCircleIcon className="h-4 w-4 inline mr-1 align-text-bottom" />
              Detail pengiriman dan metode pembayaran akan dipilih pada langkah
              berikutnya.
            </p>
          </div>
        )}

        {/* Tombol Kembali ke Pesanan atau Lanjutkan Belanja */}
        {!loading && (
          <div className="mt-8 text-center">
            {cartItems.length > 0 ? (
              <Link
                to="/profile/pesanan" // Arahkan ke halaman riwayat pesanan jika keranjang ada isi
                className="inline-flex items-center text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors group"
              >
                <ArrowUturnLeftIcon className="h-4 w-4 mr-1.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
                Kembali ke Halaman Pesanan
              </Link>
            ) : (
              <Link
                to="/katalog"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors group"
              >
                <ShoppingCartIcon className="h-4 w-4 mr-1.5 transition-transform duration-150 group-hover:scale-105" />
                Lanjutkan Belanja
              </Link>
            )}
          </div>
        )}
      </main>
      {/* Footer bisa diletakkan di MainLayout jika ada */}
    </div>
  );
}

export default KeranjangPage;

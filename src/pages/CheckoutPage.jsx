import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient"; // Sesuaikan path ke apiClient Anda
import {
  ShoppingCartIcon,
  UserCircleIcon,
  MapPinIcon,
  PhoneIcon,
  PencilIcon,
  CreditCardIcon,
  ArrowPathIcon,
  XCircleIcon,
  ArrowLeftIcon, // Icon untuk tombol kembali
} from "@heroicons/react/24/outline";

// --- Helper Function: Format Rupiah ---
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

// --- Komponen Skeleton (Disesuaikan untuk tampilan baru) ---
const FormInputSkeleton = () => (
  <div className="mb-5 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
    <div className="h-11 bg-slate-200 rounded-lg w-full"></div>
  </div>
);

const FormTextareaSkeleton = ({ taller = false }) => (
  <div className="mb-5 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
    <div
      className={` ${taller ? "h-32" : "h-24"} bg-slate-200 rounded-lg w-full`}
    ></div>
    {taller && <div className="h-3 bg-slate-200 rounded w-1/2 mt-1.5"></div>}
  </div>
);

const CartItemSkeleton = () => (
  <div className="flex justify-between items-start py-4 border-b border-slate-100 last:border-b-0 animate-pulse">
    {" "}
    {/* Disesuaikan dengan item cart asli */}
    <div className="flex items-start flex-grow mr-4">
      <div className="w-16 h-16 bg-slate-200 rounded-lg mr-4 flex-shrink-0"></div>{" "}
      {/* Rounded-lg */}
      <div className="flex-grow space-y-2.5 mt-0.5">
        <div className="h-4 bg-slate-200 rounded w-4/5"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-5 bg-slate-200 rounded w-1/5 flex-shrink-0 mt-0.5"></div>
  </div>
);

const CheckoutPageSkeleton = () => (
  <div className="container mx-auto px-4">
    <div className="flex justify-between items-center mb-10 animate-pulse">
      <div className="h-6 w-36 bg-slate-300 rounded"></div>{" "}
      {/* Tombol kembali skeleton */}
      <div className="h-9 bg-slate-300 rounded w-1/3 mx-auto invisible sm:visible"></div>{" "}
      {/* Judul skeleton */}
      <div className="w-36"></div> {/* Spacer */}
    </div>
    <div className="h-8 bg-slate-300 rounded w-1/2 mx-auto mb-10 animate-pulse sm:hidden"></div>{" "}
    {/* Judul mobile skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
      <div className="lg:col-span-2 bg-white p-7 rounded-xl shadow-xl animate-pulse">
        {" "}
        {/* Style card baru */}
        <div className="h-7 bg-slate-300 rounded w-2/5 mb-7 border-b border-slate-200 pb-5"></div>{" "}
        {/* Judul section skeleton */}
        <FormInputSkeleton />
        <FormInputSkeleton />
        <FormTextareaSkeleton taller={true} />
        <FormTextareaSkeleton />
      </div>
      <div className="lg:col-span-1 bg-white p-7 rounded-xl shadow-xl h-fit animate-pulse">
        {" "}
        {/* Style card baru */}
        <div className="h-7 bg-slate-300 rounded w-3/5 mb-7 border-b border-slate-200 pb-5"></div>{" "}
        {/* Judul section skeleton */}
        <div className="max-h-80 mb-6 pr-2 -mr-2 space-y-4">
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>
        <div className="pt-6 border-t border-slate-200 mt-5 space-y-3.5">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-slate-200 rounded w-1/4"></div>
            <div className="h-5 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-slate-300 rounded w-1/3 font-bold"></div>
            <div className="h-6 bg-slate-300 rounded w-2/5 font-bold"></div>
          </div>
        </div>
        <div className="h-12 bg-indigo-300 rounded-lg mt-10 w-full"></div>{" "}
        {/* Tombol bayar skeleton */}
      </div>
    </div>
  </div>
);

// --- Komponen Utama ---
function CheckoutPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    namaPemesan: "",
    nomorHp: "",
    alamatPengiriman: "",
    catatan: "",
  });
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const snapScriptId = "midtrans-snap-script";
    const snapUrl =
      import.meta.env.VITE_MIDTRANS_SNAP_URL ||
      (import.meta.env.PROD
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js");
    const clientKey =
      import.meta.env.VITE_MIDTRANS_CLIENT_KEY ||
      "SB-Mid-client-xxxxxxxxxxxxxx"; // GANTI DENGAN CLIENT KEY SANDBOX ANDA

    let script = document.getElementById(snapScriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = snapScriptId;
      script.src = snapUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
    return () => {
      // Optional cleanup
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoadingCart(true);
    setCartError(null);
    setPaymentError("");
    setCurrentUser(null);
    setCartItems([]);

    const fetchCartAndUser = async () => {
      try {
        let userData = null;
        try {
          const userResponse = await apiClient.get("/user");
          if (isMounted && userResponse.data) {
            userData = userResponse.data;
            setCurrentUser(userData);
            setFormData((prev) => ({
              ...prev,
              namaPemesan: userData.name || "",
              nomorHp: userData.phone || userData.nomor_whatsapp || "",
            }));
          }
        } catch (userErr) {
          if (isMounted) console.warn("Gagal memuat data user:", userErr);
        }

        const cartResponse = await apiClient.get("/keranjang");
        if (isMounted) {
          if (cartResponse.data && Array.isArray(cartResponse.data.data)) {
            setCartItems(cartResponse.data.data);
            if (cartResponse.data.data.length === 0) {
              setCartError(
                "Keranjang belanja Anda kosong. Silakan tambahkan produk ke keranjang terlebih dahulu."
              );
            }
          } else {
            setCartItems([]);
            console.warn(
              "Format data keranjang tidak sesuai:",
              cartResponse.data
            );
            setCartError("Gagal memuat keranjang. Format data tidak valid.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gagal memuat data checkout:", err);
          if (err.response && err.response.status === 401) {
            setCartError(
              "Sesi Anda telah berakhir. Mohon login kembali untuk melanjutkan proses checkout."
            );
            setTimeout(
              () =>
                navigate("/login", {
                  replace: true,
                  state: { from: "/checkout" },
                }),
              3500
            );
          } else {
            setCartError(
              "Terjadi kesalahan saat memuat data checkout. Silakan coba lagi dalam beberapa saat."
            );
          }
          setCartItems([]);
        }
      } finally {
        if (isMounted) setLoadingCart(false);
      }
    };

    fetchCartAndUser();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateItemSubtotal = (item) => {
    const price = Number(item?.ikan?.harga) || 0;
    const quantity = Number(item?.quantity) || 0;
    return price * quantity;
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + calculateItemSubtotal(item),
      0
    );
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (cartItems.length === 0) {
      setPaymentError(
        "Keranjang Anda kosong. Tidak dapat melanjutkan pembayaran."
      );
      return;
    }
    if (
      !formData.namaPemesan.trim() ||
      !formData.nomorHp.trim() ||
      !formData.alamatPengiriman.trim()
    ) {
      setPaymentError(
        "Informasi Wajib Belum Lengkap. Harap isi Nama Penerima, Nomor HP, dan Alamat Pengiriman."
      );
      return;
    }

    setIsProcessingCheckout(true);

    try {
      const orderPayload = {
        nama_pelanggan: formData.namaPemesan,
        nomor_whatsapp: formData.nomorHp,
        alamat_pengiriman: formData.alamatPengiriman,
        catatan: formData.catatan,
        user_email: currentUser?.email,
        user_id: currentUser?.id,
      };

      Object.keys(orderPayload).forEach((key) => {
        if (orderPayload[key] === null || orderPayload[key] === undefined) {
          delete orderPayload[key];
        }
      });

      const response = await apiClient.post("/pesanan", orderPayload);
      // Variabel order_id dihapus dari destructuring jika tidak digunakan
      const { snap_token /*, order_id */ } = response.data;
      // Jika Anda memerlukan order_id dari backend untuk logging atau tujuan lain sebelum Midtrans,
      // Anda bisa menyimpannya di variabel terpisah atau menggunakannya langsung:
      // const backendOrderId = response.data.order_id;
      // console.log("Backend Order ID:", backendOrderId);

      if (!snap_token) {
        throw new Error(
          "Gagal mendapatkan token pembayaran dari server. Mohon coba lagi."
        );
      }

      // Logging order_id dari backend jika masih diperlukan (misalnya untuk debugging)
      // console.log(
      //   "[CheckoutPage] Menerima Snap Token:",
      //   snap_token,
      //   "untuk Order ID Internal:",
      //   response.data.order_id // Mengakses langsung jika diperlukan
      // );

      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: function (result) {
            navigate(
              `/pesanan/sukses?order_id=${result.order_id}&status_code=${result.status_code}&transaction_status=${result.transaction_status}`
            );
          },
          onPending: function (result) {
            navigate(
              `/pesanan/pending?order_id=${result.order_id}&status_code=${result.status_code}&transaction_status=${result.transaction_status}&payment_type=${result.payment_type}`
            );
          },
          onError: function (result) {
            setPaymentError(
              `Pembayaran Gagal: ${
                result.status_message ||
                "Terjadi kesalahan pada sistem pembayaran. Silakan coba lagi."
              }`
            );
          },
          onClose: function () {
            setPaymentError(
              "Jendela pembayaran ditutup. Pesanan Anda menunggu penyelesaian pembayaran. Anda dapat mencoba lagi dari halaman detail pesanan."
            );
          },
        });
      } else {
        throw new Error(
          "Layanan pembayaran saat ini tidak tersedia. Mohon coba beberapa saat lagi atau hubungi dukungan."
        );
      }
    } catch (error) {
      setPaymentError(
        `Gagal Memproses Checkout: ${
          error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan internal. Mohon coba lagi nanti."
        }`
      );
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleGoBack = () => {
    navigate("/keranjang");
  };

  return (
    <>
      <div className="bg-slate-50 min-h-screen py-8 sm:py-12 font-sans">
        {" "}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loadingCart ? (
            <CheckoutPageSkeleton />
          ) : cartError ? (
            <div className="text-center py-10 sm:py-16 bg-white border border-red-200 rounded-xl shadow-lg max-w-lg mx-auto">
              <XCircleIcon className="h-16 w-16 sm:h-20 sm:w-20 text-red-500 mx-auto mb-5" />
              <h2 className="text-xl sm:text-2xl text-red-700 mb-3 font-semibold">
                Oops, Terjadi Masalah!
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mb-8 px-4 leading-relaxed">
                {cartError}
              </p>
              <div className="space-y-3 sm:space-y-0 sm:space-x-3">
                {cartError.includes("login") ? (
                  <button
                    onClick={() =>
                      navigate("/login", {
                        replace: true,
                        state: { from: "/checkout" },
                      })
                    }
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out font-medium"
                  >
                    Login Sekarang
                  </button>
                ) : cartError.includes("Keranjang belanja Anda kosong") ? (
                  <button
                    onClick={() => navigate("/katalog")}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out font-medium"
                  >
                    Mulai Belanja
                  </button>
                ) : (
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out font-medium"
                  >
                    Coba Lagi
                  </button>
                )}
                <button
                  onClick={handleGoBack}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition duration-150 ease-in-out font-medium"
                >
                  Kembali
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8 sm:mb-10">
                <button
                  onClick={handleGoBack}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150 group py-2 px-3 -ml-3 rounded-md hover:bg-indigo-50"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1.5 transform transition-transform duration-150 group-hover:-translate-x-0.5" />
                  Kembali ke Keranjang
                </button>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 text-center flex-grow invisible sm:visible">
                  Checkout
                </h1>
                <div className="w-auto sm:w-40"> </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-6 text-center sm:hidden">
                Checkout
              </h1>

              {paymentError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-md text-sm flex items-start">
                  {" "}
                  <XCircleIcon className="h-5 w-5 mr-3 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{paymentError}</span>
                </div>
              )}
              <form
                onSubmit={handleProceedToPayment}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12"
              >
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-xl">
                  {" "}
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-7 border-b border-slate-200 pb-5">
                    Detail Alamat & Kontak Penerima
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="namaPemesan"
                        className="flex items-center text-sm font-medium text-slate-700 mb-1.5"
                      >
                        <UserCircleIcon className="h-5 w-5 mr-2 text-slate-400" />
                        Nama Penerima{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="namaPemesan"
                        id="namaPemesan"
                        value={formData.namaPemesan}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out placeholder-slate-400 bg-slate-50 focus:bg-white"
                        required
                        placeholder="Masukkan nama lengkap penerima"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="nomorHp"
                        className="flex items-center text-sm font-medium text-slate-700 mb-1.5"
                      >
                        <PhoneIcon className="h-5 w-5 mr-2 text-slate-400" />
                        Nomor HP (Aktif WhatsApp){" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="tel"
                        name="nomorHp"
                        id="nomorHp"
                        value={formData.nomorHp}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out placeholder-slate-400 bg-slate-50 focus:bg-white"
                        required
                        placeholder="Contoh: 081234567890"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="alamatPengiriman"
                        className="flex items-center text-sm font-medium text-slate-700 mb-1.5"
                      >
                        <MapPinIcon className="h-5 w-5 mr-2 text-slate-400" />
                        Alamat Pengiriman Lengkap{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <textarea
                        name="alamatPengiriman"
                        id="alamatPengiriman"
                        rows="4"
                        value={formData.alamatPengiriman}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out placeholder-slate-400 bg-slate-50 focus:bg-white"
                        required
                        placeholder="Cth: Jl. Anggrek No. 12A, RT 003/RW 005, Kel. Melati, Kec. Mawar, Kota Kembang, Provinsi Flora, 12345. Patokan: Sebelah toko roti."
                      ></textarea>
                      <p className="mt-2 text-xs text-slate-500">
                        Pastikan alamat sudah benar dan selengkap mungkin
                        (termasuk patokan jika ada) untuk memudahkan kurir.
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="catatan"
                        className="flex items-center text-sm font-medium text-slate-700 mb-1.5"
                      >
                        <PencilIcon className="h-5 w-5 mr-2 text-slate-400" />
                        Catatan Tambahan (Opsional)
                      </label>
                      <textarea
                        name="catatan"
                        id="catatan"
                        rows="3"
                        value={formData.catatan}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out placeholder-slate-400 bg-slate-50 focus:bg-white"
                        placeholder="Misalnya: Tolong dibersihkan sisiknya, atau preferensi ukuran tertentu jika variatif."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-xl shadow-xl h-fit">
                  {" "}
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-7 border-b border-slate-200 pb-5">
                    Ringkasan Pesanan
                  </h2>
                  <div className="max-h-80 overflow-y-auto mb-6 pr-2 -mr-2 space-y-4 custom-scrollbar">
                    {" "}
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start py-3 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-start flex-grow mr-3">
                          <img
                            src={
                              item.ikan?.gambar_utama
                                ? `https://res.cloudinary.com/dm3icigfr/image/upload/w_80,h_80,c_fill,g_auto,q_auto,f_auto/${item.ikan.gambar_utama}`
                                : "/placeholder-image.webp"
                            }
                            alt={item.ikan?.nama_ikan || "Gambar Ikan"}
                            className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0 shadow-sm bg-slate-100"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-image.webp";
                            }}
                          />
                          <div className="flex-grow mt-0.5">
                            <p className="text-sm font-semibold text-slate-800 leading-snug">
                              {item.ikan?.nama_ikan || "Item Tidak Diketahui"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {item.quantity} x{" "}
                              {formatRupiah(item.ikan?.harga || 0)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 flex-shrink-0 ml-2 mt-0.5 text-right">
                          {" "}
                          {formatRupiah(calculateItemSubtotal(item))}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-600">Subtotal Produk</p>
                      <p className="text-sm font-medium text-slate-800">
                        {formatRupiah(calculateTotal())}
                      </p>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg pt-2">
                      {" "}
                      <p className="text-slate-900">Total Pembayaran</p>
                      <p className="text-indigo-600">
                        {formatRupiah(calculateTotal())}
                      </p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={
                      isProcessingCheckout ||
                      cartItems.length === 0 ||
                      loadingCart
                    }
                    className="mt-10 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-indigo-400"
                  >
                    {isProcessingCheckout ? (
                      <>
                        <ArrowPathIcon className="animate-spin h-5 w-5 mr-2.5" />
                        Sedang Memproses...
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="h-5 w-5 mr-2.5" /> Lanjutkan
                        ke Pembayaran
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
export default CheckoutPage;

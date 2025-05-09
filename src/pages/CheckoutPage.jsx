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

// --- Komponen Skeleton ---
const FormInputSkeleton = () => (
  <div className="mb-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
    <div className="h-9 bg-gray-200 rounded w-full"></div>
  </div>
);

const FormTextareaSkeleton = ({ taller = false }) => (
  <div className="mb-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
    <div
      className={` ${taller ? "h-24" : "h-20"} bg-gray-200 rounded w-full`}
    ></div>
    {taller && <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>}
  </div>
);

const CartItemSkeleton = () => (
  <div className="flex justify-between items-center py-3 border-b last:border-b-0 animate-pulse">
    <div className="flex items-center flex-grow mr-3">
      <div className="w-16 h-16 bg-gray-200 rounded mr-3 flex-shrink-0"></div>
      <div className="flex-grow space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    <div className="h-5 bg-gray-200 rounded w-1/6 flex-shrink-0"></div>
  </div>
);

const CheckoutPageSkeleton = () => (
  <div className="container mx-auto px-4">
    <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-8 animate-pulse"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-6 border-b border-gray-200 pb-4"></div>
        <FormInputSkeleton />
        <FormInputSkeleton />
        <FormTextareaSkeleton taller={true} />
        <FormTextareaSkeleton />
      </div>
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-6 border-b border-gray-200 pb-4"></div>
        <CartItemSkeleton />
        <CartItemSkeleton />
        <CartItemSkeleton />
        <div className="pt-4 border-t border-gray-200 mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-300 rounded w-1/3 font-bold"></div>
            <div className="h-6 bg-gray-300 rounded w-2/5 font-bold"></div>
          </div>
        </div>
        <div className="h-12 bg-gray-300 rounded-lg mt-8 w-full"></div>
      </div>
    </div>
  </div>
);

// --- Komponen Utama ---
function CheckoutPage() {
  const navigate = useNavigate();

  // State
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // State currentUser tetap ada
  const [formData, setFormData] = useState({
    namaPemesan: "",
    nomorHp: "",
    alamatPengiriman: "",
    catatan: "",
  });
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // 1. Load Midtrans Snap.js script
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
      console.log("[CheckoutPage] Loading Midtrans Snap Script. URL:", snapUrl);
      console.log(
        "[CheckoutPage] Midtrans Client Key:",
        clientKey ? "Loaded" : "Using fallback/placeholder"
      );
    }
    return () => {
      /* Optional cleanup */
    };
  }, []);

  // Fetch data keranjang dan user
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
            setCurrentUser(userData); // <-- currentUser diset
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
                "Keranjang Anda kosong. Silakan isi keranjang terlebih dahulu."
              );
            }
          } else {
            setCartItems([]);
            console.warn(
              "Format data keranjang tidak sesuai:",
              cartResponse.data
            );
            setCartError("Gagal memuat keranjang. Format data tidak sesuai.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gagal memuat data checkout:", err);
          if (err.response && err.response.status === 401) {
            setCartError(
              "Sesi Anda berakhir. Silakan login kembali untuk melanjutkan checkout."
            );
            setTimeout(
              () =>
                navigate("/login", {
                  replace: true,
                  state: { from: "/checkout" },
                }),
              3000
            );
          } else {
            setCartError(
              "Gagal memuat data checkout. Silakan coba lagi nanti."
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

  // Handler input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Kalkulasi subtotal item
  const calculateItemSubtotal = (item) => {
    const price = Number(item?.ikan?.harga) || 0;
    const quantity = Number(item?.quantity) || 0;
    return price * quantity;
  };

  // Kalkulasi total keranjang
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + calculateItemSubtotal(item),
      0
    );
  };

  // Handler tombol pembayaran (dengan Midtrans)
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (cartItems.length === 0) {
      setPaymentError("Keranjang Anda kosong.");
      return;
    }
    if (
      !formData.namaPemesan.trim() ||
      !formData.nomorHp.trim() ||
      !formData.alamatPengiriman.trim()
    ) {
      setPaymentError(
        "Harap lengkapi Nama Penerima, Nomor HP, dan Alamat Pengiriman."
      );
      return;
    }

    setIsProcessingCheckout(true);

    try {
      // 1. Buat Pesanan di Backend & Dapatkan Snap Token
      const orderPayload = {
        nama_pelanggan: formData.namaPemesan,
        nomor_whatsapp: formData.nomorHp,
        alamat_pengiriman: formData.alamatPengiriman,
        catatan: formData.catatan,
        // MODIFIKASI: Menggunakan currentUser.email
        // Pastikan backend Anda mengharapkan field 'user_email' atau sesuaikan namanya.
        // Optional chaining (?. ) digunakan untuk menghindari error jika currentUser null atau tidak memiliki properti email.
        user_email: currentUser?.email,
        // Anda juga bisa menambahkan data lain dari currentUser jika diperlukan, contoh:
        // user_id: currentUser?.id,
      };

      // Opsional: Hapus field user_email jika nilainya null atau undefined,
      // tergantung bagaimana backend Anda menanganinya.
      if (
        orderPayload.user_email === null ||
        orderPayload.user_email === undefined
      ) {
        delete orderPayload.user_email;
      }
      // if (orderPayload.user_id === null || orderPayload.user_id === undefined) {
      //   delete orderPayload.user_id;
      // }

      console.log(
        "[CheckoutPage] Mengirim data pesanan ke backend:",
        orderPayload
      );
      const response = await apiClient.post("/pesanan", orderPayload);
      const { snap_token, order_id } = response.data;

      if (!snap_token) {
        console.error(
          "[CheckoutPage] Respons backend tidak menyertakan snap_token:",
          response.data
        );
        throw new Error("Gagal mendapatkan token pembayaran dari server.");
      }
      console.log(
        "[CheckoutPage] Menerima Snap Token:",
        snap_token,
        "untuk Order ID:",
        order_id
      );

      // 2. Panggil Midtrans Snap UI
      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: function (result) {
            console.log("[CheckoutPage] Midtrans Payment Success:", result);
            navigate(
              `/pesanan/sukses?order_id=${result.order_id}&status_code=${result.status_code}&transaction_status=${result.transaction_status}`
            );
          },
          onPending: function (result) {
            console.log("[CheckoutPage] Midtrans Payment Pending:", result);
            navigate(
              `/pesanan/pending?order_id=${result.order_id}&status_code=${result.status_code}&transaction_status=${result.transaction_status}&payment_type=${result.payment_type}`
            );
          },
          onError: function (result) {
            console.error("[CheckoutPage] Midtrans Payment Error:", result);
            setPaymentError(
              `Pembayaran gagal: ${
                result.status_message || "Silakan coba lagi."
              }`
            );
          },
          onClose: function () {
            console.log("[CheckoutPage] Midtrans payment popup closed by user");
            setPaymentError(
              "Anda menutup jendela pembayaran. Pesanan Anda masih menunggu pembayaran."
            );
          },
        });
      } else {
        console.error("[CheckoutPage] Midtrans Snap.js belum terload.");
        throw new Error(
          "Layanan pembayaran sedang tidak tersedia. Coba beberapa saat lagi."
        );
      }
    } catch (error) {
      console.error(
        "[CheckoutPage] Gagal memproses checkout:",
        error.response?.data || error.message || error
      );
      setPaymentError(
        `Gagal memproses checkout: ${
          error.response?.data?.message || error.message || "Terjadi kesalahan."
        }`
      );
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // --- Render JSX ---
  return (
    <>
      <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loadingCart ? (
            <CheckoutPageSkeleton />
          ) : cartError ? (
            <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg shadow">
              <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg text-red-600 mb-4">{cartError}</p>
              {cartError.includes("login") ? (
                <button
                  onClick={() =>
                    navigate("/login", {
                      replace: true,
                      state: { from: "/checkout" },
                    })
                  }
                  className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Login Sekarang
                </button>
              ) : cartError.includes("Keranjang Anda kosong") ? (
                <button
                  onClick={() => navigate("/katalog")}
                  className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Lihat Katalog
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Coba Lagi
                </button>
              )}
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8 sm:mb-10 text-center">
                Checkout
              </h1>
              {paymentError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg shadow-sm text-sm">
                  {paymentError}
                </div>
              )}
              <form
                onSubmit={handleProceedToPayment}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12"
              >
                {/* Kolom Form */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-slate-200 pb-4">
                    Detail Pengiriman
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="namaPemesan"
                        className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                      >
                        <UserCircleIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                        Nama Penerima{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="namaPemesan"
                        id="namaPemesan"
                        value={formData.namaPemesan}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="nomorHp"
                        className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                      >
                        <PhoneIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                        Nomor HP (WhatsApp){" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="tel"
                        name="nomorHp"
                        id="nomorHp"
                        value={formData.nomorHp}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="alamatPengiriman"
                        className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                      >
                        <MapPinIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                        Alamat Pengiriman Lengkap{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <textarea
                        name="alamatPengiriman"
                        id="alamatPengiriman"
                        rows="4"
                        value={formData.alamatPengiriman}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        required
                      ></textarea>
                      <p className="mt-1.5 text-xs text-gray-500">
                        Detail: Jalan, No Rumah, RT/RW, Kel/Desa, Kec, Kab/Kota,
                        Prov, Kode Pos.
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="catatan"
                        className="flex items-center text-sm font-medium text-gray-700 mb-1.5"
                      >
                        <PencilIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                        Catatan (Opsional)
                      </label>
                      <textarea
                        name="catatan"
                        id="catatan"
                        rows="3"
                        value={formData.catatan}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Kolom Ringkasan */}
                <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-xl shadow-lg h-fit">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-slate-200 pb-4">
                    Ringkasan Pesanan
                  </h2>
                  <div className="max-h-72 overflow-y-auto mb-5 pr-2 space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start py-2"
                      >
                        <div className="flex items-start flex-grow mr-3">
                          <img
                            src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_64,h_64,c_fill,q_auto,f_auto/${item.ikan?.gambar_utama}`}
                            alt={item.ikan?.nama_ikan || "Gambar Ikan"}
                            className="w-16 h-16 object-cover rounded-md mr-3 flex-shrink-0 shadow-sm bg-gray-100"
                            onError={(e) =>
                              (e.target.src = "/placeholder-image.png")
                            } // Ganti dengan path placeholder Anda
                          />
                          <div className="flex-grow mt-0.5">
                            <p className="text-sm font-medium text-gray-800 leading-snug">
                              {item.ikan?.nama_ikan || "Item Tidak Diketahui"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.quantity} x{" "}
                              {formatRupiah(item.ikan?.harga || 0)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 flex-shrink-0 ml-2 mt-0.5">
                          {formatRupiah(calculateItemSubtotal(item))}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-5 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatRupiah(calculateTotal())}
                      </p>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-base pt-2">
                      <p className="text-gray-900">Total</p>
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
                    className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isProcessingCheckout ? (
                      <>
                        {" "}
                        <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />{" "}
                        Memproses...{" "}
                      </>
                    ) : (
                      <>
                        {" "}
                        <CreditCardIcon className="h-5 w-5 mr-2" /> Lanjutkan
                        Pembayaran{" "}
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

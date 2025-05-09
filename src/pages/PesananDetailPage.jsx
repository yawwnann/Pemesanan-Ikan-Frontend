import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient"; // Sesuaikan path
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  MapPinIcon,
  PhoneIcon,
  CreditCardIcon,
  TagIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Helper Function: Format Rupiah
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

// Helper Function: Warna Badge Status Pesanan
const getStatusPesananColor = (status) => {
  // (Sama seperti di PesananPage.jsx)
  switch (status?.toLowerCase()) {
    case "baru":
      return "bg-blue-100 text-blue-800";
    case "diproses":
      return "bg-yellow-100 text-yellow-800";
    case "dikirim":
      return "bg-cyan-100 text-cyan-800";
    case "selesai":
      return "bg-green-100 text-green-800";
    case "batal":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper Function: Warna Badge Status Pembayaran
const getStatusPembayaranColor = (status) => {
  // (Sama seperti di PesananPage.jsx)
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "paid":
    case "settlement":
    case "capture":
      return "bg-green-100 text-green-800";
    case "challenge":
      return "bg-orange-100 text-orange-800";
    case "failure":
    case "failed":
    case "deny":
    case "cancel":
    case "cancelled":
    case "expire":
    case "expired":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Komponen Skeleton untuk Detail
const DetailSkeleton = () => (
  <div className="animate-pulse space-y-8">
    {/* Info Pesanan Skeleton */}
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/5"></div>
        </div>
      </div>
    </div>
    {/* Info Pelanggan Skeleton */}
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
    {/* Item Skeleton */}
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="border-t border-gray-200 pt-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
        </div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-1/3 ml-auto mt-4"></div>
    </div>
  </div>
);

// --- Komponen Utama Detail Pesanan ---
function PesananDetailPage() {
  const { orderId } = useParams(); // Ambil orderId dari URL
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchOrderDetail = async () => {
      try {
        const response = await apiClient.get(`/pesanan/${orderId}`);
        // Asumsi resource mengembalikan data di dalam 'data'
        if (isMounted && response.data?.data) {
          setOrder(response.data.data);
        } else if (isMounted) {
          console.warn(
            "Format data detail pesanan tidak sesuai:",
            response.data
          );
          setError("Gagal memuat detail pesanan: Format data tidak valid.");
          setOrder(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Gagal memuat detail pesanan ID ${orderId}:`, err);
          if (err.response) {
            if (err.response.status === 404) {
              setError("Pesanan tidak ditemukan.");
            } else if (
              err.response.status === 401 ||
              err.response.status === 403
            ) {
              setError(
                "Anda tidak diizinkan melihat pesanan ini. Silakan login ulang."
              );
              setTimeout(
                () =>
                  navigate("/login", {
                    replace: true,
                    state: { from: `/pesanan/detail/${orderId}` },
                  }),
                3000
              );
            } else {
              setError(
                "Gagal memuat detail pesanan. Terjadi kesalahan server."
              );
            }
          } else {
            setError("Gagal memuat detail pesanan. Periksa koneksi Anda.");
          }
          setOrder(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (orderId) {
      fetchOrderDetail();
    } else {
      setError("ID Pesanan tidak valid.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [orderId, navigate]); // Re-fetch jika orderId berubah

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tombol Kembali */}
        <Link
          to="/pesanan" // Atau path halaman riwayat pesanan Anda
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
          Kembali ke Riwayat Pesanan
        </Link>

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg shadow">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-600">{error}</p>
          </div>
        ) : !order ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">
              Detail pesanan tidak dapat ditampilkan.
            </p>
          </div>
        ) : (
          // Tampilan Detail Pesanan
          <div className="space-y-8">
            {/* Informasi Umum Pesanan */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">
                Detail Pesanan
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="sm:col-span-1">
                  <dt className="text-gray-500">Order ID (Midtrans)</dt>
                  <dd className="mt-1 text-gray-900 font-mono">
                    {order.midtrans_order_id || "-"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-gray-500">Tanggal Pesan</dt>
                  <dd className="mt-1 text-gray-900">
                    {format(
                      new Date(order.created_at || order.tanggal_pesan),
                      "dd MMMM yyyy, HH:mm",
                      { locale: id }
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-gray-500">Status Pesanan</dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusPesananColor(
                        order.status
                      )}`}
                    >
                      {order.status || "N/A"}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-gray-500">Status Pembayaran</dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusPembayaranColor(
                        order.status_pembayaran
                      )}`}
                    >
                      {order.status_pembayaran
                        ? order.status_pembayaran.charAt(0).toUpperCase() +
                          order.status_pembayaran.slice(1)
                        : "N/A"}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-gray-500">Metode Pembayaran</dt>
                  <dd className="mt-1 text-gray-900">
                    {order.metode_pembayaran || "-"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-gray-500">Transaction ID (Midtrans)</dt>
                  <dd className="mt-1 text-gray-900 font-mono text-xs">
                    {order.midtrans_transaction_id || "-"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Informasi Pelanggan & Pengiriman */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">
                Info Pelanggan & Pengiriman
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="sm:col-span-1">
                  <dt className="text-gray-500">Nama Penerima</dt>
                  <dd className="mt-1 text-gray-900">
                    {order.nama_pelanggan || "-"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-gray-500">Nomor WhatsApp</dt>
                  <dd className="mt-1 text-gray-900">
                    {order.nomor_whatsapp || "-"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Alamat Pengiriman</dt>
                  <dd className="mt-1 text-gray-900 whitespace-pre-line">
                    {order.alamat_pengiriman || "-"}
                  </dd>
                </div>
                {order.catatan && (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Catatan Pelanggan</dt>
                    <dd className="mt-1 text-gray-900 whitespace-pre-line">
                      {order.catatan}
                    </dd>
                  </div>
                )}
                {order.user && ( // Tampilkan jika pesanan terhubung ke user
                  <div className="sm:col-span-2 pt-3 border-t mt-3">
                    <dt className="text-gray-500">Akun Pemesan</dt>
                    <dd className="mt-1 text-gray-900">
                      {order.user.name} ({order.user.email})
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Rincian Item Pesanan */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <h2 className="text-xl font-semibold text-gray-800 px-6 pt-6 pb-4 border-b">
                Item Dipesan
              </h2>
              <ul role="list" className="divide-y divide-gray-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map(
                    (
                      item // Asumsi $order->items berisi collection model Ikan dengan pivot
                    ) => (
                      <li
                        key={item.id}
                        className="flex py-4 px-6 hover:bg-gray-50"
                      >
                        <div className="flex-shrink-0 h-16 w-16">
                          <img
                            src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_64,h_64,c_fill,q_auto,f_auto/${item.gambar_utama}`} // Asumsi model Ikan punya gambar_utama
                            alt={item.nama_ikan || "Gambar Ikan"}
                            className="h-16 w-16 rounded-md object-cover bg-gray-100"
                            onError={(e) =>
                              (e.target.src = "/placeholder-image.png")
                            }
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.nama_ikan || "Nama Item Tidak Ada"}</h3>
                              <p className="ml-4">
                                {formatRupiah(
                                  (item.pivot?.harga_saat_pesan || 0) *
                                    (item.pivot?.jumlah || 0)
                                )}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              Harga Satuan:{" "}
                              {formatRupiah(item.harga_saat_pesan || 0)}
                            </p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <p className="text-gray-500">
                              Qty: {item.jumlah || 0}
                            </p>
                            {/* Mungkin link ke produk jika perlu */}
                            {/* <div className="flex">
                                                        <Link to={`/ikan/${item.slug}`} className="font-medium text-indigo-600 hover:text-indigo-500">Lihat Produk</Link>
                                                    </div> */}
                          </div>
                        </div>
                      </li>
                    )
                  )
                ) : (
                  <li className="px-6 py-6 text-center text-gray-500">
                    Tidak ada item dalam pesanan ini.
                  </li>
                )}
              </ul>
              {/* Total di bagian bawah */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <p>Total Pesanan</p>
                  <p>{formatRupiah(order.total_harga)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PesananDetailPage;

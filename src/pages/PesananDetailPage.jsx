// src/pages/PesananDetailPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient"; // Sesuaikan path apiClient Anda
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
  ClockIcon,
  ShieldCheckIcon,
  PencilIcon, // Ditambahkan jika digunakan di DetailItem atau tempat lain
  XCircleIcon, // Digunakan sebagai ErrorIconPage
} from "@heroicons/react/24/outline";

// Impor ikon solid jika ada preferensi untuk beberapa status
import { CheckCircleIcon as SolidCheckCircleIcon } from "@heroicons/react/24/solid";

import { format } from "date-fns";
import { id } from "date-fns/locale";

// Helper Function: Format Rupiah
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined || isNaN(Number(angka)))
    return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(angka));
};

// Helper untuk Status Pesanan (Fulfillment)
const StatusPesananDisplay = ({ status }) => {
  let colorClass = "bg-gray-100 text-gray-800";
  let Icon = InformationCircleIcon;
  let text = status || "Tidak Diketahui";

  switch (status?.toLowerCase()) {
    case "baru":
      colorClass = "bg-blue-100 text-blue-800";
      Icon = ShoppingBagIcon;
      break;
    case "diproses":
      colorClass = "bg-yellow-100 text-yellow-700";
      Icon = ArrowPathIcon;
      break;
    case "dikirim":
      colorClass = "bg-cyan-100 text-cyan-700";
      Icon = ShoppingBagIcon;
      break; // Anda bisa ganti ikon truk pengiriman
    case "selesai":
      colorClass = "bg-green-100 text-green-700";
      Icon = SolidCheckCircleIcon;
      break;
    case "batal":
      colorClass = "bg-red-100 text-red-700";
      Icon = XCircleIcon;
      break;
    default:
      text = "N/A";
      Icon = InformationCircleIcon;
      break;
  }
  return (
    <span
      className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${colorClass}`}
    >
      <Icon
        className={`h-4 w-4 mr-1.5 ${
          Icon === ArrowPathIcon && status?.toLowerCase() === "diproses"
            ? "animate-spin"
            : ""
        }`}
      />
      {text.charAt(0).toUpperCase() + text.slice(1)}
    </span>
  );
};

// Helper untuk Status Pembayaran
const StatusPembayaranDisplay = ({ status }) => {
  let colorClass = "bg-gray-100 text-gray-800";
  let Icon = InformationCircleIcon;
  let text = status || "Belum Ada Info";

  switch (status?.toLowerCase()) {
    case "pending":
      colorClass = "bg-yellow-100 text-yellow-700";
      Icon = ClockIcon;
      break;
    case "paid":
    case "settlement":
    case "capture":
      colorClass = "bg-green-100 text-green-700";
      Icon = ShieldCheckIcon;
      text = "Lunas";
      break;
    case "challenge":
      colorClass = "bg-orange-100 text-orange-700";
      Icon = ExclamationTriangleIcon;
      text = "Challenge";
      break;
    case "failure":
    case "failed":
    case "deny":
    case "cancel":
    case "cancelled":
    case "expire":
    case "expired":
      colorClass = "bg-red-100 text-red-700";
      Icon = XCircleIcon;
      text = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Gagal/Batal";
      break;
    default:
      text = "N/A";
      Icon = InformationCircleIcon;
      break;
  }
  return (
    <span
      className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${colorClass}`}
    >
      <Icon className="h-4 w-4 mr-1.5" />
      {text}
    </span>
  );
};

// --- Komponen Skeleton untuk Detail ---
const DetailSkeleton = () => (
  <div className="animate-pulse space-y-8">
    {/* Judul Skeleton */}
    <div className="h-8 bg-gray-300 rounded w-1/2 mb-6"></div>

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
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
        </div>
      </div>
      <div className="h-6 bg-gray-300 rounded w-1/3 ml-auto mt-4"></div>
    </div>
  </div>
);

// --- Komponen Utama Detail Pesanan ---
function PesananDetailPage() {
  const { orderId } = useParams();
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
        if (isMounted && response.data?.data) {
          console.log("Data Detail Pesanan Diterima:", response.data.data);
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
                `Gagal memuat detail pesanan. Server: ${
                  err.response.statusText || "Error"
                }`
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
  }, [orderId, navigate]);

  const DetailItem = ({
    label,
    value,
    icon: IconComponent,
    className = "",
  }) => (
    <div className={`sm:col-span-1 ${className}`}>
      <dt className="text-xs sm:text-sm text-gray-500 flex items-center">
        {IconComponent && (
          <IconComponent className="h-4 w-4 mr-1.5 text-gray-400" />
        )}
        {label}
      </dt>
      <dd className="mt-1 text-sm sm:text-base text-gray-900 font-medium">
        {value || "-"}
      </dd>
    </div>
  );

  return (
    <div className="bg-slate-100 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link
          to="/pesanan" // Sesuaikan dengan path riwayat pesanan Anda
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-6 group"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1.5 transition-transform duration-150 group-hover:-translate-x-1" />
          Kembali ke Riwayat Pesanan
        </Link>

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <div className="text-center py-10 bg-white border border-red-200 rounded-xl shadow-lg">
            <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />{" "}
            {/* Menggunakan XCircleIcon yang diimpor */}
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Oops! Terjadi Kesalahan
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : !order ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-lg">
            <InformationCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Pesanan Tidak Ditemukan
            </h2>
            <p className="text-gray-600">
              Detail pesanan yang Anda cari tidak dapat ditampilkan.
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Informasi Umum Pesanan */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-slate-200">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Detail Pesanan
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Order ID (Midtrans):{" "}
                    <span className="font-mono">
                      {order.midtrans_order_id || order.id}
                    </span>
                  </p>
                </div>
                <div className="mt-3 sm:mt-0">
                  <StatusPesananDisplay status={order.status} />
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem
                  label="Tanggal Pesan"
                  value={format(
                    new Date(order.dibuat_pada || order.tanggal_pesan),
                    "EEEE, dd MMMM yyyy, HH:mm",
                    { locale: id }
                  )}
                  icon={CalendarDaysIcon}
                  className="sm:col-span-2"
                />
                <DetailItem
                  label="Status Pembayaran"
                  value={
                    <StatusPembayaranDisplay status={order.status_pembayaran} />
                  }
                  icon={CreditCardIcon}
                />
                <DetailItem
                  label="Metode Pembayaran"
                  value={order.metode_pembayaran || "-"}
                  icon={TagIcon}
                />
                <DetailItem
                  label="Transaction ID (Midtrans)"
                  value={order.midtrans_transaction_id || "-"}
                  icon={TagIcon}
                  className="sm:col-span-2 font-mono text-xs"
                />
              </dl>
            </div>

            {/* Info Pelanggan & Pengiriman */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">
                Info Pelanggan & Pengiriman
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem
                  label="Nama Penerima"
                  value={order.nama_pelanggan}
                  icon={UserCircleIcon}
                />
                <DetailItem
                  label="Nomor WhatsApp"
                  value={order.nomor_whatsapp}
                  icon={PhoneIcon}
                />
                <div className="sm:col-span-2">
                  <dt className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />{" "}
                    Alamat Pengiriman
                  </dt>
                  <dd className="mt-1 text-sm sm:text-base text-gray-900 font-medium whitespace-pre-line">
                    {order.alamat_pengiriman || "-"}
                  </dd>
                </div>
                {order.catatan && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs sm:text-sm text-gray-500 flex items-center">
                      <PencilIcon className="h-4 w-4 mr-1.5 text-gray-400" />{" "}
                      Catatan Pelanggan
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base text-gray-900 font-medium whitespace-pre-line">
                      {order.catatan}
                    </dd>
                  </div>
                )}
                {order.user && (
                  <div className="sm:col-span-2 pt-4 border-t mt-4">
                    <dt className="text-xs sm:text-sm text-gray-500">
                      Akun Pemesan
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base text-gray-900 font-medium">
                      {order.user.name} ({order.user.email})
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Rincian Item Pesanan */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <h2 className="text-xl font-semibold text-gray-800 px-6 sm:px-8 pt-6 pb-4 border-b border-slate-200">
                Item Dipesan
              </h2>
              <ul role="list" className="divide-y divide-slate-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <li
                      key={item.ikan_id || item.id}
                      className="flex flex-col sm:flex-row py-4 px-6 sm:px-8 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex-shrink-0 h-20 w-20 sm:h-24 sm:w-24">
                        <img
                          src={`https://res.cloudinary.com/dm3icigfr/image/upload/w_100,h_100,c_fill,q_auto,f_auto/${item.gambar_utama}`}
                          alt={item.nama_ikan || "Gambar Ikan"}
                          className="h-full w-full rounded-lg object-cover bg-gray-100 shadow-sm"
                          onError={(e) =>
                            (e.target.src = "/placeholder-image.png")
                          } // Ganti dengan path placeholder Anda
                        />
                      </div>
                      <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 flex flex-1 flex-col">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:justify-between text-base font-medium text-gray-900">
                            <h3 className="text-lg">
                              {item.nama_ikan || "Nama Item Tidak Ada"}
                            </h3>
                            <p className="sm:ml-4 mt-1 sm:mt-0 text-gray-800">
                              {formatRupiah(item.subtotal || 0)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Harga Satuan:{" "}
                            {formatRupiah(item.harga_saat_pesan || 0)}
                          </p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm mt-2">
                          <p className="text-gray-500">
                            Qty: {item.jumlah || 0}
                          </p>
                          {item.slug && (
                            <div className="flex">
                              <Link
                                to={`/ikan/${item.slug}`}
                                className="font-medium text-indigo-600 hover:text-indigo-800"
                              >
                                Lihat Produk
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-6 sm:px-8 py-6 text-center text-gray-500">
                    <ShoppingBagIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    Tidak ada item dalam pesanan ini.
                  </li>
                )}
              </ul>
              <div className="border-t border-slate-200 px-6 sm:px-8 py-5 bg-slate-50">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <p>Total Pesanan</p>
                  <p className="text-indigo-700">
                    {formatRupiah(order.total_harga)}
                  </p>
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

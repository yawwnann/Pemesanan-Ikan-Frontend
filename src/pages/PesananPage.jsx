import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient"; // Sesuaikan path
import {
  EyeIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns"; // Untuk format tanggal
import { id } from "date-fns/locale"; // Locale Bahasa Indonesia untuk tanggal

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

// --- Komponen Skeleton ---
const OrderRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-5 py-4 whitespace-nowrap text-sm">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="px-5 py-4 whitespace-nowrap text-sm">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="px-5 py-4 whitespace-nowrap text-sm">
      <div className="h-6 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-5 py-4 whitespace-nowrap text-sm">
      <div className="h-6 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-5 py-4 whitespace-nowrap text-sm">
      <div className="h-4 bg-gray-200 rounded w-28"></div>
    </td>
    <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </td>
  </tr>
);

// --- Komponen Utama ---
function PesananPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationData, setPaginationData] = useState(null);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Fungsi Fetch Data Pesanan
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/pesanan", {
        params: { page },
      });
      if (response.data && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
        setPaginationData({
          meta: response.data.meta,
          links: response.data.links,
        });
      } else {
        console.warn("Format data pesanan tidak sesuai:", response.data);
        setOrders([]);
        setPaginationData(null);
        setError("Format data pesanan dari server tidak sesuai.");
      }
    } catch (err) {
      console.error("Gagal memuat riwayat pesanan:", err);
      if (err.response && err.response.status === 401) {
        setError(
          "Sesi Anda berakhir. Silakan login kembali untuk melihat pesanan."
        );
        setTimeout(
          () =>
            navigate("/login", {
              replace: true,
              state: { from: "/profile/pesanan" },
            }),
          3000
        );
      } else {
        setError("Gagal memuat riwayat pesanan. Silakan coba lagi nanti.");
      }
      setOrders([]);
      setPaginationData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data saat komponen mount atau halaman berubah
  useEffect(() => {
    fetchOrders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Handler untuk Paginasi
  const handlePageChange = (page) => {
    if (
      page >= 1 &&
      page <= (paginationData?.meta?.last_page || 1) &&
      page !== currentPage
    ) {
      setSearchParams({ page: page.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --- Fungsi getPageNumberFromUrl DIHAPUS DARI SINI ---

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-8 text-center">
          Riwayat Pesanan Saya
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg shadow-sm text-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            {error}
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tanggal
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status Bayar
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status Pesanan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <OrderRowSkeleton key={index} />
                  ))
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {format(
                          new Date(order.created_at || order.tanggal_pesan),
                          "dd MMMM yyyy",
                          { locale: id }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {order.midtrans_order_id || `INT-${order.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusPesananColor(
                            order.status
                          )}`}
                        >
                          {order.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">
                        {formatRupiah(order.total_harga)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/pesanan/detail/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" /> Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-10 px-6">
                      <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Anda belum memiliki riwayat pesanan.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginasi Sederhana */}
        {paginationData &&
          paginationData.meta &&
          paginationData.meta.last_page > 1 &&
          !loading && (
            <nav
              className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8 rounded-b-lg shadow-md"
              aria-label="Pagination"
            >
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Menampilkan{" "}
                  <span className="font-medium">
                    {paginationData.meta.from || 0}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium">
                    {paginationData.meta.to || 0}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium">
                    {paginationData.meta.total || 0}
                  </span>{" "}
                  hasil
                </p>
              </div>
              <div className="flex flex-1 justify-between sm:justify-end">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationData.links?.prev}
                  className={`relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus-visible:outline-offset-0 ${
                    !paginationData.links?.prev
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationData.links?.next}
                  className={`relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus-visible:outline-offset-0 ${
                    !paginationData.links?.next
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Berikutnya
                </button>
              </div>
            </nav>
          )}
      </div>
    </div>
  );
}

export default PesananPage;

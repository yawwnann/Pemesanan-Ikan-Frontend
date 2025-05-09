import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid"; // Ikon sukses

function PesananSuksesPage() {
  const [searchParams] = useSearchParams();

  // Ambil parameter dari URL
  const orderId = searchParams.get("order_id");
  const statusCode = searchParams.get("status_code");
  const transactionStatus = searchParams.get("transaction_status");

  // Anda bisa menambahkan useEffect di sini jika perlu melakukan sesuatu
  // saat halaman dimuat, misalnya mengirim konfirmasi ke backend (opsional)
  useEffect(() => {
    console.log("Halaman Sukses Dimuat:", {
      orderId,
      statusCode,
      transactionStatus,
    });
    // PENTING: Jangan menganggap pesanan lunas HANYA berdasarkan halaman ini.
    // Konfirmasi final HARUS berasal dari notifikasi webhook di backend Anda.
  }, [orderId, statusCode, transactionStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 py-8 text-center">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg max-w-md w-full">
        <CheckCircleIcon className="h-16 w-16 sm:h-20 sm:w-20 text-green-500 mx-auto mb-5" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          Pembayaran Berhasil!
        </h1>
        <p className="text-gray-600 mb-6">
          Terima kasih! Pembayaran Anda untuk pesanan{" "}
          {orderId ? (
            <span className="font-semibold text-gray-700">{orderId}</span>
          ) : (
            "Anda"
          )}{" "}
          telah diterima atau sedang diproses oleh bank/penyedia layanan.
        </p>

        {/* Menampilkan detail status singkat dari Midtrans (opsional) */}
        {transactionStatus && (
          <div className="text-sm text-gray-500 mb-6 border-t border-b border-slate-200 py-3">
            Status Transaksi:{" "}
            <span className="font-medium capitalize">
              {transactionStatus.replace("_", " ")}
            </span>
            {statusCode && ` (Code: ${statusCode})`}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-8">
          Kami akan segera memproses pesanan Anda. Konfirmasi pesanan dan detail
          lebih lanjut akan dikirimkan melalui notifikasi atau dapat dilihat di
          riwayat pesanan Anda setelah diverifikasi oleh sistem kami.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/pesanan" // Arahkan ke halaman riwayat pesanan Anda
            className="w-full sm:w-auto px-6 py-2.5 border border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Lihat Riwayat Pesanan
          </Link>
          <Link
            to="/katalog" // Arahkan ke halaman katalog
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PesananSuksesPage;

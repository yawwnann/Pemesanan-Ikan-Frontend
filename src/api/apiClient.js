// src/api/apiClient.js
import axios from "axios";

// Mendapatkan base URL dari environment variable atau gunakan default
// Ini lebih fleksibel daripada hardcode langsung
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
// Pastikan Anda menjalankan server API di http://localhost:8000
// Dan kita tambahkan '/api' karena endpoint Anda (login, register, ikan) ada di bawah /api

// Buat instance Axios kustom
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Timeout request setelah 10 detik
  headers: {
    "Content-Type": "application/json", // Default content type untuk POST, PUT, PATCH
    Accept: "application/json", // Header accept default
    // Anda bisa menambahkan header default lain di sini jika perlu
  },
});

// --- Interceptors (Opsional tapi sangat berguna) ---
// Interceptor ini akan berjalan SEBELUM setiap request dikirim
apiClient.interceptors.request.use(
  (config) => {
    // Di sini Anda bisa menambahkan logic untuk mengambil token dari localStorage
    // atau state management dan menambahkannya ke header Authorization
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    console.log("Starting Request", config); // Log untuk debug
    return config; // Kembalikan konfigurasi yang sudah dimodifikasi (atau asli)
  },
  (error) => {
    // Lakukan sesuatu jika ada error saat menyiapkan request
    console.error("Request Error Interceptor:", error);
    return Promise.reject(error);
  }
);

// Interceptor ini akan berjalan SETELAH setiap response diterima
apiClient.interceptors.response.use(
  (response) => {
    // Lakukan sesuatu dengan data response sebelum diteruskan ke .then()
    console.log("Response Received:", response); // Log untuk debug
    return response; // Kembalikan response asli
  },
  (error) => {
    // Lakukan sesuatu dengan error response global
    console.error("Response Error Interceptor:", error.response || error);
    // Contoh: Handle 401 Unauthorized (misalnya token expired -> logout user)
    // if (error.response && error.response.status === 401) {
    //   console.log('Unauthorized! Redirecting to login...');
    //   localStorage.removeItem('authToken');
    //   // Redirect ke halaman login (butuh akses ke history/navigate)
    //   // window.location.href = '/login'; // Cara paling sederhana
    // }

    // Penting: Tetap reject promise agar error bisa ditangani di .catch() komponen
    return Promise.reject(error);
  }
);

// Ekspor instance yang sudah dikonfigurasi
export default apiClient;

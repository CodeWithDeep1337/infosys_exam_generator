// src/utils/axiosConfig.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api"; // Added /api context path

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // "Content-Type": "application/json", // Don't set default here, let interceptor or request handle it
    "Accept": "application/json"
  },
  timeout: 10000,
});

// Add JWT token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("🔐 Sending token:", token ? "Yes" : "No");

    if (token) {
      if (token.startsWith("Bearer ")) {
        config.headers.Authorization = token;
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    } else {
        delete config.headers["Content-Type"]; // Let browser set boundary
    }
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.log("⚠️ 401 Unauthorized - Redirecting to login");
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

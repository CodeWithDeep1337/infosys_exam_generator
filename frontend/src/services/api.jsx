import axios from "axios";

/**
 * Axios instance configuration
 * baseURL includes '/api' to match:
 * server.servlet.context-path=/api
 */
const api = axios.create({
  baseURL: "http://localhost:8081/api",
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

// ===============================
// REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // ✅ Attach JWT token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Allow browser to auto-set multipart headers
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ❌ Backend unreachable
    if (!error.response) {
      console.error("❌ Network error: Spring Boot is not reachable");
      return Promise.reject(
        new Error("Server is unreachable. Please try again later.")
      );
    }

    const { status, config, data } = error.response;

    // ===============================
    // 🔴 401 — Token expired / invalid
    // ===============================
    if (status === 401) {
      console.warn("⚠️ Session expired or invalid token");

      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        localStorage.clear();
        window.location.href = "/login?session=expired";
      }
    }

    // ===============================
    // 🟠 403 — Access denied (ROLE issue)
    // ===============================
    else if (status === 403) {
      const role = localStorage.getItem("role");

      console.group("⛔ ACCESS DENIED (403)");
      console.error(`URL: ${config.method?.toUpperCase()} ${config.url}`);
      console.error(`User Role: ${role}`);
      console.error(`Message: ${data?.message || "Forbidden"}`);
      console.groupEnd();

      // ❗ DO NOT LOGOUT here
      // Optional: show toast / snackbar / dialog
      // alert("You do not have permission to access this feature.");
    }

    return Promise.reject(error);
  }
);

export default api;

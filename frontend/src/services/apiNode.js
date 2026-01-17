import axios from "axios";

/**
 * Axios instance configuration for NODE.JS Backend
 * baseURL: http://localhost:8080/api
 */
const apiNode = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 60000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
apiNode.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
apiNode.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Node Backend Error:", error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Potentially log out if tokens are shared and strictly validated
      // But maybe we just warn?
      console.warn("⚠️ Node Backend 401");
    }
    return Promise.reject(error);
  }
);

export default apiNode;

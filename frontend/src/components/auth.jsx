import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api"; // ✅ centralized axios instance
import { jwtDecode } from "./jwtDecode";

const AuthContext = createContext();

// Custom hook
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          logout();
        }
      } catch (err) {
        console.error("Invalid token:", err);
        logout();
      }
    }

    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token } = res.data;

      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      setUser(decoded);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return decoded;
    } catch (err) {
      console.error("Login failed:", err);
      throw new Error(err.response?.data?.error || "Login failed");
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        role: user?.role,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

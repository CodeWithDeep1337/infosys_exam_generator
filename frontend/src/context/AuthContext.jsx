import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// 1️⃣ Create Context
const AuthContext = createContext();

// 2️⃣ Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { role, email }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3️⃣ Load auth data from localStorage on refresh
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  // 4️⃣ Login function
  const login = (data) => {
    const { token, role, email } = data;

    setToken(token);
    setUser({ role, email });

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ role, email }));

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // 5️⃣ Logout function
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 6️⃣ Custom Hook
export const useAuth = () => useContext(AuthContext);

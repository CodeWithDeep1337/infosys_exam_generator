import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  useTheme
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock, Login as LoginIcon } from "@mui/icons-material";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const loginUser = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setErrorMsg("Please enter both email and password");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role.toUpperCase());
      localStorage.setItem("user", JSON.stringify(response.data));

      if (response.data.id) {
        localStorage.setItem("userId", response.data.id);
      }

      const userRole = response.data.role.toUpperCase();
      if (userRole === "INSTRUCTOR") navigate("/instructor/dashboard");
      else if (userRole === "ADMIN") navigate("/admin/dashboard");
      else navigate("/student/dashboard");

    } catch (error) {
      console.error("Login failure:", error);
      setErrorMsg(error.response?.data?.message || "Login failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", // Bright fresh gradient
        position: "relative",
        overflow: "hidden",
        padding: 2,
      }}
    >
      {/* Decorative Blobs */}
      <Box sx={{
        position: "absolute",
        top: "-10%",
        left: "-10%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
        borderRadius: "50%",
        zIndex: 0,
      }} />
      <Box sx={{
        position: "absolute",
        bottom: "-10%",
        right: "-10%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
        borderRadius: "50%",
        zIndex: 0,
      }} />

      <Paper
        className="glass-effect slide-up"
        sx={{
          padding: { xs: 4, md: 6 },
          borderRadius: 4,
          width: { xs: "100%", sm: 420 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1,
          border: '1px solid rgba(255,255,255,0.6)',
        }}
      >
        <Box sx={{ 
          mb: 4, 
          textAlign: "center",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Typography 
            variant="h3" 
            className="text-gradient"
            sx={{ fontWeight: "900", mb: 1, letterSpacing: '-1px' }}
          >
            SkillForge
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', fontWeight: 500 }}>
            Welcome back! Please login to continue.
          </Typography>
        </Box>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={loginUser} style={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: "#667eea" }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.5)",
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea", borderWidth: 2 },
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "#667eea" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff sx={{ color: "#667eea" }} /> : <Visibility sx={{ color: "#667eea" }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 4,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.5)",
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea", borderWidth: 2 },
              }
            }}
          />

          <Button
            className="hover-lift pulse-glow"
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            endIcon={!loading && <LoginIcon />}
            sx={{
              py: 1.8,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: 3,
              textTransform: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(118, 75, 162, 0.4)",
            }}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : "Sign In"}
          </Button>
        </form>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Don’t have an account?{" "}
            <span
              style={{
                color: "#764ba2",
                cursor: "pointer",
                fontWeight: "bold",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/register")}
            >
              Sign Up
            </span>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

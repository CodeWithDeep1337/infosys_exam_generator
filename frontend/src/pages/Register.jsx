import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
  IconButton
} from "@mui/material";
import { 
  Person, 
  Email, 
  Lock, 
  Phone, 
  School, 
  Badge,
  Visibility,
  VisibilityOff,
  AppRegistration
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    college: "",
    role: "STUDENT",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const registerUser = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.role) {
      setErrorMsg("Please fill all required fields!");
      return;
    }

    // Email Validation (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Email Lowercase Validation
    if (form.email !== form.email.toLowerCase()) {
      setErrorMsg("Email address must be in lowercase only.");
      return;
    }

    // Password Length Validation
    if (form.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const registrationData = {
        username: form.username.trim() || form.email.split("@")[0],
        fullName: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phoneNumber: form.phone.trim(),
        college: form.college.trim(),
        role: form.role.toUpperCase().trim(),
      };

      await api.post("/auth/register", registrationData);

      // Using window.confirm/alert for simplicity, or could use a Snackbar
      alert("Registration successful! Redirecting to login...");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMsg(error.response?.data?.message || "An unexpected error occurred.");
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
        background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", // Same bright gradient
        position: "relative",
        overflow: "hidden",
        padding: 2,
      }}
    >
      {/* Decorative Blobs */}
      <Box sx={{
        position: "absolute",
        top: "-15%",
        right: "-5%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
        borderRadius: "50%",
        zIndex: 0,
      }} />
      <Box sx={{
        position: "absolute",
        bottom: "-15%",
        left: "-5%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
        borderRadius: "50%",
        zIndex: 0,
      }} />

      <Paper
        className="glass-effect slide-up"
        sx={{
          padding: { xs: 4, md: 5 },
          borderRadius: 4,
          width: { xs: "100%", sm: 550 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1,
          border: '1px solid rgba(255,255,255,0.6)',
        }}
      >
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography 
            variant="h4" 
            className="text-gradient"
            sx={{ fontWeight: "800", mb: 1, letterSpacing: '-0.5px' }}
          >
            Join SkillForge
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', fontWeight: 500 }}>
            Create your new account
          </Typography>
        </Box>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, width: "100%", borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={registerUser} noValidate style={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Person sx={{ color: "#667eea" }} /></InputAdornment>,
            }}
            sx={{ 
              mb: 2.5,
              "& .MuiOutlinedInput-root": { 
                borderRadius: 2, 
                backgroundColor: "rgba(255,255,255,0.5)",
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea", borderWidth: 2 } 
              } 
            }}
          />

          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Email sx={{ color: "#667eea" }} /></InputAdornment>,
            }}
            sx={{ 
              mb: 2.5,
              "& .MuiOutlinedInput-root": { 
                borderRadius: 2, 
                backgroundColor: "rgba(255,255,255,0.5)",
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea", borderWidth: 2 } 
              } 
            }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Phone sx={{ color: "#667eea" }} /></InputAdornment>,
            }}
            sx={{ 
              mb: 2.5,
              "& .MuiOutlinedInput-root": { 
                borderRadius: 2, 
                backgroundColor: "rgba(255,255,255,0.5)",
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea", borderWidth: 2 } 
              } 
            }}
          />

          <TextField
            fullWidth
            label="College / Org"
            name="college"
            value={form.college}
            onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><School sx={{ color: "#667eea" }} /></InputAdornment>,
            }}
            sx={{ 
              mb: 2.5,
              "& .MuiOutlinedInput-root": { 
                borderRadius: 2, 
                backgroundColor: "rgba(255,255,255,0.5)",
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea", borderWidth: 2 } 
              } 
            }}
          />

          <TextField
            fullWidth
            select
            label="Account Type"
            name="role"
            value={form.role}
            onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Badge sx={{ color: "#667eea" }} /></InputAdornment>,
            }}
            sx={{ 
              mb: 2.5,
              "& .MuiOutlinedInput-root": { 
                borderRadius: 2, 
                backgroundColor: "rgba(255,255,255,0.5)",
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea", borderWidth: 2 } 
              } 
            }}
          >
            <MenuItem value="STUDENT">Student</MenuItem>
            <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
            <MenuItem value="ADMIN">Administrator</MenuItem>
          </TextField>

          <TextField
            required
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock sx={{ color: "#667eea" }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff sx={{ color: "#667eea" }} /> : <Visibility sx={{ color: "#667eea" }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 2.5,
              "& .MuiOutlinedInput-root": { 
                borderRadius: 2, 
                backgroundColor: "rgba(255,255,255,0.5)",
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                "&:hover fieldset": { borderColor: "#667eea" },
                "&.Mui-focused fieldset": { borderColor: "#667eea", borderWidth: 2 } 
              } 
            }}
          />

          <Button
            className="hover-lift pulse-glow"
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            endIcon={!loading && <AppRegistration />}
            sx={{
              mt: 2,
              mb: 2,
              py: 1.8,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: 3,
              textTransform: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(118, 75, 162, 0.4)",
            }}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : "Sign Up"}
          </Button>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Already have an account?{" "}
              <span
                style={{
                  color: "#764ba2",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => navigate("/login")}
              >
                Sign In
              </span>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  LinearProgress,
  Alert,
  Paper,
} from "@mui/material";
import { CloudUpload as UploadIcon } from "@mui/icons-material";
import api from "../services/api";

const MaterialUpload = ({ topicId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("PDF");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");

    if (!title) {
      setError("Material title is required.");
      return;
    }

    if ((type === "LINK" || type === "YOUTUBE") && !url) {
      setError("Please provide a valid URL.");
      return;
    }

    if (type !== "LINK" && type !== "YOUTUBE" && !file) {
      setError("Please select a file to upload.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login?session=expired";
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("topicId", topicId);

    if (type === "LINK" || type === "YOUTUBE") {
      formData.append("url", url);
    } else {
      formData.append("file", file);
    }

    setLoading(true);

    try {
      // Note: Multipart headers are usually handled automatically by the browser with FormData
      // But we pass headers: { "Content-Type": "multipart/form-data" } to be safe 
      // though axios usually strips it if data is FormData. 
      // However, our interceptor might force application/json if not careful.
      // Let's use a config override.
      await api.post("/materials/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
      });

      setSuccess(true);
      setTitle("");
      setFile(null);
      setUrl("");

      if (onUploadSuccess) onUploadSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = "/login?session=expired";
      } else {
        const resData = err.response?.data;
        setError(
          (typeof resData === 'string' ? resData : resData?.message) ||
          resData?.error || 
          `Upload failed (${err.response?.status || "Unknown"}).`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        border: "1px dashed #cbd5e1",
        borderRadius: 3,
        bgcolor: "#f8fafc",
      }}
    >
      <Typography variant="subtitle1" fontWeight="700" mb={2}>
        Add Resource (PDF, Video, or Link)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Uploaded successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleUpload}>
        <TextField
          fullWidth
          label="Material Title"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2, bgcolor: "white" }}
        />

        <TextField
          select
          fullWidth
          label="Material Type"
          size="small"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setFile(null);
            setUrl("");
          }}
          sx={{ mb: 2, bgcolor: "white" }}
        >
          <MenuItem value="PDF">PDF Document</MenuItem>
          <MenuItem value="VIDEO">Video File</MenuItem>
          <MenuItem value="YOUTUBE">YouTube Video</MenuItem>
          <MenuItem value="LINK">External Link</MenuItem>
        </TextField>

        {type === "LINK" || type === "YOUTUBE" ? (
          <TextField
            fullWidth
            label={type === "YOUTUBE" ? "YouTube URL" : "External URL"}
            size="small"
            placeholder={type === "YOUTUBE" ? "https://youtube.com/watch?v=..." : "https://..."}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            sx={{ mb: 2, bgcolor: "white" }}
          />
        ) : (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              sx={{ textTransform: "none", borderStyle: "dashed", py: 1 }}
            >
              {file ? file.name : `Select ${type} File`}
              <input
                type="file"
                hidden
                accept={type === "PDF" ? ".pdf" : "video/*"}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Button>
          </Box>
        )}

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ fontWeight: "bold", py: 1 }}
        >
          {loading ? "Processing..." : "Save Material"}
        </Button>
      </Box>
    </Paper>
  );
};

export default MaterialUpload;

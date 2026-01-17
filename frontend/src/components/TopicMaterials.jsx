import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  OpenInNew as OpenIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";

const TopicMaterials = () => {
  const { topicId } = useParams();

  const [materials, setMaterials] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("PDF");
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMaterials = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    try {
      const res = await api.get(`/materials/topic/${topicId}`);
      setMaterials(res.data);
    } catch (err) {
      setError("Failed to load materials");
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!title) return setError("Material title is required");
    if (type === "LINK" && !link) return setError("External link is required");
    if (type !== "LINK" && !file) return setError("Please upload a file");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("topicId", topicId);

    if (type === "LINK") {
      formData.append("url", link);
    } else {
      formData.append("file", file);
    }

    try {
      await api.post("/materials/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Material uploaded successfully");
      setTitle("");
      setFile(null);
      setLink("");
      fetchMaterials();
    } catch (err) {
      setError("Upload failed. Ensure file size is within limits.");
    } finally {
      setSubmitting(false);
    }
  };

  const openMaterial = (m) => {
    if (m.type === "LINK") {
      // If it's a link, open the URL directly
      const destination = m.url || m.link;
      if (destination) window.open(destination, "_blank");
    } else {
      // ✅ Use the Controller's download endpoint
      // This calls the @GetMapping("/download/{filename}") method
      window.open(
        `http://localhost:8081/api/materials/download/${m.filePath}`,
        "_blank"
      );
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" fontWeight="700" gutterBottom color="primary">
        Topic Resources
      </Typography>

      {/* UPLOAD FORM */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          bgcolor: "#fcfcfd",
        }}
      >
        {(error || message) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }}>
            {error || message}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
        >
          <TextField
            label="Title"
            size="small"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ flex: 2, minWidth: "200px" }}
          />

          <TextField
            select
            label="Type"
            size="small"
            value={type}
            onChange={(e) => setType(e.target.value)}
            sx={{ flex: 1, minWidth: "120px" }}
          >
            <MenuItem value="PDF">PDF Document</MenuItem>
            <MenuItem value="VIDEO">Video Link/File</MenuItem>
            <MenuItem value="LINK">External Website</MenuItem>
          </TextField>

          {type === "LINK" ? (
            <TextField
              label="URL"
              size="small"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              sx={{ flex: 2, minWidth: "200px" }}
            />
          ) : (
            <Button
              variant="outlined"
              component="label"
              sx={{ flex: 1, textTransform: "none" }}
            >
              {file ? file.name.substring(0, 15) + "..." : "Select File"}
              <input
                type="file"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={20} /> : <UploadIcon />
            }
          >
            {submitting ? "Saving..." : "Upload"}
          </Button>
        </Box>
      </Paper>

      {/* TABLE */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Resource</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  No resources found for this topic.
                </TableCell>
              </TableRow>
            ) : (
              materials.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>{m.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={m.type}
                      size="small"
                      variant="soft"
                      color="primary"
                      sx={{ fontSize: "10px", fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      startIcon={<OpenIcon />}
                      size="small"
                      onClick={() => openMaterial(m)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TopicMaterials;

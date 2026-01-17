import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import api from "../services/api";

const MaterialManager = ({ topicId }) => {
  const [courseMaterial, setCourseMaterial] = useState({
    title: "",
    type: "PDF",
    link: "",
  });

  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ===============================
  // LOAD MATERIALS
  // ===============================
  useEffect(() => {
    if (topicId) {
      fetchMaterials();
    }
  }, [topicId]);

  // ===============================
  // FETCH MATERIALS
  // ===============================
  const fetchMaterials = async () => {
    try {
      const res = await api.get(`/materials/topic/${topicId}`);
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load materials.");
    }
  };

  // ===============================
  // FILE CHANGE
  // ===============================
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  // ===============================
  // SUBMIT MATERIAL
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !courseMaterial.title ||
      (courseMaterial.type !== "LINK" && !file) ||
      (courseMaterial.type === "LINK" && !courseMaterial.link)
    ) {
      setError("Please provide material name and required file/link.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", courseMaterial.title);
      formData.append("type", courseMaterial.type);
      formData.append("topicId", topicId);

      if (courseMaterial.type === "LINK") {
        formData.append("url", courseMaterial.link);
      } else {
        formData.append("file", file);
      }

      await api.post("/materials/upload", formData);

      setSuccess(true);
      setCourseMaterial({ title: "", type: "PDF", link: "" });
      setFile(null);
      fetchMaterials();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // OPEN MATERIAL
  // ===============================
  const handleOpenMaterial = (m) => {
    if (m.type === "LINK") {
      window.open(m.link, "_blank");
    } else {
      window.open(`http://localhost:8081/api/uploads/${m.filePath}`, "_blank");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      {/* FORM */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Topic Materials Management
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && (
          <Alert severity="success">✅ Details added successfully!</Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Material Name"
            fullWidth
            sx={{ mb: 2 }}
            value={courseMaterial.title}
            onChange={(e) =>
              setCourseMaterial({ ...courseMaterial, title: e.target.value })
            }
          />

          <TextField
            select
            label="Type"
            value={courseMaterial.type}
            onChange={(e) =>
              setCourseMaterial({ ...courseMaterial, type: e.target.value })
            }
            sx={{ mb: 2 }}
          >
            <option value="PDF">PDF</option>
            <option value="VIDEO">VIDEO</option>
            <option value="LINK">LINK</option>
          </TextField>

          {courseMaterial.type === "LINK" ? (
            <TextField
              fullWidth
              label="External URL"
              sx={{ mb: 2 }}
              value={courseMaterial.link}
              onChange={(e) =>
                setCourseMaterial({ ...courseMaterial, link: e.target.value })
              }
            />
          ) : (
            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            >
              {file ? file.name : "Upload PDF / Video"}
              <input hidden type="file" onChange={handleFileChange} />
            </Button>
          )}

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <Button type="submit" variant="contained">
            Submit Details
          </Button>
        </Box>
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Material Name</b>
              </TableCell>
              <TableCell>
                <b>Type</b>
              </TableCell>
              <TableCell align="center">
                <b>Action</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No materials added yet.
                </TableCell>
              </TableRow>
            ) : (
              materials.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.title}</TableCell>
                  <TableCell>
                    <Chip label={m.type} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Button onClick={() => handleOpenMaterial(m)}>Open</Button>
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

export default MaterialManager;

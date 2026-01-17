import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Stack,
  Alert,
  Typography
} from "@mui/material";
import api from "../services/api";

const TopicForm = ({ courses, onTopicAdded, editingTopic, onCancelEdit, subjects = [] }) => {
  const [name, setName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Pre-fill
  useEffect(() => {
    if (editingTopic) {
        setName(editingTopic.name || "");
        // We need subjectId. If topic has multiple subjects it's complex, 
        // but our basic model has one subject per topic usually, or we find it via subjectName match if ID missing?
        // Let's assume editingTopic has subjectId populated from Backend DTO
        setSelectedSubjectId(editingTopic.subjectId || "");
    } else {
        setName("");
        setSelectedSubjectId("");
    }
  }, [editingTopic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !selectedSubjectId) {
      setError("Name and Subject are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", "CONTAINER"); // Default type
    formData.append("subjectId", selectedSubjectId);
    formData.append("content", ""); // Empty content

    try {
      setLoading(true);

      if (editingTopic) {
          // Update via JSON
          const payload = {
              name,
              subjectId: selectedSubjectId,
              type: "CONTAINER"
          };
          await api.put(`/topics/${editingTopic.id}`, payload);
          console.log("✅ Topic updated");
      } else {
          // Create via Multipart
          await api.post("/topics/upload", formData);
          console.log("✅ Topic created");
      }

      setName("");
      setSelectedSubjectId("");
      onTopicAdded();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error adding topic";
      setError(errorMessage);
      console.error("❌ Error adding topic:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" fontWeight="bold" sx={{mb: 2, color: "primary.main"}}>
         {editingTopic ? "Edit Topic" : "Create New Topic"}
      </Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Topic Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

        <TextField
          select
          label="Assign to Subject *"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          required
          fullWidth
        >
          {subjects.length > 0 ? (
            subjects.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} {s.courseTitle ? `(${s.courseTitle})` : ""}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No subjects available. Create one first.</MenuItem>
          )}
        </TextField>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ py: 1.5 }}
          disabled={loading}
        >
          {loading ? "Processing..." : (editingTopic ? "Update Topic" : "Create Topic")}
        </Button>
        
        {editingTopic && (
            <Button variant="outlined" fullWidth onClick={onCancelEdit}>Cancel</Button>
        )}
      </Stack>
    </Box>
  );
};

export default TopicForm;

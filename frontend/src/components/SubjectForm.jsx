import React, { useState, useEffect } from "react";
import { Box, TextField, Button, MenuItem, Alert, Typography } from "@mui/material";
import api from "../services/api";

const SubjectForm = ({ courses = [], onSubjectAdded, editingSubject, onCancelEdit }) => {
  const [subjectData, setSubjectData] = useState({
    name: "",
    courseId: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setSubjectData({ ...subjectData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  useEffect(() => {
    if (editingSubject) {
        setSubjectData({
            name: editingSubject.name || "",
            courseId: editingSubject.courseId || "",
        });
    } else {
        setSubjectData({ name: "", courseId: "" });
    }
  }, [editingSubject]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subjectData.name || !subjectData.courseId) {
      setError("Both Subject Name and Course are required.");
      return;
    }

    const instructorId = Number(localStorage.getItem("userId"));
    if (!instructorId) {
      setError("Instructor not logged in.");
      return;
    }

    try {
      const payload = {
        name: subjectData.name,
        courseId: Number(subjectData.courseId),
        instructorId,
        description: "",
      };

      if (editingSubject) {
          // Update
          await api.put(`/subjects/${editingSubject.id}`, payload);
      } else {
          // Create
          await api.post("/subjects", payload);
      }
      setSubjectData({ name: "", courseId: "" });
      setSuccess(true);
      setError("");

      onSubjectAdded && onSubjectAdded();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Failed to add subject.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400 }}>
        <Typography variant="h6" fontWeight="bold" sx={{mb: 2, color: "primary.main"}}>
            {editingSubject ? "Edit Subject" : "Create New Subject"}
        </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Subject added!
        </Alert>
      )}

      <TextField
        label="Subject Name *"
        name="name"
        fullWidth
        value={subjectData.name}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <TextField
        select
        label="Select Course *"
        name="courseId"
        fullWidth
        value={subjectData.courseId}
        onChange={handleChange}
        sx={{ mb: 3 }}
      >
        {courses.length > 0 ? (
          courses.map((course) => (
            <MenuItem
              key={course.id || course._id}
              value={course.id || course._id}
            >
              {course.title || course.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No courses available</MenuItem>
        )}
      </TextField>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ py: 1.5, fontWeight: "bold", mb: 2 }}
      >
        {editingSubject ? "Update Subject" : "Create Subject"}
      </Button>

      {editingSubject && (
        <Button
            variant="outlined"
            fullWidth
            onClick={onCancelEdit}
            sx={{ fontWeight: "bold" }}
        >
            Cancel
        </Button>
      )}
    </Box>
  );
};

export default SubjectForm;

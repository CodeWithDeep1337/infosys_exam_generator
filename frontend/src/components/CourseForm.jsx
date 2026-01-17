import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Grid,
  InputAdornment
} from "@mui/material";
import TitleIcon from "@mui/icons-material/Title";
import DescriptionIcon from "@mui/icons-material/Description";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveIcon from "@mui/icons-material/Save";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import api from "../services/api";

const CourseForm = ({ onCourseAdded, editingCourse, onCancelEdit }) => {
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    difficulty: "",
    duration: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };
  
  // Populate form when editingCourse changes
  useEffect(() => {
    if (editingCourse) {
        setCourseData({
            title: editingCourse.title || "",
            description: editingCourse.description || "",
            difficulty: editingCourse.difficulty || "",
            duration: editingCourse.duration ? `${editingCourse.duration} Months` : "",
        });
    } else {
        // Reset if canceled or finished
        setCourseData({
            title: "",
            description: "",
            difficulty: "",
            duration: "",
        });
    }
  }, [editingCourse]);

  const handleClear = () => {
    setCourseData({
      title: "",
      description: "",
      difficulty: "",
      duration: "",
    });
    setError("");
    if (onCancelEdit) onCancelEdit(); // Notify parent
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseData.title || !courseData.difficulty || !courseData.duration) {
      setError("Title, Difficulty, and Duration are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const instructorId = localStorage.getItem("userId");

      if (!instructorId) {
        throw new Error("Instructor ID not found. Please log in again.");
      }

      // ✅ FIXED: Flatten the payload to match CourseRequestDTO
      // Backend expects: instructorId: 5
      const payload = {
        title: courseData.title,
        description: courseData.description,
        difficulty: courseData.difficulty,
        duration: courseData.duration,
        instructorId: parseInt(instructorId), // Simple number, not an object
      };

      if (editingCourse) {
          // Update
          // We must not modify payload.instructorId unless we are Admin, but here user is loggedin.
          // In update API backend just ignores it or updates it, assuming same instructor.
          await api.put(`/courses/${editingCourse.id}`, payload);
      } else {
          // Create
          await api.post("/courses", payload);
      }

      handleClear();
      setSuccess(true);

      if (onCourseAdded) onCourseAdded();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to add course:", err);
      const msg = err.response?.data?.error || "Failed to add course.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 4, 
            borderRadius: 4,
            background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
            {editingCourse ? (
                <><i className="bi bi-pencil-square me-2"></i>Edit Course</>
            ) : (
                <><i className="bi bi-plus-circle-fill me-2"></i>Create New Course</>
            )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            Fill in the details below to add a new course to your curriculum.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setSuccess(false)}
        >
          {editingCourse ? "Course updated!" : "Course added successfully!"}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label="Course Title *"
          name="title"
          value={courseData.title}
          onChange={handleChange}
          sx={{ mb: 2 }}
          disabled={loading}
          placeholder="e.g. Advanced Java Programming"
        />

        <TextField
          fullWidth
          label="Description"
          name="description"
          multiline
          rows={3}
          value={courseData.description}
          onChange={handleChange}
          sx={{ mb: 2 }}
          disabled={loading}
          placeholder="What will students learn in this course?"
        />

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            select
            fullWidth
            label="Difficulty *"
            name="difficulty"
            value={courseData.difficulty}
            onChange={handleChange}
            disabled={loading}
          >
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            label="Duration *"
            name="duration"
            value={courseData.duration}
            onChange={handleChange}
            disabled={loading}
          >
            <MenuItem value="3 Months">3 Months</MenuItem>
            <MenuItem value="6 Months">6 Months</MenuItem>
            <MenuItem value="9 Months">9 Months</MenuItem>
            <MenuItem value="12 Months">12 Months</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ fontWeight: "bold" }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : editingCourse ? (
              "Update Course"
            ) : (
              "Save Course"
            )}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={handleClear}
            disabled={loading}
          >
            {editingCourse ? "Cancel" : "Clear"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CourseForm;

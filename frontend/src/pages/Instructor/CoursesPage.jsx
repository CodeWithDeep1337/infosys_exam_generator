import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import CourseForm from "../../components/CourseForm";
import CourseTable from "../../components/CourseTable";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Grid,
  Fade
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null); // Edit State
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ===============================
  // FETCH COURSES
  // ===============================
  const fetchCourses = useCallback(async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (!token) {
      setErrorMsg("You are not logged in. Please sign in to view courses.");
      return;
    }

    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
      setErrorMsg("Access Denied: You do not have Instructor privileges.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      let url = "/courses";
      // Filter for Instructor
      if (role === "INSTRUCTOR" && userId) {
          url = `/courses/instructor/${userId}`;
      }

      const res = await api.get(url);
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setErrorMsg("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ===============================
  // DELETE COURSE
  // ===============================
  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await api.delete(`/courses/${courseId}`);
      fetchCourses();
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg("Failed to delete course. You might not have permission.");
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to form
  };
  
  const handleCancelEdit = () => {
    setEditingCourse(null);
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <PageHeader 
        title="Course Management"
        subtitle="Create, organize, and manage your curriculum effectively."
        breadcrumbs={[{ label: "Dashboard", href: "/instructor" }, { label: "Courses" }]}
        actionLabel="New Course"
        actionIcon={<AddIcon />}
        onAction={() => document.getElementById("course-title")?.focus()} 
      />

      {errorMsg && (
       <Fade in>
          <Alert
            severity="error"
            variant="filled"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setErrorMsg("")}
            action={
              (errorMsg.includes("session") ||
                errorMsg.includes("logged in")) && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </Button>
              )
            }
          >
            {errorMsg}
          </Alert>
       </Fade>
      )}

      <Grid container spacing={4}>
        {/* Left Column: Form */}
        <Grid item xs={12} md={5} lg={4}>
            <CourseForm 
                onCourseAdded={fetchCourses} 
                editingCourse={editingCourse}
                onCancelEdit={handleCancelEdit}
            />
        </Grid>

        {/* Right Column: Table */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper
             elevation={0} 
             sx={{ 
                 p: 0, 
                 borderRadius: 4, 
                 border: "1px solid rgba(226, 232, 240, 0.8)",
                 boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                 overflow: 'hidden'
             }}
          >
             <Box sx={{ p: 3, borderBottom: "1px solid #f1f5f9", bgcolor: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h6 style={{ margin: 0, fontWeight: "bold", color: "#334155" }}>
                    <i className="bi bi-book-half me-2 text-primary"></i>
                    Your Catalog
                </h6>
                 <span className="badge bg-light text-dark border">{courses.length} Courses</span>
            </Box>

            <Box sx={{ p: 0 }}>
              {loading ? (
                 <Box sx={{ textAlign: "center", py: 8 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }} color="text.secondary">Loading...</Typography>
                 </Box>
              ) : courses.length > 0 ? (
                <CourseTable
                  courses={courses}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ) : (
                 <Box sx={{ p: 6, textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: 2, m: 3 }}>
                     <i className="bi bi-journal-plus fs-1 text-muted"></i>
                     <p className="text-muted mt-2">No courses found. Start by creating one!</p>
                 </Box>
              )}
           </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CoursesPage;

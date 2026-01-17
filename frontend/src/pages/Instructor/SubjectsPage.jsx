import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import SubjectForm from "../../components/SubjectForm";
import SubjectTable from "../../components/SubjectTable";
import PageHeader from "../../components/PageHeader"; // Custom Component
import { useNavigate } from "react-router-dom";

import {
  Box,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Grid,
  Fade
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const SubjectPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null); // Edit State
  const [courses, setCourses] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch Courses
  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get("/courses");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch courses error:", err);
      setCourses([]);
    }
  }, []);

  // Fetch Subjects
  const fetchSubjects = useCallback(async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (!token) {
      setErrorMsg("You are not logged in. Please sign in to view subjects.");
      return;
    }

    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
      setErrorMsg("Access Denied: You do not have Instructor privileges.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      let url = "/subjects";
      if (role === "INSTRUCTOR" && userId) {
          url = `/subjects/instructor/${userId}`;
      }
      const res = await api.get(url);
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setErrorMsg("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    try {
      await api.delete(`/subjects/${subjectId}`);
      fetchSubjects();
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg("Failed to delete subject.");
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
  };

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
  }, [fetchCourses, fetchSubjects]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <PageHeader 
        title="Subjects Management"
        subtitle="Organize your curriculum by defining specific subjects and modules."
        breadcrumbs={[{ label: "Dashboard", href: "/instructor" }, { label: "Subjects" }]}
        actionLabel="Help & Guide"
        onAction={() => window.open('https://skillforge.com/guide', '_blank')}
        actionIcon={<AddCircleOutlineIcon />} 
      />

      {errorMsg && (
        <Fade in>
            <Alert
              severity="error"
              variant="filled"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setErrorMsg("")}
              action={
                (errorMsg.includes("session") || errorMsg.includes("logged in")) && (
                  <Button color="inherit" size="small" onClick={() => navigate("/login")}>
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
        {/* LEFT COLUMN: FORM */}
        <Grid item xs={12} md={4}>
            <SubjectForm 
                courses={courses} 
                onSubjectAdded={fetchSubjects} 
                editingSubject={editingSubject}
                onCancelEdit={handleCancelEdit}
            />
        </Grid>

        {/* RIGHT COLUMN: TABLE */}
        <Grid item xs={12} md={8}>
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
             <Box sx={{ p: 3, borderBottom: "1px solid #f1f5f9", bgcolor: "#fff" }}>
                <h6 style={{ margin: 0, fontWeight: "bold", color: "#334155" }}>
                    <i className="bi bi-list-ul me-2 text-primary"></i>
                    All Subjects
                </h6>
            </Box>

            <Box sx={{ p: 2 }}>
                {loading ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                    <CircularProgress />
                    <p className="mt-3 text-muted">Synchronizing data...</p>
                    </Box>
                ) : subjects.length > 0 ? (
                    <SubjectTable 
                        subjects={subjects} 
                        onDelete={handleDelete} 
                        onEdit={handleEdit}
                    />
                ) : (
                    <Box sx={{ p: 6, textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: 2, m: 2 }}>
                        <i className="bi bi-folder-x fs-1 text-muted"></i>
                        <p className="text-muted mt-2">No subjects found. Use the form to add your first subject!</p>
                    </Box>
                )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubjectPage;

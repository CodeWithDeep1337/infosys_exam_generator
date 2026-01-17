import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import TopicForm from "../../components/TopicForm";
import TopicTable from "../../components/TopicTable";
import MaterialUpload from "../../components/MaterialUpload";
import PageHeader from "../../components/PageHeader";
import {
  Box,
  CircularProgress,
  Alert,
  Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, IconButton, Button,
  Grid,
  Fade,
  Typography
} from "@mui/material";
import { PlayArrow as PlayArrowIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

const TopicsPage = () => {
  const { topicId } = useParams();
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]); // New state for subjects
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null); // Edit State

  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  
  const [videoUrl, setVideoUrl] = useState(null);

  const getEmbedUrl = (url) => {
      if (!url) return "";
      let embedUrl = url;
      if (url.includes("watch?v=")) {
          const vId = url.split("watch?v=")[1].split("&")[0];
          embedUrl = `https://www.youtube.com/embed/${vId}`;
      } else if (url.includes("youtu.be/")) {
           const vId = url.split("youtu.be/")[1];
           embedUrl = `https://www.youtube.com/embed/${vId}`;
      }
      return embedUrl;
  };

  const fetchInitialData = useCallback(async () => {
    const role = localStorage.getItem("role");
    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
      setErrorMsg("Access Denied: You do not have Instructor privileges.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const [courseRes, topicRes, subjectRes] = await Promise.all([
        api.get(role === "INSTRUCTOR" ? `/courses/instructor/${localStorage.getItem("userId")}` : "/courses"),
        api.get(role === "INSTRUCTOR" ? `/topics/instructor/${localStorage.getItem("userId")}` : "/topics"),
        api.get(role === "INSTRUCTOR" ? `/subjects/instructor/${localStorage.getItem("userId")}` : "/subjects"),
      ]);
      setCourses(courseRes.data);
      setTopics(topicRes.data);
      setSubjects(subjectRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setErrorMsg("Server error: Could not load topics or courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopics = async () => {
    try {
      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("userId");
      const url = (role === "INSTRUCTOR" && userId) 
        ? `/topics/instructor/${userId}` 
        : "/topics";
      const res = await api.get(url);
      setTopics(res.data);
    } catch (err) {
      setErrorMsg("Failed to refresh topics.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      await api.delete(`/topics/${id}`);
      fetchTopics();
    } catch (err) {
      setErrorMsg(
        "Failed to delete topic. Ensure it has no materials attached."
      );
    }
  };

  const handleEdit = (topic) => {
      setEditingTopic(topic);
      // Scroll to form if needed
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
      setEditingTopic(null);
  };

  const fetchTopicMaterials = async (tId) => {
      const id = tId || selectedTopic?.id;
      if (!id) return;
      setLoadingMaterials(true);
      try {
          const res = await api.get(`/materials/topic/${id}`);
          setMaterials(res.data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoadingMaterials(false);
      }
  };

  const openMaterialDialog = (topic) => {
      setSelectedTopic(topic);
      fetchTopicMaterials(topic.id);
      setMaterialDialogOpen(true);
  };

  const handleDeleteMaterial = async (mId) => {
      if (!window.confirm("Delete this material?")) return;
      try {
          await api.delete(`/materials/${mId}`);
          fetchTopicMaterials();
      } catch (err) {
          alert("Failed to delete material");
      }
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <PageHeader 
        title="Topics & Materials"
        subtitle="Manage detailed topics and upload learning resources."
        breadcrumbs={[{ label: "Dashboard", href: "/instructor" }, { label: "Topics" }]}
        actionLabel="Create New Topic"
        onAction={() => document.getElementById("topic-title")?.focus()} // Simple accessibility hack
        actionIcon={<AddIcon />} 
      />

      {errorMsg && (
        <Fade in>
            <Alert
            severity="error"
            variant="filled"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setErrorMsg("")}
            >
            {errorMsg}
            </Alert>
        </Fade>
      )}

      <Grid container spacing={4}>
        {/* Left Column: Create Topic Form */}
        <Grid item xs={12} md={4}>
            <TopicForm 
                courses={courses} 
                subjects={subjects} // Pass subjects
                onTopicAdded={fetchTopics} 
                editingTopic={editingTopic}
                onCancelEdit={handleCancelEdit}
            />
        </Grid>

        {/* Right Column: List */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 0, borderRadius: 4, border: "1px solid #e2e8f0", overflow: 'hidden', boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
             <Box sx={{ p: 3, borderBottom: "1px solid #f1f5f9", bgcolor: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h6 style={{ margin: 0, fontWeight: "bold", color: "#334155" }}>
                    <i className="bi bi-collection-play me-2 text-primary"></i>
                    Topics Library
                </h6>
                <span className="badge bg-light text-dark border">{topics.length} Topics</span>
            </Box>

            <Box sx={{ p: 0 }}>
                {loading ? (
                 <Box sx={{ textAlign: "center", py: 8 }}>
                    <CircularProgress />
                  </Box>
                ) : topics.length > 0 ? (
                  <TopicTable
                    topics={topics}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onManageMaterials={openMaterialDialog} 
                  />
                ) : (
                   <Box sx={{ p: 6, textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: 2, m: 3 }}>
                       <i className="bi bi-journal-album fs-1 text-muted"></i>
                       <p className="text-muted mt-2">No topics created yet.</p>
                   </Box>
                )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Material Management Dialog */}
      <Dialog open={materialDialogOpen} onClose={() => setMaterialDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Manage Resources: {selectedTopic?.name}</DialogTitle>
        <DialogContent dividers>
            <Box mb={4} p={2} bgcolor="#f8fafc" borderRadius={2} border="1px dashed #cbd5e1">
                <MaterialUpload topicId={selectedTopic?.id} onUploadSuccess={() => fetchTopicMaterials(selectedTopic?.id)} />
            </Box>
            
            <h6 className="fw-bold mb-3">Existing Materials ({materials.length})</h6>
            {loadingMaterials ? (
                <div className="text-center"><CircularProgress size={24} /></div>
            ) : materials.length > 0 ? (
                <List>
                    {materials.map((mat) => (
                        <ListItem key={mat.id} sx={{ bgcolor: "white", mb: 1, borderRadius: 2, border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                             <ListItemText 
                                primary={mat.title} 
                                secondary={<span className="badge bg-secondary bg-opacity-10 text-secondary">{mat.type}</span>} 
                             />
                             <Box>
                                {mat.type === "LINK" || mat.type === "YOUTUBE" || mat.type === "VIDEO" ? (
                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        startIcon={<PlayArrowIcon />}
                                        onClick={() => {
                                            if (mat.type === "YOUTUBE") {
                                                setVideoUrl(mat.link);
                                            } else if (mat.type === "VIDEO") {
                                                setVideoUrl(`http://localhost:8081/api/materials/download/${mat.filePath}`);
                                            } else {
                                                window.open(mat.link, "_blank");
                                            }
                                        }}
                                        sx={{ mr: 1, borderRadius: 2 }}
                                    >
                                        {mat.type === "LINK" ? "Open" : "Play"}
                                    </Button>
                                ) : (
                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        href={`http://localhost:8081/api/materials/download/${mat.filePath}`} 
                                        target="_blank"
                                        sx={{ mr: 1, borderRadius: 2 }}
                                    >
                                        Download
                                    </Button>
                                )}
                                <IconButton color="error" size="small" onClick={() => handleDeleteMaterial(mat.id)}>
                                    <DeleteIcon />
                                </IconButton>
                             </Box>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography color="text.secondary" align="center" py={2}>No materials uploaded yet.</Typography>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setMaterialDialogOpen(false)}>Close</Button>
        </DialogActions>

      </Dialog>

      {/* --- Video Player Dialog --- */}
      <Dialog 
        open={Boolean(videoUrl)} 
        onClose={() => setVideoUrl(null)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{ sx: { height: '80vh', bgcolor: 'black' } }}
      >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              VIDEO PREVIEW
              <Button onClick={() => setVideoUrl(null)} color="inherit">Close</Button>
          </DialogTitle>
          <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {videoUrl && (
                  videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
                      <iframe 
                          width="100%" 
                          height="100%" 
                          src={getEmbedUrl(videoUrl)} 
                          title="YouTube video player" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          allowFullScreen
                      ></iframe>
                  ) : (
                      <video controls width="100%" height="100%" style={{ maxHeight: '100%' }}>
                          <source src={videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                      </video>
                  )
              )}
          </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TopicsPage;

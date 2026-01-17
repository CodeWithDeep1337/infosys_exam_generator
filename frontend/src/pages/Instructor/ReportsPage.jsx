import React, { useState, useEffect } from "react";
import apiNode from "../../services/apiNode";
import StudentDetailsModal from "../../components/Instructor/StudentDetailsModal";
import QuizGradingModal from "../../components/Instructor/QuizGradingModal";
import PageHeader from "../../components/PageHeader";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Fade,
  Paper,
  Divider,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  EmojiEvents as EmojiEventsIcon,
  PendingActions as PendingActionsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await apiNode.get("/instructor/reports");
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // Process data for display
  const studentData = Object.values(
    reports.reduce((acc, row) => {
      if (!acc[row.userId]) {
        acc[row.userId] = {
          userId: row.userId,
          username: row.username,
          totalAttempts: 0,
          totalScore: 0,
          gradedCount: 0,
          pendingCount: 0,
        };
      }
      acc[row.userId].totalAttempts += 1;
      if (row.score !== null) {
        acc[row.userId].totalScore += row.score;
        acc[row.userId].gradedCount += 1;
      }
      if (row.status === "PENDING_REVIEW") acc[row.userId].pendingCount += 1;
      return acc;
    }, {})
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <PageHeader
        title="Student Performance"
        subtitle="Track progress, grade submissions, and review analytics."
        breadcrumbs={[{ label: "Dashboard", href: "/instructor" }, { label: "Reports" }]}
        actionLabel="Export Data" // Placeholder action
        onAction={() => alert("Export feature coming soon!")} 
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in>
          <Grid container spacing={3}>
            {studentData.length > 0 ? (
              studentData.map((student) => {
                const avgScore =
                  student.gradedCount > 0
                    ? Math.round(student.totalScore / student.gradedCount)
                    : 0;
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={student.userId}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 4,
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                        border: "1px solid #e2e8f0",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: "center", p: 3 }}>
                         <Avatar
                            sx={{
                              width: 72,
                              height: 72,
                              margin: "0 auto",
                              mb: 2,
                              bgcolor: "primary.main",
                              fontSize: "1.75rem",
                              fontWeight: "bold",
                              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.3)"
                            }}
                          >
                            {student.username.charAt(0).toUpperCase()}
                          </Avatar>
                        
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {student.username}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 3 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Quizzes</Typography>
                                <Typography variant="h6" fontWeight="bold">{student.totalAttempts}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Avg Score</Typography>
                                <Typography 
                                    variant="h6" 
                                    fontWeight="bold" 
                                    color={avgScore >= 50 ? "success.main" : "error.main"}
                                >
                                    {avgScore}%
                                </Typography>
                            </Box>
                             <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Pending</Typography>
                                <Typography 
                                    variant="h6" 
                                    fontWeight="bold" 
                                    color={student.pendingCount > 0 ? "warning.main" : "text.secondary"}
                                >
                                    {student.pendingCount}
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
                          onClick={() => {
                            console.log("CLICK: View Details for student:", student);
                            if (!student.userId) console.error("ERROR: student.userId is missing!");
                            setSelectedStudentId(student.userId);
                          }}
                          endIcon={<PersonIcon />}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            ) : (
                <Grid item xs={12}>
                     <Box sx={{ p: 6, textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: 4, bgcolor: "#f8fafc" }}>
                       <PersonIcon sx={{ fontSize: 60, color: "#94a3b8", mb: 2 }} />
                       <Typography variant="h6" color="text.secondary">No student reports found.</Typography>
                     </Box>
                </Grid>
            )}
          </Grid>
        </Fade>
      )}

      {/* Modals */}
      {selectedStudentId && (
        <StudentDetailsModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onOpenGrading={(attemptId) => {
            setSelectedStudentId(null);
            setSelectedAttemptId(attemptId);
          }}
        />
      )}

      {selectedAttemptId && (
        <QuizGradingModal
          attemptId={selectedAttemptId}
          onClose={() => setSelectedAttemptId(null)}
        />
      )}
    </Box>
  );
};

export default ReportsPage;

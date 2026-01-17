import React, { useState, useEffect } from "react";
import apiNode from "../../services/apiNode";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  CircularProgress,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import AssessmentIcon from "@mui/icons-material/Assessment"; 
import ShowChartIcon from "@mui/icons-material/ShowChart";
import PieChartIcon from "@mui/icons-material/PieChart";

// --- Chart.js Imports ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const StudentDetailsModal = ({ studentId, onClose, onOpenGrading }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchDetails();
    }
  }, [studentId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await apiNode.get(`/instructor/student/${studentId}/details`);
      const rawData = res.data;

      // Logic to add attempt numbers
      if (rawData.quizHistory) {
          const sortedHistory = [...rawData.quizHistory].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
          const attemptCounts = {};
          
          const historyWithAttempts = sortedHistory.map(item => {
              if (!attemptCounts[item.quizTitle]) { 
                   attemptCounts[item.quizTitle] = 0;
              }
              attemptCounts[item.quizTitle]++;
              const count = attemptCounts[item.quizTitle];
              const suffix = ["st", "nd", "rd"][((count + 90) % 100 - 10) % 10 - 1] || "th";
              
              return {
                  ...item,
                  attemptLabel: `${count}${suffix} Attempt`
              };
          });

          rawData.quizHistory = historyWithAttempts.reverse();
      }

      setData(rawData);
    } catch (err) {
      console.error("Failed to fetch student details", err);
    } finally {
      setLoading(false);
    }
  };

  if (!studentId) return null;

  // Calculate Summary Stats
  const totalQuizzes = data?.quizHistory?.length || 0;
  const avgScore = totalQuizzes > 0 
    ? Math.round(data.quizHistory.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalQuizzes) 
    : 0;
  const completedCount = data?.quizHistory?.filter(q => q.status === "COMPLETED").length || 0;

  // --- Chart Data Preparation ---
  const showAnalytics = data?.analytics && data.analytics.topicPerformance.length > 0;

  const pieData = showAnalytics ? {
    labels: data.analytics.topicPerformance.map(t => t.topic),
    datasets: [
      {
        label: 'Avg Score',
        data: data.analytics.topicPerformance.map(t => t.avgScore),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const lineData = showAnalytics ? {
      labels: data.analytics.progression.map(p => p.date),
      datasets: [
        {
          label: 'Your Score',
          data: data.analytics.progression.map(p => p.score),
          borderColor: '#4f46e5', // Indigo
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          tension: 0.4,
          pointBackgroundColor: 'white',
          pointBorderColor: '#4f46e5',
          pointBorderWidth: 2,
          pointRadius: 4,
          fill: true
        },
        // Benchmark Lines
        {
            label: 'Advanced Level (75+)',
            data: data.analytics.progression.map(() => 75),
            borderColor: 'rgba(34, 197, 94, 0.5)', // Green
            borderDash: [5, 5],
            pointRadius: 0,
            borderWidth: 1,
            fill: false
        },
        {
            label: 'Intermediate Level (40+)',
            data: data.analytics.progression.map(() => 40),
            borderColor: 'rgba(234, 179, 8, 0.5)', // Yellow
            borderDash: [5, 5],
            pointRadius: 0,
            borderWidth: 1,
            fill: false
        }
      ],
  } : null;

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#1e293b',
          bodyColor: '#475569',
          borderColor: '#e2e8f0',
          borderWidth: 1
      }
    },
    scales: {
        y: { 
            beginAtZero: true, 
            max: 100,
            grid: { borderDash: [2, 2], color: '#f1f5f9' },
            ticks: {
                callback: function(value) {
                    if (value === 85) return 'Adv.';
                    if (value === 50) return 'Int.';
                    if (value === 20) return 'Beg.';
                    return value;
                }
            }
        },
        x: { grid: { display: false } }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
  };

  return (
    <Dialog 
      open={!!studentId} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
          sx: { 
              borderRadius: 4, 
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
      }}
    >
      <DialogTitle sx={{ 
          m: 0, p: 3, 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          color: 'white',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
      }}>
        <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.2)' }}>
                {data?.studentName?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: '0.5px' }}>
                Student Analytics
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, fontFamily: 'monospace' }}>
                ID: {data?.email}
                </Typography>
            </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
            <CircularProgress thickness={4} />
          </Box>
        ) : data ? (
          <Box>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#eff6ff', color: '#3b82f6', mr: 2 }}>
                            <LibraryBooksIcon fontSize="large" />
                        </Box>
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">TOTAL QUIZZES</Typography>
                            <Typography variant="h4" fontWeight="800" color="#1e293b">{totalQuizzes}</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f0fdf4', color: '#22c55e', mr: 2 }}>
                            <TrendingUpIcon fontSize="large" />
                        </Box>
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">AVG. SCORE</Typography>
                            <Typography variant="h4" fontWeight="800" color="#1e293b">{avgScore}%</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fefce8', color: '#eab308', mr: 2 }}>
                            <EmojiEventsIcon fontSize="large" />
                        </Box>
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">COMPLETED</Typography>
                            <Typography variant="h4" fontWeight="800" color="#1e293b">{completedCount}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* ANALYTICS SECTION */}
            {showAnalytics ? (
                <Box sx={{ mb: 5 }}>
                    <Grid container spacing={3}>
                        {/* LEFT: Topic Performance */}
                        <Grid item xs={12} md={4}>
                             <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid #e2e8f0', borderRadius: 3 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom color="#1e293b">Topic Performance</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Average score distribution by topic</Typography>
                                <Box sx={{ height: 220, display: 'flex', justifyContent: 'center' }}>
                                    <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }} />
                                </Box>
                             </Paper>
                        </Grid>
                        
                        {/* MIDDLE: Trend */}
                        <Grid item xs={12} md={5}>
                            <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid #e2e8f0', borderRadius: 3 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                    <Typography variant="h6" fontWeight="bold" color="#1e293b">Adaptive Trend</Typography>
                                    <Chip label="Real-time" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Skill progression over time vs. benchmarks</Typography>
                                <Box sx={{ height: 220 }}>
                                    <Line options={lineOptions} data={lineData} />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* RIGHT: Strengths & Weaknesses */}
                        <Grid item xs={12} md={3}>
                            <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid #e2e8f0', borderRadius: 3 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom color="#1e293b">Insights</Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" fontWeight="bold" color="success.main" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <TrendingUpIcon fontSize="inherit" sx={{ mr: 0.5 }} /> STRENGTHS
                                    </Typography>
                                    {data.analytics.strengths.length > 0 ? (
                                        data.analytics.strengths.map(s => (
                                            <Paper key={s.topic} elevation={0} sx={{ p: 1, mb: 1, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 1.5 }}>
                                                <Typography variant="body2" fontWeight="600" color="#166534">{s.topic}</Typography>
                                                <Typography variant="caption" color="#15803d">{Math.round(s.avgScore)}% Avg</Typography>
                                            </Paper>
                                        ))
                                    ) : <Typography variant="caption" color="text.secondary">Keep practicing to build strengths!</Typography>}
                                </Box>
                                
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="error.main" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <AssessmentIcon fontSize="inherit" sx={{ mr: 0.5 }} /> FOCUS AREAS
                                    </Typography>
                                    {data.analytics.weaknesses.length > 0 ? (
                                        data.analytics.weaknesses.map(w => (
                                            <Paper key={w.topic} elevation={0} sx={{ p: 1, mb: 1, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 1.5 }}>
                                                <Typography variant="body2" fontWeight="600" color="#991b1b">{w.topic}</Typography>
                                                <Typography variant="caption" color="#b91c1c">{Math.round(w.avgScore)}% Avg</Typography>
                                            </Paper>
                                        ))
                                    ) : <Typography variant="caption" color="text.secondary">No major weak spots found.</Typography>}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            ) : (
                <Alert severity="info" sx={{ mb: 4 }}>Not enough data for analytics charts.</Alert>
            )}

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon fontSize="small" color="primary" /> Course Progress
            </Typography>
            <Box sx={{ mb: 4 }}>
              {data.courseProgress && data.courseProgress.length > 0 ? (
                <Grid container spacing={2}>
                  {data.courseProgress.map((cp, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">{cp.courseTitle}</Typography>
                            <Chip label={`${cp.progress}%`} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Box>
                        <LinearProgress variant="determinate" value={cp.progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0' }} />
                        </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: '1px dashed #cbd5e1', bgcolor: 'transparent', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">No active course enrollments.</Typography>
                </Paper>
              )}
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LibraryBooksIcon fontSize="small" color="primary" /> Detailed Quiz History
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
              <Table size="small">
                {/* ... (Existing Table) ... */}
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Quiz Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.quizHistory && data.quizHistory.length > 0 ? (
                    data.quizHistory.map((q, idx) => (
                      <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                            <Box>
                                <Typography variant="body2" fontWeight="500">{q.quizTitle}</Typography>
                                <Typography variant="caption" color="text.secondary">{q.topicName || "General"}</Typography>
                                {q.attemptLabel && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display:'block' }}>{q.attemptLabel}</Typography>
                                )}
                            </Box>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2" color="text.secondary">
                                {q.date ? new Date(q.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2" fontWeight="bold" color={q.score >= 50 ? 'success.main' : 'error.main'}>
                                {q.score ?? '-'}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Chip 
                                label={q.status} 
                                size="small" 
                                color={q.status === 'COMPLETED' ? 'success' : 'warning'} 
                                variant="outlined"
                                sx={{ borderRadius: 1, fontWeight: 'bold', fontSize: '0.7rem' }}
                            />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details / Grade">
                            <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => onOpenGrading(q.attemptId)}
                                sx={{ bgcolor: 'primary.light', color: 'primary.main', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                            >
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" color="text.secondary">No quiz attempts recorded yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="error">Failed to load student data.</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModal;

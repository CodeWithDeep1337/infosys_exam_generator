import React, { useState, useEffect } from "react";
import apiNode from "../../services/apiNode";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Chip,
  Card,
  CardContent,
  Divider,
  InputAdornment
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const QuizGradingModal = ({ attemptId, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (attemptId) {
      fetchSubmissions();
    }
  }, [attemptId]);

  const fetchSubmissions = async () => {
    try {
      const res = await apiNode.get(`/instructor/quiz/attempt/${attemptId}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId, marks) => {
    setUpdating(submissionId);
    try {
      await apiNode.post("/instructor/grade", {
        submissionId: submissionId,
        marks: marks
      });
      // Update local state to reflect change
      setSubmissions(prev => prev.map(s => 
        s.id === submissionId ? { ...s, marks: parseInt(marks), isGraded: true } : s
      ));
    } catch (err) {
      alert("Failed to save grade");
    } finally {
      setUpdating(null);
    }
  };

  if (!attemptId) return null;

  return (
    <Dialog
      open={!!attemptId}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          Grading Quiz Attempt #{attemptId}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: '#f8fafc' }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : submissions.length > 0 ? (
          <Box>
            {submissions.map((sub, index) => (
              <Card key={sub.id} sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Q{index + 1}: {sub.question?.questionText}
                    </Typography>
                    <Chip 
                      label={sub.question?.questionType} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 1, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Student Answer:
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      {sub.answerText || <Box component="span" fontStyle="italic" color="text.disabled">(No Answer)</Box>}
                    </Typography>
                  </Box>

                  {/* Correct Answer Panel */}
                  <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, mb: 3, border: '1px solid #bbf7d0' }}>
                    <Typography variant="caption" color="success.main" display="block" gutterBottom fontWeight="bold">
                      Correct Answer:
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      {sub.question?.modelAnswer || "N/A"}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      label="Marks"
                      type="number"
                      size="small"
                      defaultValue={sub.marks}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">/ {sub.question?.maxPoints || 1}</InputAdornment>,
                      }}
                      sx={{ width: 150 }}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (parseInt(val) !== sub.marks) {
                          handleGrade(sub.id, val);
                        }
                      }}
                    />
                    
                    {updating === sub.id && <CircularProgress size={20} />}
                    {sub.isGraded && !updating && (
                      <Chip 
                        icon={<CheckCircleIcon />} 
                        label="Graded" 
                        color="success" 
                        size="small" 
                        variant="soft" 
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="h6" color="text.secondary">No answers submitted for this quiz yet.</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizGradingModal;

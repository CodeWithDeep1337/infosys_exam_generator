import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Paper,
  Radio,
  FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

const QuizReviewDialog = ({ open, onClose, onSave, quizData }) => {
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (quizData) {
      setQuestions(quizData.questions || []);
      setTitle(quizData.title || "AI Generated Quiz");
    }
  }, [quizData]);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = value;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSave = () => {
    // Validate
    if (!title.trim()) return alert("Title is required");
    if (questions.length === 0) return alert("Quiz must have questions");

    onSave({
      ...quizData,
      title,
      questions,
      timeLimit: quizData.timeLimit // Ensure specific field mapping if needed, though ...quizData covers it.
    });
  };

  if (!quizData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Review & Edit Quiz</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          label="Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />

        {questions.map((q, qIndex) => (
          <Paper key={qIndex} sx={{ p: 2, mb: 2, position: "relative" }}>
            <IconButton
              size="small"
              color="error"
              sx={{ position: "absolute", top: 8, right: 8 }}
              onClick={() => handleDeleteQuestion(qIndex)}
            >
              <DeleteIcon />
            </IconButton>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Question {qIndex + 1} {(!q.options || q.options.length === 0) && "(Short Answer)"}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Question Text"
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
              sx={{ mb: 2 }}
            />

            {q.options && q.options.length > 0 ? (
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                {q.options.map((opt, oIndex) => (
                  <Box key={oIndex} display="flex" alignItems="center">
                    <Radio
                      checked={q.correctAnswer === opt}
                      onChange={() => handleCorrectAnswerChange(qIndex, opt)}
                      value={opt}
                      name={`q-${qIndex}`}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      value={opt}
                      onChange={(e) => {
                          // If we change the text of the correct option, we must update correctAnswer too
                          if (q.correctAnswer === opt) {
                              handleCorrectAnswerChange(qIndex, e.target.value);
                          }
                          handleOptionChange(qIndex, oIndex, e.target.value)
                      }}
                      label={`Option ${oIndex + 1}`}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
                 <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Model Answer / Key Points"
                     value={q.correctAnswer !== undefined ? q.correctAnswer : (q.answer || "")}
                    onChange={(e) => handleQuestionChange(qIndex, "correctAnswer", e.target.value)}
                    helperText="This answer will be used for reference."
                />
            )}
          </Paper>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          Save & Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizReviewDialog;

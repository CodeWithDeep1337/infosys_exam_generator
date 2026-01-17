import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const QuizResultDialog = ({ open, onClose, results }) => {
  // Sample data structure for results
  // results = {
  //   studentName: "John Doe",
  //   quizTitle: "Math Quiz",
  //   score: 85,
  //   totalQuestions: 10,
  //   correctAnswers: 8,
  //   wrongAnswers: 2,
  //   percentage: 85,
  //   submittedAt: "2024-01-07 19:30:00"
  // }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Quiz Results</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {results ? (
          <>
            {/* Basic Info */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography>
                <strong>Student:</strong> {results.studentName || "N/A"}
              </Typography>
              <Typography>
                <strong>Quiz:</strong> {results.quizTitle || "N/A"}
              </Typography>
              <Typography>
                <strong>Score:</strong> {results.score || 0}/
                {results.totalQuestions || 0}
              </Typography>
              <Typography>
                <strong>Percentage:</strong> {results.percentage || 0}%
              </Typography>
              <Typography>
                <strong>Submitted:</strong> {results.submittedAt || "N/A"}
              </Typography>
            </Paper>

            {/* Detailed Results Table */}
            <Typography variant="h6" gutterBottom>
              Detailed Answers
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Your Answer</TableCell>
                    <TableCell>Correct Answer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.questions?.map((question, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {question.questionText || `Question ${index + 1}`}
                      </TableCell>
                      <TableCell>
                        {question.userAnswer || "Not answered"}
                      </TableCell>
                      <TableCell>{question.correctAnswer || "N/A"}</TableCell>
                      <TableCell>
                        <Typography
                          color={
                            question.isCorrect ? "success.main" : "error.main"
                          }
                        >
                          {question.isCorrect ? "Correct" : "Wrong"}
                        </Typography>
                      </TableCell>
                      <TableCell>{question.points || 1}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No detailed results available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Typography>No results to display</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button
          onClick={() => window.print()}
          color="secondary"
          variant="contained"
        >
          Print Results
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizResultDialog;

// Alternative: Simple version if you don't need all features
export const SimpleQuizResultDialog = ({ open, onClose, results }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Quiz Results</DialogTitle>
    <DialogContent>
      <Typography>
        Score: {results?.score || 0}/{results?.totalQuestions || 0}
      </Typography>
      <Typography>Percentage: {results?.percentage || 0}%</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

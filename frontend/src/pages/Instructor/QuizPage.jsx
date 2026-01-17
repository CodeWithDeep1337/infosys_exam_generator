import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Grid,
  Fade
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QuizIcon from "@mui/icons-material/Quiz";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DeleteIcon from "@mui/icons-material/Delete"; 
import EditIcon from "@mui/icons-material/Edit"; 
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // ✅ ADDED
import SearchIcon from "@mui/icons-material/Search";

import axios from "../../utils/axiosConfig"; 
import apiNode from "../../services/apiNode"; 
import PageHeader from "../../components/PageHeader";
import QuizResultDialog from "../../components/QuizResultDialog";
import QuizReviewDialog from "../../components/QuizReviewDialog";

const QuizPage = () => {
  // --- States ---
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  
  // New States
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [quizType, setQuizType] = useState("Multiple Choice");
  
  // New: Specific counts for "Both" type
  const [mcqCount, setMcqCount] = useState(3);
  const [saCount, setSaCount] = useState(2);
  const [timeLimit, setTimeLimit] = useState(10); // ✅ Added Timer State

  // ... (existing code)

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError("");

    try {
      const subjectObj = subjects.find(s => s.id === selectedSubject);
      const topicObj = topics.find(t => t.id === selectedTopic);

      const response = await apiNode.post("/quizzes/generate", {
        subject: subjectObj ? subjectObj.name : "General",
        topic: topicObj ? topicObj.name : "General",
        difficulty,
        difficulty,
        count: quizType === "Both" ? (parseInt(mcqCount) + parseInt(saCount)) : questionCount,
        type: quizType,
        mcqCount: quizType === "Both" ? mcqCount : 0,
        saCount: quizType === "Both" ? saCount : 0,
        timeLimit // ✅ Pass to backend
      });

      setGeneratedQuiz({
          title: quizTitle,
          subject_id: selectedSubject,
          topic_id: selectedTopic, 
          difficulty,
          description: "AI Generated Quiz",
          questions: response.data.questions,
          timeLimit // ✅ Persist for saving
      });
      setReviewDialogOpen(true);
      
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(err.response?.data?.error || "AI Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ... (UI RENDER)

  // --- Assignment States ---
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedQuizIdForAssign, setSelectedQuizIdForAssign] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");

  // --- Test Taking States ---
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false); // Toggle state

  useEffect(() => {
    fetchCourses();
    fetchAllQuizzes();
    fetchStudents();
  }, []);

  // --- API Functions ---
  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      // Fallback
      if (courses.length === 0) setCourses([{id:1, title:"Mathematics"}, {id:2, title:"Science"}]);
    }
  };

  const fetchAllQuizzes = async () => {
    try {
      const res = await apiNode.get("/quizzes"); 
      setQuizzes(res.data);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    }
  };

  const fetchStudents = async () => {
      try {
          const res = await axios.get("/users"); // Fetches all users (Fixed path)
          console.log("Fetched users:", res.data);
          // Filter only students (Case-insensitive check)
          const studentList = res.data.filter(u => u.role && u.role.toUpperCase() === "STUDENT");
          setStudents(studentList);
      } catch (err) {
          console.error("Error fetching students:", err);
          // Fallback mock
           setStudents([
              { id: 101, name: "Alice Student", email: "alice@example.com" },
              { id: 102, name: "Bob Scholar", email: "bob@example.com" },
              { id: 103, name: "Charlie Learner", email: "charlie@example.com" }
           ]);
      }
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedSubject("");
    setSelectedTopic("");
    try {
      const res = await axios.get(`/subjects/course/${courseId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const handleSubjectChange = async (subjectId) => {
    setSelectedSubject(subjectId);
    setSelectedTopic("");
    try {
      const res = await axios.get(`/topics/subject/${subjectId}`);
      setTopics(res.data);
    } catch (err) {
      console.error("Error fetching topics:", err);
    }
  };

  // --- Edit States ---
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [questionsForEdit, setQuestionsForEdit] = useState([]);
  const [newQuestionForm, setNewQuestionForm] = useState({ 
      question: "", options: ["", "", "", ""], correctAnswer: "", points: 1 
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // --- Logic Functions ---

  const handleSaveQuiz = async (finalQuizData) => {
      try {
          setLoading(true);
          const response = await apiNode.post("/quizzes/create", finalQuizData);
          const newQuiz = {
              ...finalQuizData,
              id: response.data.quizId,
              title: finalQuizData.title, // Ensure title is preserved
              difficulty: finalQuizData.difficulty,
              createdAt: new Date().toISOString(),
              quizDisplayId: `Q${response.data.quizId}`,
              time_limit: finalQuizData.timeLimit // ✅ Map for UI display
          };
          setQuizzes([newQuiz, ...quizzes]);
          setReviewDialogOpen(false);
          setQuizTitle("");
          
          if(window.confirm("Quiz saved successfully! Do you want to assign it now?")) {
              openAssignDialog(response.data.quizId);
          }
      } catch (err) {
          console.error("Save error:", err);
          setError("Failed to save quiz");
      } finally {
          setLoading(false);
      }
  };

  const openAssignDialog = (quizId) => {
      setSelectedQuizIdForAssign(quizId);
      setSelectedStudentIds([]);
      setAssignDialogOpen(true);
  };

  const handleToggleStudent = (studentId) => {
    const currentIndex = selectedStudentIds.indexOf(studentId);
    const newChecked = [...selectedStudentIds];

    if (currentIndex === -1) {
      newChecked.push(studentId);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setSelectedStudentIds(newChecked);
  };

  const handleSelectAllStudents = () => {
       const filtered = students.filter(s => 
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
          s.email.toLowerCase().includes(studentSearch.toLowerCase())
      );

      if (selectedStudentIds.length === filtered.length) {
          setSelectedStudentIds([]);
      } else {
          setSelectedStudentIds(filtered.map(s => s.id));
      }
  }

  const handleConfirmAssign = async () => {
      if (selectedStudentIds.length === 0) {
          alert("Please select at least one student.");
          return;
      }

      setLoading(true);
      try {
          await apiNode.post("/quizzes/assign", {
              quizId: selectedQuizIdForAssign,
              studentIds: selectedStudentIds,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
          setAssignDialogOpen(false);
          alert(`Success! Quiz assigned to ${selectedStudentIds.length} students.`);
      } catch (err) {
          console.error("Assign error:", err);
          alert("Failed to assign quiz.");
      } finally {
          setLoading(false);
      }
  };

  const handleDeleteQuiz = async (quizId) => {
      if (!window.confirm("Are you sure you want to delete this quiz?")) {
          return;
      }
      try {
          await apiNode.delete(`/quizzes/${quizId}`);
          setQuizzes(quizzes.filter(q => q.id !== quizId));
      } catch (err) {
          console.error("Delete error:", err);
          alert("Failed to delete quiz.");
      }
  };

  const fetchQuizQuestions = async (quizId) => {
    try {
      const res = await apiNode.get(`/quizzes/${quizId}`); // Assuming viewing public/full details
      return res.data; 
    } catch (err) {
      console.error("Error fetching quiz questions:", err);
      return [];
    }
  };

  const openEditDialog = async (quizId) => {
      setEditingQuizId(quizId);
      setLoading(true);
      try {
          const quizData = await fetchQuizQuestions(quizId);
          setQuestionsForEdit(quizData.questions || []);
          setEditDialogOpen(true);
      } catch (err) {
          console.error("Fetch edit error", err);
      } finally {
          setLoading(false);
      }
  };

  const handleSaveQuestion = async () => {
      if (!newQuestionForm.question || !newQuestionForm.correctAnswer) {
          alert("Question and Correct Answer are required.");
          return;
      }

      setLoading(true);
      try {
          if (editingQuestionId) {
              await apiNode.put(`/quizzes/question/${editingQuestionId}`, newQuestionForm);
          } else {
              await apiNode.post(`/quizzes/${editingQuizId}/question`, newQuestionForm);
          }
          const quizData = await fetchQuizQuestions(editingQuizId);
          setQuestionsForEdit(quizData.questions || []);
          setNewQuestionForm({ question: "", options: ["", "", "", ""], correctAnswer: "", points: 1 });
          setEditingQuestionId(null);
      } catch (err) {
          console.error("Save Question Error", err);
          alert("Failed to save question");
      } finally {
          setLoading(false);
      }
  };

  const prepareEditQuestion = (q) => {
      setEditingQuestionId(q.id);
      setNewQuestionForm({
          question: q.question,
          options: q.options && q.options.length > 0 ? q.options : ["", "", "", ""],
          correctAnswer: q.correctAnswer || "",
          points: q.points || 1
      });
  };

  const handleDeleteQuestion = async (qId) => {
      if (!window.confirm("Delete this question?")) return;
      try {
          await apiNode.delete(`/quizzes/question/${qId}`);
          setQuestionsForEdit(questionsForEdit.filter(q => q.id !== qId));
      } catch (err) {
          alert("Failed to delete question");
      }
  };

  const handleOptionChange = (idx, val) => {
      const newOpts = [...newQuestionForm.options];
      newOpts[idx] = val;
      setNewQuestionForm({...newQuestionForm, options: newOpts});
  };

  const handleTakeTest = async (quiz) => {
    setSelectedQuiz(quiz);
    setTestDialogOpen(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTestSubmitted(false);
    setTestScore(0);
    setTestScore(0);
    setTestResult(null);
    setShowAnswers(false); // Reset toggle

    const quizDetails = await fetchQuizQuestions(quiz.id);
    setTestQuestions(quizDetails.questions || []);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    let score = 0;
    let totalPoints = 0;

    testQuestions.forEach((question) => {
      totalPoints += (question.points || 1); 
      if (userAnswers[question.id] === question.correctAnswer) {
        score += (question.points || 1);
      }
    });

    const percentage = Math.round((score / totalPoints) * 100);
    const result = {
      score,
      totalPoints,
      percentage,
      questions: testQuestions
    };

    setTestScore(score);
    setTestResult(result);
    setTestSubmitted(true);
  };

  const handleCloseTest = () => {
    setTestDialogOpen(false);
    setSelectedQuiz(null);
    setTestQuestions([]);
    setUserAnswers({});
    setTestSubmitted(false);
    setTestScore(0);
    setTestResult(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "success";
      case "medium": return "warning";
      case "hard": return "error";
      default: return "default";
    }
  };

  const currentQuestion = testQuestions[currentQuestionIndex];
  const filteredStudents = students.filter(s => 
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <PageHeader 
        title="AI Quiz Manager"
        subtitle="Create, visualize and assign AI-powered assessments."
        breadcrumbs={[{ label: "Dashboard", href: "/instructor" }, { label: "Quizzes" }]}
        actionLabel="Help & Tips"
        onAction={() => window.open('https://skillforge.com/quiz-guide', '_blank')}
      />

       {error && (
         <Fade in>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
            </Alert>
         </Fade>
      )}

      <Grid container spacing={4}>
        {/* Top: Generation Panel (Horizontal) */}
        <Grid item xs={12}>
           <Paper 
                elevation={0}
                sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    border: "1px solid #e2e8f0",
                    background: "linear-gradient(to right, #ffffff, #f8fafc)",
                    mb: 2
                }}
            >
             <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
                <AutoAwesomeIcon color="primary" /> AI Quiz Generator
             </Typography>
             
             <Grid container spacing={2}>
                {/* Row 1: Context & Title */}
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Course"
                        value={selectedCourse}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        size="small"
                        sx={{ bgcolor: 'white', minWidth: 120 }}
                    >
                        <MenuItem value="">Select Course</MenuItem>
                        {courses.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Subject"
                        value={selectedSubject}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        disabled={!selectedCourse}
                        size="small"
                        sx={{ bgcolor: 'white', minWidth: 120 }}
                    >
                        <MenuItem value="">Select Subject</MenuItem>
                        {subjects.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Topic"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        disabled={!selectedSubject}
                        size="small"
                        sx={{ bgcolor: 'white', minWidth: 120 }}
                    >
                        <MenuItem value="">Select Topic</MenuItem>
                        {topics.map((t) => (
                        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                     <TextField
                        fullWidth
                        label="Quiz Title"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        placeholder="E.g. Java Basics"
                        size="small"
                        sx={{ bgcolor: 'white', minWidth: 120 }}
                    />
                </Grid>

                {/* Row 2: Settings & Action */}
                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Type"
                        value={quizType}
                        onChange={(e) => setQuizType(e.target.value)}
                        size="small"
                        sx={{ bgcolor: 'white', minWidth: 100 }}
                    >
                        <MenuItem value="Multiple Choice">MCQ</MenuItem>
                        <MenuItem value="Short Answer">Short Answer</MenuItem>
                        <MenuItem value="Both">Both</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        size="small"
                        sx={{ bgcolor: 'white', minWidth: 100 }}
                    >
                        <MenuItem value="Easy">Easy</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Hard">Hard</MenuItem>
                    </TextField>
                </Grid>
                {quizType === "Both" ? (
                    <>
                        <Grid item xs={6} sm={2} md={1.5}>
                            <TextField
                                type="number"
                                fullWidth
                                label="MCQs"
                                value={mcqCount}
                                onChange={(e) => setMcqCount(e.target.value)}
                                inputProps={{ min: 1, max: 20 }}
                                size="small"
                                sx={{ bgcolor: 'white' }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={2} md={1.5}>
                            <TextField
                                type="number"
                                fullWidth
                                label="Short Ans"
                                value={saCount}
                                onChange={(e) => setSaCount(e.target.value)}
                                inputProps={{ min: 1, max: 20 }}
                                size="small"
                                sx={{ bgcolor: 'white' }}
                            />
                        </Grid>
                    </>
                ) : (
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            type="number"
                            fullWidth
                            label="Questions"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(e.target.value)}
                            inputProps={{ min: 1, max: 20 }}
                            size="small"
                            sx={{ bgcolor: 'white', minWidth: 80 }}
                        />
                    </Grid>
                )}
                 {/* Time Limit Input */}
                 <Grid item xs={12} sm={4} md={2}>
                    <TextField
                        type="number"
                        fullWidth
                        label="Time (min)"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                        size="small"
                        sx={{ bgcolor: 'white', minWidth: 80 }}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                     <Button
                        variant="contained"
                        fullWidth
                        onClick={handleGenerateQuiz}
                        disabled={!quizTitle.trim() || quizTitle.length < 3 || !selectedTopic || loading}
                        sx={{ 
                            fontWeight: "bold", 
                            py: 0.9,
                            height: '100%', // Match height of textfields
                            background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                            '&:hover': {
                                background: "linear-gradient(135deg, #1d4ed8, #4338ca)",
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 8px -1px rgba(79, 70, 229, 0.3)',
                            }
                        }}
                        startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <AutoAwesomeIcon />}
                    >
                       {loading ? "Generating..." : "Generate Quiz"}
                    </Button>
                </Grid>
             </Grid>
           </Paper>
        </Grid>

        {/* Bottom: Quiz List */}
        <Grid item xs={12}>
             <Paper 
                elevation={0}
                sx={{ 
                    p: 0, 
                    borderRadius: 4, 
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                }}
            >
                <Box sx={{ p: 3, borderBottom: "1px solid #f1f5f9", bgcolor: "#fff", display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" fontWeight="bold" color="#334155">
                         <QuizIcon color="action" sx={{ mr: 1, verticalAlign: 'middle' }} /> 
                         Quiz Library
                    </Typography>
                    <Chip label={`${quizzes.length} Quizzes`} size="small" />
                </Box>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {quizzes.length > 0 ? (
                      quizzes.map((quiz) => (
                        <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                          <Paper
                            elevation={0}
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              overflow: 'hidden',
                              border: '1px solid rgba(226, 232, 240, 0.8)',
                              borderRadius: 4,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.12)',
                                borderColor: '#94a3b8',
                              }
                            }}
                          >
                             {/* Top Decoration Strip */}
                             <Box sx={{ 
                                 height: 6, 
                                 background: quiz.difficulty === 'Hard' 
                                    ? 'linear-gradient(90deg, #ef4444, #b91c1c)' 
                                    : quiz.difficulty === 'Easy' 
                                        ? 'linear-gradient(90deg, #22c55e, #15803d)' 
                                        : 'linear-gradient(90deg, #eab308, #ca8a04)' 
                             }} />

                             <Box sx={{ p: 3, flexGrow: 1 }}>
                                {/* Header / Badges */}
                                <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                                     <Chip 
                                        label={quiz.difficulty || "Medium"} 
                                        size="small" 
                                        sx={{ 
                                            borderRadius: 1, 
                                            fontWeight: 'bold',
                                            bgcolor: quiz.difficulty === 'Hard' ? '#fef2f2' : quiz.difficulty === 'Easy' ? '#f0fdf4' : '#fefce8',
                                            color: quiz.difficulty === 'Hard' ? '#b91c1c' : quiz.difficulty === 'Easy' ? '#15803d' : '#854d0e',
                                            border: '1px solid',
                                            borderColor: quiz.difficulty === 'Hard' ? '#fecaca' : quiz.difficulty === 'Easy' ? '#bbf7d0' : '#fef08a'
                                        }}
                                     />
                                     <Box display="flex" alignItems="center" color="text.secondary" sx={{ opacity: 0.8 }}>
                                        <QuizIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        <Typography variant="caption" fontWeight="bold" sx={{ mr: 2 }}>
                                            {quiz.totalQuestions || 5} Qs
                                        </Typography>
                                        
                                        <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        <Typography variant="caption" fontWeight="bold">
                                            {quiz.time_limit || quiz.timeLimit || 10} min
                                        </Typography>
                                     </Box>
                                </Box>

                                {/* Title & Info */}
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, lineHeight: 1.3, color: '#1e293b' }}>
                                    {quiz.title}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }}></span>
                                    ID: {quiz.quizDisplayId || quiz.id}
                                </Typography>
                             </Box>

                             {/* Actions Footer */}
                             <Box sx={{ p: 2, pt: 0, mt: 'auto', display: 'flex', gap: 1 }}>
                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    disableElevation
                                    startIcon={<PlayArrowIcon />}
                                    onClick={(e) => { e.stopPropagation(); handleTakeTest(quiz); }}
                                    sx={{ 
                                        borderRadius: 2, 
                                        textTransform: 'none', 
                                        fontWeight: 'bold',
                                        bgcolor: '#3b82f6',
                                        '&:hover': { bgcolor: '#2563eb' }
                                    }}
                                >
                                    Preview
                                </Button>

                                <IconButton 
                                    size="small" 
                                    sx={{ border: '1px solid #e2e8f0', borderRadius: 2, color: '#64748b' }} 
                                    onClick={(e) => { e.stopPropagation(); openAssignDialog(quiz.id); }}
                                    title="Assign to Students"
                                >
                                    <AssignmentIndIcon fontSize="small" />
                                </IconButton>
                                
                                <IconButton 
                                    size="small" 
                                    sx={{ border: '1px solid #e2e8f0', borderRadius: 2, color: '#64748b' }} 
                                    onClick={(e) => { e.stopPropagation(); openEditDialog(quiz.id); }}
                                    title="Edit"
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                 <IconButton 
                                    size="small" 
                                    component="span"
                                    sx={{ 
                                        border: '1px solid #fee2e2', 
                                        borderRadius: 2, 
                                        bgcolor: '#fef2f2',
                                        color: '#ef4444',
                                        '&:hover': { bgcolor: '#fee2e2' }
                                    }} 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}
                                    title="Delete"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                             </Box>
                          </Paper>
                        </Grid>
                      ))
                  ) : (
                    <Grid item xs={12}>
                        <Box sx={{ p: 6, textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: 4 }}>
                            <Typography color="text.secondary">No quizzes available. Create one using AI!</Typography>
                        </Box>
                    </Grid>
                  )}
                </Grid>
            </Paper>
        </Grid>
      </Grid>

      {/* --- Edit Quiz Questions Dialog --- */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Questions</DialogTitle>
          <DialogContent dividers>
              <Box sx={{ mb: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      {editingQuestionId ? "Edit Question" : "Add New Question"}
                  </Typography>
                  <TextField 
                      fullWidth label="Question Text" 
                      value={newQuestionForm.question}
                      onChange={(e) => setNewQuestionForm({...newQuestionForm, question: e.target.value})}
                      sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                      {newQuestionForm.options.map((opt, idx) => (
                          <TextField 
                              key={idx}
                              label={`Option ${idx + 1}`}
                              value={opt}
                              onChange={(e) => handleOptionChange(idx, e.target.value)}
                              size="small"
                          />
                      ))}
                  </Box>
                  {/* Conditionally render Select (for MCQ) or Text (for Short Answer) */}
                  {(newQuestionForm.options.some(opt => opt.trim() !== "")) ? (
                      <TextField
                          select
                          fullWidth
                          label="Correct Answer"
                          value={newQuestionForm.correctAnswer}
                          onChange={(e) => setNewQuestionForm({...newQuestionForm, correctAnswer: e.target.value})}
                          sx={{ mb: 2 }}
                      >
                            {newQuestionForm.options.filter(o => o).map((opt, i) => (
                                <MenuItem key={i} value={opt}>{opt}</MenuItem>
                            ))}
                      </TextField>
                  ) : (
                      <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Model Answer / Keywords"
                          value={newQuestionForm.correctAnswer}
                          onChange={(e) => setNewQuestionForm({...newQuestionForm, correctAnswer: e.target.value})}
                          sx={{ mb: 2 }}
                          helperText="Enter the expected answer or keywords for this short answer question."
                      />
                  )}
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                      {editingQuestionId && (
                          <Button onClick={() => {
                              setEditingQuestionId(null); 
                              setNewQuestionForm({ question: "", options: ["", "", "", ""], correctAnswer: "", points: 1 });
                          }}>Cancel Edit</Button>
                      )}
                      <Button variant="contained" onClick={handleSaveQuestion}>
                          {editingQuestionId ? "Update Question" : "Add Question"}
                      </Button>
                  </Box>
              </Box>

              <Typography variant="h6" gutterBottom>Existing Questions ({questionsForEdit.length})</Typography>
              <List>
                  {questionsForEdit.map((q, idx) => (
                      <ListItem key={q.id} sx={{ bgcolor: "#f9f9f9", mb: 1, borderRadius: 1 }}>
                          <ListItemText 
                              primary={`Q${idx+1}: ${q.question}`}
                              secondary={`Ans: ${q.correctAnswer || q.answer || "N/A"}`}
                          />
                          <IconButton size="small" onClick={() => prepareEditQuestion(q)}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => handleDeleteQuestion(q.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </ListItem>
                  ))}
              </List>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Done</Button>
          </DialogActions>
      </Dialog>

      {/* --- Assignment Dialog --- */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Quiz to Students</DialogTitle>
          <DialogContent dividers>
              <TextField 
                fullWidth 
                placeholder="Search students..." 
                variant="outlined" 
                size="small" 
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                }}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">{filteredStudents.length} students found</Typography>
                  <Button size="small" onClick={handleSelectAllStudents}>
                      {selectedStudentIds.length === filteredStudents.length ? "Deselect All" : "Select All"}
                  </Button>
              </Box>
              <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <List dense component="div" role="list">
                      {filteredStudents.map((value) => {
                          const labelId = `transfer-list-item-${value.id}-label`;
                          return (
                              <ListItem
                                  key={value.id}
                                  role="listitem"
                                  button
                                  onClick={() => handleToggleStudent(value.id)}
                              >
                                  <ListItemIcon>
                                      <Checkbox
                                          checked={selectedStudentIds.indexOf(value.id) !== -1}
                                          tabIndex={-1}
                                          disableRipple
                                          inputProps={{ 'aria-labelledby': labelId }}
                                      />
                                  </ListItemIcon>
                                  <ListItemText 
                                      id={labelId} 
                                      primary={value.name || value.username} 
                                      secondary={value.email} 
                                  />
                              </ListItem>
                          );
                      })}
                      {filteredStudents.length === 0 && (
                          <ListItem><ListItemText primary="No students found." /></ListItem>
                      )}
                  </List>
              </Paper>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmAssign} variant="contained" disabled={loading || selectedStudentIds.length === 0}>
                  {loading ? "Assigning..." : "Assign Quiz"}
              </Button>
          </DialogActions>
      </Dialog>


      {/* --- Test Taking Dialog (Preview) --- */}
      <Dialog open={testDialogOpen} onClose={handleCloseTest} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedQuiz?.title || "Test Preview"}</Typography>
            <Box display="flex" alignItems="center" gap={1}>
                {/* Toggle for answers */}
                <FormControlLabel
                    control={<Checkbox checked={showAnswers} onChange={(e) => setShowAnswers(e.target.checked)} />}
                    label="Show Answers"
                />
                <IconButton onClick={handleCloseTest} size="small"><CloseIcon /></IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {testSubmitted ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
               <Typography variant="h5" color="secondary">Instructor Preview Completed</Typography>
               <Typography variant="h4">{testResult.score} / {testResult.totalPoints}</Typography>
            </Box>
          ) : (
            <>
              {testQuestions.length > 0 && currentQuestion && (
                 <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Question {currentQuestionIndex + 1} of {testQuestions.length}</Typography>
                    <Paper sx={{ p: 3, mb: 3, bgcolor: "#f8fafc" }}>
                        <Typography variant="h6" gutterBottom>{currentQuestion.question}</Typography>
                        <RadioGroup value={userAnswers[currentQuestion.id] || ""} onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}>
                          {currentQuestion.options && currentQuestion.options.map((option, idx) => (
                              <FormControlLabel 
                                key={idx} 
                                value={option} 
                                control={<Radio />} 
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography>{option}</Typography>
                                      {showAnswers && option === currentQuestion.correctAnswer && (
                                          <Chip 
                                            label="Correct Answer" 
                                            color="success" 
                                            size="small" 
                                            variant="outlined"
                                            sx={{ ml: 2, height: 20, fontSize: '0.7rem' }} 
                                          />
                                      )}
                                  </Box>
                                } 
                                sx={{ 
                                    width: '100%', 
                                    m: 0, 
                                    p: 1, 
                                    borderRadius: 1,
                                    bgcolor: (showAnswers && option === currentQuestion.correctAnswer) ? 'rgba(46, 125, 50, 0.12)' : 'transparent',
                                    border: (showAnswers && option === currentQuestion.correctAnswer) ? '1px solid #4caf50' : '1px solid transparent'
                                }}
                              />
                          ))}
                        </RadioGroup>
                        {/* Short Answer Input */}
                        {(!currentQuestion.options || currentQuestion.options.length === 0) && (
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Type your answer here..."
                                value={userAnswers[currentQuestion.id] || ""}
                                onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                                sx={{ mt: 2 }}
                            />
                        )}
                        {showAnswers && (
                            <Box sx={{ mt: 2, p: 1, bgcolor: '#f0fdf4', borderRadius: 1, border: '1px dashed #4caf50' }}>
                                <Typography variant="caption" color="success.main" fontWeight="bold" sx={{ whiteSpace: 'pre-wrap' }}>
                                    Correct Answer: {currentQuestion.correctAnswer}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                         <Button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>Previous</Button>
                         {currentQuestionIndex < testQuestions.length - 1 ? (
                              <Button onClick={handleNextQuestion} variant="contained">Next</Button>
                         ) : (
                              <Button onClick={handleSubmitTest} variant="contained" color="success">Finish Preview</Button>
                         )}
                    </Box>
                 </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <QuizResultDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} results={generatedQuiz} />
      <QuizReviewDialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} onSave={handleSaveQuiz} quizData={generatedQuiz} />
    </Box>
  );
};

export default QuizPage;

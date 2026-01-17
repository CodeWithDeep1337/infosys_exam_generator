import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiNode from "../../services/apiNode";
import "bootstrap/dist/css/bootstrap.min.css";

const TakeQuiz = () => {
  const { displayId } = useParams(); // This is effectively the quizId (e.g. 1, 2)
  const navigate = useNavigate();

  // State Management
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [resultData, setResultData] = useState(null);
  
  // Re-added missing state variables
  const [timeLeft, setTimeLeft] = useState(600); 
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        // Using the public/protected get quiz by ID endpoint
        const response = await apiNode.get(`/quiz/${displayId}`);
        if (response.data) {
          setQuiz(response.data);
          // If the quiz has a time limit (in minutes), set it in seconds
          // Default to 10 minutes if not specified
          // Handle both camelCase (Java default) and snake_case (DB/Node)
          const limitInMinutes = response.data.timeLimit || response.data.time_limit || 10;
          setTimeLeft(limitInMinutes * 60);
        } else {
            setError("Quiz data is empty.");
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. It may not exist or you don't have permission.");
      } finally {
        setLoading(false);
      }
    };

    if (displayId) {
      fetchQuiz();
    }
  }, [displayId]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !isFinished && !resultData) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished && !resultData) {
      handleSubmit();
    }
  }, [timeLeft, isFinished, resultData]);

  const handleOptionSelect = (questionId, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleTextChange = (questionId, text) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleSubmit = async () => {
    setIsFinished(true);
    let score = 0;
    let correctCount = 0;
    
    // Calculate Score on Frontend
    if (quiz && quiz.questions) {
        quiz.questions.forEach((q) => {
            if (q.options && q.options.length > 0) {
                 if (selectedAnswers[q.id] === q.correctAnswer) {
                    score++;
                    correctCount++;
                 }
            }
        });

        const percentage = Math.round((score / quiz.questions.length) * 100);
        
        try {
          // Submit to backend
          await apiNode.post("/quiz/submit", {
            quizId: quiz.id,
            score: percentage,
            answers: selectedAnswers,
            timestamp: new Date().toISOString(),
          });
          
          // Set Result Data for Display
          setResultData({
              score: percentage,
              correctCount,
              totalQuestions: quiz.questions.length,
              passed: percentage >= 30
          });

        } catch (err) {
          console.error("Submission error:", err);
          setError("Failed to submit results. Please try again.");
          setIsFinished(false); // Allow retry
        }
    }
  };

  // Loading & Error States
  if (loading) return (
      <div className="vh-100 d-flex flex-column align-items-center justify-content-center">
        <div className="spinner-grow text-primary" role="status"></div>
        <p className="mt-3 text-muted fw-bold">Loading Quiz...</p>
      </div>
  );

  if (error) return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow-sm rounded-3" role="alert">
          <h4 className="alert-heading"><i className="bi bi-exclamation-triangle-fill me-2"></i>Error</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-danger" onClick={() => navigate("/student/dashboard")}>Back to Dashboard</button>
        </div>
      </div>
  );

  if (!quiz) return <div className="text-center mt-5">Quiz not found.</div>;

  // --- RESULT VIEW ---
  if (resultData) {
      return (
          <div className="container py-5">
              <div className="row justify-content-center">
                  <div className="col-md-6 text-center">
                      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                          <div className={`card-header py-4 text-white ${resultData.passed ? 'bg-success' : 'bg-danger'}`}>
                              <h2 className="fw-bold mb-0">{resultData.passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
                              <p className="mb-0 opacity-75">{resultData.passed ? 'Great job!' : 'Keep practicing!'}</p>
                          </div>
                          <div className="card-body p-5">
                             <div className="mb-4">
                                 <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle shadow-inner" style={{width: '120px', height: '120px'}}>
                                     <div>
                                         <h1 className={`fw-bold mb-0 text-${resultData.passed ? 'success' : 'danger'}`} style={{fontSize: '3rem'}}>
                                             {resultData.score}%
                                         </h1>
                                     </div>
                                 </div>
                             </div>
                             
                             <h5 className="text-muted mb-4">
                                 You answered <span className="fw-bold text-dark">{resultData.correctCount}</span> out of <span className="fw-bold text-dark">{resultData.totalQuestions}</span> questions correctly.
                             </h5>

                             <div className="d-grid gap-3">
                                 <button className="btn btn-primary btn-lg rounded-pill fw-bold" onClick={() => navigate("/student/dashboard")}>
                                     <i className="bi bi-speedometer2 me-2"></i> Return to Dashboard
                                 </button>
                                 {!resultData.passed && (
                                     <button className="btn btn-outline-danger btn-lg rounded-pill fw-bold" onClick={() => window.location.reload()}>
                                         <i className="bi bi-arrow-repeat me-2"></i> Retake Quiz
                                     </button>
                                 )}
                             </div>
                          </div>
                          <div className="card-footer bg-light p-3">
                              <small className="text-muted">Results saved successfully.</small>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- QUIZ TAKING VIEW ---
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Helper for formatting time
  const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-9">
          {/* Header with Timer */}
          <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
            <div>
                 <h4 className="fw-bold text-dark mb-0">{quiz.title}</h4>
                 <small className="text-muted">Topic: {quiz.topic_name || "General"}</small>
            </div>
            <div
              className={`badge d-flex align-items-center gap-2 ${
                timeLeft < 60 ? "bg-danger" : "bg-dark"
              } p-2 px-3 fs-6 shadow-sm rounded-pill`}
            >
              <i className="bi bi-stopwatch"></i>
              <span style={{fontVariantNumeric: 'tabular-nums'}}>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress mb-4 rounded-pill bg-light" style={{ height: "8px" }}>
            <div
              className="progress-bar bg-primary"
              style={{ width: `${progress}%`, transition: "width 0.5s ease" }}
            ></div>
          </div>

          {/* Question Card */}
          <div className="card shadow-lg border-0 p-4 p-md-5 mb-4 rounded-4">
            <div className="d-flex justify-content-between mb-4">
                 <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill">
                     Question {currentQuestionIndex + 1} of {quiz.questions.length}
                 </span>
            </div>
            
            <h4 className="mb-5 fw-bold lh-base text-dark">{currentQuestion.question || currentQuestion.question_text}</h4>

            <div className="d-grid gap-3">
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      className={`btn text-start p-3 border rounded-3 position-relative overflow-hidden transition ${
                        selectedAnswers[currentQuestion.id] === option
                          ? "btn-primary shadow border-primary"
                          : "btn-outline-light text-dark border-secondary-subtle hover-bg-light"
                      }`}
                      style={{transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"}}
                      onClick={() => handleOptionSelect(currentQuestion.id, option)}
                    >
                      <div className="d-flex align-items-center position-relative z-1">
                        <span className={`badge rounded-circle me-3 ${
                             selectedAnswers[currentQuestion.id] === option ? "bg-white text-primary" : "bg-secondary bg-opacity-10 text-secondary"
                        }`} style={{width: "32px", height: "32px", display:"flex", alignItems:"center", justifyContent:"center", fontSize: '0.9rem'}}>
                            {String.fromCharCode(65+idx)}
                        </span>
                        <span className="fw-medium">{option}</span>
                      </div>
                    </button>
                  ))
              ) : (
                  <textarea 
                      className="form-control bg-light border-0 shadow-inner rounded-3 p-3" 
                      rows="5" 
                      placeholder="Type your answer here..."
                      value={selectedAnswers[currentQuestion.id] || ""}
                      onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                      style={{resize: 'none', fontSize: '1.1rem'}}
                  ></textarea>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-outline-secondary px-4 rounded-pill fw-bold"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            >
              <i className="bi bi-arrow-left me-2"></i> Previous
            </button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                className="btn btn-success px-5 rounded-pill fw-bold shadow-lg hover-scale"
                onClick={handleSubmit}
              >
                Submit Quiz <i className="bi bi-check-lg ms-2"></i>
              </button>
            ) : (
              <button
                className="btn btn-primary px-5 rounded-pill fw-bold shadow-lg hover-scale"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              >
                Next <i className="bi bi-arrow-right ms-2"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;

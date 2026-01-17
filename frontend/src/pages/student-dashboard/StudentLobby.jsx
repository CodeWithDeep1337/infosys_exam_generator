import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiNode from "../../services/apiNode";
import "bootstrap/dist/css/bootstrap.min.css";

const StudentLobby = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [stats, setStats] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Fetch ASSIGNED quizzes from Node backend
        const res = await apiNode.get("/quiz/my-quizzes");
        
        // Map Backend Data to Frontend UI Format
        const mappedQuizzes = res.data.map(q => ({
            id: q.quiz_id,
            displayId: q.quiz_id, // Use Database ID for navigation
            title: q.title,
            topic: { name: q.topic_name || "General" },
            quizId: q.quiz_id,
            status: q.status,
            difficulty: q.difficulty || "Medium",
            time_limit: q.time_limit // ✅ Map time_limit
        }));

        // Filter: Show PENDING or IN_PROGRESS quizzes in the Lobby
        const readyQuizzes = mappedQuizzes.filter(q => q.status !== 'COMPLETED');

        setQuizzes(readyQuizzes);
        setFilteredQuizzes(readyQuizzes);

        const uniqueCategories = [
          "All",
          ...new Set(readyQuizzes.map((q) => q.topic.name)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching quizzes", err);
      }
    };
    
    // Fetch Adaptive Stats to recommend difficulty
    const fetchStats = async () => {
        try {
            const res = await apiNode.get("/quiz/stats");
            setStats(res.data);
        } catch(err) {
            console.error("Error fetching stats", err);
        }
    }

    fetchQuizzes();
    fetchStats();
  }, []);

  // ✅ Trigger filtering whenever search term or category changes
  useEffect(() => {
    let result = quizzes;

    if (selectedCategory !== "All") {
      result = result.filter(
        (q) => (q.topic?.name || `Topic ${q.topicId}`) === selectedCategory
      );
    }

    if (searchTerm) {
      result = result.filter((q) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuizzes(result);
  }, [searchTerm, selectedCategory, quizzes]);

  // Color mapping helpers
  const getDifficultyColor = (diff) => {
      switch(diff?.toLowerCase()) {
          case 'hard': return 'danger';
          case 'medium': return 'warning';
          case 'easy': 
          default: return 'success';
      }
  };

  const getGradient = (index) => {
      const gradients = [
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "linear-gradient(135deg, #2af598 0%, #009efd 100%)",
          "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      ];
      return gradients[index % gradients.length];
  };

  return (
    <div className="container py-5">
      
      {/* --- HERO / HEADER --- */}
      <div className="text-center mb-5 slide-down">
          <h1 className="fw-bold mb-3">Quiz Lobby</h1>
          <p className="text-muted lead mb-4">Challenge yourself and test your knowledge.</p>
          
          <div className="position-relative mx-auto" style={{maxWidth: '600px'}}>
             <input
                type="text"
                className="form-control form-control-lg rounded-pill shadow-sm ps-5 border-0 bg-white"
                placeholder="Search quizzes by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{height: '60px'}}
              />
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted fs-5"></i>
          </div>
      </div>

       {/* --- CATEGORY PILLS --- */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-5 fade-in" style={{animationDelay: '0.2s'}}>
          {categories.map((cat, idx) => (
              <button
                key={cat}
                className={`btn rounded-pill px-4 fw-bold transition ${
                  selectedCategory === cat
                    ? "btn-dark shadow"
                    : "btn-white text-muted border border-light shadow-sm"
                }`}
                onClick={() => setSelectedCategory(cat)}
                style={{minWidth: '100px'}}
              >
                {cat}
              </button>
            ))}
      </div>


      {/* --- QUIZ GRID --- */}
      <div className="row g-4 fade-in" style={{animationDelay: '0.4s'}}>
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz, index) => {
             const isRecommended = stats && stats.nextDifficulty === quiz.difficulty;
             
             return (
                <div className="col-md-6 col-lg-4" key={quiz.id}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-lift transition group">
                        {/* Card Header Gradient */}
                        <div className="p-4 text-white position-relative" style={{
                            background: getGradient(index),
                            minHeight: '120px'
                        }}>
                             <div className="d-flex justify-content-between align-items-start position-relative z-1">
                                <span className="badge bg-white bg-opacity-25 backdrop-blur border border-white border-opacity-25 fw-normal rounded-pill px-3">
                                   <i className="bi bi-folder2-open me-1"></i> {quiz.topic?.name || "General"}
                                </span>
                                {isRecommended && (
                                    <span className="badge bg-white text-primary fw-bold shadow-sm rounded-pill px-2 py-1" title="Recommended for your level">
                                        <i className="bi bi-star-fill"></i>
                                    </span>
                                )}
                             </div>
                             
                             {/* Decorative Icon */}
                             <i className="bi bi-file-text position-absolute bottom-0 end-0 text-white opacity-25" 
                                style={{fontSize: '6rem', transform: 'rotate(-15deg) translate(20px, 20px)'}}></i>
                        </div>

                        {/* Card Body */}
                        <div className="card-body p-4 d-flex flex-column">
                            <h5 className="card-title fw-bold mb-3">{quiz.title}</h5>
                            
                            <div className="d-flex gap-2 mb-4">
                                <span className={`badge bg-${getDifficultyColor(quiz.difficulty)} bg-opacity-10 text-${getDifficultyColor(quiz.difficulty)} rounded-pill px-3`}>
                                    {quiz.difficulty}
                                </span>
                                <span className="badge bg-light text-muted rounded-pill px-3 border">
                                    <i className="bi bi-clock me-1"></i> {quiz.time_limit || 10} min
                                </span>
                            </div>

                            <button
                                className={`btn w-100 py-3 rounded-pill fw-bold mt-auto transition shadow-sm ${isRecommended ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => navigate(`/student/take-quiz/${quiz.displayId}`)}
                            >
                                {quiz.status === 'IN_PROGRESS' ? 'Continue Quiz' : 'Start Quiz'} <i className="bi bi-arrow-right ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            );
          })
        ) : (
          <div className="col-12 text-center py-5">
            <div className="bg-light rounded-4 p-5 border border-dashed mx-auto" style={{maxWidth: '500px'}}>
                <i className="bi bi-inbox fs-1 text-muted opacity-50 mb-3 d-block"></i>
                <h5 className="fw-bold text-muted">No quizzes found</h5>
                <p className="text-muted mb-0">Try adjusting your filters or search terms.</p>
            </div>
          </div>
        )}
      </div>

       <style jsx>{`
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 1rem 3rem rgba(0,0,0,.15)!important; }
        .transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .backdrop-blur { backdrop-filter: blur(10px); }
        
        .slide-down { animation: slideDown 0.8s ease-out forwards; }
        .fade-in { opacity: 0; animation: fadeIn 0.8s ease-out forwards; }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .btn-white { background: white; }
        .btn-white:hover { background: #f8f9fa; }
      `}</style>
    </div>
  );
};

export default StudentLobby;


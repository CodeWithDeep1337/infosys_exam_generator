import React, { useState, useEffect } from "react";
import apiNode from "../../services/apiNode";
import axios from "../../utils/axiosConfig"; // Java Backend
import "bootstrap/dist/css/bootstrap.min.css"; 
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [username, setUsername] = useState("Student");

  useEffect(() => {
    const storedUser = localStorage.getItem("username"); // Check Login.jsx if this is set
    if (storedUser) setUsername(storedUser);
    
    fetchDashboardData();
    fetchCourses();
  }, []);

  const fetchDashboardData = async () => {
      try {
        // Fetch Adaptive Stats 
        const statsRes = await apiNode.get("/quiz/stats");
        setStats(statsRes.data);
      } catch (e) {
        console.warn("Could not fetch stats", e);
      }
  };

  const fetchCourses = async () => {
      try {
          const res = await axios.get("/courses");
          setCourses(res.data);
      } catch (err) {
          console.error("Error fetching courses", err);
      }
  };

  return (
    <div className="container py-4">
      
      {/* --- HERO SECTION --- */}
      <div className="p-5 mb-5 rounded-5 text-white hero-section position-relative overflow-hidden slide-down">
          <div className="position-relative z-1">
              <span className="badge bg-white bg-opacity-25 border border-white border-opacity-25 px-3 py-2 rounded-pill mb-3 backdrop-blur">
                  <i className="bi bi-mortarboard-fill me-2"></i> Welcome Back
              </span>
              <h1 className="display-4 fw-bold mb-3">Hello, {username}!</h1>
              <p className="lead text-white-50 mb-4" style={{maxWidth: '600px'}}>
                  Ready to continue your learning journey? Check your latest stats or jump straight into a new quiz.
              </p>
              <div className="d-flex gap-3">
                   <Link to="/student/materials" className="btn btn-light rounded-pill px-4 py-2 fw-bold shadow-sm btn-hover-scale">
                      <i className="bi bi-play-circle-fill me-2 text-primary"></i>Start Learning
                  </Link>
                  <Link to="/student/progress" className="btn btn-outline-light rounded-pill px-4 py-2 fw-bold backdrop-blur btn-hover-scale">
                      View Progress
                  </Link>
              </div>
          </div>
          
          {/* Abstract Shapes/Background */}
          <div className="position-absolute top-0 end-0 h-100 w-50 d-none d-lg-block" style={{
              background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)',
              filter: 'blur(60px)'
          }}></div>
          <div className="circle-shape"></div>
      </div>

      {/* --- STATS CARDS --- */}
      <h5 className="fw-bold mb-4 fade-in" style={{animationDelay: '0.2s'}}>At a Glance</h5>
      <div className="row g-4 mb-5 fade-in" style={{animationDelay: '0.3s'}}>
          {/* Card 1 */}
          <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 p-4 rounded-4 hover-lift transition bg-white">
                  <div className="d-flex align-items-center mb-3">
                      <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary me-3">
                          <i className="bi bi-lightning-charge-fill fs-4"></i>
                      </div>
                      <div>
                          <small className="text-muted text-uppercase fw-bold ls-1">Current Focus</small>
                          <h5 className="fw-bold mb-0">{stats?.nextDifficulty || "Beginner"}</h5>
                      </div>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                      <div className="progress-bar bg-primary" style={{width: '60%'}}></div>
                  </div>
              </div>
          </div>

          {/* Card 2 */}
          <div className="col-md-4">
               <div className="card border-0 shadow-sm h-100 p-4 rounded-4 hover-lift transition bg-white">
                  <div className="d-flex align-items-center mb-3">
                      <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success me-3">
                          <i className="bi bi-check-circle-fill fs-4"></i>
                      </div>
                      <div>
                          <small className="text-muted text-uppercase fw-bold ls-1">Performance</small>
                          <h5 className="fw-bold mb-0">{stats?.avgScore || 0}% Avg. Score</h5>
                      </div>
                  </div>
                   <div className="progress" style={{height: '6px'}}>
                      <div className="progress-bar bg-success" style={{width: `${stats?.avgScore || 0}%`}}></div>
                  </div>
              </div>
          </div>

          {/* Card 3 */}
          <div className="col-md-4">
               <div className="card border-0 shadow-sm h-100 p-4 rounded-4 hover-lift transition bg-white">
                  <div className="d-flex align-items-center mb-3">
                      <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning me-3">
                          <i className="bi bi-trophy-fill fs-4"></i>
                      </div>
                      <div>
                          <small className="text-muted text-uppercase fw-bold ls-1">Activity</small>
                          <h5 className="fw-bold mb-0">{stats?.totalAttempts || 0} Quizzes</h5>
                      </div>
                  </div>
                   <div className="progress" style={{height: '6px'}}>
                      <div className="progress-bar bg-warning" style={{width: '100%'}}></div>
                  </div>
              </div>
          </div>
      </div>

       {/* --- CTA / COURSE PREVIEW --- */}
       <div className="row g-4 fade-in" style={{animationDelay: '0.4s'}}>
           <div className="col-lg-8">
               <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-light position-relative overflow-hidden">
                   <div className="position-relative z-1">
                       <h4 className="fw-bold mb-3">Continue Learning</h4>
                       <p className="text-muted mb-4">You have access to <strong>{courses.length} courses</strong>. Dive back into your materials.</p>
                       <div className="d-flex flex-wrap gap-2">
                           {courses.slice(0, 3).map(c => (
                               <span key={c.id} className="badge bg-white text-dark border px-3 py-2 rounded-pill shadow-sm">
                                   {c.title}
                               </span>
                           ))}
                           {courses.length > 3 && <span className="badge bg-white text-muted border px-3 py-2 rounded-pill">+{courses.length - 3} more</span>}
                       </div>
                   </div>
                   <i className="bi bi-book position-absolute bottom-0 end-0 text-muted opacity-10" style={{fontSize: '8rem', transform: 'rotate(-20deg) translate(20px, 20px)'}}></i>
               </div>
           </div>
           
            <div className="col-lg-4">
               {/* AI Recommendation Card */}
               {stats?.suggestedContent ? (
                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white text-start position-relative overflow-hidden hover-lift transition">
                      <span className="badge bg-primary bg-opacity-10 text-primary mb-3 w-auto align-self-start">
                          <i className="bi bi-stars me-1"></i> AI Recommended
                      </span>
                      <h5 className="fw-bold mb-2">Recommended for You</h5>
                      <p className="text-muted small mb-3">Based on your recent performance in <strong>{stats.weakTopic || "General"}</strong>.</p>
                      
                      <Link to={`/student/roadmap`} className="btn btn-outline-primary rounded-pill btn-sm stretched-link fw-bold mt-auto">
                          View Roadmap <i className="bi bi-map ms-1"></i>
                      </Link>
                  </div>
               ) : (
                   <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-dark text-white text-center d-flex flex-column justify-content-center align-items-center position-relative overflow-hidden hover-scale transition cursor-pointer"
                        onClick={() => window.location.href = "/student/lobby"}>
                       <div className="position-relative z-1">
                           <div className="mb-3 p-3 rounded-circle bg-white bg-opacity-10 d-inline-block">
                               <i className="bi bi-controller fs-2"></i>
                           </div>
                           <h5 className="fw-bold">Ready for a Challenge?</h5>
                           <p className="small text-white-50 mb-0">Test your skills in the Quiz Lobby</p>
                       </div>
                       {/* Background Glow */}
                        <div className="position-absolute w-100 h-100 top-0 start-0" style={{
                          background: 'radial-gradient(circle at 100% 0%, #6366f1 0%, transparent 50%)',
                          opacity: 0.5
                        }}></div>
                   </div>
               )}
           </div>
       </div>

      <style jsx>{`
        .hero-section {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.4);
        }
        .backdrop-blur { backdrop-filter: blur(10px); }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.15)!important; }
        .hover-scale:hover { transform: scale(1.02); }
        .cursor-pointer { cursor: pointer; }
        .transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .ls-1 { letter-spacing: 1px; }

        .slide-down { animation: slideDown 0.8s ease-out forwards; }
        .fade-in { opacity: 0; animation: fadeIn 0.8s ease-out forwards; }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .circle-shape {
            position: absolute;
            width: 300px;
            height: 300px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            bottom: -100px;
            left: -50px;
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;


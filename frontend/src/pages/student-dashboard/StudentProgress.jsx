import React, { useState, useEffect } from "react";
import apiNode from "../../services/apiNode";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentProgress = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Stats
      try {
        const statsRes = await apiNode.get("/quiz/stats");
        setStats(statsRes.data);
      } catch (e) {
        console.warn("Could not fetch stats", e);
      }

      // 2. Fetch History
      const historyRes = await apiNode.get("/quiz/my-quizzes");
      
      const formattedHistory = historyRes.data.map((item) => ({
        id: item.attempt_id,
        quizId: item.quiz_id,
        title: item.title,
        score: item.score || 0,
        topicName: item.topic_name,
        status: item.status,
        createdAt: item.created_at || new Date().toISOString(),
      }));

      // Sort by date for charts
      formattedHistory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      // Attempt Counting Logic
      const attemptCounts = {};
      const historyWithAttempts = formattedHistory.map((item) => {
        if (!attemptCounts[item.quizId]) attemptCounts[item.quizId] = 0;
        attemptCounts[item.quizId]++;
        const count = attemptCounts[item.quizId];
        const suffix = ["st", "nd", "rd"][((count + 90) % 100 - 10) % 10 - 1] || "th";
        return { ...item, attemptLabel: `${count}${suffix} Attempt` };
      });

      setHistory(historyWithAttempts);
    } catch (err) {
      console.error("Error fetching progress data", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Chart Data Preparation ---
  // 1. Score Trend (Line Chart)
  const lineChartData = {
    labels: history.map((h) => 
       h.title.length > 15 ? h.title.substring(0, 15) + "..." : h.title
    ),
    datasets: [
      {
        label: "Quiz Score (%)",
        data: history.map((h) => h.score),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Performance Trend Check" },
    },
    scales: {
      y: { min: 0, max: 100 },
    },
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-5 fade-in">
        <div>
           <h2 className="fw-bold mb-1">My Progress</h2>
           <p className="text-muted">Track your learning journey and performance analytics</p>
        </div>
      </div>

      {/* --- STATS OVERVIEW --- */}
      {stats && (
          <div className="row g-4 mb-5 slide-up">
              <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100 p-3 rounded-4 bg-primary bg-opacity-10 text-primary">
                      <div className="card-body text-center">
                          <i className="bi bi-trophy-fill fs-1 mb-2"></i>
                          <h6 className="text-uppercase small fw-bold ls-1 mb-1">Current Level</h6>
                          <h3 className="fw-bold mb-0">{stats.nextDifficulty}</h3>
                      </div>
                  </div>
              </div>
              <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100 p-3 rounded-4 bg-success bg-opacity-10 text-success">
                      <div className="card-body text-center">
                          <i className="bi bi-graph-up-arrow fs-1 mb-2"></i>
                          <h6 className="text-uppercase small fw-bold ls-1 mb-1">Average Score</h6>
                          <h3 className="fw-bold mb-0">{stats.avgScore}%</h3>
                      </div>
                  </div>
              </div>
              <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100 p-3 rounded-4 bg-warning bg-opacity-10 text-warning">
                      <div className="card-body text-center">
                          <i className="bi bi-journal-check fs-1 mb-2"></i>
                          <h6 className="text-uppercase small fw-bold ls-1 mb-1">Quizzes Taken</h6>
                          <h3 className="fw-bold mb-0">{stats.totalAttempts}</h3>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- CHARTS SECTION --- */}
      <div className="card border-0 shadow-lg rounded-4 p-4 mb-5 slide-up" style={{animationDelay: '0.1s'}}>
          <div className="card-body">
              <h5 className="fw-bold mb-4">Performance Analytics</h5>
              <div style={{ maxHeight: '400px' }}>
                 {history.length > 0 ? (
                     <Line data={lineChartData} options={lineChartOptions} />
                 ) : (
                     <p className="text-muted text-center py-5">Complete some quizzes to see your analytics!</p>
                 )}
              </div>
          </div>
      </div>

      {/* --- DETAILED HISTORY --- */}
      <h5 className="fw-bold mb-3 slide-up" style={{animationDelay: '0.2s'}}>Detailed History</h5>
      <div className="row g-3 slide-up" style={{animationDelay: '0.3s'}}>
        {[...history].reverse().map((item) => (
             <div key={item.id} className="col-12">
                 <div className="card border-0 shadow-sm rounded-3 overflow-hidden hover-shadow transition">
                     <div className="card-body d-flex align-items-center">
                         <div className={`p-3 rounded-2 me-3 ${item.score >= 50 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                             <h4 className="fw-bold mb-0">{item.score}%</h4>
                         </div>
                         <div className="flex-grow-1">
                             <div className="d-flex justify-content-between align-items-start">
                                 <div>
                                     <h6 className="fw-bold mb-0">{item.title}</h6>
                                     <small className="text-muted">{item.topicName} • {new Date(item.createdAt).toLocaleDateString()}</small>
                                 </div>
                                 <div className="text-end">
                                     <span className="badge bg-light text-dark border">{item.attemptLabel}</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        ))}
        {history.length === 0 && <p className="text-muted">No history found.</p>}
      </div>

      <style jsx>{`
        .hover-shadow:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; transform: translateY(-2px); }
        .transition { transition: all 0.3s ease; }
        .ls-1 { letter-spacing: 1px; }
        .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
        .slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; transform: translateY(20px); }
        
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default StudentProgress;

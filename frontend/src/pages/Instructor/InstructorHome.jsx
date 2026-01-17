import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/axiosConfig"; // Java Backend
import CountUp from "../../components/CountUp"; 
import { toast } from "react-toastify";

const InstructorHome = () => {
  const [stats, setStats] = useState({
    courses: 0,
    subjects: 0,
    topics: 0,
    quizzes: 0,
    students: 0,
    recentCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await axios.get(`/instructor/dashboard-stats/${userId}`);
      setStats(res.data);
      setLoading(false);
      // Optional: Toast only on error or specific success to avoid spam
    } catch (error) {
      console.error("Error fetching instructor stats", error);
      toast.error("Failed to load dashboard data.");
      setLoading(false);
    }
  };

  if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: "50vh"}}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
      );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold text-dark mb-1">Instructor Dashboard</h2>
          <p className="text-muted mb-0">Welcome back! Here's an overview of your teaching progress.</p>
        </div>
        <Link to="/instructor/courses" className="btn btn-primary rounded-pill px-4 py-2 shadow-sm text-decoration-none text-white fw-bold">
          <i className="bi bi-plus-lg me-2"></i>Create New Course
        </Link>
      </div>

      {/* Stats Cards - Premium Grid */}
      <div className="row g-4 mb-5">
        
        <StatsCard 
            title="Total Courses" 
            count={stats.courses} 
            icon="bi-journal-bookmark-fill" 
            gradient="linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)" 
        />
        
        <StatsCard 
            title="Enrolled Students" 
            count={stats.students} 
            icon="bi-people-fill" 
            gradient="linear-gradient(135deg, #ef4444 0%, #f97316 100%)" 
        />

        <StatsCard 
            title="Active Quizzes" 
            count={stats.quizzes} 
            icon="bi-lightning-charge-fill" 
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" 
        />
        
        <StatsCard 
            title="Topics Covered" 
            count={stats.topics} 
            icon="bi-layers-fill" 
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" 
        />
      </div>

      <div className="row g-4">
        {/* Recent Courses Table */}
        <div className="col-lg-8">
            <div className="card border-0 shadow-sm" style={{borderRadius: "1rem"}}>
                <div className="card-header bg-white border-0 py-4 px-4">
                    <h5 className="fw-bold mb-0">Recent Courses</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light text-uppercase small text-muted">
                                <tr>
                                    <th className="ps-4 py-3 border-0">Course Name</th>
                                    <th className="border-0">Difficulty</th>
                                    <th className="border-0">Duration</th>
                                    <th className="border-0">Created At</th>
                                    <th className="pe-4 border-0 text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentCourses && stats.recentCourses.length > 0 ? (
                                    stats.recentCourses.map(course => (
                                        <tr key={course.id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" style={{width: "40px", height: "40px"}}>
                                                        <i className="bi bi-code-square fs-5"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 fw-bold">{course.title}</h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill fw-normal px-3 py-2 ${getDifficultyBadge(course.difficulty)}`}>
                                                    {course.difficulty}
                                                </span>
                                            </td>
                                            <td className="text-muted">{course.duration} Months</td>
                                            <td className="text-muted small">
                                                {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"}
                                            </td>
                                            <td className="pe-4 text-end">
                                                <button className="btn btn-sm btn-light rounded-circle text-secondary">
                                                    <i className="bi bi-three-dots"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            No courses found. Start by creating one!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4">
             <div className="card border-0 shadow-sm h-100" style={{borderRadius: "1rem"}}>
                <div className="card-header bg-white border-0 py-4 px-4">
                    <h5 className="fw-bold mb-0">Quick Actions</h5>
                </div>
                <div className="card-body px-4">
                    <div className="d-grid gap-3">
                        <QuickActionLink 
                            to="/instructor/courses" 
                            label="Manage Courses" 
                            icon="bi-journal-richtext" 
                            color="primary" 
                        />
                         <QuickActionLink 
                            to="/instructor/quizzes" 
                            label="Create New Quiz" 
                            icon="bi-lightning" 
                            color="dark" 
                        />
                         <QuickActionLink 
                            to="/instructor/reports" 
                            label="View Reports" 
                            icon="bi-bar-chart" 
                            color="info" 
                        />
                         <QuickActionLink 
                            to="/instructor/subjects" 
                            label="Manage Subjects" 
                            icon="bi-tags" 
                            color="warning" 
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Components
const StatsCard = ({ title, count, icon, gradient }) => (
    <div className="col-md-3">
        <div className="card border-0 shadow-lg h-100 overflow-hidden text-white hover-lift" 
             style={{ borderRadius: "1rem", background: gradient, transition: "transform 0.2s" }}>
             <div className="card-body position-relative p-4">
               <div className="position-absolute top-0 end-0 p-3 opacity-25">
                 <i className={`bi ${icon}`} style={{ fontSize: "5rem" }}></i>
               </div>
               <div className="d-flex align-items-center mb-3">
                 <div className="bg-white bg-opacity-25 rounded-3 p-2 d-flex justify-content-center align-items-center" style={{width: "48px", height: "48px"}}>
                   <i className={`bi ${icon} fs-4 text-white`}></i>
                 </div>
               </div>
               <h2 className="display-4 fw-bold mb-0">
                 <CountUp end={count} />
               </h2>
               <p className="opacity-75 mb-0 font-monospace small text-uppercase">{title}</p>
             </div>
        </div>
    </div>
);

const QuickActionLink = ({ to, label, icon, color }) => (
    <Link to={to} className={`btn btn-outline-${color} py-3 text-start fw-bold shadow-sm`} style={{borderRadius: "0.75rem", transition: "all 0.2s"}}>
        <i className={`bi ${icon} me-2 fs-5`}></i> {label}
    </Link>
);

const getDifficultyBadge = (level) => {
    switch (level?.toLowerCase()) {
        case 'beginner': return 'bg-success bg-opacity-10 text-success';
        case 'intermediate': return 'bg-warning bg-opacity-10 text-warning';
        case 'advanced': return 'bg-danger bg-opacity-10 text-danger';
        default: return 'bg-secondary bg-opacity-10 text-secondary';
    }
};

export default InstructorHome;

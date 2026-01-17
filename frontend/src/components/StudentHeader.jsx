import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const StudentHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all user data from storage
    localStorage.clear();
    // Redirect to login page
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-4">
      <div className="container-fluid">
        {/* Branding */}
        <Link
          className="navbar-brand fw-bold text-primary"
          to="/student/dashboard"
        >
          SkillForge
        </Link>

        {/* Toggle button for mobile view */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-2">
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link px-3 rounded-pill ${isActive ? "active bg-primary text-white shadow-sm" : ""}`}
                to="/student/dashboard"
              >
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link px-3 rounded-pill ${isActive ? "active bg-primary text-white shadow-sm" : ""}`}
                to="/student/roadmap"
              >
                Roadmap
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link px-3 rounded-pill ${isActive ? "active bg-primary text-white shadow-sm" : ""}`}
                to="/student/materials"
              >
                Courses
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link px-3 rounded-pill ${isActive ? "active bg-primary text-white shadow-sm" : ""}`}
                to="/student/lobby"
              >
                Quiz Lobby
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link px-3 rounded-pill ${isActive ? "active bg-primary text-white shadow-sm" : ""}`}
                to="/student/progress"
              >
                My Progress
              </NavLink>
            </li>
          </ul>

          {/* Right side items */}
          <div className="d-flex align-items-center">
            <span className="text-light me-3 small text-opacity-75">
              ID: <span className="fw-bold text-white">{localStorage.getItem("userId")}</span>
            </span>
            <button
              className="btn btn-danger btn-sm rounded-pill px-4 fw-bold shadow-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StudentHeader;

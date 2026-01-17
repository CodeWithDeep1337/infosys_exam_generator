import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Forbidden = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  const goHome = () => {
    // Redirect based on role
    if (userRole === "STUDENT") navigate("/student-dashboard");
    else if (userRole === "INSTRUCTOR") navigate("/instructor/dashboard");
    else navigate("/login");
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div
        className="text-center p-5 shadow-sm rounded-4 border bg-white"
        style={{ maxWidth: "500px" }}
      >
        <h1 className="display-1 fw-bold text-danger">403</h1>
        <h2 className="fw-bold mb-3">Access Denied</h2>
        <p className="text-muted mb-4">
          Oops! You don't have permission to view this page. If you believe this
          is an error, please contact your administrator.
        </p>
        <button className="btn btn-primary rounded-pill px-4" onClick={goHome}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Forbidden;

import React, { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROLES } from "./constants/roles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- PAGES ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forbidden from "./pages/Forbidden";
import StudentDashboard from "./pages/student-dashboard/StudentDashboard";
import StudentLobby from "./pages/student-dashboard/StudentLobby";
import StudentProgress from "./pages/student-dashboard/StudentProgress";
import StudentMaterials from "./pages/student-dashboard/StudentMaterials";
import TakeQuiz from "./pages/student-dashboard/TakeQuiz";
import StudentRoadmap from "./pages/student-dashboard/StudentRoadmap";
import InstructorDashboard from "./pages/Instructor/InstructorPage";
import AdminDashboard from "./pages/AdminDashboard";

// --- COMPONENTS ---
import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./components/StudentLayout";

const RootRedirect = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toUpperCase().trim();

  // Memoize the redirect path to prevent infinite loops
  const redirectPath = useMemo(() => {
    if (!token) return "/login";

    const dashboardMap = {
      [ROLES.INSTRUCTOR]: "/instructor",
      [ROLES.STUDENT]: "/student/dashboard",
      [ROLES.ADMIN]: "/admin",
    };

    return dashboardMap[role] || "/login";
  }, [token, role]);

  return <Navigate to={redirectPath} replace />;
};

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Root path */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/403" element={<Forbidden />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/lobby" element={<StudentLobby />} />
            <Route path="/student/progress" element={<StudentProgress />} />
            <Route path="/student/materials" element={<StudentMaterials />} />
            <Route path="/student/roadmap" element={<StudentRoadmap />} />
            <Route
              path="/student/take-quiz/:displayId"
              element={<TakeQuiz />}
            />
          </Route>
        </Route>

        {/* Instructor Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]} />}>
          <Route path="/instructor/*" element={<InstructorDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* Catch-all - only after all other routes */}
        <Route path="*" element={<Navigate to="/403" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;

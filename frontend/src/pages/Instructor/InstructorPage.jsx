// src/pages/Instructor/InstructorPage.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import CoursesPage from "./CoursesPage";
import SubjectsPage from "./SubjectsPage";
import TopicsPage from "./TopicsPage";
import QuizPage from "./QuizPage";
import ReportsPage from "./ReportsPage";
import InstructorHome from "./InstructorHome";

const InstructorPage = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "24px", overflowY: "auto", backgroundColor: "#f1f5f9" }}>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InstructorHome />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="quizzes" element={<QuizPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="topic/:topicId" element={<TopicsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default InstructorPage;

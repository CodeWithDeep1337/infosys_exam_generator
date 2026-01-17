import React from "react";
import { Outlet } from "react-router-dom";
import StudentHeader from "./StudentHeader"; // Ensure the path is correct

const StudentLayout = () => {
  return (
    <div className="student-app-wrapper">
      {/* This Header will stay visible on all Student pages */}
      <StudentHeader />

      {/* The main content of the page (Dashboard, Lobby, etc.) loads here */}
      <main className="container py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;

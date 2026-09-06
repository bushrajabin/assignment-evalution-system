import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CreateAssignment from "./pages/teacher/CreateAssignment";
import ViewSubmissions from "./pages/teacher/ViewSubmissions";
import Performance from "./pages/teacher/Performance";

import StudentDashboard from "./pages/student/StudentDashboard";
import AssignmentDetail from "./pages/student/AssignmentDetail";
import MySubmissions from "./pages/student/MySubmissions";


import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "teacher" ? "/teacher" : "/student"} replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Home /> : <Login />} />
        <Route path="/register" element={user ? <Home /> : <Register />} />
        <Route path="/forgot-password" element={user ? <Home /> : <ForgotPassword />} />
        <Route path="/reset-password/:token" element={user ? <Home /> : <ResetPassword />} />
        <Route path="/" element={<Home />} />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/new"
          element={
            <ProtectedRoute role="teacher">
              <CreateAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignment/:assignmentId/submissions"
          element={
            <ProtectedRoute role="teacher">
              <ViewSubmissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/performance"
          element={
            <ProtectedRoute role="teacher">
              <Performance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignment/:id"
          element={
            <ProtectedRoute role="student">
              <AssignmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/submissions"
          element={
            <ProtectedRoute role="student">
              <MySubmissions />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Home />} />

      </Routes>
    </>
  );
}

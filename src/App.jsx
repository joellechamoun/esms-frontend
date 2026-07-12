import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Majors from "./pages/Majors";
import Rooms from "./pages/Rooms";
import ExamSessions from "./pages/ExamSessions";
import Schedule from "./pages/Schedule";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import TimeSlots from "./pages/TimeSlots";
import Exams from "./pages/Exams";
import LandingPage from "./pages/LandingPage";

import StudentLayout from "./layouts/StudentLayout";
import StudentCourses from "./pages/StudentCourses";
import MyRegistrations from "./pages/MyRegistrations";
import StudentSchedule from "./pages/StudentSchedule";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Portal */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/majors" element={<Majors />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/exam-sessions" element={<ExamSessions />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/time-slots" element={<TimeSlots />} />
          <Route path="/exams" element={<Exams />} />
        </Route>

        {/* Student Portal */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/registrations" element={<MyRegistrations />} />
          <Route path="/student/schedule" element={<StudentSchedule />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}

export default App;
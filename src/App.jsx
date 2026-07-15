import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import MajorsCourses from "./pages/MajorsCourses";
import Rooms from "./pages/Rooms";
import Departments from "./pages/Departments";
import ExamSessions from "./pages/ExamSessions";
import ExamScheduleApprovals from "./pages/ExamScheduleApprovals";
import Schedule from "./pages/Schedule";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Exams from "./pages/Exams";
import LandingPage from "./pages/LandingPage";

import StudentLayout from "./layouts/StudentLayout";
import StudentCourses from "./pages/StudentCourses";
import MyRegistrations from "./pages/MyRegistrations";
import StudentSchedule from "./pages/StudentSchedule";

import HeadOfDepartmentLayout from "./layouts/HeadOfDepartmentLayout";
import HodDashboard from "./pages/hod/Dashboard";
import HodCourses from "./pages/hod/Courses";
import HodExamSchedule from "./pages/hod/ExamSchedule";

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
          <Route path="/users" element={<Users />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/majors" element={<MajorsCourses />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/exam-sessions" element={<ExamSessions />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/exam-schedules" element={<ExamScheduleApprovals />} />
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

        {/* Head of Department Portal */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["HeadOfDepartment"]}>
              <HeadOfDepartmentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/hod/dashboard" element={<HodDashboard />} />
          <Route path="/hod/courses" element={<HodCourses />} />
          <Route path="/hod/exam-schedule" element={<HodExamSchedule />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}

export default App;
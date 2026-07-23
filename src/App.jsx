import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import MajorsCourses from "./pages/MajorsCourses";
import Departments from "./pages/Departments";
import ExamSessions from "./pages/ExamSessions";
import ExamScheduleApprovals from "./pages/ExamScheduleApprovals";
import Schedule from "./pages/Schedule";
import FinalSchedule from "./pages/FinalSchedule";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import LandingPage from "./pages/LandingPage";

import HeadOfDepartmentLayout from "./layouts/HeadOfDepartmentLayout";
import HodDashboard from "./pages/hod/Dashboard";
import HodCourses from "./pages/hod/Courses";
import HodExamSchedule from "./pages/hod/ExamSchedule";

import FacultyLayout from "./layouts/FacultyLayout";
import FacultyDashboard from "./pages/faculty/Dashboard";
import FacultySchedule from "./pages/faculty/Schedule";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

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
          <Route path="/exam-sessions" element={<ExamSessions />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/exam-schedules" element={<ExamScheduleApprovals />} />
          <Route path="/final-schedule" element={<FinalSchedule />} />
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

        {/* Faculty Portal */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Faculty"]}>
              <FacultyLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/schedule" element={<FacultySchedule />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}

export default App;
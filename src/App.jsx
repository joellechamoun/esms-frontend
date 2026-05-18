import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Rooms from "./pages/Rooms";
import ExamSessions from "./pages/ExamSessions";
import Schedule from "./pages/Schedule";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import TimeSlots from "./pages/TimeSlots";
import Exams from "./pages/Exams";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/exam-sessions" element={<ExamSessions />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/time-slots" element={<TimeSlots />} />
        <Route path="/exams" element={<Exams />} />
      </Route>
    </Routes>
  );
}

export default App;
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/examflow-logo-white.png";
import "./StudentLayout.css";

function StudentLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="student-layout">
      <header className="student-topbar">
        <div
          className="student-brand"
          onClick={() => navigate("/student/courses")}
        >
          <img src={logo} alt="ExamFlow Logo" />
          <div>
            <h2>ExamFlow</h2>
            <p>Smart Exam Scheduling System</p>
          </div>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <nav className="student-menu">
        <NavLink to="/student/courses">Available Courses</NavLink>
        <NavLink to="/student/registrations">My Courses</NavLink>
        <NavLink to="/student/schedule">My Exam Schedule</NavLink>
      </nav>

      <main className="student-content">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;
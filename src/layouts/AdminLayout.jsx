import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/examflow-logo-white.png";
import "./AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  //  check if we are on dashboard
  const isHome = location.pathname === "/dashboard";

  return (
    <div className="portal-layout">
      {/* TOP BAR */}
      <header className="portal-topbar">
        <div
          className="portal-brand"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="ExamFlow Logo" />
          <div>
            <h2>ExamFlow</h2>
            <p>Smart Exam Scheduling System</p>
          </div>
        </div>

        <div className="portal-actions">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/*  SHOW MENU ONLY IF NOT HOME */}
      {!isHome && (
        <nav className="portal-menu">
          <NavLink to="/dashboard">Home</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/departments">Departments</NavLink>
          <NavLink to="/majors">Majors & Courses</NavLink>
          <NavLink to="/rooms">Rooms</NavLink>
          <NavLink to="/exam-sessions">Exam Sessions</NavLink>
          <NavLink to="/schedule">Schedule</NavLink>
          <NavLink to="/exam-schedules">Approvals</NavLink>
        </nav>
      )}

      <main className="portal-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/lebanese-university-logo.png";
import "./AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="portal-layout">
      {/* TOP BAR */}
      <header className="portal-topbar">
        <div
          className="portal-brand"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="Lebanese University Logo" />
          <div>
            <h2>ExamFlow</h2>
            <p>Faculty of Sciences</p>
          </div>
        </div>

        <div className="portal-actions">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="portal-menu">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/departments">Departments</NavLink>
        <NavLink to="/majors">Majors & Courses</NavLink>
        <NavLink to="/exam-sessions">Exam Sessions</NavLink>
        <NavLink to="/schedule">Schedule</NavLink>
        <NavLink to="/exam-schedules">Approvals</NavLink>
        <NavLink to="/final-schedule">Final Schedule</NavLink>
      </nav>

      <main className="portal-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
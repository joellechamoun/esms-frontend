import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/examflow-logo-white.png";
import "./AdminLayout.css";

function HeadOfDepartmentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isHome = location.pathname === "/hod/dashboard";

  return (
    <div className="portal-layout">
      <header className="portal-topbar">
        <div
          className="portal-brand"
          onClick={() => navigate("/hod/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="ExamFlow Logo" />
          <div>
            <h2>ExamFlow</h2>
            <p>Head of Department Portal</p>
          </div>
        </div>

        <div className="portal-actions">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {!isHome && (
        <nav className="portal-menu">
          <NavLink to="/hod/dashboard">Home</NavLink>
          <NavLink to="/hod/courses">Courses</NavLink>
          <NavLink to="/hod/exam-schedule">Exam Schedule</NavLink>
        </nav>
      )}

      <main className="portal-content">
        <Outlet />
      </main>
    </div>
  );
}

export default HeadOfDepartmentLayout;

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/lebanese-university-logo.png";
import "./AdminLayout.css";

function HeadOfDepartmentLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="portal-layout">
      <header className="portal-topbar">
        <div
          className="portal-brand"
          onClick={() => navigate("/hod/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="Lebanese University Logo" />
          <div>
            <h2>ExamFlow</h2>
            <p>Head of Department Portal</p>
          </div>
        </div>

        <div className="portal-actions">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="portal-menu">
        <NavLink to="/hod/dashboard">Dashboard</NavLink>
        <NavLink to="/hod/courses">Courses</NavLink>
        <NavLink to="/hod/exam-schedule">Exam Schedule</NavLink>
      </nav>

      <main className="portal-content">
        <Outlet />
      </main>
    </div>
  );
}

export default HeadOfDepartmentLayout;

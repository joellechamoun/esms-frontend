import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/lebanese-university-logo.png";
import "./AdminLayout.css";

function FacultyLayout() {
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
          onClick={() => navigate("/faculty/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="Lebanese University Logo" />
          <div>
            <h2>ExamFlow</h2>
            <p>Faculty Portal</p>
          </div>
        </div>

        <div className="portal-actions">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="portal-menu">
        <NavLink to="/faculty/dashboard">Dashboard</NavLink>
        <NavLink to="/faculty/schedule">Schedule</NavLink>
      </nav>

      <main className="portal-content">
        <Outlet />
      </main>
    </div>
  );
}

export default FacultyLayout;

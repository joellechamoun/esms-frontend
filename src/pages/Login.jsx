import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/examflow-logo.png";
import Spinner from "../components/Spinner";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success(`Welcome ${res.data.user.name || ""}`);

      if (res.data.user.role === "Student") {
        navigate("/student/courses");
      } else if (res.data.user.role === "HeadOfDepartment") {
        navigate("/hod/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="ExamFlow Logo" className="login-logo" />

        <h2>Welcome Back</h2>
        <p>Login to access the ExamFlow account</p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="name@esms.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-with-spinner" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="login-links">
          <span>Don't have an account?</span>

          <Link to="/register" className="register-link">
            Create Student Account
          </Link>

          <Link to="/" className="back-home">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
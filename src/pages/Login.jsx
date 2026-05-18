import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/examflow-logo.png";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="ExamFlow Logo" className="login-logo" />

        <h2>Welcome Back</h2>
        <p>Login to access the ExamFlow admin dashboard</p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="admin@esms.com"
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

          <button type="submit">Login</button>
        </form>

        <Link to="/" className="back-home">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Login;
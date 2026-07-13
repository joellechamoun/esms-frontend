import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/examflow-logo.png";
import Spinner from "../components/Spinner";
import "./Login.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/auth/student-register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      toast.success("Account created successfully. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account");
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="ExamFlow Logo" className="login-logo" />

        <h2>Create Account</h2>
        <p>Create a student account to access ExamFlow</p>

        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="student@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn-with-spinner" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" />
                Creating account...
              </>
            ) : (
              "Create Student Account"
            )}
          </button>
        </form>

        <div className="login-links">
          <span>Already have an account?</span>

          <Link to="/login" className="register-link">
            Login
          </Link>

          <Link to="/" className="back-home">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
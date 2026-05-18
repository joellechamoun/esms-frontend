import { Link } from "react-router-dom";
import logo from "../assets/examflow-logo.png";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="brand">
          <img src={logo} alt="ExamFlow Logo" />
          <div>
            <h1>ExamFlow</h1>
            <p>Smart Exam Scheduling System</p>
          </div>
        </div>

        <nav className="landing-nav">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
          <Link to="/login" className="login-btn">Login</Link>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-overlay">
          <div className="hero-content">
            <h2>
              Organizing Exams. <br />
              Simplifying Scheduling.
            </h2>
            <p>
              ExamFlow helps universities manage courses, rooms, exam sessions,
              time slots, and final exam schedules in one clear platform.
            </p>
            <Link to="/login" className="hero-btn">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="feature-card">
          <h3>Courses</h3>
          <p>Manage academic courses by year, semester, and term.</p>
        </div>

        <div className="feature-card">
          <h3>Exam Sessions</h3>
          <p>Create and organize exam periods such as midterms and finals.</p>
        </div>

        <div className="feature-card">
          <h3>Scheduling</h3>
          <p>Schedule exams while respecting rooms, time slots, and constraints.</p>
        </div>

        <div className="feature-card">
          <h3>Final Schedule</h3>
          <p>Display exam schedules clearly by year, session, and term.</p>
        </div>
      </section>

      <footer className="landing-footer" id="contact">
        <p>© 2026 ExamFlow. Academic Exam Scheduling Platform.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
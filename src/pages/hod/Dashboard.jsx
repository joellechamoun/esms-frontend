import { Link } from "react-router-dom";

import coursesIcon from "../../assets/icons/courses.png";
import examsIcon from "../../assets/icons/exams.png";

function HodDashboard() {
  const cards = [
    {
      title: "Courses",
      text: "Add and manage courses for your department's majors.",
      path: "/hod/courses",
      icon: coursesIcon,
    },
    {
      title: "Exam Schedule",
      text: "Build your department's exam schedule and submit it for approval.",
      path: "/hod/exam-schedule",
      icon: examsIcon,
    },
  ];

  return (
    <div className="uni-home">
      <section className="uni-hero">
        <div className="uni-hero-content">
          <h1>Welcome to ExamFlow</h1>
          <p>
            Manage your department's courses and build its exam schedule for
            admin approval.
          </p>

          <div className="uni-hero-icons">
            {cards.map((card) => (
              <Link to={card.path} key={card.title}>
                <img src={card.icon} alt={card.title} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="uni-card-grid">
        {cards.map((card) => (
          <Link to={card.path} className="uni-card" key={card.title}>
            <div className="uni-card-icon">
              <img src={card.icon} alt={card.title} />
            </div>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default HodDashboard;

import { Link } from "react-router-dom";

import majorsIcon from "../assets/icons/majors.png";
import coursesIcon from "../assets/icons/courses.png";
import roomsIcon from "../assets/icons/rooms.png";
import sessionsIcon from "../assets/icons/sessions.png";
import examsIcon from "../assets/icons/exams.png";
import scheduleIcon from "../assets/icons/schedule.png";

function Dashboard() {
  const cards = [
    {
      title: "Users",
      text: "Create, edit, and manage user accounts of any role.",
      path: "/users",
      icon: majorsIcon,
    },
    {
      title: "Departments",
      text: "Manage departments and assign heads of department.",
      path: "/departments",
      icon: majorsIcon,
    },
    {
      title: "Majors & Courses",
      text: "Manage academic majors and their courses in one place.",
      path: "/majors",
      icon: coursesIcon,
    },
    {
      title: "Rooms",
      text: "Manage exam rooms and room capacities.",
      path: "/rooms",
      icon: roomsIcon,
    },
    {
      title: "Exam Sessions",
      text: "Create exam periods and manage their time slots.",
      path: "/exam-sessions",
      icon: sessionsIcon,
    },
    {
      title: "Exams",
      text: "Schedule exams while respecting constraints.",
      path: "/exams",
      icon: examsIcon,
    },
    {
      title: "Final Schedule",
      text: "View the final exam schedule clearly.",
      path: "/schedule",
      icon: scheduleIcon,
    },
    {
      title: "Approvals",
      text: "Review, approve, reject, and publish department exam schedules.",
      path: "/exam-schedules",
      icon: examsIcon,
    },
  ];

  return (
    <div className="uni-home">
      <section className="uni-hero">
        <div className="uni-hero-content">
          <h1>Welcome to ExamFlow</h1>
          <p>
            Organize majors, courses, exam sessions, rooms, time slots, and
            final schedules in one academic platform.
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

export default Dashboard;
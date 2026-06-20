import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

function Schedule() {
  const [exams, setExams] = useState([]);
  const [examSessions, setExamSessions] = useState([]);

  const [filters, setFilters] = useState({
    examSession: "",
    year: "",
    term: "",
  });

  useEffect(() => {
    fetchExamSessions();
    fetchExams();
  }, []);

  const fetchExamSessions = async () => {
    try {
      const res = await api.get("/exam-sessions");
      setExamSessions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exam sessions");
    }
  };

  const fetchExams = async () => {
    try {
      const params = {};

      if (filters.examSession) params.examSession = filters.examSession;
      if (filters.year) params.year = filters.year;
      if (filters.term) params.term = filters.term;

      const res = await api.get("/exams", { params });
      setExams(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exam schedule");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchExams();
  };

  const resetFilters = () => {
    setFilters({
      examSession: "",
      year: "",
      term: "",
    });

    setTimeout(fetchExams, 0);

    toast.info("Filters reset");
  };

  const groupedByYear = exams.reduce((acc, exam) => {
    const year = exam.course?.year || "Unknown";

    if (!acc[year]) acc[year] = [];
    acc[year].push(exam);

    return acc;
  }, {});

  const getYearTitle = (year) => {
    if (year === "1") return "Year 1 / L1 Exam Schedule";
    if (year === "2") return "Year 2 / L2 Exam Schedule";
    if (year === "3") return "Year 3 / L3 Exam Schedule";
    if (year === "4") return "Year 4 / M1 Exam Schedule";
    if (year === "5") return "Year 5 / M2 Exam Schedule";
    return "Unknown Year Schedule";
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Final Exam Schedule</h2>
        <p>
          View the final exam schedule grouped by academic year, with filters
          for session, year, and term.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>Filter Schedule</h3>
          <p>Filter by exam session, academic year, or term.</p>
        </div>

        <form onSubmit={applyFilters}>
          <select
            name="examSession"
            value={filters.examSession}
            onChange={handleFilterChange}
          >
            <option value="">All Exam Sessions</option>
            {examSessions.map((session) => (
              <option key={session._id} value={session._id}>
                {session.name}
              </option>
            ))}
          </select>

          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
          >
            <option value="">All Years</option>
            <option value="1">Year 1 / L1</option>
            <option value="2">Year 2 / L2</option>
            <option value="3">Year 3 / L3</option>
            <option value="4">Year 4 / M1</option>
            <option value="5">Year 5 / M2</option>
          </select>

          <select
            name="term"
            value={filters.term}
            onChange={handleFilterChange}
          >
            <option value="">All Terms</option>
            <option value="current">Current Term</option>
          </select>

          <button type="submit" className="primary-btn">
            Apply Filters
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={resetFilters}
          >
            Reset
          </button>
        </form>
      </div>

      {Object.keys(groupedByYear).length === 0 && (
        <div className="table-card">
          <div className="empty-table">No exams scheduled yet.</div>
        </div>
      )}

      {Object.keys(groupedByYear)
        .sort((a, b) => Number(a) - Number(b))
        .map((year) => (
          <div className="table-card" key={year}>
            <div className="table-header">
              <h3>{getYearTitle(year)}</h3>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Room</th>
                  <th>Exam Session</th>
                </tr>
              </thead>

              <tbody>
                {groupedByYear[year].map((exam) => (
                  <tr key={exam._id}>
                    <td className="strong-cell">{exam.timeSlot?.date}</td>
                    <td>
                      {exam.timeSlot?.startTime} -{" "}
                      {exam.timeSlot?.endTime}
                    </td>
                    <td>{exam.course?.code}</td>
                    <td>{exam.course?.name}</td>
                    <td>{exam.room?.name}</td>
                    <td>{exam.examSession?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}

export default Schedule;
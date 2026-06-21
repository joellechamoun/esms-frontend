import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

function StudentSchedule() {
  const [exams, setExams] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState("");

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await api.get("/registrations/me/schedule");
      setExams(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exam schedule");
    }
  };

  const getMajorLabel = (major) => {
    if (!major) return "No major";
    if (typeof major === "string") return "Major assigned";
    return `${major.code || ""}${major.code && major.name ? " - " : ""}${
      major.name || ""
    }`;
  };

  const semesters = [
    ...new Set(exams.map((exam) => exam.course?.semester).filter(Boolean)),
  ];

  const filteredExams = semesterFilter
    ? exams.filter((exam) => exam.course?.semester === semesterFilter)
    : exams;

  return (
    <div className="student-page">
      <div className="page-header">
        <h2>My Exam Schedule</h2>
        <p>View the exams scheduled for your registered courses.</p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>Filter Schedule</h3>
          <p>Filter your exam calendar by course semester.</p>
        </div>

        <form>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
          >
            <option value="">All Semesters</option>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setSemesterFilter("");
              toast.info("Semester filter cleared");
            }}
          >
            Reset
          </button>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Exam Calendar</h3>
          <p>{filteredExams.length} exam(s) scheduled</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Course</th>
              <th>Major</th>
              <th>Semester</th>
              <th>Room</th>
              <th>Session</th>
            </tr>
          </thead>

          <tbody>
            {filteredExams.map((exam) => (
              <tr key={exam._id}>
                <td className="strong-cell">{exam.timeSlot?.date}</td>
                <td>
                  {exam.timeSlot?.startTime} - {exam.timeSlot?.endTime}
                </td>
                <td>
                  {exam.course?.code} - {exam.course?.name}
                </td>
                <td>{getMajorLabel(exam.course?.major)}</td>
                <td>{exam.course?.semester}</td>
                <td>{exam.room?.name}</td>
                <td>{exam.examSession?.name}</td>
              </tr>
            ))}

            {filteredExams.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-table">
                  No exams found for the selected semester.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentSchedule;
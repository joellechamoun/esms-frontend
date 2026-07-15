import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";

function Exams() {
  const [examSessions, setExamSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);

  const [form, setForm] = useState({
    examSession: "",
    course: "",
    timeSlot: "",
  });

  useEffect(() => {
    Promise.all([fetchInitialData(), fetchExams()]).finally(() =>
      setLoading(false)
    );
  }, []);

  useEffect(() => {
    if (form.examSession) {
      fetchTimeSlots(form.examSession);
    } else {
      setTimeSlots([]);
    }
  }, [form.examSession]);

  const fetchInitialData = async () => {
    try {
      const [sessionsRes, coursesRes] = await Promise.all([
        api.get("/exam-sessions"),
        api.get("/courses"),
      ]);

      setExamSessions(sessionsRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load scheduling data");
    }
  };

  const fetchTimeSlots = async (sessionId) => {
    try {
      const res = await api.get(`/exam-sessions/${sessionId}/time-slots`);
      setTimeSlots(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load time slots");
    }
  };

  const fetchExams = async () => {
    try {
      const res = await api.get("/exams");
      setExams(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exams");
    }
  };

  const getMajorLabel = (major) => {
    if (!major) return "No major";
    if (typeof major === "string") return "Major assigned";
    return `${major.code || ""}${major.code && major.name ? " - " : ""}${
      major.name || ""
    }`;
  };

  const getCourseOptionLabel = (course) => {
    const majorLabel = getMajorLabel(course.major);
    return `${course.code} - ${course.name} | ${majorLabel} | Year ${course.year}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "examSession" ? { timeSlot: "" } : {}),
    }));
  };

  const openDeleteModal = (id) => {
    setSelectedExamId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedExamId(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!selectedExamId) return;

    try {
      await api.delete(`/exams/${selectedExamId}`);
      toast.success("Exam deleted successfully");
      closeDeleteModal();
      fetchExams();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete exam");
      closeDeleteModal();
    }
  };

  const handleScheduleExam = async (e) => {
    e.preventDefault();

    try {
      await api.post("/exams", {
        course: form.course,
        timeSlot: form.timeSlot,
        examSession: form.examSession,
      });

      toast.success("Exam scheduled successfully");

      setForm({
        examSession: "",
        course: "",
        timeSlot: "",
      });

      setTimeSlots([]);
      fetchExams();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to schedule exam");
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Exam Scheduling</h2>
        <p>
          Manually schedule exams by selecting a course, exam session, and
          available time slot.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>Schedule New Exam</h3>
          <p>
            Select the required information below. The system will automatically
            validate scheduling constraints.
          </p>
        </div>

        <form onSubmit={handleScheduleExam}>
          <select
            name="examSession"
            value={form.examSession}
            onChange={handleChange}
            required
          >
            <option value="">Select Exam Session</option>
            {examSessions.map((session) => (
              <option key={session._id} value={session._id}>
                {session.name}
              </option>
            ))}
          </select>

          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {getCourseOptionLabel(course)}
              </option>
            ))}
          </select>

          <select
            name="timeSlot"
            value={form.timeSlot}
            onChange={handleChange}
            required
          >
            <option value="">Select Time Slot</option>
            {timeSlots.map((slot) => (
              <option key={slot._id} value={slot._id}>
                {slot.date} | {slot.startTime} - {slot.endTime}
              </option>
            ))}
          </select>

          <button type="submit" className="primary-btn">
            Schedule Exam
          </button>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Scheduled Exams List</h3>
            <p>{exams.length} exam(s) scheduled</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading exams...</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Major</th>
                <th>Year</th>
                <th>Date</th>
                <th>Time</th>
                <th>Session</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td className="strong-cell">
                    {exam.course?.code} - {exam.course?.name}
                  </td>
                  <td>{getMajorLabel(exam.course?.major)}</td>
                  <td>{exam.course?.year}</td>
                  <td>{exam.timeSlot?.date}</td>
                  <td>
                    {exam.timeSlot?.startTime} - {exam.timeSlot?.endTime}
                  </td>
                  <td>{exam.examSession?.name}</td>
                  <td>
                    <button
                      className="table-btn danger-btn"
                      onClick={() => openDeleteModal(exam._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {exams.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-table">
                    No exams scheduled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Exam"
          message="Are you sure you want to delete this scheduled exam? This action cannot be undone."
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default Exams;
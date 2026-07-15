import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import ConfirmModal from "../../components/ConfirmModal";
import Spinner from "../../components/Spinner";

const STATUS_LABELS = {
  Draft: "Draft",
  PendingApproval: "Pending Approval",
  Approved: "Approved",
  Published: "Published",
};

function HodExamSchedule() {
  const [examSessions, setExamSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [exams, setExams] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);

  const [selectedSession, setSelectedSession] = useState("");

  const [form, setForm] = useState({
    course: "",
    timeSlot: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);

  useEffect(() => {
    Promise.all([fetchExamSessions(), fetchCourses()]).finally(() =>
      setLoading(false)
    );
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadSessionData(selectedSession);
    } else {
      setTimeSlots([]);
      setExams([]);
      setSchedule(null);
    }
  }, [selectedSession]);

  const fetchExamSessions = async () => {
    try {
      const res = await api.get("/exam-sessions");
      setExamSessions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exam sessions");
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    }
  };

  const loadSessionData = async (sessionId) => {
    setLoadingSession(true);

    try {
      const [slotsRes, schedulesRes, examsRes] = await Promise.all([
        api.get(`/exam-sessions/${sessionId}/time-slots`),
        api.get("/exam-schedules", { params: { examSession: sessionId } }),
        api.get("/exams", { params: { examSession: sessionId } }),
      ]);

      setTimeSlots(slotsRes.data);
      setSchedule(schedulesRes.data[0] || null);
      setExams(examsRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exam schedule data");
    } finally {
      setLoadingSession(false);
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
    setForm({ course: "", timeSlot: "" });
  };

  const isEditable = !schedule || schedule.status === "Draft";

  const handleAddExam = async (e) => {
    e.preventDefault();

    try {
      await api.post("/exams", {
        course: form.course,
        timeSlot: form.timeSlot,
        examSession: selectedSession,
      });

      toast.success("Exam added to schedule");
      setForm({ course: "", timeSlot: "" });
      loadSessionData(selectedSession);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add exam");
    }
  };

  const openDeleteModal = (id) => {
    setSelectedExamId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedExamId(null);
    setShowDeleteModal(false);
  };

  const handleDeleteExam = async () => {
    if (!selectedExamId) return;

    try {
      await api.delete(`/exams/${selectedExamId}`);
      toast.success("Exam removed from schedule");
      closeDeleteModal();
      loadSessionData(selectedSession);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to remove exam");
      closeDeleteModal();
    }
  };

  const handleSubmitSchedule = async () => {
    if (!schedule) return;

    try {
      await api.post(`/exam-schedules/${schedule._id}/submit`);
      toast.success("Exam schedule submitted for approval");
      loadSessionData(selectedSession);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to submit exam schedule"
      );
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Exam Schedule</h2>
        <p>
          Build your department's exam schedule for a session, then submit it
          to the admin for approval.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>Select Exam Session</h3>
          <p>Choose the exam session to build a schedule for.</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading exam sessions...</span>
          </div>
        ) : (
          <form>
            <select value={selectedSession} onChange={handleSessionChange}>
              <option value="">Select Exam Session</option>
              {examSessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.name}
                </option>
              ))}
            </select>
          </form>
        )}
      </div>

      {selectedSession && loadingSession && (
        <div className="table-card">
          <div className="loading-state">
            <Spinner />
            <span>Loading schedule...</span>
          </div>
        </div>
      )}

      {selectedSession && !loadingSession && (
        <>
          <div className="form-card">
            <div className="section-title">
              <h3>Schedule Status: {STATUS_LABELS[schedule?.status || "Draft"]}</h3>
              {schedule?.status === "Draft" && schedule?.rejectionReason && (
                <p style={{ color: "#b3261e" }}>
                  Returned by admin: {schedule.rejectionReason}
                </p>
              )}
              {!schedule && (
                <p>No exams added yet — add exams below to start the draft.</p>
              )}
              {schedule?.status === "PendingApproval" && (
                <p>Awaiting admin approval. You can't make changes right now.</p>
              )}
              {schedule?.status === "Approved" && (
                <p>Approved by admin — awaiting publication.</p>
              )}
              {schedule?.status === "Published" && (
                <p>Published — this schedule is final.</p>
              )}
            </div>
          </div>

          {isEditable && (
            <div className="form-card">
              <div className="section-title">
                <h3>Add Exam</h3>
                <p>Select a course and time slot for this session.</p>
              </div>

              <form onSubmit={handleAddExam}>
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
                  Add Exam
                </button>
              </form>
            </div>
          )}

          <div className="table-card">
            <div className="table-header">
              <div>
                <h3>Exams in this Session</h3>
                <p>{exams.length} exam(s) added</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Major</th>
                  <th>Year</th>
                  <th>Date</th>
                  <th>Time</th>
                  {isEditable && <th>Actions</th>}
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
                    {isEditable && (
                      <td>
                        <button
                          className="table-btn danger-btn"
                          onClick={() => openDeleteModal(exam._id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

                {exams.length === 0 && (
                  <tr>
                    <td colSpan={isEditable ? 6 : 5} className="empty-table">
                      No exams added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {schedule?.status === "Draft" && exams.length > 0 && (
            <div className="form-card">
              <button className="primary-btn" onClick={handleSubmitSchedule}>
                Submit for Approval
              </button>
            </div>
          )}
        </>
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Remove Exam"
          message="Are you sure you want to remove this exam from the schedule?"
          onCancel={closeDeleteModal}
          onConfirm={handleDeleteExam}
        />
      )}
    </div>
  );
}

export default HodExamSchedule;

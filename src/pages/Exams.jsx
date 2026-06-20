import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

function Exams() {
  const [examSessions, setExamSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [exams, setExams] = useState([]);

  const [form, setForm] = useState({
    examSession: "",
    course: "",
    room: "",
    timeSlot: "",
  });

  useEffect(() => {
    fetchInitialData();
    fetchExams();
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
      const [sessionsRes, coursesRes, roomsRes] = await Promise.all([
        api.get("/exam-sessions"),
        api.get("/courses"),
        api.get("/rooms"),
      ]);

      setExamSessions(sessionsRes.data);
      setCourses(coursesRes.data);
      setRooms(roomsRes.data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "examSession" ? { timeSlot: "" } : {}),
    }));
  };

  const handleScheduleExam = async (e) => {
    e.preventDefault();

    try {
      await api.post("/exams", {
        course: form.course,
        room: form.room,
        timeSlot: form.timeSlot,
        examSession: form.examSession,
      });

      toast.success("Exam scheduled successfully");

      setForm({
        examSession: "",
        course: "",
        room: "",
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
          Manually schedule exams by selecting a course, room, exam session, and
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
                {course.code} - {course.name} (Year {course.year})
              </option>
            ))}
          </select>

          <select
            name="room"
            value={form.room}
            onChange={handleChange}
            required
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.name} - Capacity {room.capacity}
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

        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Year</th>
              <th>Room</th>
              <th>Date</th>
              <th>Time</th>
              <th>Session</th>
            </tr>
          </thead>

          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id}>
                <td className="strong-cell">
                  {exam.course?.code} - {exam.course?.name}
                </td>
                <td>{exam.course?.year}</td>
                <td>{exam.room?.name}</td>
                <td>{exam.timeSlot?.date}</td>
                <td>
                  {exam.timeSlot?.startTime} - {exam.timeSlot?.endTime}
                </td>
                <td>{exam.examSession?.name}</td>
              </tr>
            ))}

            {exams.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-table">
                  No exams scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Exams;
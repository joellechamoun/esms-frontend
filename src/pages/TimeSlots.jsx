import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

function TimeSlots() {
  const [examSessions, setExamSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetchExamSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [selectedSession]);

  const fetchExamSessions = async () => {
    try {
      const res = await api.get("/exam-sessions");
      setExamSessions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch exam sessions");
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await api.get(`/exam-sessions/${selectedSession}/time-slots`);
      setTimeSlots(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch time slots");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateTimeSlot = async (e) => {
    e.preventDefault();

    if (!selectedSession) {
      toast.warning("Please select an exam session first");
      return;
    }

    try {
      await api.post(`/exam-sessions/${selectedSession}/time-slots`, {
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
      });

      toast.success("Time slot added successfully");

      setForm({
        date: "",
        startTime: "",
        endTime: "",
      });

      fetchTimeSlots();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create time slot");
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Time Slots Management</h2>
        <p>
          Create available exam dates and time ranges linked to a selected exam
          session.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>Add New Time Slot</h3>
          <p>Select an exam session, then define the exam date and time range.</p>
        </div>

        <form onSubmit={handleCreateTimeSlot}>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            required
          >
            <option value="">Select Exam Session</option>
            {examSessions.map((session) => (
              <option key={session._id} value={session._id}>
                {session.name}
              </option>
            ))}
          </select>

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <input
            name="startTime"
            type="time"
            value={form.startTime}
            onChange={handleChange}
            required
          />

          <input
            name="endTime"
            type="time"
            value={form.endTime}
            onChange={handleChange}
            required
          />

          <button type="submit" className="primary-btn">
            Add Time Slot
          </button>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Time Slots List</h3>
            <p>
              {selectedSession
                ? `${timeSlots.length} time slot(s) available`
                : "Select an exam session to view time slots"}
            </p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Active</th>
            </tr>
          </thead>

          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot._id}>
                <td className="strong-cell">{slot.date}</td>
                <td>{slot.startTime}</td>
                <td>{slot.endTime}</td>
                <td>{slot.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}

            {timeSlots.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-table">
                  {selectedSession
                    ? "No time slots added for this session yet."
                    : "Please select an exam session first."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TimeSlots;
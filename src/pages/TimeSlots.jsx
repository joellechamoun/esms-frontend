import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";

function TimeSlots() {
  const [examSessions, setExamSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const selectedSessionDetails = examSessions.find(
    (session) => session._id === selectedSession
  );

  const sessionStartDate =
    selectedSessionDetails?.startDate?.slice(0, 10) || "";
  const sessionEndDate =
    selectedSessionDetails?.endDate?.slice(0, 10) || "";

  useEffect(() => {
    fetchExamSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      setLoadingSlots(true);
      fetchTimeSlots().finally(() => setLoadingSlots(false));
      resetFormOnly();
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
      const res = await api.get(
        `/exam-sessions/${selectedSession}/time-slots`
      );
      setTimeSlots(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch time slots");
    }
  };

  const resetFormOnly = () => {
    setForm({
      date: "",
      startTime: "",
      endTime: "",
    });
    setEditingId(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedSlotId(null);
  };

  const openDeleteModal = (id) => {
    setSelectedSlotId(id);
    setShowDeleteModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmitTimeSlot = async (e) => {
    e.preventDefault();

    if (!selectedSession) {
      toast.warning("Please select an exam session first");
      return;
    }

    if (form.startTime >= form.endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    try {
      const timeSlotData = {
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
      };

      if (editingId) {
        await api.put(`/time-slots/${editingId}`, timeSlotData);
        toast.success("Time slot updated successfully");
      } else {
        await api.post(
          `/exam-sessions/${selectedSession}/time-slots`,
          timeSlotData
        );
        toast.success("Time slot added successfully");
      }

      resetFormOnly();
      fetchTimeSlots();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to save time slot"
      );
    }
  };

  const handleEdit = (slot) => {
    setEditingId(slot._id);
    setForm({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const handleDelete = async () => {
    if (!selectedSlotId) return;

    try {
      await api.delete(`/time-slots/${selectedSlotId}`);
      toast.success("Time slot deleted successfully");
      closeDeleteModal();
      fetchTimeSlots();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to delete time slot"
      );
      closeDeleteModal();
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
          <h3>{editingId ? "Edit Time Slot" : "Add New Time Slot"}</h3>
          <p>
            Select an exam session, then define an exam date within the session
            period.
          </p>
        </div>

        <form onSubmit={handleSubmitTimeSlot}>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            required
            disabled={editingId}
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
            min={sessionStartDate}
            max={sessionEndDate}
            disabled={!selectedSession}
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
            {editingId ? "Update Time Slot" : "Add Time Slot"}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={resetFormOnly}
            >
              Cancel
            </button>
          )}
        </form>

        {selectedSessionDetails && (
          <p style={{ marginTop: "12px", color: "#5f6b7a" }}>
            Selected session period: {sessionStartDate} to {sessionEndDate}
          </p>
        )}
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

        {loadingSlots ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading time slots...</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot._id}>
                  <td className="strong-cell">{slot.date}</td>
                  <td>{slot.startTime}</td>
                  <td>{slot.endTime}</td>
                  <td>
                    <button
                      className="table-btn"
                      onClick={() => handleEdit(slot)}
                    >
                      Edit
                    </button>

                    <button
                      className="table-btn danger-btn"
                      onClick={() => openDeleteModal(slot._id)}
                    >
                      Delete
                    </button>
                  </td>
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
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Time Slot"
          message="Are you sure you want to delete this time slot? This action cannot be undone."
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default TimeSlots;
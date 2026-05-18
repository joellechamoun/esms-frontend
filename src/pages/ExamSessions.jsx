import { useEffect, useState } from "react";
import api from "../api/axios";

function ExamSessions() {
  const [examSessions, setExamSessions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "Draft",
  });

  useEffect(() => {
    fetchExamSessions();
  }, []);

  const fetchExamSessions = async () => {
    try {
      const res = await api.get("/exam-sessions");
      setExamSessions(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch exam sessions");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      startDate: "",
      endDate: "",
      status: "Draft",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const sessionData = {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
      };

      if (editingId) {
        await api.put(`/exam-sessions/${editingId}`, sessionData);
      } else {
        await api.post("/exam-sessions", sessionData);
      }

      resetForm();
      fetchExamSessions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save exam session");
    }
  };

  const handleEdit = (session) => {
    setEditingId(session._id);

    setForm({
      name: session.name,
      startDate: session.startDate?.slice(0, 10),
      endDate: session.endDate?.slice(0, 10),
      status: session.status,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam session?")) {
      return;
    }

    try {
      await api.delete(`/exam-sessions/${id}`);
      fetchExamSessions();
    } catch (err) {
      console.error(err);
      alert("Failed to delete exam session");
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Exam Sessions Management</h2>
        <p>
          Create and manage exam periods such as midterms, finals, and session
          status.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>{editingId ? "Edit Exam Session" : "Add New Exam Session"}</h3>
          <p>Fill in the exam session information below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Session Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
          />

          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            required
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <option value="Draft">Draft</option>
            <option value="Generated">Generated</option>
            <option value="Published">Published</option>
          </select>

          <button type="submit" className="primary-btn">
            {editingId ? "Update Session" : "Add Session"}
          </button>

          {editingId && (
            <button type="button" className="secondary-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Exam Sessions List</h3>
            <p>{examSessions.length} session(s) available</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Session Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {examSessions.map((session) => (
              <tr key={session._id}>
                <td className="strong-cell">{session.name}</td>
                <td>{session.startDate?.slice(0, 10)}</td>
                <td>{session.endDate?.slice(0, 10)}</td>
                <td>{session.status}</td>
                <td>
                  <button
                    className="table-btn"
                    onClick={() => handleEdit(session)}
                  >
                    Edit
                  </button>
                  <button
                    className="table-btn danger-btn"
                    onClick={() => handleDelete(session._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {examSessions.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-table">
                  No exam sessions added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExamSessions;
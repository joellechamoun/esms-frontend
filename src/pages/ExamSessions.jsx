import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";

function ExamSessions() {
  const [examSessions, setExamSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 11 },
    (_, index) => currentYear + index
  );

  const [form, setForm] = useState({
    season: "",
    academicYear: "",
    examType: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchExamSessions().finally(() => setLoading(false));
  }, []);

  const fetchExamSessions = async () => {
    try {
      const res = await api.get("/exam-sessions");
      setExamSessions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch exam sessions");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      season: "",
      academicYear: "",
      examType: "",
      startDate: "",
      endDate: "",
    });
    setEditingId(null);
  };

  const openDeleteModal = (id) => {
    setSelectedSessionId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedSessionId(null);
    setShowDeleteModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const sessionData = {
        season: form.season,
        academicYear: Number(form.academicYear),
        examType: form.examType,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      if (editingId) {
        await api.put(`/exam-sessions/${editingId}`, sessionData);
        toast.success("Exam session updated successfully");
      } else {
        await api.post("/exam-sessions", sessionData);
        toast.success("Exam session added successfully");
      }

      resetForm();
      fetchExamSessions();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save exam session");
    }
  };

  const handleEdit = (session) => {
    setEditingId(session._id);

    setForm({
      season: session.season || "",
      academicYear: session.academicYear ? String(session.academicYear) : "",
      examType: session.examType || "",
      startDate: session.startDate?.slice(0, 10) || "",
      endDate: session.endDate?.slice(0, 10) || "",
    });
  };

  const handleDelete = async () => {
    if (!selectedSessionId) return;

    try {
      await api.delete(`/exam-sessions/${selectedSessionId}`);
      toast.success("Exam session deleted successfully");
      closeDeleteModal();
      fetchExamSessions();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to delete exam session"
      );
      closeDeleteModal();
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Exam Sessions Management</h2>
        <p>
          Create and manage exam periods by season, academic year, and exam
          type.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>{editingId ? "Edit Exam Session" : "Add New Exam Session"}</h3>
          <p>Fill in the exam session information below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <select
            name="season"
            value={form.season}
            onChange={handleChange}
            required
          >
            <option value="">Select Season</option>
            <option value="Fall">Fall</option>
            <option value="Spring">Spring</option>
          </select>

          <select
            name="academicYear"
            value={form.academicYear}
            onChange={handleChange}
            required
          >
            <option value="">Select Year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            name="examType"
            value={form.examType}
            onChange={handleChange}
            required
          >
            <option value="">Select Exam Type</option>
            <option value="Midterm">Midterm</option>
            <option value="Final">Final</option>
          </select>

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

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading exam sessions...</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Session Name</th>
                <th>Season</th>
                <th>Year</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {examSessions.map((session) => (
                <tr key={session._id}>
                  <td className="strong-cell">{session.name}</td>
                  <td>{session.season}</td>
                  <td>{session.academicYear}</td>
                  <td>{session.examType}</td>
                  <td>{session.startDate?.slice(0, 10)}</td>
                  <td>{session.endDate?.slice(0, 10)}</td>
                  <td>
                    <button
                      className="table-btn"
                      onClick={() => handleEdit(session)}
                    >
                      Edit
                    </button>
                    <button
                      className="table-btn danger-btn"
                      onClick={() => openDeleteModal(session._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {examSessions.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-table">
                    No exam sessions added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Exam Session"
          message="Are you sure you want to delete this exam session? This action cannot be undone."
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default ExamSessions;
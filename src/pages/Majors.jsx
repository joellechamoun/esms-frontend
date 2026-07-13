import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";

function Majors() {
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMajorId, setSelectedMajorId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
  });

  useEffect(() => {
    fetchMajors().finally(() => setLoading(false));
  }, []);

  const fetchMajors = async () => {
    try {
      const res = await api.get("/majors");
      setMajors(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch majors");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
    });
    setEditingId(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedMajorId(null);
  };

  const openDeleteModal = (id) => {
    setSelectedMajorId(id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const majorData = {
        code: form.code,
        name: form.name,
      };

      if (editingId) {
        await api.put(`/majors/${editingId}`, majorData);
        toast.success("Major updated successfully");
      } else {
        await api.post("/majors", majorData);
        toast.success("Major added successfully");
      }

      resetForm();
      fetchMajors();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save major");
    }
  };

  const handleEdit = (major) => {
    setEditingId(major._id);
    setForm({
      code: major.code || "",
      name: major.name || "",
    });
  };

  const handleDelete = async () => {
    if (!selectedMajorId) return;

    try {
      await api.delete(`/majors/${selectedMajorId}`);
      toast.success("Major deleted successfully");
      closeDeleteModal();
      fetchMajors();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "Failed to delete major"
      );
      closeDeleteModal();
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Majors Management</h2>
        <p>Manage faculty majors used to organize academic courses.</p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>{editingId ? "Edit Major" : "Add New Major"}</h3>
          <p>Fill in the major information below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            name="code"
            placeholder="Major Code e.g. CS"
            value={form.code}
            onChange={handleChange}
            required
          />

          <input
            name="name"
            placeholder="Major Name e.g. Computer Science"
            value={form.name}
            onChange={handleChange}
            required
          />

          <button type="submit" className="primary-btn">
            {editingId ? "Update Major" : "Add Major"}
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
            <h3>Majors List</h3>
            <p>{majors.length} major(s) available</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading majors...</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {majors.map((major) => (
                <tr key={major._id}>
                  <td className="strong-cell">{major.code}</td>
                  <td>{major.name}</td>
                  <td>
                    <button
                      className="table-btn"
                      onClick={() => handleEdit(major)}
                    >
                      Edit
                    </button>
                    <button
                      className="table-btn danger-btn"
                      onClick={() => openDeleteModal(major._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {majors.length === 0 && (
                <tr>
                  <td colSpan="3" className="empty-table">
                    No majors added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Major"
          message="Are you sure you want to delete this major? You cannot delete a major that is already assigned to courses."
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default Majors;
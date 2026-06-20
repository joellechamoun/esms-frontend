import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    year: "",
    semester: "",
    term: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch courses");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      year: "",
      semester: "",
      term: "",
    });
    setEditingId(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedCourseId(null);
  };

  const openDeleteModal = (id) => {
    setSelectedCourseId(id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const courseData = {
        code: form.code,
        name: form.name,
        year: Number(form.year),
        semester: form.semester,
        term: form.term,
      };

      if (editingId) {
        await api.put(`/courses/${editingId}`, courseData);
        toast.success("Course updated successfully");
      } else {
        await api.post("/courses", courseData);
        toast.success("Course added successfully");
      }

      resetForm();
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save course");
    }
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setForm({
      code: course.code,
      name: course.name,
      year: course.year,
      semester: course.semester,
      term: course.term,
    });
  };

  const handleDelete = async () => {
    if (!selectedCourseId) return;

    try {
      await api.delete(`/courses/${selectedCourseId}`);
      toast.success("Course deleted successfully");
      closeDeleteModal();
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete course");
      closeDeleteModal();
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Courses Management</h2>
        <p>Manage academic courses by year, semester, and term.</p>
      </div>

      <div className="form-card course-form-card">
        <div className="section-title">
          <h3>{editingId ? "Edit Course" : "Add New Course"}</h3>
          <p>Fill in the course information below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            name="code"
            placeholder="Course Code"
            value={form.code}
            onChange={handleChange}
            required
          />

          <input
            name="name"
            placeholder="Course Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="year"
            type="number"
            placeholder="Year"
            value={form.year}
            onChange={handleChange}
            required
          />

          <select
            name="semester"
            value={form.semester}
            onChange={handleChange}
            required
          >
            <option value="">Select Semester</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
            <option value="S3">S3</option>
            <option value="S4">S4</option>
            <option value="S5">S5</option>
            <option value="S6">S6</option>
            <option value="S7">S7</option>
            <option value="S8">S8</option>
            <option value="S9">S9</option>
            <option value="S10">S10</option>
          </select>

          <input
            name="term"
            placeholder="Term e.g. Spring 2026"
            value={form.term}
            onChange={handleChange}
            required
          />

          <button type="submit" className="primary-btn">
            {editingId ? "Update Course" : "Add Course"}
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
            <h3>Courses List</h3>
            <p>{courses.length} course(s) available</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Term</th>
              <th>Students</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td className="strong-cell">{course.code}</td>
                <td>{course.name}</td>
                <td>{course.year}</td>
                <td>{course.semester}</td>
                <td>{course.term}</td>
                <td>
                  <strong>{course.registeredCount || 0}</strong>
                </td>
                <td>
                  <button
                    className="table-btn"
                    onClick={() => handleEdit(course)}
                  >
                    Edit
                  </button>
                  <button
                    className="table-btn danger-btn"
                    onClick={() => openDeleteModal(course._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {courses.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-table">
                  No courses added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default Courses;
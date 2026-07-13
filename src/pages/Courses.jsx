import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import RegistrantsModal from "../components/RegistrantsModal";
import Spinner from "../components/Spinner";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [registrantsCourse, setRegistrantsCourse] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    major: "",
    year: "",
    semester: "",
  });

  const semestersByYear = {
    1: ["S1", "S2"],
    2: ["S3", "S4"],
    3: ["S5", "S6"],
    4: ["S7", "S8"],
    5: ["S9", "S10"],
  };

  const availableSemesters = form.year ? semestersByYear[form.year] || [] : [];

  useEffect(() => {
    Promise.all([fetchCourses(), fetchMajors()]).finally(() =>
      setLoading(false)
    );
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
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;

    setForm((prev) => ({
      ...prev,
      year: selectedYear,
      semester: "",
    }));
  };

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      major: "",
      year: "",
      semester: "",
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

    if (!availableSemesters.includes(form.semester)) {
      toast.error("Please select a valid semester for the selected year");
      return;
    }

    try {
      const courseData = {
        code: form.code,
        name: form.name,
        major: form.major,
        year: Number(form.year),
        semester: form.semester,
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
      code: course.code || "",
      name: course.name || "",
      major: course.major?._id || course.major || "",
      year: course.year ? String(course.year) : "",
      semester: course.semester || "",
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
        <p>Manage academic courses by major, year, and semester.</p>
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

          <select
            name="major"
            value={form.major}
            onChange={handleChange}
            required
          >
            <option value="">Select Major</option>
            {majors.map((major) => (
              <option key={major._id} value={major._id}>
                {major.code} - {major.name}
              </option>
            ))}
          </select>

          <select
            name="year"
            value={form.year}
            onChange={handleYearChange}
            required
          >
            <option value="">Select Year</option>
            <option value="1">Year 1 / L1</option>
            <option value="2">Year 2 / L2</option>
            <option value="3">Year 3 / L3</option>
            <option value="4">Year 4 / M1</option>
            <option value="5">Year 5 / M2</option>
          </select>

          <select
            name="semester"
            value={form.semester}
            onChange={handleChange}
            required
            disabled={!form.year}
          >
            <option value="">Select Semester</option>
            {availableSemesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>

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

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading courses...</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Major</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td className="strong-cell">{course.code}</td>
                  <td>{course.name}</td>
                  <td>
                    {course.major
                      ? `${course.major.code || ""}${
                          course.major.code && course.major.name ? " - " : ""
                        }${course.major.name || ""}`
                      : "No major"}
                  </td>
                  <td>{course.year}</td>
                  <td>{course.semester}</td>
                  <td>
                    <button
                      className="table-btn"
                      onClick={() => setRegistrantsCourse(course)}
                    >
                      {course.registeredCount || 0} student(s)
                    </button>
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
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}

      {registrantsCourse && (
        <RegistrantsModal
          course={registrantsCourse}
          onClose={() => setRegistrantsCourse(null)}
        />
      )}
    </div>
  );
}

export default Courses;
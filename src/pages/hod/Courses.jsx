import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import ConfirmModal from "../../components/ConfirmModal";
import Spinner from "../../components/Spinner";

const semestersByYear = {
  1: ["S1", "S2"],
  2: ["S3", "S4"],
  3: ["S5", "S6"],
  4: ["S7", "S8"],
  5: ["S9", "S10"],
};

function HodCourses() {
  const [majors, setMajors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMajorId, setSelectedMajorId] = useState(null);

  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    year: "",
    semester: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourseForDelete, setSelectedCourseForDelete] = useState(null);

  const availableSemesters = courseForm.year
    ? semestersByYear[courseForm.year] || []
    : [];

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const ownDepartmentId = user?.department;

  useEffect(() => {
    Promise.all([fetchMajors(), fetchCourses()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchMajors = async () => {
    try {
      const res = await api.get("/majors");
      const ownMajors = res.data.filter(
        (major) => (major.department?._id || major.department) === ownDepartmentId
      );
      setMajors(ownMajors);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch majors");
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch courses");
    }
  };

  const selectedMajor = majors.find((m) => m._id === selectedMajorId) || null;

  const coursesForSelectedMajor = courses.filter(
    (c) => (c.major?._id || c.major) === selectedMajorId
  );

  const selectMajor = (id) => {
    setSelectedMajorId(id);
    resetCourseForm();
  };

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseYearChange = (e) => {
    setCourseForm((prev) => ({
      ...prev,
      year: e.target.value,
      semester: "",
    }));
  };

  const resetCourseForm = () => {
    setCourseForm({ code: "", name: "", year: "", semester: "" });
    setEditingCourseId(null);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMajorId) return;

    if (!availableSemesters.includes(courseForm.semester)) {
      toast.error("Please select a valid semester for the selected year");
      return;
    }

    try {
      const courseData = {
        code: courseForm.code,
        name: courseForm.name,
        major: selectedMajorId,
        year: Number(courseForm.year),
        semester: courseForm.semester,
      };

      if (editingCourseId) {
        await api.put(`/courses/${editingCourseId}`, courseData);
        toast.success("Course updated successfully");
      } else {
        await api.post("/courses", courseData);
        toast.success("Course added successfully");
      }

      resetCourseForm();
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save course");
    }
  };

  const handleCourseEdit = (course) => {
    setEditingCourseId(course._id);
    setCourseForm({
      code: course.code || "",
      name: course.name || "",
      year: course.year ? String(course.year) : "",
      semester: course.semester || "",
    });
  };

  const openDeleteModal = (id) => {
    setSelectedCourseForDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedCourseForDelete(null);
    setShowDeleteModal(false);
  };

  const handleCourseDelete = async () => {
    if (!selectedCourseForDelete) return;

    try {
      await api.delete(`/courses/${selectedCourseForDelete}`);
      toast.success("Course deleted successfully");
      closeDeleteModal();
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete course");
      closeDeleteModal();
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Department Courses</h2>
        <p>Select a major to manage its courses.</p>
      </div>

      {loading ? (
        <div className="table-card">
          <div className="loading-state">
            <Spinner />
            <span>Loading majors and courses...</span>
          </div>
        </div>
      ) : (
        <div className="split-layout">
          <div className="split-panel-left table-card">
            <div className="table-header">
              <div>
                <h3>Majors</h3>
                <p>{majors.length} major(s) in your department</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                </tr>
              </thead>

              <tbody>
                {majors.map((major) => (
                  <tr
                    key={major._id}
                    className={major._id === selectedMajorId ? "active-row" : ""}
                    onClick={() => selectMajor(major._id)}
                  >
                    <td className="strong-cell">{major.code}</td>
                    <td>{major.name}</td>
                  </tr>
                ))}

                {majors.length === 0 && (
                  <tr>
                    <td colSpan="2" className="empty-table">
                      No majors in your department yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="split-panel-right">
            {selectedMajor ? (
              <>
                <div className="form-card">
                  <div className="section-title">
                    <h3>
                      {editingCourseId ? "Edit Course" : "Add Course to"}{" "}
                      {selectedMajor.name}
                    </h3>
                    <p>Fill in the course information below.</p>
                  </div>

                  <form onSubmit={handleCourseSubmit}>
                    <input
                      name="code"
                      placeholder="Course Code"
                      value={courseForm.code}
                      onChange={handleCourseChange}
                      required
                    />

                    <input
                      name="name"
                      placeholder="Course Name"
                      value={courseForm.name}
                      onChange={handleCourseChange}
                      required
                    />

                    <select
                      name="year"
                      value={courseForm.year}
                      onChange={handleCourseYearChange}
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
                      value={courseForm.semester}
                      onChange={handleCourseChange}
                      required
                      disabled={!courseForm.year}
                    >
                      <option value="">Select Semester</option>
                      {availableSemesters.map((semester) => (
                        <option key={semester} value={semester}>
                          {semester}
                        </option>
                      ))}
                    </select>

                    <button type="submit" className="primary-btn">
                      {editingCourseId ? "Update Course" : "Add Course"}
                    </button>

                    {editingCourseId && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={resetCourseForm}
                      >
                        Cancel
                      </button>
                    )}
                  </form>
                </div>

                <div className="table-card">
                  <div className="table-header">
                    <div>
                      <h3>Courses in {selectedMajor.name}</h3>
                      <p>{coursesForSelectedMajor.length} course(s)</p>
                    </div>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Year</th>
                        <th>Semester</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {coursesForSelectedMajor.map((course) => (
                        <tr key={course._id}>
                          <td className="strong-cell">{course.code}</td>
                          <td>{course.name}</td>
                          <td>{course.year}</td>
                          <td>{course.semester}</td>
                          <td>
                            <button
                              className="table-btn"
                              onClick={() => handleCourseEdit(course)}
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

                      {coursesForSelectedMajor.length === 0 && (
                        <tr>
                          <td colSpan="5" className="empty-table">
                            No courses added to this major yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="split-empty-state">
                Select a major on the left to manage its courses.
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          onCancel={closeDeleteModal}
          onConfirm={handleCourseDelete}
        />
      )}
    </div>
  );
}

export default HodCourses;

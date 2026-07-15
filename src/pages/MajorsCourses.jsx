import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import RegistrantsModal from "../components/RegistrantsModal";
import Spinner from "../components/Spinner";

const semestersByYear = {
  1: ["S1", "S2"],
  2: ["S3", "S4"],
  3: ["S5", "S6"],
  4: ["S7", "S8"],
  5: ["S9", "S10"],
};

function MajorsCourses() {
  const [majors, setMajors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMajorId, setSelectedMajorId] = useState(null);

  const [editingMajorId, setEditingMajorId] = useState(null);
  const [majorForm, setMajorForm] = useState({
    code: "",
    name: "",
    department: "",
  });

  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    year: "",
    semester: "",
  });

  const [showDeleteMajorModal, setShowDeleteMajorModal] = useState(false);
  const [selectedMajorForDelete, setSelectedMajorForDelete] = useState(null);

  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
  const [selectedCourseForDelete, setSelectedCourseForDelete] = useState(null);

  const [registrantsCourse, setRegistrantsCourse] = useState(null);

  const availableSemesters = courseForm.year
    ? semestersByYear[courseForm.year] || []
    : [];

  useEffect(() => {
    Promise.all([fetchMajors(), fetchCourses(), fetchDepartments()]).finally(
      () => setLoading(false)
    );
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

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch courses");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch departments");
    }
  };

  const selectedMajor = majors.find((m) => m._id === selectedMajorId) || null;

  const coursesForSelectedMajor = courses.filter(
    (c) => (c.major?._id || c.major) === selectedMajorId
  );

  // ===== MAJOR FORM =====

  const handleMajorChange = (e) => {
    setMajorForm({ ...majorForm, [e.target.name]: e.target.value });
  };

  const resetMajorForm = () => {
    setMajorForm({ code: "", name: "", department: "" });
    setEditingMajorId(null);
  };

  const handleMajorSubmit = async (e) => {
    e.preventDefault();

    try {
      const majorData = {
        code: majorForm.code,
        name: majorForm.name,
        department: majorForm.department,
      };

      if (editingMajorId) {
        await api.put(`/majors/${editingMajorId}`, majorData);
        toast.success("Major updated successfully");
      } else {
        await api.post("/majors", majorData);
        toast.success("Major added successfully");
      }

      resetMajorForm();
      fetchMajors();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save major");
    }
  };

  const handleMajorEdit = (major) => {
    setEditingMajorId(major._id);
    setMajorForm({
      code: major.code || "",
      name: major.name || "",
      department: major.department?._id || major.department || "",
    });
  };

  const openDeleteMajorModal = (id) => {
    setSelectedMajorForDelete(id);
    setShowDeleteMajorModal(true);
  };

  const closeDeleteMajorModal = () => {
    setSelectedMajorForDelete(null);
    setShowDeleteMajorModal(false);
  };

  const handleMajorDelete = async () => {
    if (!selectedMajorForDelete) return;

    try {
      await api.delete(`/majors/${selectedMajorForDelete}`);
      toast.success("Major deleted successfully");

      if (selectedMajorId === selectedMajorForDelete) {
        setSelectedMajorId(null);
      }

      closeDeleteMajorModal();
      fetchMajors();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete major");
      closeDeleteMajorModal();
    }
  };

  // ===== COURSE FORM (scoped to selectedMajorId) =====

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

  const openDeleteCourseModal = (id) => {
    setSelectedCourseForDelete(id);
    setShowDeleteCourseModal(true);
  };

  const closeDeleteCourseModal = () => {
    setSelectedCourseForDelete(null);
    setShowDeleteCourseModal(false);
  };

  const handleCourseDelete = async () => {
    if (!selectedCourseForDelete) return;

    try {
      await api.delete(`/courses/${selectedCourseForDelete}`);
      toast.success("Course deleted successfully");
      closeDeleteCourseModal();
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete course");
      closeDeleteCourseModal();
    }
  };

  const selectMajor = (id) => {
    setSelectedMajorId(id);
    resetCourseForm();
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Majors & Courses</h2>
        <p>Manage majors and the courses that belong to them.</p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>{editingMajorId ? "Edit Major" : "Add New Major"}</h3>
          <p>Fill in the major information below.</p>
        </div>

        <form onSubmit={handleMajorSubmit}>
          <input
            name="code"
            placeholder="Major Code e.g. CS"
            value={majorForm.code}
            onChange={handleMajorChange}
            required
          />

          <input
            name="name"
            placeholder="Major Name e.g. Computer Science"
            value={majorForm.name}
            onChange={handleMajorChange}
            required
          />

          <select
            name="department"
            value={majorForm.department}
            onChange={handleMajorChange}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.code} - {dept.name}
              </option>
            ))}
          </select>

          <button type="submit" className="primary-btn">
            {editingMajorId ? "Update Major" : "Add Major"}
          </button>

          {editingMajorId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={resetMajorForm}
            >
              Cancel
            </button>
          )}
        </form>
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
                <p>{majors.length} major(s) — click one to manage its courses</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Actions</th>
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
                    <td>{major.department?.code || "—"}</td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMajorEdit(major);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="table-btn danger-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteMajorModal(major._id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {majors.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-table">
                      No majors added yet.
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
                        <th>Students</th>
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
                              onClick={() => setRegistrantsCourse(course)}
                            >
                              {course.registeredCount || 0} student(s)
                            </button>
                          </td>
                          <td>
                            <button
                              className="table-btn"
                              onClick={() => handleCourseEdit(course)}
                            >
                              Edit
                            </button>
                            <button
                              className="table-btn danger-btn"
                              onClick={() => openDeleteCourseModal(course._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {coursesForSelectedMajor.length === 0 && (
                        <tr>
                          <td colSpan="6" className="empty-table">
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

      {showDeleteMajorModal && (
        <ConfirmModal
          title="Delete Major"
          message="Are you sure you want to delete this major? You cannot delete a major that is already assigned to courses."
          onCancel={closeDeleteMajorModal}
          onConfirm={handleMajorDelete}
        />
      )}

      {showDeleteCourseModal && (
        <ConfirmModal
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          onCancel={closeDeleteCourseModal}
          onConfirm={handleCourseDelete}
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

export default MajorsCourses;

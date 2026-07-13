import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";

function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState(null);

  useEffect(() => {
    Promise.all([fetchCourses(), fetchMyRegistrations()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const res = await api.get("/registrations/me");
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load registrations");
    }
  };

  const getRegistration = (courseId) => {
    return registrations.find((reg) => reg.course?._id === courseId);
  };

  const getMajorLabel = (major) => {
    if (!major) return "No major";
    if (typeof major === "string") return "Major assigned";
    return `${major.code || ""}${major.code && major.name ? " - " : ""}${
      major.name || ""
    }`;
  };

  const handleRegister = async (courseId) => {
    try {
      await api.post("/registrations", { courseId });
      toast.success("Registered successfully");
      fetchMyRegistrations();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to register");
    }
  };

  const openUnregisterModal = (registrationId) => {
    setSelectedRegistrationId(registrationId);
    setShowUnregisterModal(true);
  };

  const closeUnregisterModal = () => {
    setShowUnregisterModal(false);
    setSelectedRegistrationId(null);
  };

  const handleUnregister = async () => {
    if (!selectedRegistrationId) return;

    try {
      await api.delete(`/registrations/${selectedRegistrationId}`);
      toast.success("Unregistered successfully");
      closeUnregisterModal();
      fetchMyRegistrations();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to unregister");
      closeUnregisterModal();
    }
  };

  return (
    <div className="student-page">
      <div className="page-header">
        <h2>Available Courses</h2>
        <p>Select the courses you want to register in.</p>
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
                <th>Course Name</th>
                <th>Major</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Registration</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => {
                const registration = getRegistration(course._id);

                return (
                  <tr key={course._id}>
                    <td className="strong-cell">{course.code}</td>
                    <td>{course.name}</td>
                    <td>{getMajorLabel(course.major)}</td>
                    <td>{course.year}</td>
                    <td>{course.semester}</td>
                    <td>
                      {registration ? (
                        <button
                          className="table-btn danger-btn"
                          onClick={() => openUnregisterModal(registration._id)}
                        >
                          Unregister
                        </button>
                      ) : (
                        <button
                          className="table-btn"
                          onClick={() => handleRegister(course._id)}
                        >
                          Register
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {courses.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No courses available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showUnregisterModal && (
        <ConfirmModal
          title="Unregister from Course"
          message="Are you sure you want to unregister from this course?"
          confirmLabel="Unregister"
          onCancel={closeUnregisterModal}
          onConfirm={handleUnregister}
        />
      )}
    </div>
  );
}

export default StudentCourses;

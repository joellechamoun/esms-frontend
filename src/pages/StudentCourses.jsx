import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchMyRegistrations();
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

  const isRegistered = (courseId) => {
    return registrations.some((reg) => reg.course?._id === courseId);
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

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Course Name</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Term</th>
              <th>Registration</th>
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
                  {isRegistered(course._id) ? (
                    <span className="registered-badge">Registered</span>
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
            ))}

            {courses.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-table">
                  No courses available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentCourses;
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get("/registrations/me");
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load registered courses");
    }
  };

  const getMajorLabel = (major) => {
    if (!major) return "No major";
    if (typeof major === "string") return "Major assigned";
    return `${major.code || ""}${major.code && major.name ? " - " : ""}${
      major.name || ""
    }`;
  };

  const validRegistrations = registrations.filter((reg) => reg.course);

  const groupedBySemester = validRegistrations.reduce((acc, reg) => {
    const semester = reg.course?.semester || "Unknown";

    if (!acc[semester]) {
      acc[semester] = [];
    }

    acc[semester].push(reg);
    return acc;
  }, {});

  return (
    <div className="student-page">
      <div className="page-header">
        <h2>My Courses</h2>
        <p>View your registered courses grouped by semester.</p>
      </div>

      {validRegistrations.length === 0 && (
        <div className="table-card">
          <div className="empty-table">
            You are not registered in any course yet.
          </div>
        </div>
      )}

      {Object.keys(groupedBySemester).map((semester) => (
        <div className="table-card" key={semester}>
          <div className="table-header">
            <h3>{semester} Registered Courses</h3>
          </div>

          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Major</th>
                <th>Year</th>
              </tr>
            </thead>

            <tbody>
              {groupedBySemester[semester].map((reg) => (
                <tr key={reg._id}>
                  <td className="strong-cell">{reg.course?.code}</td>
                  <td>{reg.course?.name}</td>
                  <td>{getMajorLabel(reg.course?.major)}</td>
                  <td>{reg.course?.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default MyRegistrations;
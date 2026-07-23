import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import Spinner from "./Spinner";

function RegistrantsModal({ course, onClose }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRegistrants = async () => {
    try {
      const res = await api.get(`/registrations?course=${course._id}`);
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load registered students");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="registrants-modal">
        <h3>Registered Students</h3>
        <p>
          {course.code} - {course.name}
        </p>

        {loading && (
          <div className="loading-state">
            <Spinner />
            <span>Loading...</span>
          </div>
        )}

        {!loading && registrations.length === 0 && (
          <div className="empty-table">No students registered yet.</div>
        )}

        {!loading && registrations.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>

            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id}>
                  <td>{reg.student?.name}</td>
                  <td>{reg.student?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrantsModal;

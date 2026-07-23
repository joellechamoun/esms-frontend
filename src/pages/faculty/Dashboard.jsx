import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../../api/axios";
import Spinner from "../../components/Spinner";
import ProfileBanner from "../../components/ProfileBanner";
import StatCard from "../../components/StatCard";

function formatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function FacultyDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, summaryRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/dashboard/summary"),
        ]);
        setUser(meRes.data);
        setSummary(summaryRes.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <Spinner />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const stats = summary?.stats;
  const nextExam = stats?.nextExam;

  return (
    <div className="dashboard-page">
      <ProfileBanner user={user} currentTerm={summary?.currentTerm} />

      {!summary?.department && (
        <div className="table-card">
          <div className="empty-table">
            You're not assigned to a department yet. Ask an Admin to set one
            on your account to see your schedule here.
          </div>
        </div>
      )}

      {summary?.department && (
        <>
          <section className="stat-grid">
            <StatCard
              label="Published Sessions"
              value={stats.publishedSessionsCount}
              to="/faculty/schedule"
            />
            <StatCard
              label="Published Exams"
              value={stats.totalPublishedExams}
              to="/faculty/schedule"
            />
          </section>

          <div className="table-card">
            <div className="table-header">
              <div>
                <h3>Next Exam</h3>
                <p>The soonest upcoming exam in your department's published schedule.</p>
              </div>
            </div>

            {nextExam ? (
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="strong-cell">{nextExam.course}</td>
                    <td>{formatDate(nextExam.date)}</td>
                    <td>
                      {nextExam.startTime} - {nextExam.endTime}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="empty-table">
                No upcoming published exams for your department.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FacultyDashboard;

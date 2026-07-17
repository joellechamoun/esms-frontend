import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../../api/axios";
import Spinner from "../../components/Spinner";
import ProfileBanner from "../../components/ProfileBanner";
import StatCard from "../../components/StatCard";
import BarChart from "../../components/BarChart";
import NeedsAttention from "../../components/NeedsAttention";

const STATUS_LABELS = {
  Draft: "Draft",
  PendingApproval: "Pending Approval",
  Approved: "Approved",
  Published: "Published",
};

function HodDashboard() {
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
  const needsAttention = summary?.needsAttention;
  const latestSchedule = stats?.examSchedules?.[0];

  const courseBars = stats
    ? stats.registrationsByCourse.map((c) => ({
        label: c.code,
        value: c.count,
        color: "#1f5597",
      }))
    : [];

  const attentionItems = needsAttention
    ? needsAttention.rejectedSchedules.map((s) => ({
        id: `rejected-${s.id}`,
        title: s.examSessionName,
        subtitle: `Rejected: ${s.rejectionReason}`,
        actionLabel: "Fix & Resubmit",
        actionTo: "/hod/exam-schedule",
        tone: "danger",
      }))
    : [];

  return (
    <div className="dashboard-page">
      <ProfileBanner user={user} currentTerm={summary?.currentTerm} />

      {stats && (
        <>
          <section className="stat-grid">
            <StatCard
              label="Courses"
              value={stats.totalCourses}
              to="/hod/courses"
            />
            <StatCard
              label="Student Registrations"
              value={stats.totalRegistrations}
              to="/hod/courses"
            />
            <StatCard
              label="Latest Schedule Status"
              value={
                latestSchedule
                  ? STATUS_LABELS[latestSchedule.status] || latestSchedule.status
                  : "No Schedule Yet"
              }
              to="/hod/exam-schedule"
            />
          </section>

          <section className="chart-grid chart-grid-single">
            <BarChart title="Registrations by Course" bars={courseBars} />
          </section>
        </>
      )}

      {needsAttention && (
        <NeedsAttention
          items={attentionItems}
          emptyMessage="No rejected schedules waiting on you."
        />
      )}
    </div>
  );
}

export default HodDashboard;

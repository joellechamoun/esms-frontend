import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";
import Spinner from "../components/Spinner";
import ProfileBanner from "../components/ProfileBanner";
import StatCard from "../components/StatCard";
import DonutChart from "../components/DonutChart";
import BarChart from "../components/BarChart";
import NeedsAttention from "../components/NeedsAttention";

const ROLE_LABELS = {
  Student: "Students",
  HeadOfDepartment: "HoDs",
  Faculty: "Faculty",
  Admin: "Admins",
};

const ROLE_COLORS = {
  Student: "#1f5597",
  HeadOfDepartment: "#c9a24d",
  Faculty: "#c0532b",
  Admin: "#9aa5b1",
};

const STATUS_LABELS = {
  Draft: "Draft",
  PendingApproval: "Pending",
  Approved: "Approved",
  Published: "Published",
};

const STATUS_COLORS = {
  Draft: "#9aa5b1",
  PendingApproval: "#c9a24d",
  Approved: "#2f8f5b",
  Published: "#1f5597",
};

function Dashboard() {
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

  const roleSegments = stats
    ? Object.entries(stats.usersByRole).map(([role, value]) => ({
        label: ROLE_LABELS[role] || role,
        value,
        color: ROLE_COLORS[role] || "#9aa5b1",
      }))
    : [];

  const statusBars = stats
    ? Object.entries(stats.examSchedulesByStatus).map(([status, value]) => ({
        label: STATUS_LABELS[status] || status,
        value,
        color: STATUS_COLORS[status] || "#9aa5b1",
      }))
    : [];

  const attentionItems = needsAttention
    ? [
        ...needsAttention.pendingApprovals.map((s) => ({
          id: `approval-${s.id}`,
          title: `${s.departmentName} · ${s.examSessionName}`,
          subtitle: `Submitted by ${s.submittedByName} · pending approval`,
          actionLabel: "Review",
          actionTo: "/exam-schedules",
          tone: "warning",
        })),
        ...needsAttention.departmentsWithoutHead.map((d) => ({
          id: `no-head-${d.id}`,
          title: d.name,
          subtitle: "No head of department assigned",
          actionLabel: "Assign Head",
          actionTo: "/departments",
          tone: "neutral",
        })),
      ]
    : [];

  return (
    <div className="dashboard-page">
      <ProfileBanner user={user} currentTerm={summary?.currentTerm} />

      {stats && (
        <>
          <section className="stat-grid">
            <StatCard label="Total Users" value={stats.totalUsers} to="/users" />
            <StatCard
              label="Departments"
              value={stats.totalDepartments}
              to="/departments"
            />
            <StatCard label="Majors" value={stats.totalMajors} to="/majors" />
            <StatCard label="Courses" value={stats.totalCourses} to="/majors" />
            <StatCard label="Rooms" value={stats.totalRooms} to="/rooms" />
          </section>

          <section className="chart-grid">
            <DonutChart title="Users by Role" segments={roleSegments} />
            <BarChart title="Exam Schedules by Status" bars={statusBars} />
          </section>
        </>
      )}

      {needsAttention && (
        <NeedsAttention
          items={attentionItems}
          emptyMessage="No pending approvals or unassigned departments."
        />
      )}
    </div>
  );
}

export default Dashboard;

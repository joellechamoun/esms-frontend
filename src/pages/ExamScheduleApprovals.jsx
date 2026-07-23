import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { DndContext } from "@dnd-kit/core";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import ReasonModal from "../components/ReasonModal";
import Spinner from "../components/Spinner";
import ExamGrid from "../components/examGrid/ExamGrid";

const STATUS_LABELS = {
  Draft: "Draft",
  PendingApproval: "Pending Approval",
  Approved: "Approved",
  Published: "Published",
};

const STATUS_COLORS = {
  Draft: "#6b7280",
  PendingApproval: "#c9a24d",
  Approved: "#2f855a",
  Published: "#1a5fb4",
};

const getExamYear = (exam) => exam.course?.year;

function ExamScheduleApprovals() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedMajorId, setSelectedMajorId] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchSchedules().finally(() => setLoading(false));
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/exam-schedules");
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch exam schedules");
    }
  };

  const viewSchedule = async (id) => {
    setLoadingDetail(true);

    try {
      const res = await api.get(`/exam-schedules/${id}`);
      setSelectedSchedule(res.data);
      setSelectedMajorId(null);

      const sessionId = res.data.examSession?._id || res.data.examSession;
      const slotsRes = await api.get(`/exam-sessions/${sessionId}/time-slots`);
      setTimeSlots(slotsRes.data);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to load exam schedule details"
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const refreshAfterAction = async () => {
    if (selectedSchedule) {
      await viewSchedule(selectedSchedule._id);
    }
    await fetchSchedules();
  };

  const handleApprove = async () => {
    try {
      await api.post(`/exam-schedules/${selectedSchedule._id}/approve`);
      toast.success("Exam schedule approved");
      setShowApproveModal(false);
      refreshAfterAction();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to approve schedule");
      setShowApproveModal(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      await api.post(`/exam-schedules/${selectedSchedule._id}/reject`, {
        reason,
      });
      toast.success("Exam schedule rejected and returned to draft");
      setShowRejectModal(false);
      refreshAfterAction();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reject schedule");
      setShowRejectModal(false);
    }
  };

  const handlePublish = async () => {
    try {
      await api.post(`/exam-schedules/${selectedSchedule._id}/publish`);
      toast.success("Exam schedule published");
      setShowPublishModal(false);
      refreshAfterAction();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to publish schedule");
      setShowPublishModal(false);
    }
  };

  const filteredSchedules = statusFilter
    ? schedules.filter((s) => s.status === statusFilter)
    : schedules;

  const scheduleExams = selectedSchedule?.exams || [];

  const majorTabs = useMemo(() => {
    const seen = new Map();

    for (const exam of scheduleExams) {
      const major = exam.course?.major;
      if (major?._id && !seen.has(major._id)) seen.set(major._id, major);
    }

    return [...seen.values()].sort((a, b) => a.code.localeCompare(b.code));
  }, [scheduleExams]);

  useEffect(() => {
    if (majorTabs.length > 0 && !majorTabs.some((m) => m._id === selectedMajorId)) {
      setSelectedMajorId(majorTabs[0]._id);
    }
  }, [majorTabs, selectedMajorId]);

  const examsForMajor = useMemo(
    () =>
      scheduleExams.filter(
        (exam) => (exam.course?.major?._id || exam.course?.major) === selectedMajorId
      ),
    [scheduleExams, selectedMajorId]
  );

  const yearColumns = useMemo(() => {
    const years = new Set(examsForMajor.map((exam) => exam.course?.year));
    return [...years]
      .sort((a, b) => a - b)
      .map((year) => ({ id: year, label: `Year ${year}` }));
  }, [examsForMajor]);

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Exam Schedule Approvals</h2>
        <p>
          Review exam schedules submitted by heads of department, then
          approve, reject, or publish them.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>Filter</h3>
          <p>Filter schedules by status.</p>
        </div>

        <form>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Exam Schedules</h3>
            <p>{filteredSchedules.length} schedule(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading exam schedules...</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Exam Session</th>
                <th>Status</th>
                <th>Submitted By</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSchedules.map((s) => (
                <tr key={s._id}>
                  <td className="strong-cell">{s.department?.name}</td>
                  <td>{s.examSession?.name}</td>
                  <td>
                    <span style={{ color: STATUS_COLORS[s.status], fontWeight: 700 }}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td>{s.submittedBy ? s.submittedBy.name : "—"}</td>
                  <td>
                    <button className="table-btn" onClick={() => viewSchedule(s._id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-table">
                    No exam schedules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedSchedule && (
        <div className="table-card">
          <div className="table-header">
            <div>
              <h3>
                {selectedSchedule.department?.name} —{" "}
                {selectedSchedule.examSession?.name}
              </h3>
              <p>
                Status:{" "}
                <span
                  style={{
                    color: STATUS_COLORS[selectedSchedule.status],
                    fontWeight: 700,
                  }}
                >
                  {STATUS_LABELS[selectedSchedule.status]}
                </span>
              </p>
              {selectedSchedule.status === "Draft" &&
                selectedSchedule.rejectionReason && (
                  <p style={{ color: "#b3261e" }}>
                    Last rejection reason: {selectedSchedule.rejectionReason}
                  </p>
                )}
            </div>

            <div>
              {selectedSchedule.status === "PendingApproval" && (
                <>
                  <button
                    className="table-btn"
                    onClick={() => setShowApproveModal(true)}
                  >
                    Approve
                  </button>
                  <button
                    className="table-btn danger-btn"
                    onClick={() => setShowRejectModal(true)}
                  >
                    Reject
                  </button>
                </>
              )}

              {selectedSchedule.status === "Approved" && (
                <button
                  className="table-btn"
                  onClick={() => setShowPublishModal(true)}
                >
                  Publish
                </button>
              )}
            </div>
          </div>

          {loadingDetail ? (
            <div className="loading-state">
              <Spinner />
              <span>Loading exams...</span>
            </div>
          ) : majorTabs.length === 0 ? (
            <div className="empty-table">No exams in this schedule.</div>
          ) : (
            <>
              <div className="grid-tab-bar">
                {majorTabs.map((major) => (
                  <button
                    key={major._id}
                    type="button"
                    className={`grid-tab${
                      selectedMajorId === major._id ? " active" : ""
                    }`}
                    onClick={() => setSelectedMajorId(major._id)}
                    title={major.name}
                  >
                    {major.code}
                  </button>
                ))}
              </div>

              <DndContext>
                <ExamGrid
                  timeSlots={timeSlots}
                  columns={yearColumns}
                  exams={examsForMajor}
                  editable={false}
                  getExamColumnId={getExamYear}
                />
              </DndContext>
            </>
          )}
        </div>
      )}

      {showApproveModal && (
        <ConfirmModal
          title="Approve Exam Schedule"
          message="Are you sure you want to approve this exam schedule?"
          confirmLabel="Approve"
          onCancel={() => setShowApproveModal(false)}
          onConfirm={handleApprove}
        />
      )}

      {showRejectModal && (
        <ReasonModal
          title="Reject Exam Schedule"
          message="Provide a reason for rejecting this schedule. It will be returned to the department as a draft for edits."
          confirmLabel="Reject"
          onCancel={() => setShowRejectModal(false)}
          onConfirm={handleReject}
        />
      )}

      {showPublishModal && (
        <ConfirmModal
          title="Publish Exam Schedule"
          message="Are you sure you want to publish this exam schedule? This makes it final and visible to students."
          confirmLabel="Publish"
          onCancel={() => setShowPublishModal(false)}
          onConfirm={handlePublish}
        />
      )}
    </div>
  );
}

export default ExamScheduleApprovals;

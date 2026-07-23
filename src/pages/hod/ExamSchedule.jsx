import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import api from "../../api/axios";
import ConfirmModal from "../../components/ConfirmModal";
import Spinner from "../../components/Spinner";
import ExamGrid from "../../components/examGrid/ExamGrid";
import UnscheduledCourseSidebar from "../../components/examGrid/UnscheduledCourseSidebar";
import CourseChip from "../../components/examGrid/CourseChip";

const STATUS_LABELS = {
  Draft: "Draft",
  PendingApproval: "Pending Approval",
  Approved: "Approved",
  Published: "Published",
};

const getExamYear = (exam) => exam.course?.year;
const getCourseYear = (course) => course.year;

function HodExamSchedule() {
  const [examSessions, setExamSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [exams, setExams] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedMajorId, setSelectedMajorId] = useState(null);
  const [sidebarYearFilter, setSidebarYearFilter] = useState("all");
  const [activeDragCourse, setActiveDragCourse] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const ownDepartmentId = user?.department;

  useEffect(() => {
    Promise.all([fetchExamSessions(), fetchCourses(), fetchMajors()]).finally(
      () => setLoading(false)
    );
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadSessionData(selectedSession);
    } else {
      setTimeSlots([]);
      setExams([]);
      setSchedule(null);
    }
  }, [selectedSession]);

  useEffect(() => {
    if (majors.length > 0 && !majors.some((m) => m._id === selectedMajorId)) {
      setSelectedMajorId(majors[0]._id);
    }
  }, [majors, selectedMajorId]);

  const fetchExamSessions = async () => {
    try {
      const res = await api.get("/exam-sessions");
      setExamSessions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exam sessions");
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    }
  };

  const fetchMajors = async () => {
    try {
      const res = await api.get("/majors");
      const ownMajors = res.data.filter(
        (major) => (major.department?._id || major.department) === ownDepartmentId
      );
      setMajors(ownMajors);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load majors");
    }
  };

  const loadSessionData = async (sessionId) => {
    setLoadingSession(true);

    try {
      const [slotsRes, schedulesRes, examsRes] = await Promise.all([
        api.get(`/exam-sessions/${sessionId}/time-slots`),
        api.get("/exam-schedules", { params: { examSession: sessionId } }),
        api.get("/exams", { params: { examSession: sessionId } }),
      ]);

      setTimeSlots(slotsRes.data);
      setSchedule(schedulesRes.data[0] || null);
      setExams(examsRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exam schedule data");
    } finally {
      setLoadingSession(false);
    }
  };

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
  };

  const isEditable = !schedule || schedule.status === "Draft";

  const yearColumns = useMemo(() => {
    const years = new Set(
      courses
        .filter((course) => (course.major?._id || course.major) === selectedMajorId)
        .map((course) => course.year)
    );

    return [...years]
      .sort((a, b) => a - b)
      .map((year) => ({ id: year, label: `Year ${year}` }));
  }, [courses, selectedMajorId]);

  const examsForMajor = useMemo(
    () =>
      exams.filter(
        (exam) => (exam.course?.major?._id || exam.course?.major) === selectedMajorId
      ),
    [exams, selectedMajorId]
  );

  const unscheduledCourses = useMemo(() => {
    const scheduledCourseIds = new Set(
      exams.map((exam) => exam.course?._id).filter(Boolean)
    );

    return courses.filter(
      (course) =>
        (course.major?._id || course.major) === selectedMajorId &&
        !scheduledCourseIds.has(course._id)
    );
  }, [courses, exams, selectedMajorId]);

  const handleDragStart = (event) => {
    setActiveDragCourse(event.active.data.current?.course || null);
  };

  const handleDragCancel = () => {
    setActiveDragCourse(null);
  };

  const handleDragEnd = async (event) => {
    setActiveDragCourse(null);

    const { active, over } = event;
    if (!over) return;

    const course = active.data.current?.course;
    const exam = active.data.current?.exam;
    const { timeSlot, column } = over.data.current || {};

    if (!course || !timeSlot || !column) return;

    if (course.year !== column.id) {
      toast.error(`${course.code} belongs to a different year`);
      return;
    }

    if (exam && exam.timeSlot?._id === timeSlot._id) return;

    try {
      if (exam) {
        await api.patch(`/exams/${exam._id}`, { timeSlot: timeSlot._id });
        toast.success(`${course.code} moved`);
      } else {
        await api.post("/exams", {
          course: course._id,
          timeSlot: timeSlot._id,
          examSession: selectedSession,
        });
        toast.success(`${course.code} scheduled`);
      }

      loadSessionData(selectedSession);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          (exam ? "Failed to move exam" : "Failed to schedule exam")
      );
    }
  };

  const openDeleteModal = (id) => {
    setSelectedExamId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedExamId(null);
    setShowDeleteModal(false);
  };

  const handleDeleteExam = async () => {
    if (!selectedExamId) return;

    try {
      await api.delete(`/exams/${selectedExamId}`);
      toast.success("Exam removed from schedule");
      closeDeleteModal();
      loadSessionData(selectedSession);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to remove exam");
      closeDeleteModal();
    }
  };

  const handleSubmitSchedule = async () => {
    if (!schedule) return;

    try {
      await api.post(`/exam-schedules/${schedule._id}/submit`);
      toast.success("Exam schedule submitted for approval");
      loadSessionData(selectedSession);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to submit exam schedule"
      );
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Exam Schedule</h2>
        <p>
          Build your department's exam schedule for a session, then submit it
          to the admin for approval.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>Select Exam Session</h3>
          <p>Choose the exam session to build a schedule for.</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading exam sessions...</span>
          </div>
        ) : (
          <form>
            <select value={selectedSession} onChange={handleSessionChange}>
              <option value="">Select Exam Session</option>
              {examSessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.name}
                </option>
              ))}
            </select>
          </form>
        )}
      </div>

      {selectedSession && loadingSession && (
        <div className="table-card">
          <div className="loading-state">
            <Spinner />
            <span>Loading schedule...</span>
          </div>
        </div>
      )}

      {selectedSession && !loadingSession && (
        <>
          <div className="form-card">
            <div className="section-title">
              <h3>Schedule Status: {STATUS_LABELS[schedule?.status || "Draft"]}</h3>
              {schedule?.status === "Draft" && schedule?.rejectionReason && (
                <p style={{ color: "#b3261e" }}>
                  Returned by admin: {schedule.rejectionReason}
                </p>
              )}
              {!schedule && (
                <p>
                  No exams added yet — pick a major below, then drag courses
                  onto the grid to start the draft.
                </p>
              )}
              {schedule?.status === "PendingApproval" && (
                <p>Awaiting admin approval. You can't make changes right now.</p>
              )}
              {schedule?.status === "Approved" && (
                <p>Approved by admin — awaiting publication.</p>
              )}
              {schedule?.status === "Published" && (
                <p>Published — this schedule is final.</p>
              )}
            </div>
          </div>

          {majors.length === 0 ? (
            <div className="table-card">
              <div className="empty-table">
                No majors in your department yet — add some in Departments first.
              </div>
            </div>
          ) : (
            <>
              <div className="grid-tab-bar">
                {majors.map((major) => (
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

              <DndContext
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                {isEditable ? (
                  <div className="split-layout">
                    <div className="split-panel-left">
                      <UnscheduledCourseSidebar
                        courses={unscheduledCourses}
                        helpText="Drag a course onto its year's column to schedule it."
                        emptyText="All courses in this major are scheduled."
                        yearFilter={sidebarYearFilter}
                        onYearFilterChange={setSidebarYearFilter}
                      />
                    </div>

                    <div className="split-panel-right">
                      <ExamGrid
                        timeSlots={timeSlots}
                        columns={yearColumns}
                        exams={examsForMajor}
                        editable
                        onRemoveExam={(exam) => openDeleteModal(exam._id)}
                        getExamColumnId={getExamYear}
                        getCourseColumnId={getCourseYear}
                        emptyColumnsMessage="No courses in this major yet."
                      />
                    </div>
                  </div>
                ) : (
                  <ExamGrid
                    timeSlots={timeSlots}
                    columns={yearColumns}
                    exams={examsForMajor}
                    editable={false}
                    getExamColumnId={getExamYear}
                    getCourseColumnId={getCourseYear}
                    emptyColumnsMessage="No courses in this major yet."
                  />
                )}

                <DragOverlay>
                  {activeDragCourse ? (
                    <CourseChip
                      course={activeDragCourse}
                      draggable={false}
                      className="drag-overlay-chip"
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </>
          )}

          {schedule?.status === "Draft" && exams.length > 0 && (
            <div className="form-card">
              <button className="primary-btn" onClick={handleSubmitSchedule}>
                Submit for Approval
              </button>
            </div>
          )}
        </>
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Remove Exam"
          message="Are you sure you want to remove this exam from the schedule?"
          onCancel={closeDeleteModal}
          onConfirm={handleDeleteExam}
        />
      )}
    </div>
  );
}

export default HodExamSchedule;

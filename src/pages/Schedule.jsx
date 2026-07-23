import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";
import ExamGrid from "../components/examGrid/ExamGrid";
import UnscheduledCourseSidebar from "../components/examGrid/UnscheduledCourseSidebar";
import CourseChip from "../components/examGrid/CourseChip";

const getExamMajorId = (exam) => exam.course?.major?._id || exam.course?.major;
const getCourseMajorId = (course) => course.major?._id || course.major;

function Schedule() {
  const [examSessions, setExamSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);
  const [sidebarYearFilter, setSidebarYearFilter] = useState("all");
  const [activeDragCourse, setActiveDragCourse] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);

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
    }
  }, [selectedSession]);

  const availableYears = useMemo(
    () => [...new Set(courses.map((c) => c.year))].sort((a, b) => a - b),
    [courses]
  );

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

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
      setMajors(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load majors");
    }
  };

  const loadSessionData = async (sessionId) => {
    setLoadingSession(true);

    try {
      const [slotsRes, examsRes] = await Promise.all([
        api.get(`/exam-sessions/${sessionId}/time-slots`),
        api.get("/exams", { params: { examSession: sessionId } }),
      ]);

      setTimeSlots(slotsRes.data);
      setExams(examsRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exam scheduling data");
    } finally {
      setLoadingSession(false);
    }
  };

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
  };

  const majorColumns = useMemo(
    () => majors.map((major) => ({ id: major._id, label: major.code, sublabel: major.name })),
    [majors]
  );

  const examsForYear = useMemo(
    () => exams.filter((exam) => exam.course?.year === selectedYear),
    [exams, selectedYear]
  );

  const unscheduledCourses = useMemo(() => {
    const scheduledCourseIds = new Set(
      exams.map((exam) => exam.course?._id).filter(Boolean)
    );

    return courses.filter(
      (course) => course.year === selectedYear && !scheduledCourseIds.has(course._id)
    );
  }, [courses, exams, selectedYear]);

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

    if (getCourseMajorId(course) !== column.id) {
      toast.error(`${course.code} belongs to a different major`);
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
      toast.success("Exam deleted successfully");
      closeDeleteModal();
      loadSessionData(selectedSession);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete exam");
      closeDeleteModal();
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Exam Schedule</h2>
        <p>
          Drag courses onto the calendar to schedule exams and review the
          schedule across every department.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>Select Exam Session</h3>
          <p>Choose the exam session to view or schedule.</p>
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
            <span>Loading exams...</span>
          </div>
        </div>
      )}

      {selectedSession && !loadingSession && (
        <>
          {availableYears.length === 0 ? (
            <div className="table-card">
              <div className="empty-table">No courses exist yet.</div>
            </div>
          ) : (
            <>
              <div className="grid-tab-bar">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`grid-tab${selectedYear === year ? " active" : ""}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    Year {year}
                  </button>
                ))}
              </div>

              <DndContext
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <div className="split-layout">
                  <div className="split-panel-left">
                    <UnscheduledCourseSidebar
                      courses={unscheduledCourses}
                      helpText="Drag a course onto its major's column to schedule it."
                      emptyText="All courses for this year are scheduled."
                      yearFilter={sidebarYearFilter}
                      onYearFilterChange={setSidebarYearFilter}
                    />
                  </div>

                  <div className="split-panel-right">
                    <ExamGrid
                      timeSlots={timeSlots}
                      columns={majorColumns}
                      exams={examsForYear}
                      editable
                      onRemoveExam={(exam) => openDeleteModal(exam._id)}
                      getExamColumnId={getExamMajorId}
                      getCourseColumnId={getCourseMajorId}
                      emptyColumnsMessage="No majors exist yet."
                    />
                  </div>
                </div>

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
        </>
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Exam"
          message="Are you sure you want to delete this scheduled exam? This action cannot be undone."
          onCancel={closeDeleteModal}
          onConfirm={handleDeleteExam}
        />
      )}
    </div>
  );
}

export default Schedule;

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import Spinner from "../../components/Spinner";
import ExamGrid from "../../components/examGrid/ExamGrid";

const getExamMajorId = (exam) => exam.course?.major?._id || exam.course?.major;

function FacultySchedule() {
  const [examSessions, setExamSessions] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSession, setSelectedSession] = useState("");
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [exams, setExams] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [hasPublishedSchedule, setHasPublishedSchedule] = useState(false);

  useEffect(() => {
    Promise.all([fetchExamSessions(), fetchMajors()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadPublishedSchedule(selectedSession);
    } else {
      setTimeSlots([]);
      setExams([]);
    }
  }, [selectedSession]);

  const fetchExamSessions = async () => {
    try {
      const res = await api.get("/exam-sessions");
      setExamSessions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exam sessions");
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

  // The backend already scopes this to the faculty member's own department
  // and only ever returns a Published schedule - nothing more to filter here.
  const loadPublishedSchedule = async (sessionId) => {
    setLoadingSchedule(true);

    try {
      const [slotsRes, schedulesRes] = await Promise.all([
        api.get(`/exam-sessions/${sessionId}/time-slots`),
        api.get("/exam-schedules", { params: { examSession: sessionId } }),
      ]);

      setTimeSlots(slotsRes.data);

      const schedule = schedulesRes.data[0] || null;
      setHasPublishedSchedule(!!schedule);
      setDepartmentName(schedule?.department?.name || "");

      if (schedule) {
        const detailRes = await api.get(`/exam-schedules/${schedule._id}`);
        setExams(detailRes.data.exams || []);
      } else {
        setExams([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load the schedule");
    } finally {
      setLoadingSchedule(false);
    }
  };

  const selectedSessionDetails =
    examSessions.find((s) => s._id === selectedSession) || null;

  const years = useMemo(
    () => [...new Set(exams.map((exam) => exam.course?.year).filter(Boolean))].sort((a, b) => a - b),
    [exams]
  );

  const examsByYear = useMemo(() => {
    const map = new Map();
    for (const year of years) {
      map.set(year, exams.filter((exam) => exam.course?.year === year));
    }
    return map;
  }, [years, exams]);

  const majorColumnsByYear = useMemo(() => {
    const map = new Map();
    for (const year of years) {
      const majorIdsInYear = new Set(
        examsByYear.get(year).map(getExamMajorId).filter(Boolean)
      );
      map.set(
        year,
        majors
          .filter((major) => majorIdsInYear.has(major._id))
          .map((major) => ({ id: major._id, label: major.code, sublabel: major.name }))
      );
    }
    return map;
  }, [years, examsByYear, majors]);

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Exam Schedule</h2>
        <p>
          {departmentName ? `${departmentName} — ` : ""}
          Your department's published exam schedule.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>Select Exam Session</h3>
          <p>Only your department's published schedule is shown.</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading exam sessions...</span>
          </div>
        ) : (
          <form>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
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

      {selectedSession && loadingSchedule && (
        <div className="table-card">
          <div className="loading-state">
            <Spinner />
            <span>Loading the schedule...</span>
          </div>
        </div>
      )}

      {selectedSession && !loadingSchedule && !hasPublishedSchedule && (
        <div className="table-card">
          <div className="empty-table">
            Your department hasn't published a schedule for this session yet.
          </div>
        </div>
      )}

      {selectedSession && !loadingSchedule && hasPublishedSchedule && (
        <>
          {years.map((year) => (
            <div className="final-schedule-year-block" key={year}>
              <div className="final-schedule-year-header">
                <h2>{selectedSessionDetails?.name}</h2>
                <h3>Year {year}</h3>
              </div>

              <ExamGrid
                timeSlots={timeSlots}
                columns={majorColumnsByYear.get(year)}
                exams={examsByYear.get(year)}
                editable={false}
                getExamColumnId={getExamMajorId}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default FacultySchedule;

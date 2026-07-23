import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import ExamGrid from "../components/examGrid/ExamGrid";
import { groupTimeSlotsByDate } from "../components/examGrid/buildExamGrid";

const getExamMajorId = (exam) => exam.course?.major?._id || exam.course?.major;

function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, "-");
}

function FinalSchedule() {
  const [examSessions, setExamSessions] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSession, setSelectedSession] = useState("");
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [publishedExams, setPublishedExams] = useState([]);
  const [publishedDepartmentCount, setPublishedDepartmentCount] = useState(0);

  useEffect(() => {
    Promise.all([fetchExamSessions(), fetchMajors()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadPublishedSchedule(selectedSession);
    } else {
      setTimeSlots([]);
      setPublishedExams([]);
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

  // The "final" schedule only includes departments that have actually
  // published for this session - draft/pending/approved-but-unpublished
  // work stays out, since it isn't final yet.
  const loadPublishedSchedule = async (sessionId) => {
    setLoadingSchedule(true);

    try {
      const [slotsRes, schedulesRes] = await Promise.all([
        api.get(`/exam-sessions/${sessionId}/time-slots`),
        api.get("/exam-schedules", {
          params: { examSession: sessionId, status: "Published" },
        }),
      ]);

      setTimeSlots(slotsRes.data);
      setPublishedDepartmentCount(schedulesRes.data.length);

      const detailResponses = await Promise.all(
        schedulesRes.data.map((schedule) => api.get(`/exam-schedules/${schedule._id}`))
      );

      setPublishedExams(detailResponses.flatMap((res) => res.data.exams || []));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load the published schedule");
    } finally {
      setLoadingSchedule(false);
    }
  };

  const selectedSessionDetails =
    examSessions.find((s) => s._id === selectedSession) || null;

  const years = useMemo(
    () =>
      [...new Set(publishedExams.map((exam) => exam.course?.year).filter(Boolean))].sort(
        (a, b) => a - b
      ),
    [publishedExams]
  );

  const examsByYear = useMemo(() => {
    const map = new Map();
    for (const year of years) {
      map.set(
        year,
        publishedExams.filter((exam) => exam.course?.year === year)
      );
    }
    return map;
  }, [years, publishedExams]);

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

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const dateGroups = groupTimeSlotsByDate(timeSlots);

    for (const year of years) {
      const columns = majorColumnsByYear.get(year);

      const lookup = new Map();
      for (const exam of examsByYear.get(year)) {
        const majorId = getExamMajorId(exam);
        if (!majorId || !exam.timeSlot?._id) continue;
        lookup.set(`${exam.timeSlot._id}::${majorId}`, exam);
      }

      const rows = [["Date", "Time", ...columns.map((c) => c.label)]];

      for (const { date, slots } of dateGroups) {
        for (const slot of slots) {
          const row = [date, `${slot.startTime} - ${slot.endTime}`];

          for (const column of columns) {
            const exam = lookup.get(`${slot._id}::${column.id}`);
            row.push(exam?.course?.code || "");
          }

          rows.push(row);
        }
      }

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, `Year ${year}`);
    }

    const sessionLabel = sanitizeFilename(selectedSessionDetails?.name || "Schedule");
    XLSX.writeFile(workbook, `${sessionLabel} - Final Schedule.xlsx`);
  };

  return (
    <div className="portal-page">
      <div className="page-header no-print">
        <h2>Final Schedule</h2>
        <p>
          View the published exam schedule for a session, one section per
          year, and export it as PDF or Excel.
        </p>
      </div>

      <div className="form-card no-print">
        <div className="section-title">
          <h3>Select Exam Session</h3>
          <p>Only departments that have published their schedule are included.</p>
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

            {selectedSession && !loadingSchedule && years.length > 0 && (
              <>
                <button type="button" className="secondary-btn" onClick={handlePrint}>
                  Export PDF
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleExportExcel}
                >
                  Export Excel
                </button>
              </>
            )}
          </form>
        )}
      </div>

      {selectedSession && loadingSchedule && (
        <div className="table-card no-print">
          <div className="loading-state">
            <Spinner />
            <span>Loading the published schedule...</span>
          </div>
        </div>
      )}

      {selectedSession && !loadingSchedule && publishedDepartmentCount === 0 && (
        <div className="table-card no-print">
          <div className="empty-table">
            No department has published its schedule for this session yet.
          </div>
        </div>
      )}

      {selectedSession && !loadingSchedule && years.length > 0 && (
        <div className="final-schedule-printable">
          {years.map((year) => (
            <div className="final-schedule-year-block" key={year}>
              <div className="final-schedule-year-header">
                <h2>{selectedSessionDetails?.name}</h2>
                <h3>Year {year}</h3>
                <p>
                  {majorColumnsByYear
                    .get(year)
                    .map((c) => c.sublabel || c.label)
                    .join(", ")}
                </p>
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
        </div>
      )}
    </div>
  );
}

export default FinalSchedule;

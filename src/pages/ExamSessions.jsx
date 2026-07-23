import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";

const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

// The five common session types. "Other" is a separate escape hatch for the
// rare additional sessions that don't fit this shape (see the two extra
// dropdowns that appear in the form when it's selected).
const SESSION_TYPE_PRESETS = [
  {
    value: "First:S1:Partial",
    label: "First Session — S1 — Partial",
    sessionOrder: "First",
    semesterScope: "S1",
    examType: "Partial",
  },
  {
    value: "First:S1:Final",
    label: "First Session — S1 — Final",
    sessionOrder: "First",
    semesterScope: "S1",
    examType: "Final",
  },
  {
    value: "First:S2:Partial",
    label: "First Session — S2 — Partial",
    sessionOrder: "First",
    semesterScope: "S2",
    examType: "Partial",
  },
  {
    value: "First:S2:Final",
    label: "First Session — S2 — Final",
    sessionOrder: "First",
    semesterScope: "S2",
    examType: "Final",
  },
  {
    value: "Second:Both:Final",
    label: "Second Session — S1 & S2 — Final",
    sessionOrder: "Second",
    semesterScope: "Both",
    examType: "Final",
  },
];

function findSessionTypePreset(sessionOrder, semesterScope, examType) {
  return SESSION_TYPE_PRESETS.find(
    (preset) =>
      preset.sessionOrder === sessionOrder &&
      preset.semesterScope === semesterScope &&
      preset.examType === examType
  );
}

function getSessionTypeLabel(session) {
  const preset = findSessionTypePreset(
    session.sessionOrder,
    session.semesterScope,
    session.examType
  );

  if (preset) return preset.label;

  const scopeLabel =
    session.semesterScope === "Both" ? "S1 & S2" : session.semesterScope;

  return `${session.sessionOrder} Session — ${scopeLabel} — ${session.examType}`;
}

// Exam slots are virtually always on round times, so offer a 30-minute-step
// dropdown instead of the fiddly native time picker. Bounded to 08:00-19:00
// to match the exam day window.
const TIME_OPTIONS = Array.from({ length: 23 }, (_, i) => {
  const totalMinutes = i * 30 + 8 * 60;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
});

// Default exam slot: 1.5 hours, with a 30-minute break before the next one.
const DEFAULT_SLOT_START = "08:00";
const DEFAULT_SLOT_DURATION_MINUTES = 90;
const DEFAULT_SLOT_BREAK_MINUTES = 30;

function addMinutesToTime(time, minutesToAdd) {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + minutesToAdd;
  const newHours = String(Math.floor(total / 60)).padStart(2, "0");
  const newMinutes = String(total % 60).padStart(2, "0");
  return `${newHours}:${newMinutes}`;
}

function defaultTimeBlock() {
  return {
    startTime: DEFAULT_SLOT_START,
    endTime: addMinutesToTime(DEFAULT_SLOT_START, DEFAULT_SLOT_DURATION_MINUTES),
  };
}

function nextDefaultTimeBlock(previousBlock) {
  const startTime = addMinutesToTime(
    previousBlock.endTime,
    DEFAULT_SLOT_BREAK_MINUTES
  );

  return {
    startTime,
    endTime: addMinutesToTime(startTime, DEFAULT_SLOT_DURATION_MINUTES),
  };
}

function formatSlotDateHeading(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ExamSessions() {
  const [examSessions, setExamSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 11 },
    (_, index) => currentYear + index
  );

  const [form, setForm] = useState({
    sessionType: "",
    otherSemesterScope: "",
    otherExamType: "",
    academicYear: String(currentYear),
    startDate: "",
    endDate: "",
  });

  // Time slots for whichever session is being managed below
  const [selectedSession, setSelectedSession] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [showDeleteSlotModal, setShowDeleteSlotModal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const [slotForm, setSlotForm] = useState({
    date: "",
    ...defaultTimeBlock(),
  });

  const [genDaysOfWeek, setGenDaysOfWeek] = useState([]);
  const [genTimeBlocks, setGenTimeBlocks] = useState([defaultTimeBlock()]);
  const [generating, setGenerating] = useState(false);

  const selectedSessionDetails = examSessions.find(
    (session) => session._id === selectedSession
  );

  const sessionStartDate =
    selectedSessionDetails?.startDate?.slice(0, 10) || "";
  const sessionEndDate = selectedSessionDetails?.endDate?.slice(0, 10) || "";

  useEffect(() => {
    fetchExamSessions().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedSession) {
      setLoadingSlots(true);
      fetchTimeSlots().finally(() => setLoadingSlots(false));
      resetSlotFormOnly();
      setGenDaysOfWeek([]);
      setGenTimeBlocks([defaultTimeBlock()]);
    } else {
      setTimeSlots([]);
    }
  }, [selectedSession]);

  const fetchExamSessions = async () => {
    try {
      const res = await api.get("/exam-sessions");
      setExamSessions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch exam sessions");
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await api.get(
        `/exam-sessions/${selectedSession}/time-slots`
      );
      setTimeSlots(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch time slots");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      sessionType: "",
      otherSemesterScope: "",
      otherExamType: "",
      academicYear: String(currentYear),
      startDate: "",
      endDate: "",
    });
    setEditingId(null);
  };

  const openDeleteModal = (id) => {
    setSelectedSessionId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedSessionId(null);
    setShowDeleteModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let sessionOrder;
    let semesterScope;
    let examType;

    if (form.sessionType === "Other") {
      if (!form.otherSemesterScope || !form.otherExamType) {
        toast.error(
          "Select a semester scope and exam type for the Other session"
        );
        return;
      }

      sessionOrder = "Other";
      semesterScope = form.otherSemesterScope;
      examType = form.otherExamType;
    } else {
      const preset = SESSION_TYPE_PRESETS.find(
        (p) => p.value === form.sessionType
      );

      if (!preset) {
        toast.error("Please select a session type");
        return;
      }

      ({ sessionOrder, semesterScope, examType } = preset);
    }

    try {
      const sessionData = {
        sessionOrder,
        semesterScope,
        examType,
        academicYear: Number(form.academicYear),
        startDate: form.startDate,
        endDate: form.endDate,
      };

      if (editingId) {
        await api.put(`/exam-sessions/${editingId}`, sessionData);
        toast.success("Exam session updated successfully");
      } else {
        await api.post("/exam-sessions", sessionData);
        toast.success("Exam session added successfully");
      }

      resetForm();
      fetchExamSessions();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save exam session");
    }
  };

  const handleEdit = (session) => {
    setEditingId(session._id);

    const preset = findSessionTypePreset(
      session.sessionOrder,
      session.semesterScope,
      session.examType
    );

    setForm({
      sessionType: preset ? preset.value : "Other",
      otherSemesterScope: preset ? "" : session.semesterScope || "",
      otherExamType: preset ? "" : session.examType || "",
      academicYear: session.academicYear
        ? String(session.academicYear)
        : String(currentYear),
      startDate: session.startDate?.slice(0, 10) || "",
      endDate: session.endDate?.slice(0, 10) || "",
    });
  };

  const handleDelete = async () => {
    if (!selectedSessionId) return;

    try {
      await api.delete(`/exam-sessions/${selectedSessionId}`);
      toast.success("Exam session deleted successfully");
      closeDeleteModal();

      if (selectedSession === selectedSessionId) {
        setSelectedSession("");
      }

      fetchExamSessions();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to delete exam session"
      );
      closeDeleteModal();
    }
  };

  // ---- Time slot form (manual add/edit) ----

  const resetSlotFormOnly = () => {
    setSlotForm({
      date: "",
      ...defaultTimeBlock(),
    });
    setEditingSlotId(null);
  };

  const closeDeleteSlotModal = () => {
    setShowDeleteSlotModal(false);
    setSelectedSlotId(null);
  };

  const openDeleteSlotModal = (id) => {
    setSelectedSlotId(id);
    setShowDeleteSlotModal(true);
  };

  const handleSlotFormChange = (e) => {
    setSlotForm({ ...slotForm, [e.target.name]: e.target.value });
  };

  const handleSubmitTimeSlot = async (e) => {
    e.preventDefault();

    if (slotForm.startTime >= slotForm.endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    try {
      const timeSlotData = {
        date: slotForm.date,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
      };

      if (editingSlotId) {
        await api.put(`/time-slots/${editingSlotId}`, timeSlotData);
        toast.success("Time slot updated successfully");
      } else {
        await api.post(
          `/exam-sessions/${selectedSession}/time-slots`,
          timeSlotData
        );
        toast.success("Time slot added successfully");
      }

      resetSlotFormOnly();
      fetchTimeSlots();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save time slot");
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlotId(slot._id);
    setSlotForm({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlotId) return;

    try {
      await api.delete(`/time-slots/${selectedSlotId}`);
      toast.success("Time slot deleted successfully");
      closeDeleteSlotModal();
      fetchTimeSlots();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to delete time slot"
      );
      closeDeleteSlotModal();
    }
  };

  // ---- Generate time slots ----

  const toggleGenDay = (day) => {
    setGenDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleGenBlockChange = (index, field, value) => {
    setGenTimeBlocks((prev) =>
      prev.map((block, i) =>
        i === index ? { ...block, [field]: value } : block
      )
    );
  };

  const addGenBlock = () => {
    setGenTimeBlocks((prev) => [
      ...prev,
      nextDefaultTimeBlock(prev[prev.length - 1]),
    ]);
  };

  const removeGenBlock = (index) => {
    setGenTimeBlocks((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();

    if (genDaysOfWeek.length === 0) {
      toast.error("Select at least one weekday");
      return;
    }

    const hasIncompleteBlock = genTimeBlocks.some(
      (block) => !block.startTime || !block.endTime
    );

    if (hasIncompleteBlock) {
      toast.error("Fill in both start and end time for every time block");
      return;
    }

    setGenerating(true);

    try {
      const res = await api.post(
        `/exam-sessions/${selectedSession}/time-slots/generate`,
        {
          daysOfWeek: genDaysOfWeek,
          timeBlocks: genTimeBlocks,
        }
      );

      toast.success(
        `Generated ${res.data.createdCount} time slot(s)` +
          (res.data.skippedCount
            ? ` (${res.data.skippedCount} already existed)`
            : "")
      );

      setGenDaysOfWeek([]);
      setGenTimeBlocks([{ startTime: "", endTime: "" }]);
      fetchTimeSlots();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to generate time slots"
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="portal-page">
      <div className="page-header">
        <h2>Exam Sessions Management</h2>
        <p>
          Create and manage exam periods by season, academic year, and exam
          type.
        </p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <h3>{editingId ? "Edit Exam Session" : "Add New Exam Session"}</h3>
          <p>Fill in the exam session information below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <select
            name="sessionType"
            value={form.sessionType}
            onChange={handleChange}
            required
          >
            <option value="">Select Session Type</option>
            {SESSION_TYPE_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
            <option value="Other">Other / Special Session</option>
          </select>

          {form.sessionType === "Other" && (
            <>
              <select
                name="otherSemesterScope"
                value={form.otherSemesterScope}
                onChange={handleChange}
                required
              >
                <option value="">Select Semester Scope</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="Both">Both (S1 & S2)</option>
              </select>

              <select
                name="otherExamType"
                value={form.otherExamType}
                onChange={handleChange}
                required
              >
                <option value="">Select Exam Type</option>
                <option value="Partial">Partial</option>
                <option value="Final">Final</option>
              </select>
            </>
          )}

          <select
            name="academicYear"
            value={form.academicYear}
            onChange={handleChange}
            required
          >
            <option value="">Select Year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
          />

          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            required
          />

          <button type="submit" className="primary-btn">
            {editingId ? "Update Session" : "Add Session"}
          </button>

          {editingId && (
            <button type="button" className="secondary-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3>Exam Sessions List</h3>
            <p>{examSessions.length} session(s) available</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Spinner />
            <span>Loading exam sessions...</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Session Name</th>
                <th>Session Type</th>
                <th>Year</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {examSessions.map((session) => (
                <tr
                  key={session._id}
                  className={
                    selectedSession === session._id ? "active-row" : ""
                  }
                >
                  <td className="strong-cell">{session.name}</td>
                  <td>{getSessionTypeLabel(session)}</td>
                  <td>{session.academicYear}</td>
                  <td>{session.startDate?.slice(0, 10)}</td>
                  <td>{session.endDate?.slice(0, 10)}</td>
                  <td>
                    <button
                      className="table-btn"
                      onClick={() => setSelectedSession(session._id)}
                    >
                      Manage Time Slots
                    </button>
                    <button
                      className="table-btn"
                      onClick={() => handleEdit(session)}
                    >
                      Edit
                    </button>
                    <button
                      className="table-btn danger-btn"
                      onClick={() => openDeleteModal(session._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {examSessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No exam sessions added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedSession && (
        <>
          <div className="page-header">
            <h2>Time Slots for {selectedSessionDetails?.name}</h2>
            <p>
              Session period: {sessionStartDate} to {sessionEndDate}
            </p>
          </div>

          <div className="form-card">
            <div className="section-title">
              <h3>{editingSlotId ? "Edit Time Slot" : "Add New Time Slot"}</h3>
              <p>Define a single exam date within the session period.</p>
            </div>

            <form onSubmit={handleSubmitTimeSlot}>
              <input
                name="date"
                type="date"
                value={slotForm.date}
                onChange={handleSlotFormChange}
                min={sessionStartDate}
                max={sessionEndDate}
                required
              />

              <select
                name="startTime"
                value={slotForm.startTime}
                onChange={handleSlotFormChange}
                required
              >
                <option value="">Start Time</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <select
                name="endTime"
                value={slotForm.endTime}
                onChange={handleSlotFormChange}
                required
              >
                <option value="">End Time</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <button type="submit" className="primary-btn">
                {editingSlotId ? "Update Time Slot" : "Add Time Slot"}
              </button>

              {editingSlotId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetSlotFormOnly}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

          <div className="form-card">
            <div className="section-title">
              <h3>Generate Time Slots</h3>
              <p>
                Automatically create slots on the selected weekdays across the
                session's date range, repeating the given time blocks each
                day.
              </p>
            </div>

            <form onSubmit={handleGenerateSubmit}>
              <div className="weekday-picker">
                {WEEKDAYS.map((day) => (
                  <label key={day.value} className="weekday-checkbox">
                    <input
                      type="checkbox"
                      checked={genDaysOfWeek.includes(day.value)}
                      onChange={() => toggleGenDay(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </div>

              {genTimeBlocks.map((block, index) => (
                <div className="time-block-row" key={index}>
                  <select
                    value={block.startTime}
                    onChange={(e) =>
                      handleGenBlockChange(index, "startTime", e.target.value)
                    }
                    required
                  >
                    <option value="">Start Time</option>
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>

                  <select
                    value={block.endTime}
                    onChange={(e) =>
                      handleGenBlockChange(index, "endTime", e.target.value)
                    }
                    required
                  >
                    <option value="">End Time</option>
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>

                  {genTimeBlocks.length > 1 && (
                    <button
                      type="button"
                      className="table-btn danger-btn"
                      onClick={() => removeGenBlock(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="secondary-btn"
                onClick={addGenBlock}
              >
                Add another time block
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate Time Slots"}
              </button>
            </form>
          </div>

          <div className="page-header">
            <h2>Time Slots Program</h2>
            <p>{timeSlots.length} time slot(s) across the session, grouped by day.</p>
          </div>

          {loadingSlots ? (
            <div className="table-card">
              <div className="loading-state">
                <Spinner />
                <span>Loading time slots...</span>
              </div>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="table-card">
              <div className="empty-table">
                No time slots added for this session yet.
              </div>
            </div>
          ) : (
            Object.entries(
              timeSlots.reduce((acc, slot) => {
                if (!acc[slot.date]) acc[slot.date] = [];
                acc[slot.date].push(slot);
                return acc;
              }, {})
            )
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, slotsForDate]) => (
                <div className="table-card" key={date}>
                  <div className="table-header">
                    <div>
                      <h3>{formatSlotDateHeading(date)}</h3>
                      <p>{slotsForDate.length} time slot(s)</p>
                    </div>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...slotsForDate]
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((slot) => (
                          <tr key={slot._id}>
                            <td className="strong-cell">{slot.startTime}</td>
                            <td>{slot.endTime}</td>
                            <td>
                              <button
                                className="table-btn"
                                onClick={() => handleEditSlot(slot)}
                              >
                                Edit
                              </button>

                              <button
                                className="table-btn danger-btn"
                                onClick={() => openDeleteSlotModal(slot._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ))
          )}
        </>
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Exam Session"
          message="Are you sure you want to delete this exam session? This action cannot be undone."
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
        />
      )}

      {showDeleteSlotModal && (
        <ConfirmModal
          title="Delete Time Slot"
          message="Are you sure you want to delete this time slot? This action cannot be undone."
          onCancel={closeDeleteSlotModal}
          onConfirm={handleDeleteSlot}
        />
      )}
    </div>
  );
}

export default ExamSessions;

import { useMemo } from "react";
import { groupTimeSlotsByDate, buildExamLookup, cellKey } from "./buildExamGrid";
import ExamGridCell from "./ExamGridCell";
import "./ExamGrid.css";

function formatDateHeading(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Presentational grid: rows are date -> time slot, columns are generic
// (majors for the admin view, years for the per-major HoD view). Pure render
// from timeSlots/columns/exams - the caller owns fetching, filtering to the
// current tab, and reacting to drops/removals.
function ExamGrid({
  timeSlots,
  columns,
  exams,
  editable = true,
  onRemoveExam,
  getExamColumnId,
  getCourseColumnId,
  emptyColumnsMessage = "Nothing to show columns for yet.",
}) {
  const dateGroups = useMemo(() => groupTimeSlotsByDate(timeSlots), [timeSlots]);
  const examLookup = useMemo(
    () => buildExamLookup(exams, getExamColumnId),
    [exams, getExamColumnId]
  );

  if (columns.length === 0) {
    return <div className="empty-table">{emptyColumnsMessage}</div>;
  }

  if (dateGroups.length === 0) {
    return (
      <div className="empty-table">
        No time slots generated for this session yet.
      </div>
    );
  }

  return (
    <div className="exam-grid-wrapper">
      <table className="exam-grid">
        <thead>
          <tr>
            <th className="exam-grid-corner" colSpan={2} />
            {columns.map((column) => (
              <th key={column.id} className="exam-grid-major-header">
                <span className="exam-grid-major-code">{column.label}</span>
                {column.sublabel && (
                  <span className="exam-grid-major-name">{column.sublabel}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {dateGroups.map(({ date, slots }) =>
            slots.map((slot, slotIndex) => (
              <tr key={slot._id} className={slotIndex === 0 ? "date-group-start" : ""}>
                {slotIndex === 0 && (
                  <td rowSpan={slots.length} className="exam-grid-date-cell">
                    {formatDateHeading(date)}
                  </td>
                )}

                <td className="exam-grid-time-cell">
                  {slot.startTime} - {slot.endTime}
                </td>

                {columns.map((column) => (
                  <ExamGridCell
                    key={column.id}
                    timeSlot={slot}
                    column={column}
                    exam={examLookup.get(cellKey(slot._id, column.id))}
                    editable={editable}
                    onRemoveExam={onRemoveExam}
                    getCourseColumnId={getCourseColumnId}
                  />
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ExamGrid;

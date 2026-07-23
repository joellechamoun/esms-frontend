import { useDroppable } from "@dnd-kit/core";
import CourseChip from "./CourseChip";
import { cellKey } from "./buildExamGrid";

function ExamGridCell({
  timeSlot,
  column,
  exam,
  editable,
  onRemoveExam,
  getCourseColumnId,
}) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: cellKey(timeSlot._id, column.id),
    data: { timeSlot, column },
    disabled: !editable || !!exam,
  });

  // Only invite a drop if the chip being dragged actually belongs to this
  // column - otherwise leave the cell looking inert.
  const draggedCourse = active?.data.current?.course;
  const draggedColumnId = draggedCourse ? getCourseColumnId(draggedCourse) : undefined;
  const isValidTarget = isOver && draggedColumnId === column.id;
  const isInvalidTarget =
    isOver && draggedColumnId != null && draggedColumnId !== column.id;

  const classNames = [
    "exam-grid-cell",
    exam ? "cell-filled" : "cell-empty",
    isValidTarget ? "cell-drop-valid" : "",
    isInvalidTarget ? "cell-drop-invalid" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <td ref={setNodeRef} className={classNames}>
      {exam ? (
        <CourseChip
          course={exam.course}
          draggable={editable}
          dragId={`exam-${exam._id}`}
          dragData={{ exam }}
          onClick={editable ? () => onRemoveExam(exam) : undefined}
          title={editable ? "Drag to move, or click to remove" : undefined}
        />
      ) : null}
    </td>
  );
}

export default ExamGridCell;

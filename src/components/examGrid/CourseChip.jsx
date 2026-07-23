import { useDraggable } from "@dnd-kit/core";

function CourseChip({ course, draggable = true, onClick, title, className = "" }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `course-${course._id}`,
    data: { course },
    disabled: !draggable,
  });

  const classNames = [
    "exam-course-chip",
    draggable ? "is-draggable" : "",
    isDragging ? "is-dragging" : "",
    onClick ? "is-clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={draggable ? setNodeRef : undefined}
      className={classNames}
      onClick={onClick}
      title={title}
      {...(draggable ? { ...listeners, ...attributes } : {})}
    >
      <span className="chip-code">{course.code}</span>
      <span className="chip-name">{course.name}</span>
    </div>
  );
}

export default CourseChip;

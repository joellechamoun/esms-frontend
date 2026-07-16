import CourseChip from "./CourseChip";

// Drag source: the caller is responsible for filtering courses down to
// whatever scope the current tab represents (e.g. "this major, all years" or
// "this year, all majors") plus excluding ones already scheduled.
function UnscheduledCourseSidebar({
  courses,
  helpText = "Drag a course onto its column to schedule it.",
  emptyText = "All courses here are scheduled.",
}) {
  return (
    <div className="unscheduled-course-sidebar">
      <div className="table-header">
        <div>
          <h3>Unscheduled Courses</h3>
          <p>{helpText}</p>
        </div>
      </div>

      <div className="unscheduled-course-list">
        {courses.map((course) => (
          <CourseChip key={course._id} course={course} />
        ))}

        {courses.length === 0 && <div className="empty-table">{emptyText}</div>}
      </div>
    </div>
  );
}

export default UnscheduledCourseSidebar;

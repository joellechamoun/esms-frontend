import { useEffect, useMemo } from "react";
import CourseChip from "./CourseChip";

// Drag source: the caller is responsible for filtering courses down to
// whatever scope the current tab represents (e.g. "this major, all years" or
// "this year, all majors") plus excluding ones already scheduled. When the
// passed-in courses span more than one year, an extra year filter is shown
// so long lists (e.g. a whole major) can be narrowed down further.
//
// The year filter's value/setter are owned by the caller (not local state)
// because this component gets unmounted while the parent page is reloading
// data after every drag - local state would reset the filter on every drop.
function UnscheduledCourseSidebar({
  courses,
  helpText = "Drag a course onto its column to schedule it.",
  emptyText = "All courses here are scheduled.",
  yearFilter,
  onYearFilterChange,
}) {
  const years = useMemo(
    () => [...new Set(courses.map((course) => course.year))].sort((a, b) => a - b),
    [courses]
  );

  useEffect(() => {
    if (yearFilter !== "all" && !years.includes(Number(yearFilter))) {
      onYearFilterChange("all");
    }
  }, [years, yearFilter, onYearFilterChange]);

  const visibleCourses = useMemo(
    () =>
      yearFilter === "all"
        ? courses
        : courses.filter((course) => course.year === Number(yearFilter)),
    [courses, yearFilter]
  );

  return (
    <div className="unscheduled-course-sidebar">
      <div className="table-header">
        <div>
          <h3>Unscheduled Courses</h3>
          <p>{helpText}</p>
        </div>
      </div>

      {years.length > 1 && (
        <div className="sidebar-year-filter">
          <div className="sidebar-year-filter-options">
            <button
              type="button"
              className={`sidebar-year-pill${yearFilter === "all" ? " active" : ""}`}
              onClick={() => onYearFilterChange("all")}
            >
              All
            </button>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                className={`sidebar-year-pill${
                  yearFilter === String(year) ? " active" : ""
                }`}
                onClick={() => onYearFilterChange(String(year))}
              >
                Year {year}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="unscheduled-course-list">
        {visibleCourses.map((course) => (
          <CourseChip key={course._id} course={course} />
        ))}

        {visibleCourses.length === 0 && (
          <div className="empty-table">{emptyText}</div>
        )}
      </div>
    </div>
  );
}

export default UnscheduledCourseSidebar;

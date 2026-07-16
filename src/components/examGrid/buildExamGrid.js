// Groups a flat list of time slots into date-ordered rows, each carrying its
// own (possibly irregular) set of slots sorted by start time.
export function groupTimeSlotsByDate(timeSlots) {
  const byDate = new Map();

  for (const slot of timeSlots) {
    if (!byDate.has(slot.date)) byDate.set(slot.date, []);
    byDate.get(slot.date).push(slot);
  }

  return [...byDate.entries()]
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, slots]) => ({
      date,
      slots: [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));
}

// Keys exams by "timeSlot::column" so a grid cell can look up its content in
// O(1) without scanning the exam list per cell. `getColumnId` lets the same
// grid be columned by major (admin view) or by year (per-major HoD view).
export function buildExamLookup(exams, getColumnId) {
  const lookup = new Map();

  for (const exam of exams) {
    const columnId = getColumnId(exam);
    if (columnId == null || !exam.timeSlot?._id) continue;

    lookup.set(`${exam.timeSlot._id}::${columnId}`, exam);
  }

  return lookup;
}

export function cellKey(timeSlotId, columnId) {
  return `${timeSlotId}::${columnId}`;
}

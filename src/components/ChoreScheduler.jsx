import { useMemo, useState } from "react";
import { initialPeople, initialChores } from "../data/initialData";
import {
  formatDateKey,
  formatReadableDate,
  getCalendarDays,
  getMonthName,
  moveMonth
} from "../utils/calendarUtils";

const weekDayOptions = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 }
];

function ChoreScheduler() {
  const actualToday = new Date();
  const todayKey = formatDateKey(actualToday);

  const [people, setPeople] = useState(initialPeople);
  const [choresByDate, setChoresByDate] = useState(initialChores);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(actualToday.getFullYear(), actualToday.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const [newPersonName, setNewPersonName] = useState("");
  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChorePersonId, setNewChorePersonId] = useState(
    initialPeople[0]?.id || ""
  );

  const [filterPerson, setFilterPerson] = useState("all");

  const [bulkChoreTitle, setBulkChoreTitle] = useState("");
  const [bulkPersonId, setBulkPersonId] = useState(initialPeople[0]?.id || "");
  const [bulkStartDate, setBulkStartDate] = useState(todayKey);
  const [bulkCount, setBulkCount] = useState("4");
  const [bulkTimeUnit, setBulkTimeUnit] = useState("weeks");
  const [bulkFrequency, setBulkFrequency] = useState("weekly");
  const [bulkDaysOfWeek, setBulkDaysOfWeek] = useState([1]);
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editChore, setEditChore] = useState(null); // { id, title, assignedTo, date, originalDate }
  const [toast, setToast] = useState(null); // { message: string, type: "success" | "delete" | "edit" }

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  function handleAddPerson() {
    const trimmed = newPersonName.trim();
    if (!trimmed) return;

    const newPerson = {
      id: Date.now(),
      name: trimmed
    };

    setPeople((prev) => [...prev, newPerson]);
    setNewPersonName("");
    setNewChorePersonId(newPerson.id);
    setBulkPersonId(newPerson.id);
  }

  function handleAddChore() {
    const trimmed = newChoreTitle.trim();
    if (!trimmed || !newChorePersonId) return;

    const newChore = {
      id: Date.now(),
      title: trimmed,
      assignedTo: Number(newChorePersonId),
      done: false
    };

    setChoresByDate((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newChore]
    }));

    setNewChoreTitle("");
  }

  function addChoreToDate(dateKey, title, personId, uniqueSeed) {
    return {
      id: Date.now() + uniqueSeed,
      title,
      assignedTo: Number(personId),
      done: false
    };
  }

  function handleWeeklyDayToggle(dayValue) {
    setBulkDaysOfWeek((prev) =>
      prev.includes(dayValue)
        ? prev.filter((day) => day !== dayValue)
        : [...prev, dayValue].sort((a, b) => a - b)
    );
  }

  function getStartOfWeek(date) {
    const copy = new Date(date);
    const day = copy.getDay();
    copy.setDate(copy.getDate() - day);
    copy.setHours(12, 0, 0, 0);
    return copy;
  }

  function handleAddBulkChores() {
    const trimmed = bulkChoreTitle.trim();
    if (!trimmed || !bulkPersonId) return;

    const updated = { ...choresByDate };
    let uniqueSeed = 0;

    if (bulkFrequency === "daily") {
      if (!bulkStartDate) return;

      const start = new Date(`${bulkStartDate}T12:00:00`);

      let totalDays = 7;

      if (bulkTimeUnit === "weeks") {
        totalDays = Number(bulkCount) * 7;
      } else if (bulkTimeUnit === "months") {
        totalDays = Number(bulkCount) * 30;
      } else if (bulkTimeUnit === "years") {
        totalDays = Number(bulkCount) * 365;
      }

      for (let i = 0; i < totalDays; i++) {
        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + i);

        const dateKey = formatDateKey(nextDate);
        const newChore = addChoreToDate(dateKey, trimmed, bulkPersonId, uniqueSeed++);

        updated[dateKey] = [...(updated[dateKey] || []), newChore];
      }
    } else {
      if (bulkDaysOfWeek.length === 0) return;

      const anchorDate = new Date();
      const startOfWeek = getStartOfWeek(anchorDate);

      let totalWeeks = 1;

      if (bulkTimeUnit === "weeks") {
        totalWeeks = Number(bulkCount);
      } else if (bulkTimeUnit === "months") {
        totalWeeks = Number(bulkCount) * 4;
      } else if (bulkTimeUnit === "years") {
        totalWeeks = Number(bulkCount) * 52;
      }

      for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
        bulkDaysOfWeek.forEach((dayOfWeek) => {
          const nextDate = new Date(startOfWeek);
          nextDate.setDate(startOfWeek.getDate() + weekIndex * 7 + dayOfWeek);

          const dateKey = formatDateKey(nextDate);
          const newChore = addChoreToDate(dateKey, trimmed, bulkPersonId, uniqueSeed++);

          updated[dateKey] = [...(updated[dateKey] || []), newChore];
        });
      }
    }

    setChoresByDate(updated);
    setBulkChoreTitle("");
    setBulkCount("4");
    setBulkTimeUnit("weeks");
  }

  function handleOpenEdit(chore) {
    setEditChore({
      id: chore.id,
      title: chore.title,
      assignedTo: chore.assignedTo,
      date: selectedDate,
      originalDate: selectedDate
    });
  }

  function handleSaveEdit() {
    if (!editChore.title.trim()) return;

    setChoresByDate((prev) => {
      const updated = { ...prev };

      updated[editChore.originalDate] =
        (updated[editChore.originalDate] || []).filter(
          (c) => c.id !== editChore.id
        );

      const updatedChore = {
        id: editChore.id,
        title: editChore.title.trim(),
        assignedTo: Number(editChore.assignedTo),
        done: false
      };

      updated[editChore.date] = [
        ...(updated[editChore.date] || []),
        updatedChore
      ];

      return updated;
    });

    showToast(`"${editChore.title}" Updated`, "edit");

    setEditChore(null);
  }

  function showToast(message, type = "success") {
    const formattedMessage =
      message.charAt(0).toUpperCase() + message.slice(1);

    setToast({ message: formattedMessage, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  function handleDeleteChore(choreId) {
    const currentChore = (choresByDate[selectedDate] || []).find(
      (c) => c.id === choreId
    );

    if (!currentChore) return;

    setChoresByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter(
        (chore) => chore.id !== choreId
      )
    }));

    setConfirmDeleteId(null);

    showToast(`"${currentChore.title}" Deleted`, "delete");
  }

  function handleToggleDone(choreId) {
    const currentChore = (choresByDate[selectedDate] || []).find(
      (c) => c.id === choreId
    );

    if (!currentChore) return;

    const newDoneState = !currentChore.done;

    setChoresByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map((chore) =>
        chore.id === choreId ? { ...chore, done: newDoneState } : chore
      )
    }));

    showToast(
      newDoneState
        ? `"${currentChore.title}" Marked Complete`
        : `"${currentChore.title}" Marked Pending`
    );
  }

  function getPersonName(personId) {
    return people.find((person) => person.id === personId)?.name || "Unknown";
  }

  function getPersonColorClass(personId) {
    const index = people.findIndex((person) => person.id === personId);
    return index >= 0 ? `person-color-${index % 8}` : "person-color-default";
  }

  function getChoresForDate(dateKey) {
    return choresByDate[dateKey] || [];
  }

  function getFilteredChoresForDate(dateKey) {
    const chores = getChoresForDate(dateKey);

    if (filterPerson === "all") return chores;

    return chores.filter((chore) => chore.assignedTo === Number(filterPerson));
  }

  function getTotalCount(dateKey) {
    return getFilteredChoresForDate(dateKey).length;
  }

  function getCompletedCount(dateKey) {
    return getFilteredChoresForDate(dateKey).filter((chore) => chore.done).length;
  }

  const selectedChores = getFilteredChoresForDate(selectedDate);

  const isViewingToday = selectedDate === todayKey;

  return (
    <div className="scheduler-page">
      {editChore !== null && (
        <div className="confirm-backdrop" onClick={() => setEditChore(null)}>
          <div className="confirm-dialog edit-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="confirm-message">Edit Chore</p>

            <div className="edit-form">
              <label className="edit-label">Chore Name</label>
              <input
                className="edit-input"
                type="text"
                value={editChore.title}
                onChange={(e) => setEditChore({ ...editChore, title: e.target.value })}
              />

              <label className="edit-label">Assigned To</label>
              <select
                className="edit-input"
                value={editChore.assignedTo}
                onChange={(e) => setEditChore({ ...editChore, assignedTo: e.target.value })}
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>{person.name}</option>
                ))}
              </select>

              <label className="edit-label">Date</label>
              <input
                className="edit-input"
                type="date"
                value={editChore.date}
                onChange={(e) => setEditChore({ ...editChore, date: e.target.value })}
              />
            </div>

            <div className="confirm-actions">
              <button onClick={() => setEditChore(null)}>Cancel</button>
              <button className="save-btn" onClick={handleSaveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className="confirm-backdrop" onClick={() => setConfirmDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="confirm-message">Delete this chore?</p>
            <p className="confirm-subtext">This action cannot be undone.</p>
            <div className="confirm-actions">
              <button onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className="delete-btn" onClick={() => handleDeleteChore(confirmDeleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <header className="page-header">
        <h1>Household Chore Scheduler</h1>
        <p>Interactive front-end prototype for chore planning and daily tracking.</p>
      </header>

      <section className="legend-section card">
        <div className="section-header">
          <h2>Household Members</h2>
        </div>

        <div className="legend-list">
          {people.map((person, index) => (
            <div key={person.id} className="legend-item">
              <span className={`legend-color person-color-${index % 8}`}></span>
              <span>{person.name}</span>
            </div>
          ))}
        </div>

        <div className="inline-form">
          <input
            type="text"
            placeholder="Add person"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
          />
          <button onClick={handleAddPerson}>Add Person</button>
        </div>
      </section>

      <section className="card filter-card">
        <div className="section-header">
          <h2>Filter View</h2>
        </div>

        <div className="inline-form">
          <select
            value={filterPerson}
            onChange={(e) => setFilterPerson(e.target.value)}
          >
            <option value="all">All Housemates</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="main-grid">
        <div className="calendar-panel card">
          <div className="calendar-header">
            <button onClick={() => setCurrentMonth(moveMonth(currentMonth, -1))}>
              ←
            </button>
            <h2>{getMonthName(currentMonth)}</h2>
            <button onClick={() => setCurrentMonth(moveMonth(currentMonth, 1))}>
              →
            </button>
          </div>

          <div className="calendar-weekdays">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="calendar-grid">
            {calendarDays.map(({ date, currentMonth: isCurrentMonth }) => {
              const dateKey = formatDateKey(date);
              const isSelected = selectedDate === dateKey;
              const isToday = todayKey === dateKey;
              const completed = getCompletedCount(dateKey);
              const total = getTotalCount(dateKey);

              return (
                <button
                  key={dateKey}
                  className={`calendar-day
                    ${isCurrentMonth ? "" : "other-month"}
                    ${isSelected ? "selected" : ""}
                    ${isToday ? "today" : ""}
                  `}
                  onClick={() => {
                    setSelectedDate(dateKey);
                  }}
                >
                  <div className="day-top">
                    <span className="day-number">{date.getDate()}</span>
                    {isToday && <span className="today-badge">Today</span>}
                  </div>

                  <div className="day-summary">
                    <span className="summary-label">Chores</span>
                    <span className="summary-count">
                      {completed}/{total}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="details-panel">
          <div className={`card ${isViewingToday ? "today-panel" : ""}`}>
            <div className="section-header">
              <h2>
                Chores for {formatReadableDate(selectedDate)}
                {isViewingToday && (
                  <span className="today-label"> (Today)</span>
                )}
              </h2>
            </div>

            <div className="selected-day-summary">
              Completed: {getCompletedCount(selectedDate)} / {getTotalCount(selectedDate)}
            </div>

            <div className="inline-form add-chore-form">
              <input
                type="text"
                placeholder="Add a chore"
                value={newChoreTitle}
                onChange={(e) => setNewChoreTitle(e.target.value)}
              />

              <select
                value={newChorePersonId}
                onChange={(e) => setNewChorePersonId(e.target.value)}
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>

              <button onClick={handleAddChore}>Add Chore</button>
            </div>

            <div className="chore-chart">
              <div className="chart-header">
                <span>Task</span>
                <span>Assigned</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {selectedChores.length === 0 ? (
                <div className="empty-state">
                  No chores for this day with the current filter. Add one above.
                </div>
              ) : (
                selectedChores.map((chore) => {
                  const personColorClass = getPersonColorClass(chore.assignedTo);

                  return (
                    <div key={chore.id} className={`chart-row ${personColorClass}`}>
                      <span className={chore.done ? "done-text" : ""}>{chore.title}</span>

                      <span className="assigned-person">
                        <span className={`mini-color-dot ${personColorClass}`}></span>
                        {getPersonName(chore.assignedTo)}
                      </span>

                      <span className="chore-status">{chore.done ? "Done" : "Pending"}</span>

                      <div className="row-actions">
                        <button onClick={() => handleToggleDone(chore.id)}>
                          {chore.done ? "Undo" : "Mark Done"}
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() => handleOpenEdit(chore)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => setConfirmDeleteId(chore.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card bulk-card">
            <div className="section-header">
              <h2>Schedule Chores for Upcoming Time Periods</h2>
            </div>

            <div className="bulk-form-grid">
              <input
                type="text"
                placeholder="Chore title"
                value={bulkChoreTitle}
                onChange={(e) => setBulkChoreTitle(e.target.value)}
              />

              <select
                value={bulkPersonId}
                onChange={(e) => setBulkPersonId(e.target.value)}
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>

              <select
                value={bulkFrequency}
                onChange={(e) => setBulkFrequency(e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>

              <div className="timeframe-group">
                <select
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="6">6</option>
                  <option value="8">8</option>
                  <option value="12">12</option>
                </select>

                <select
                  value={bulkTimeUnit}
                  onChange={(e) => setBulkTimeUnit(e.target.value)}
                >
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>

              {bulkFrequency === "daily" && (
                <input
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                />
              )}
            </div>

            {bulkFrequency === "weekly" && (
              <div className="weekday-picker">
                <span className="weekday-picker-label">Choose days of the week:</span>
                <div className="weekday-options">
                  {weekDayOptions.map((day) => (
                    <label key={day.value} className="weekday-chip">
                      <input
                        type="checkbox"
                        checked={bulkDaysOfWeek.includes(day.value)}
                        onChange={() => handleWeeklyDayToggle(day.value)}
                      />
                      <span>{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button className="bulk-add-button" onClick={handleAddBulkChores}>
              Add Series
            </button>

            <p className="bulk-helper-text">
              Weekly mode lets you choose specific weekdays. Daily mode creates chores every day
              for the selected number of weeks, months, or years.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile Calendar Modal */}
      {mobileCalendarOpen && (
        <div 
          className="calendar-modal-backdrop" 
          onClick={() => setMobileCalendarOpen(false)}
        >
          <div 
            className="calendar-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="calendar-modal-header">
              <h3>Select Date</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setMobileCalendarOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="calendar-modal-content">
              {/* Month Navigation */}
              <div className="modal-month-nav">
                <button onClick={() => setCurrentMonth(moveMonth(currentMonth, -1))}>
                  ←
                </button>
                <h2>{getMonthName(currentMonth)}</h2>
                <button onClick={() => setCurrentMonth(moveMonth(currentMonth, 1))}>
                  →
                </button>
              </div>

              {/* Weekdays */}
              <div className="calendar-weekdays">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Calendar Grid */}
              <div className="calendar-grid">
                {calendarDays.map(({ date, currentMonth: isCurrentMonth }) => {
                  const dateKey = formatDateKey(date);
                  const isSelected = selectedDate === dateKey;
                  const isToday = todayKey === dateKey;
                  const completed = getCompletedCount(dateKey);
                  const total = getTotalCount(dateKey);

                  return (
                    <button
                      key={dateKey}
                      className={`calendar-day
                        ${isCurrentMonth ? "" : "other-month"}
                        ${isSelected ? "selected" : ""}
                        ${isToday ? "today" : ""}
                      `}
                      onClick={() => {
                        setSelectedDate(dateKey);
                        setMobileCalendarOpen(false);
                      }}
                    >
                      <div className="day-top">
                        <span className="day-number">{date.getDate()}</span>
                        {isToday && <span className="today-badge">Today</span>}
                      </div>

                      <div className="day-summary">
                        <span className="summary-label">Chores</span>
                        <span className="summary-count">
                          {completed}/{total}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        className="calendar-fab" 
        onClick={() => setMobileCalendarOpen(true)}
        aria-label="Open calendar"
      >
        📅
      </button>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ChoreScheduler;
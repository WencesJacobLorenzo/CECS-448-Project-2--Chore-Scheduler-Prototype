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

  function handleDeleteChore(choreId) {
    setChoresByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter((chore) => chore.id !== choreId)
    }));
  }

  function handleToggleDone(choreId) {
    setChoresByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map((chore) =>
        chore.id === choreId ? { ...chore, done: !chore.done } : chore
      )
    }));
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

  return (
    <div className="scheduler-page">
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
            <button 
              className="mobile-calendar-toggle"
              onClick={() => setMobileCalendarOpen(!mobileCalendarOpen)}
            >
              {mobileCalendarOpen ? '📅 Hide Calendar' : '📅 Show Calendar'}
            </button>
            
            <div className="month-navigation">
              <button onClick={() => setCurrentMonth(moveMonth(currentMonth, -1))}>
                ←
              </button>
              <h2>{getMonthName(currentMonth)}</h2>
              <button onClick={() => setCurrentMonth(moveMonth(currentMonth, 1))}>
                →
              </button>
            </div>
          </div>

          <div className={`calendar-content ${mobileCalendarOpen ? 'mobile-open' : 'mobile-closed'}`}>
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

        <div className="details-panel">
          <div className="card">
            <div className="section-header">
              <h2>Chores for {formatReadableDate(selectedDate)}</h2>
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
                <span>Assigned To</span>
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

                      <span>{chore.done ? "Done" : "Pending"}</span>

                      <div className="row-actions">
                        <button onClick={() => handleToggleDone(chore.id)}>
                          {chore.done ? "Undo" : "Mark Done"}
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteChore(chore.id)}
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
    </div>
  );
}

export default ChoreScheduler;
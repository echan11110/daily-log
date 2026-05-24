import { useState, useEffect, useCallback } from 'react'
import TaskRow from './TaskRow.jsx'
import PunishmentVerdict from './PunishmentVerdict.jsx'
import { getDailyQuote } from '../data/quotes.js'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default function DailyView({ taskNames, setTaskNames, loadDay, saveDay }) {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [dayData, setDayData] = useState(() => loadDay(today))
  const [isEditing, setIsEditing] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [draggedIdx, setDraggedIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

  // Compute the 7 tab dates for the current offset week (Sun–Sat)
  const weekDates = (() => {
    const dow = today.getDay()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - dow + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday)
      d.setDate(sunday.getDate() + i)
      return d
    })
  })()

  const weekLabel = (() => {
    const s = weekDates[0]
    const e = weekDates[6]
    const sm = MONTH_NAMES[s.getMonth()].slice(0, 3)
    const em = MONTH_NAMES[e.getMonth()].slice(0, 3)
    if (sm === em) return `${sm} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`
    return `${sm} ${s.getDate()} – ${em} ${e.getDate()}, ${e.getFullYear()}`
  })()

  function navigateWeek(dir) {
    const newOffset = weekOffset + dir
    if (newOffset > 0) return
    setWeekOffset(newOffset)
    // Move selected date to same day-of-week in new week
    const dow = today.getDay()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - dow + newOffset * 7)
    const newDate = new Date(sunday)
    newDate.setDate(sunday.getDate() + selectedDate.getDay())
    setSelectedDate(newDate)
  }

  useEffect(() => {
    setDayData(loadDay(selectedDate))
  }, [selectedDate, loadDay])

  const persist = useCallback(
    (newData) => {
      setDayData(newData)
      saveDay(selectedDate, newData)
    },
    [selectedDate, saveDay]
  )

  // ── Task handlers ──────────────────────────────────────────────────────────

  function handleStatusToggle(idx, nextStatus) {
    const tasks = dayData.tasks.map((t, i) =>
      i === idx ? { ...t, status: nextStatus } : t
    )
    persist({ ...dayData, tasks })
  }

  function handleNoteChange(idx, value) {
    const tasks = dayData.tasks.map((t, i) =>
      i === idx ? { ...t, note: value } : t
    )
    persist({ ...dayData, tasks })
  }

  function handleNameChange(idx, value) {
    setTaskNames(taskNames.map((n, i) => (i === idx ? value : n)))
  }

  function handleMoveUp(idx) {
    if (idx === 0) return
    const newNames = [...taskNames]
    ;[newNames[idx - 1], newNames[idx]] = [newNames[idx], newNames[idx - 1]]
    setTaskNames(newNames)
    const newTasks = [...dayData.tasks]
    ;[newTasks[idx - 1], newTasks[idx]] = [newTasks[idx], newTasks[idx - 1]]
    persist({ ...dayData, tasks: newTasks })
  }

  function handleMoveDown(idx) {
    if (idx === taskNames.length - 1) return
    const newNames = [...taskNames]
    ;[newNames[idx], newNames[idx + 1]] = [newNames[idx + 1], newNames[idx]]
    setTaskNames(newNames)
    const newTasks = [...dayData.tasks]
    ;[newTasks[idx], newTasks[idx + 1]] = [newTasks[idx + 1], newTasks[idx]]
    persist({ ...dayData, tasks: newTasks })
  }

  function handleDelete(idx) {
    setTaskNames(taskNames.filter((_, i) => i !== idx))
    persist({ ...dayData, tasks: dayData.tasks.filter((_, i) => i !== idx) })
  }

  function handleAddTask() {
    setTaskNames([...taskNames, 'New task'])
    persist({ ...dayData, tasks: [...dayData.tasks, { status: 'empty', note: '' }] })
  }

  function handleReflectionChange(e) {
    persist({ ...dayData, reflection: e.target.value })
  }

  // ── Drag-and-drop handlers ─────────────────────────────────────────────────

  function handleDragStart(idx) {
    setDraggedIdx(idx)
  }

  function handleDragOver(e, idx) {
    e.preventDefault()
    if (idx !== dragOverIdx) setDragOverIdx(idx)
  }

  function handleDrop(idx) {
    if (draggedIdx === null || draggedIdx === idx) {
      setDraggedIdx(null)
      setDragOverIdx(null)
      return
    }
    const from = draggedIdx
    const to = idx
    const newNames = [...taskNames]
    const [n] = newNames.splice(from, 1)
    newNames.splice(to, 0, n)
    setTaskNames(newNames)
    const newTasks = [...dayData.tasks]
    const [t] = newTasks.splice(from, 1)
    newTasks.splice(to, 0, t)
    persist({ ...dayData, tasks: newTasks })
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  function handleDragEnd() {
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const done = dayData.tasks.filter((t) => t.status === 'done').length
  const total = dayData.tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const isToday = (d) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()

  const isSel = (d) =>
    d.getFullYear() === selectedDate.getFullYear() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getDate() === selectedDate.getDate()

  const dateLabel = `${DAY_NAMES[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`

  return (
    <div className="daily-view">
      {/* Week navigation */}
      <div className="week-nav">
        <button className="week-nav-btn" onClick={() => navigateWeek(-1)} aria-label="Previous week">‹</button>
        <span className="week-nav-label">{weekLabel}</span>
        <button className="week-nav-btn" onClick={() => navigateWeek(1)} disabled={weekOffset >= 0} aria-label="Next week">›</button>
      </div>

      {/* Day tabs */}
      <div className="day-tabs">
        {weekDates.map((d, i) => (
          <button
            key={i}
            className={`day-tab${isSel(d) ? ' day-tab--selected' : ''}${isToday(d) ? ' day-tab--today' : ''}`}
            onClick={() => setSelectedDate(new Date(d))}
          >
            <span className="day-tab-label">{DAY_LABELS[d.getDay()]}</span>
            <span className="day-tab-date">{d.getDate()}</span>
          </button>
        ))}
      </div>

      {/* Date heading */}
      <div className="date-heading">
        <span className="date-text">{dateLabel}</span>
        <button
          className={`edit-btn${isEditing ? ' edit-btn--active' : ''}`}
          onClick={() => setIsEditing(!isEditing)}
          title="Edit task names"
        >
          ✏
        </button>
      </div>

      {/* Intention banner */}
      {dayData.intention && (
        <div className="intention-banner">
          <span className="intention-banner-label">★ Intention</span>
          <span className="intention-banner-text">{dayData.intention}</span>
        </div>
      )}

      {/* Task list */}
      <div className="task-list">
        {taskNames.map((name, i) => (
          <TaskRow
            key={i}
            index={i}
            name={name}
            status={dayData.tasks[i]?.status ?? 'empty'}
            note={dayData.tasks[i]?.note ?? ''}
            priority={dayData.tasks[i]?.priority ?? false}
            isEditing={isEditing}
            isFirst={i === 0}
            isLast={i === taskNames.length - 1}
            isDragging={draggedIdx === i}
            isDragOver={dragOverIdx === i}
            onStatusToggle={handleStatusToggle}
            onNoteChange={handleNoteChange}
            onNameChange={handleNameChange}
            onMoveUp={() => handleMoveUp(i)}
            onMoveDown={() => handleMoveDown(i)}
            onDelete={() => handleDelete(i)}
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
          />
        ))}

        {isEditing && (
          <button className="task-add-btn" onClick={handleAddTask}>
            + Add task
          </button>
        )}
      </div>

      {/* Score */}
      <div className="score-bar">
        <span className="score-label">Score</span>
        <span className="score-value">
          {done} / {total} = <strong>{pct}%</strong>
        </span>
      </div>

      {/* Punishment verdict */}
      <PunishmentVerdict done={done} total={total} />

      {/* Reflection */}
      <div className="reflection-block">
        <label className="reflection-label">Daily Reflection</label>
        <textarea
          className="reflection-textarea"
          placeholder="How did today go? What would you do differently?"
          value={dayData.reflection}
          onChange={handleReflectionChange}
        />
      </div>

      {/* Quote */}
      <div className="quote-block">
        <span className="quote-text">"{getDailyQuote(selectedDate)}"</span>
      </div>
    </div>
  )
}

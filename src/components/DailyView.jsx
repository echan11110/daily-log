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

  const weekDates = (() => {
    const dow = today.getDay()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - dow + i)
      return d
    })
  })()

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
    const updated = taskNames.map((n, i) => (i === idx ? value : n))
    setTaskNames(updated)
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
    const newNames = taskNames.filter((_, i) => i !== idx)
    setTaskNames(newNames)
    const newTasks = dayData.tasks.filter((_, i) => i !== idx)
    persist({ ...dayData, tasks: newTasks })
  }

  function handleAddTask() {
    const newNames = [...taskNames, 'New task']
    setTaskNames(newNames)
    const newTasks = [...dayData.tasks, { status: 'empty', note: '' }]
    persist({ ...dayData, tasks: newTasks })
  }

  function handleReflectionChange(e) {
    persist({ ...dayData, reflection: e.target.value })
  }

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
      {/* Day tabs */}
      <div className="day-tabs">
        {weekDates.map((d, i) => (
          <button
            key={i}
            className={`day-tab${isSel(d) ? ' day-tab--selected' : ''}${isToday(d) ? ' day-tab--today' : ''}`}
            onClick={() => setSelectedDate(new Date(d))}
          >
            {DAY_LABELS[d.getDay()]}
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
            onStatusToggle={handleStatusToggle}
            onNoteChange={handleNoteChange}
            onNameChange={handleNameChange}
            onMoveUp={() => handleMoveUp(i)}
            onMoveDown={() => handleMoveDown(i)}
            onDelete={() => handleDelete(i)}
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

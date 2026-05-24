export default function TaskRow({
  index, name, status, note, priority, isEditing,
  onStatusToggle, onNoteChange, onNameChange,
  onMoveUp, onMoveDown, onDelete,
  isFirst, isLast,
}) {
  const NEXT_STATUS = { empty: 'done', done: 'cross', cross: 'empty' }
  const statusLabel = status === 'done' ? '✓' : status === 'cross' ? '✗' : ''
  const statusClass = `status-btn status-${status}`

  return (
    <div className={`task-row task-row--${status}${priority ? ' task-row--priority' : ''}`}>
      {isEditing ? (
        <div className="task-move-btns">
          <button className="task-move-btn" onClick={onMoveUp} disabled={isFirst} aria-label="Move up">↑</button>
          <button className="task-move-btn" onClick={onMoveDown} disabled={isLast} aria-label="Move down">↓</button>
        </div>
      ) : (
        <span className="task-num">
          {priority
            ? <span className="task-priority-star">★</span>
            : String(index + 1).padStart(2, '0')
          }
        </span>
      )}

      {isEditing ? (
        <input
          className="task-name task-name--edit"
          value={name}
          onChange={(e) => onNameChange(index, e.target.value)}
        />
      ) : (
        <span className={`task-name${status === 'done' ? ' task-name--done' : ''}`}>{name}</span>
      )}

      {isEditing && (
        <button className="task-delete-btn" onClick={onDelete} aria-label={`Delete task ${index + 1}`}>×</button>
      )}

      <button
        className={statusClass}
        onClick={() => onStatusToggle(index, NEXT_STATUS[status])}
        aria-label={`Toggle status for task ${index + 1}`}
      >
        {statusLabel}
      </button>

      <input
        className="task-note"
        type="text"
        placeholder="notes…"
        value={note}
        onChange={(e) => onNoteChange(index, e.target.value)}
      />
    </div>
  )
}

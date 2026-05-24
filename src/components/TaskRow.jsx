export default function TaskRow({
  index, name, status, note, priority, isEditing,
  onStatusToggle, onNoteChange, onNameChange,
  onMoveUp, onMoveDown, onDelete,
  isFirst, isLast,
  isDragging, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
}) {
  const NEXT_STATUS = { empty: 'done', done: 'cross', cross: 'empty' }
  const statusLabel = status === 'done' ? '✓' : status === 'cross' ? '✗' : ''
  const statusClass = `status-btn status-${status}`

  let rowClass = `task-row task-row--${status}`
  if (priority) rowClass += ' task-row--priority'
  if (isDragging) rowClass += ' task-row--dragging'
  if (isDragOver) rowClass += ' task-row--drag-over'

  return (
    <div
      className={rowClass}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {isEditing ? (
        <div className="task-move-btns">
          <button className="task-move-btn" onClick={onMoveUp} disabled={isFirst} aria-label="Move up">↑</button>
          <button className="task-move-btn" onClick={onMoveDown} disabled={isLast} aria-label="Move down">↓</button>
        </div>
      ) : (
        <span className="task-drag-handle" aria-hidden="true">⠿</span>
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

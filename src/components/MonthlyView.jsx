import { useState, useCallback } from 'react'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function scoreColor(pct) {
  const hue = Math.round(pct * 1.2)
  return `hsl(${hue}, 68%, 52%)`
}
function scoreBg(pct) {
  const hue = Math.round(pct * 1.2)
  return `hsla(${hue}, 68%, 52%, 0.15)`
}

export default function MonthlyView({ getMonthData, loadDay, saveDay, taskNames }) {
  const today = new Date()
  const [year, setYear]       = useState(today.getFullYear())
  const [month, setMonth]     = useState(today.getMonth())
  const [selected, setSelected] = useState(null)
  // bump this to force monthData to re-read localStorage after a plan save
  const [refresh, setRefresh] = useState(0)

  const monthData = getMonthData(year, month, refresh)

  const firstDow   = new Date(year, month, 1).getDay()
  const startOffset = (firstDow + 6) % 7

  const prevMonth = () => {
    setSelected(null)
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    setSelected(null)
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const isToday = (d) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth()    === today.getMonth()    &&
    d.getDate()     === today.getDate()

  const isFuture = (d) => {
    const t  = new Date(today); t.setHours(0,0,0,0)
    const dd = new Date(d);     dd.setHours(0,0,0,0)
    return dd > t
  }

  // Month stats (past days only)
  const activeDays = monthData.filter(d => d.hasData)
  const avgPct = activeDays.length > 0
    ? Math.round(activeDays.reduce((s, d) => s + (d.done / d.total) * 100, 0) / activeDays.length)
    : null
  const streakDays = (() => {
    let streak = 0
    for (const d of [...monthData].reverse()) {
      if (isFuture(d.date)) continue
      if (!d.hasData) break
      const pct = Math.round((d.done / d.total) * 100)
      if (pct >= 50) streak++; else break
    }
    return streak
  })()
  const plannedAhead = monthData.filter(d => isFuture(d.date) && d.hasPlan).length

  const handleCellClick = (item) => {
    const isSame = selected?.date.getTime() === item.date.getTime()
    if (isSame) { setSelected(null); return }
    const dayData = loadDay(item.date)
    const future  = isFuture(item.date)
    const pct     = item.hasData ? Math.round((item.done / item.total) * 100) : null
    setSelected({ ...item, dayData, pct, future })
  }

  // ── Plan panel handlers ──────────────────────────────
  const handleIntentionChange = useCallback((e) => {
    if (!selected) return
    const updated = { ...selected.dayData, intention: e.target.value }
    saveDay(selected.date, updated)
    setSelected(s => ({ ...s, dayData: updated }))
    setRefresh(r => r + 1)
  }, [selected, saveDay])

  const handlePriorityToggle = useCallback((idx) => {
    if (!selected) return
    const tasks = selected.dayData.tasks.map((t, i) =>
      i === idx ? { ...t, priority: !t.priority } : t
    )
    const updated = { ...selected.dayData, tasks }
    saveDay(selected.date, updated)
    setSelected(s => ({ ...s, dayData: updated }))
  }, [selected, saveDay])

  return (
    <div className="monthly-view">

      {/* ── Nav header ── */}
      <div className="mv-header">
        <button className="mv-nav" onClick={prevMonth} aria-label="Previous month">‹</button>
        <div className="mv-title-block">
          <h2 className="mv-title">{MONTH_NAMES[month]} {year}</h2>
          <div className="mv-stats">
            {avgPct !== null && (
              <span className="mv-stat" style={{ color: scoreColor(avgPct) }}>
                avg {avgPct}%
              </span>
            )}
            {streakDays > 1 && (
              <span className="mv-stat mv-stat--streak">{streakDays}d streak</span>
            )}
            <span className="mv-stat mv-stat--days">
              {activeDays.length} / {monthData.length} logged
            </span>
            {plannedAhead > 0 && (
              <span className="mv-stat mv-stat--planned">
                {plannedAhead} planned ahead
              </span>
            )}
          </div>
        </div>
        <button className="mv-nav" onClick={nextMonth} aria-label="Next month">›</button>
      </div>

      {/* ── Day-of-week row ── */}
      <div className="mv-dow-row">
        {DOW.map(d => <span key={d} className="mv-dow">{d}</span>)}
      </div>

      {/* ── Calendar grid ── */}
      <div className="mv-grid">
        {Array.from({ length: startOffset }, (_, i) => (
          <div key={`gap-${i}`} className="mv-cell mv-cell--gap" />
        ))}

        {monthData.map((item) => {
          const { date, done, total, hasData, hasPlan } = item
          const future = isFuture(date)
          const today_ = isToday(date)
          const pct    = hasData ? Math.round((done / total) * 100) : null
          const isSel  = selected?.date.getTime() === date.getTime()

          return (
            <button
              key={date.getDate()}
              className={[
                'mv-cell',
                today_  ? 'mv-cell--today'    : '',
                future  ? 'mv-cell--future'   : '',
                isSel   ? 'mv-cell--selected' : '',
                hasData ? 'mv-cell--has-data' : '',
                hasPlan && future ? 'mv-cell--planned' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handleCellClick(item)}
              style={pct !== null ? {
                '--day-color': scoreColor(pct),
                '--day-bg':    scoreBg(pct),
              } : {}}
            >
              <span className="mv-date-num">{date.getDate()}</span>
              {pct !== null && (
                <>
                  <span className="mv-pct">{pct}%</span>
                  <div className="mv-fill" style={{ height: `${pct}%`, background: scoreColor(pct) }} />
                </>
              )}
              {hasPlan && future && !pct && (
                <span className="mv-plan-dot">★</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Detail / Plan panel ── */}
      {selected && (
        <div
          className={`mv-detail${selected.future ? ' mv-detail--plan' : ''}`}
          style={selected.pct !== null ? {
            borderColor: `${scoreColor(selected.pct)}40`,
          } : {}}
        >
          <div className="mv-detail-head">
            <span className="mv-detail-date">
              {MONTH_NAMES[selected.date.getMonth()]} {selected.date.getDate()}, {selected.date.getFullYear()}
            </span>
            {selected.future ? (
              <span className="mv-detail-badge">Plan ahead</span>
            ) : selected.pct !== null ? (
              <span className="mv-detail-score" style={{ color: scoreColor(selected.pct) }}>
                {selected.done} / {selected.total} · {selected.pct}%
              </span>
            ) : (
              <span className="mv-detail-score mv-detail-score--none">No data</span>
            )}
          </div>

          {/* ── FUTURE: planning UI ── */}
          {selected.future && (
            <div className="mv-plan-body">
              <div className="mv-plan-section">
                <label className="mv-plan-label">Day Intention</label>
                <textarea
                  className="mv-plan-textarea"
                  placeholder="What do you want to accomplish this day?"
                  value={selected.dayData?.intention ?? ''}
                  onChange={handleIntentionChange}
                />
              </div>

              <div className="mv-plan-section">
                <label className="mv-plan-label">Priority Tasks</label>
                <p className="mv-plan-hint">Star the tasks you want to focus on — they'll be highlighted in Daily view.</p>
                <div className="mv-priority-grid">
                  {taskNames.map((name, i) => {
                    const isPriority = selected.dayData?.tasks?.[i]?.priority ?? false
                    return (
                      <button
                        key={i}
                        className={`mv-priority-task${isPriority ? ' mv-priority-task--on' : ''}`}
                        onClick={() => handlePriorityToggle(i)}
                      >
                        <span className="mv-priority-star">{isPriority ? '★' : '☆'}</span>
                        <span className="mv-priority-name">{name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── PAST / TODAY: review UI ── */}
          {!selected.future && selected.dayData && (
            <>
              {selected.dayData.intention && (
                <div className="mv-review-intention">
                  <span className="mv-review-intention-label">Intention</span>
                  <p className="mv-review-intention-text">{selected.dayData.intention}</p>
                </div>
              )}
              <div className="mv-task-grid">
                {selected.dayData.tasks.map((task, i) => (
                  <div key={i} className={`mv-task mv-task--${task.status}`}>
                    <span className="mv-task-icon">
                      {task.status === 'done' ? '✓' : task.status === 'cross' ? '✗' : '○'}
                    </span>
                    <span className="mv-task-name">{taskNames[i] ?? `Task ${i + 1}`}</span>
                    {task.note && <span className="mv-task-note">{task.note}</span>}
                  </div>
                ))}
              </div>
              {selected.dayData.reflection && (
                <div className="mv-reflection">
                  <span className="mv-reflection-label">Reflection</span>
                  <p className="mv-reflection-text">{selected.dayData.reflection}</p>
                </div>
              )}
            </>
          )}

          {!selected.future && !selected.dayData && (
            <p className="mv-no-data">Nothing logged for this day.</p>
          )}
        </div>
      )}

    </div>
  )
}

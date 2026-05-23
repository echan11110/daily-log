import { useState } from 'react'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

// Interpolate hue 0 (red) → 120 (green) through yellow at 50%
function scoreColor(pct) {
  const hue = Math.round(pct * 1.2)
  return `hsl(${hue}, 68%, 52%)`
}

function scoreBg(pct) {
  const hue = Math.round(pct * 1.2)
  return `hsla(${hue}, 68%, 52%, 0.15)`
}

export default function MonthlyView({ getMonthData, loadDay, taskNames }) {
  const today = new Date()
  const [year, setYear]     = useState(today.getFullYear())
  const [month, setMonth]   = useState(today.getMonth())
  const [selected, setSelected] = useState(null)

  const monthData = getMonthData(year, month)

  // Mon-first start offset: Mon=0 … Sun=6
  const firstDow = new Date(year, month, 1).getDay()
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
    const t = new Date(today); t.setHours(0,0,0,0)
    const dd = new Date(d);    dd.setHours(0,0,0,0)
    return dd > t
  }

  // Month-level stats
  const activeDays = monthData.filter(d => d.hasData)
  const avgPct = activeDays.length > 0
    ? Math.round(activeDays.reduce((s, d) => s + (d.done / d.total) * 100, 0) / activeDays.length)
    : null
  const streakDays = (() => {
    let streak = 0
    const sorted = [...monthData].reverse()
    for (const d of sorted) {
      if (isFuture(d.date)) continue
      if (!d.hasData) break
      const pct = Math.round((d.done / d.total) * 100)
      if (pct >= 50) streak++; else break
    }
    return streak
  })()

  const handleCellClick = (item) => {
    if (isFuture(item.date)) return
    const isSame = selected?.date.getTime() === item.date.getTime()
    if (isSame) { setSelected(null); return }
    const dayData = item.hasData ? loadDay(item.date) : null
    const pct = item.hasData ? Math.round((item.done / item.total) * 100) : null
    setSelected({ ...item, dayData, pct })
  }

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
              <span className="mv-stat mv-stat--streak">
                {streakDays}d streak
              </span>
            )}
            <span className="mv-stat mv-stat--days">
              {activeDays.length} / {monthData.length} days logged
            </span>
          </div>
        </div>
        <button className="mv-nav" onClick={nextMonth} aria-label="Next month">›</button>
      </div>

      {/* ── Day-of-week header ── */}
      <div className="mv-dow-row">
        {DOW.map(d => <span key={d} className="mv-dow">{d}</span>)}
      </div>

      {/* ── Calendar grid ── */}
      <div className="mv-grid">
        {Array.from({ length: startOffset }, (_, i) => (
          <div key={`gap-${i}`} className="mv-cell mv-cell--gap" />
        ))}

        {monthData.map((item) => {
          const { date, done, total, hasData } = item
          const future  = isFuture(date)
          const today_  = isToday(date)
          const pct     = hasData ? Math.round((done / total) * 100) : null
          const isSel   = selected?.date.getTime() === date.getTime()

          return (
            <button
              key={date.getDate()}
              className={[
                'mv-cell',
                today_  ? 'mv-cell--today'    : '',
                future  ? 'mv-cell--future'   : '',
                isSel   ? 'mv-cell--selected' : '',
                hasData ? 'mv-cell--has-data' : '',
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
                  <div
                    className="mv-fill"
                    style={{ height: `${pct}%`, background: scoreColor(pct) }}
                  />
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Day detail panel ── */}
      {selected && (
        <div
          className="mv-detail"
          style={selected.pct !== null ? {
            '--detail-color': scoreColor(selected.pct),
            borderColor: `${scoreColor(selected.pct)}40`,
          } : {}}
        >
          <div className="mv-detail-head">
            <span className="mv-detail-date">
              {MONTH_NAMES[selected.date.getMonth()]} {selected.date.getDate()}, {selected.date.getFullYear()}
            </span>
            {selected.pct !== null ? (
              <span
                className="mv-detail-score"
                style={{ color: scoreColor(selected.pct) }}
              >
                {selected.done} / {selected.total} &nbsp;·&nbsp; {selected.pct}%
              </span>
            ) : (
              <span className="mv-detail-score mv-detail-score--none">No data</span>
            )}
          </div>

          {selected.dayData ? (
            <>
              <div className="mv-task-grid">
                {selected.dayData.tasks.map((task, i) => (
                  <div key={i} className={`mv-task mv-task--${task.status}`}>
                    <span className="mv-task-icon">
                      {task.status === 'done'  ? '✓'
                     : task.status === 'cross' ? '✗'
                     : '○'}
                    </span>
                    <span className="mv-task-name">
                      {taskNames[i] ?? `Task ${i + 1}`}
                    </span>
                    {task.note && (
                      <span className="mv-task-note">{task.note}</span>
                    )}
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
          ) : (
            <p className="mv-no-data">Nothing logged for this day.</p>
          )}
        </div>
      )}

    </div>
  )
}

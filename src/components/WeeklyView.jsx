const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function WeeklyView({ getWeekData }) {
  const today = new Date()
  const weekData = getWeekData(today)

  const isToday = (d) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()

  return (
    <div className="weekly-view">
      <h2 className="weekly-title">Week at a Glance</h2>
      <div className="week-cards">
        {weekData.map(({ date, total, done }, i) => {
          const hasData = total > 0
          const pct = hasData ? Math.round((done / total) * 100) : 0
          const today_ = isToday(date)

          return (
            <div
              key={i}
              className={`week-card${today_ ? ' week-card--today' : ''}${!hasData ? ' week-card--empty' : ''}`}
            >
              <span className="wc-day">{SHORT_DAYS[date.getDay()]}</span>
              <span className="wc-date">
                {SHORT_MONTHS[date.getMonth()]} {date.getDate()}
              </span>
              <div className="wc-bar-wrap">
                <div
                  className="wc-bar-fill"
                  style={{ height: hasData ? `${pct}%` : '0%' }}
                />
              </div>
              <span className="wc-pct">
                {hasData ? `${pct}%` : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

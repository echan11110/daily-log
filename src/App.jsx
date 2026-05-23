import { useState } from 'react'
import DailyView from './components/DailyView.jsx'
import WeeklyView from './components/WeeklyView.jsx'
import { useStorage } from './hooks/useStorage.js'

export default function App() {
  const [view, setView] = useState('daily')
  const { taskNames, setTaskNames, loadDay, saveDay, getWeekData } = useStorage()

  return (
    <div className="app-bg">
      <div className="journal-card">
        <div className="journal-margin" />
        <div className="journal-content">
          <header className="app-header">
            <h1 className="app-title">DAILY LOG</h1>
            <div className="view-toggle">
              <button
                className={`toggle-btn${view === 'daily' ? ' toggle-btn--active' : ''}`}
                onClick={() => setView('daily')}
              >
                Daily
              </button>
              <button
                className={`toggle-btn${view === 'weekly' ? ' toggle-btn--active' : ''}`}
                onClick={() => setView('weekly')}
              >
                Weekly
              </button>
            </div>
          </header>

          {view === 'daily' ? (
            <DailyView
              taskNames={taskNames}
              setTaskNames={setTaskNames}
              loadDay={loadDay}
              saveDay={saveDay}
            />
          ) : (
            <WeeklyView getWeekData={getWeekData} />
          )}
        </div>
      </div>
    </div>
  )
}

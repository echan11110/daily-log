import { useState } from 'react'
import DailyView from './components/DailyView.jsx'
import WeeklyView from './components/WeeklyView.jsx'
import MonthlyView from './components/MonthlyView.jsx'
import LoginScreen from './components/LoginScreen.jsx'
import { useStorage } from './hooks/useStorage.js'
import { useAuth } from './hooks/useAuth.js'

export default function App() {
  const [view, setView] = useState('daily')
  const { user, loading, signOut } = useAuth()
  const { taskNames, setTaskNames, loadDay, saveDay, getWeekData, getMonthData, syncing } = useStorage(user)

  if (loading) return (
    <div className="app-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--a1)', fontFamily: 'var(--font-body)', opacity: 0.6 }}>Loading…</span>
    </div>
  )

  if (!user) return <LoginScreen />

  return (
    <div className="app-bg">
      <div className="journal-card">
        <div className="journal-margin" />
        <div className="journal-content">
          <header className="app-header">
            <h1 className="app-title">DAILY LOG</h1>
            <div className="header-right">
              {syncing && <span className="sync-dot" title="Syncing…">↻</span>}
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
                <button
                  className={`toggle-btn${view === 'monthly' ? ' toggle-btn--active' : ''}`}
                  onClick={() => setView('monthly')}
                >
                  Monthly
                </button>
              </div>
              <button className="signout-btn" onClick={signOut} title="Sign out">↪</button>
            </div>
          </header>

          {view === 'daily' && (
            <DailyView
              taskNames={taskNames}
              setTaskNames={setTaskNames}
              loadDay={loadDay}
              saveDay={saveDay}
            />
          )}
          {view === 'weekly' && (
            <WeeklyView getWeekData={getWeekData} />
          )}
          {view === 'monthly' && (
            <MonthlyView
              getMonthData={getMonthData}
              loadDay={loadDay}
              saveDay={saveDay}
              taskNames={taskNames}
            />
          )}
        </div>
      </div>
    </div>
  )
}

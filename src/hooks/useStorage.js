import { useState, useEffect, useCallback } from 'react'

export const DEFAULT_TASKS = [
  'Wake up at 6:30 AM',
  'Morning Study Session',
  'Cold Shower',
  '5 hrs of Study',
  'Workout 15 min',
  'Meditation 5 min',
  'Read 5 pages',
  'Eat 80% and no junk',
  '2L of water',
  'Clean my Environment',
  'Skin and Hair care',
  'Plan next day',
  'Journaling',
  'Dinner btw 7–9',
  'Brush at night',
  'Sleep btw 10–11',
]

const TASKS_KEY = 'daily-log-task-names'

function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `daily-log-${y}-${m}-${d}`
}

function defaultDayData(taskNames) {
  return {
    tasks: taskNames.map(() => ({ status: 'empty', note: '' })),
    reflection: '',
  }
}

export function useStorage() {
  const [taskNames, setTaskNamesState] = useState(() => {
    try {
      const saved = localStorage.getItem(TASKS_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_TASKS
  })

  const setTaskNames = useCallback((names) => {
    setTaskNamesState(names)
    localStorage.setItem(TASKS_KEY, JSON.stringify(names))
  }, [])

  const loadDay = useCallback(
    (date) => {
      try {
        const raw = localStorage.getItem(dateKey(date))
        if (raw) {
          const parsed = JSON.parse(raw)
          // Ensure tasks array length matches current task list
          while (parsed.tasks.length < taskNames.length) {
            parsed.tasks.push({ status: 'empty', note: '' })
          }
          return parsed
        }
      } catch {}
      return defaultDayData(taskNames)
    },
    [taskNames]
  )

  const saveDay = useCallback((date, data) => {
    localStorage.setItem(dateKey(date), JSON.stringify(data))
  }, [])

  const getWeekData = useCallback(
    (today) => {
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const data = loadDay(d)
        const total = data.tasks.length
        const done = data.tasks.filter((t) => t.status === 'done').length
        days.push({ date: d, data, total, done })
      }
      return days
    },
    [loadDay]
  )

  const getMonthData = useCallback((year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const raw = localStorage.getItem(dateKey(date))
      let parsed = null
      let done = 0
      let total = 0
      if (raw) {
        try {
          parsed = JSON.parse(raw)
          total = parsed.tasks?.length ?? 0
          done  = parsed.tasks?.filter((t) => t.status === 'done').length ?? 0
        } catch {}
      }
      // hasData = someone actually toggled tasks (not just wrote a plan)
      const hasActivity = done > 0 ||
        (parsed?.tasks?.some((t) => t.status === 'cross') ?? false)
      const hasData = !!raw && total > 0 && hasActivity
      // hasPlan = future day with a written intention
      const hasPlan = !!(parsed?.intention?.trim())
      days.push({ date, done, total, hasData, hasPlan })
    }
    return days
  }, [])

  return { taskNames, setTaskNames, loadDay, saveDay, getWeekData, getMonthData }
}

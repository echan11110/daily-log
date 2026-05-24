import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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

// localStorage key → 'daily-log-YYYY-MM-DD'
function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `daily-log-${y}-${m}-${d}`
}

// Supabase date column value → 'YYYY-MM-DD'
function dateStr(date) {
  return dateKey(date).replace('daily-log-', '')
}

function defaultDayData(taskNames) {
  return {
    tasks: taskNames.map(() => ({ status: 'empty', note: '' })),
    reflection: '',
    intention: '',
  }
}

// Seed the in-memory store from whatever is currently in localStorage
function loadStoreFromLocal() {
  const store = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('daily-log-2')) {
        store[key] = JSON.parse(localStorage.getItem(key))
      }
    }
  } catch {}
  return store
}

export function useStorage(user) {
  // ── Primary in-memory store (React state = source of truth) ──────────────
  const [dayStore, setDayStore] = useState(loadStoreFromLocal)

  const [taskNames, setTaskNamesState] = useState(() => {
    try {
      const saved = localStorage.getItem(TASKS_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_TASKS
  })

  const [syncing, setSyncing] = useState(false)

  // ── Supabase sync (runs once per sign-in) ────────────────────────────────
  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function sync() {
      setSyncing(true)
      try {
        // 1. Fetch all saved days from Supabase
        const { data: logs, error: logsErr } = await supabase
          .from('daily_logs')
          .select('date, data')
          .eq('user_id', user.id)

        if (logsErr) throw logsErr

        // 2. Fetch task names from Supabase
        const { data: settings } = await supabase
          .from('user_settings')
          .select('task_names')
          .eq('user_id', user.id)
          .maybeSingle()

        if (cancelled) return

        // 3. Build merged store: Supabase wins for any key it has
        const newStore = { ...loadStoreFromLocal() }
        const remoteKeys = new Set()

        if (logs) {
          for (const { date, data } of logs) {
            const key = `daily-log-${date}`
            newStore[key] = data
            localStorage.setItem(key, JSON.stringify(data))
            remoteKeys.add(key)
          }
        }

        // 4. Push any local-only keys up to Supabase (first-device migration)
        const localOnlyEntries = Object.entries(newStore).filter(
          ([k]) => !remoteKeys.has(k)
        )
        if (localOnlyEntries.length > 0 && user) {
          const upserts = localOnlyEntries.map(([key, data]) => ({
            user_id: user.id,
            date: key.replace('daily-log-', ''),
            data,
            updated_at: new Date().toISOString(),
          }))
          await supabase
            .from('daily_logs')
            .upsert(upserts, { onConflict: 'user_id,date' })
        }

        setDayStore(newStore)

        // 5. Sync task names
        if (settings?.task_names?.length) {
          setTaskNamesState(settings.task_names)
          localStorage.setItem(TASKS_KEY, JSON.stringify(settings.task_names))
        } else {
          // Push local task names to Supabase (first sign-in)
          const localNames = (() => {
            try { return JSON.parse(localStorage.getItem(TASKS_KEY)) } catch { return null }
          })()
          await supabase.from('user_settings').upsert(
            { user_id: user.id, task_names: localNames ?? DEFAULT_TASKS, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
        }
      } catch (err) {
        console.error('[sync] Supabase error:', err)
      } finally {
        if (!cancelled) setSyncing(false)
      }
    }

    sync()
    return () => { cancelled = true }
  }, [user?.id])

  // ── Reads ─────────────────────────────────────────────────────────────────
  const loadDay = useCallback(
    (date) => {
      const stored = dayStore[dateKey(date)]
      if (stored) {
        const data = { ...stored, tasks: [...(stored.tasks ?? [])] }
        data.tasks = data.tasks.slice(0, taskNames.length)
        while (data.tasks.length < taskNames.length) {
          data.tasks.push({ status: 'empty', note: '' })
        }
        return data
      }
      return defaultDayData(taskNames)
    },
    [dayStore, taskNames]
  )

  // ── Writes ────────────────────────────────────────────────────────────────
  const saveDay = useCallback(
    (date, data) => {
      const key = dateKey(date)
      // Update React state immediately (triggers re-renders)
      setDayStore((prev) => ({ ...prev, [key]: data }))
      // Update localStorage cache
      localStorage.setItem(key, JSON.stringify(data))
      // Async push to Supabase (fire-and-forget)
      if (user) {
        supabase
          .from('daily_logs')
          .upsert(
            { user_id: user.id, date: dateStr(date), data, updated_at: new Date().toISOString() },
            { onConflict: 'user_id,date' }
          )
          .then(({ error }) => { if (error) console.error('[saveDay]', error) })
      }
    },
    [user]
  )

  const setTaskNames = useCallback(
    (names) => {
      setTaskNamesState(names)
      localStorage.setItem(TASKS_KEY, JSON.stringify(names))
      if (user) {
        supabase
          .from('user_settings')
          .upsert(
            { user_id: user.id, task_names: names, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
          .then(({ error }) => { if (error) console.error('[setTaskNames]', error) })
      }
    },
    [user]
  )

  // ── Aggregate views ───────────────────────────────────────────────────────
  const getWeekData = useCallback(
    (today) => {
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const data = loadDay(d)
        days.push({
          date: d,
          data,
          total: data.tasks.length,
          done: data.tasks.filter((t) => t.status === 'done').length,
        })
      }
      return days
    },
    [loadDay]
  )

  const getMonthData = useCallback(
    (year, month) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const days = []
      for (let d = 1; d <= daysInMonth; d++) {
        const date  = new Date(year, month, d)
        const key   = dateKey(date)
        const stored = dayStore[key] ?? null
        const total = stored?.tasks?.length ?? 0
        const done  = stored?.tasks?.filter((t) => t.status === 'done').length ?? 0
        const hasActivity =
          done > 0 || (stored?.tasks?.some((t) => t.status === 'cross') ?? false)
        days.push({
          date,
          done,
          total,
          hasData: !!stored && total > 0 && hasActivity,
          hasPlan: !!(stored?.intention?.trim()),
        })
      }
      return days
    },
    [dayStore]
  )

  return { taskNames, setTaskNames, loadDay, saveDay, getWeekData, getMonthData, syncing }
}

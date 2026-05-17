import { create } from 'zustand'
import { MonthData } from './types'
import { getCurrentMonth, emptyMonthData } from './utils'
import { getMonthData, saveMonthData } from './github'

interface Store {
  currentMonth: string
  monthData: MonthData
  loading: boolean
  saving: boolean
  error: string | null
  members: string[]
  setCurrentMonth: (m: string) => void
  loadMonth: (m: string) => Promise<void>
  saveMonth: (data: MonthData) => Promise<boolean>
  setMembers: (m: string[]) => void
  loadMembers: () => void
}

export const useStore = create<Store>((set, get) => ({
  currentMonth: getCurrentMonth(),
  monthData: emptyMonthData(getCurrentMonth()),
  loading: false,
  saving: false,
  error: null,
  members: ['Self', 'Spouse', 'Family'],

  setCurrentMonth: (m) => {
    set({ currentMonth: m })
    get().loadMonth(m)
  },

  loadMonth: async (m) => {
    set({ loading: true, error: null })
    try {
      const data = await getMonthData(m)
      set({ monthData: data, loading: false })
    } catch {
      set({ error: 'Failed to load data', loading: false })
    }
  },

  saveMonth: async (data) => {
    set({ saving: true })
    // Optimistic update
    set({ monthData: data })
    const ok = await saveMonthData(data.month, data)
    set({ saving: false })
    return ok
  },

  setMembers: (m) => {
    set({ members: m })
    if (typeof window !== 'undefined') {
      localStorage.setItem('family_members', JSON.stringify(m))
    }
  },

  loadMembers: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('family_members')
      if (saved) set({ members: JSON.parse(saved) })
    }
  },
}))

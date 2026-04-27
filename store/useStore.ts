import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserStatus = 'pregnant' | 'postpartum_early' | 'postpartum_late' | 'unknown'
export type Trimester = 'first' | 'second' | 'third' | 'term'
export type RiskLevel = 'low' | 'medium' | 'high'

interface User {
  id: string
  phone: string
  fullName: string
  status: UserStatus
  trimester?: Trimester
  weeksCount?: number
  chwName?: string
  chwPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  location?: string
}

interface LastCheckup {
  riskLevel: RiskLevel
  conditionChecked: string
  symptomsDetected: string[]
  date: string
}

interface CheckupHistoryEntry {
  riskLevel: RiskLevel
  date: string
}

interface AppState {
  user: User | null
  lastCheckup: LastCheckup | null
  checkupHistory: CheckupHistoryEntry[]
  
  setUser: (user: User | null) => void
  setLastCheckup: (checkup: LastCheckup | null) => void
  addToHistory: (entry: CheckupHistoryEntry) => void
  logout: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      lastCheckup: null,
      checkupHistory: [],

      setUser: (user) => set({ user }),

      setLastCheckup: (checkup) => set({ lastCheckup: checkup }),

      addToHistory: (entry) => set((state) => ({
        checkupHistory: [entry, ...state.checkupHistory].slice(0, 10) // Keep last 10 entries
      })),

      logout: () => set({ user: null, lastCheckup: null, checkupHistory: [] }),
    }),
    {
      name: 'continuum-store',
      partialize: (state) => ({
        user: state.user,
        lastCheckup: state.lastCheckup,
        checkupHistory: state.checkupHistory,
      }),
    }
  )
)

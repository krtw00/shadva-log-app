import { ElectronAPI } from '@electron-toolkit/preload'

interface Match {
  id?: number
  match_date: string
  player_rank: string
  player_group?: string
  player_cr?: number
  player_mp?: number
  player_class: string
  player_archetype?: string
  opponent_class: string
  opponent_archetype?: string
  is_first: number
  result: number
  notes?: string
}

interface Archetype {
  id?: number
  name: string
  class_name: string
  default_cr?: number
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      addMatch: (match: Match) => Promise<{ success: boolean; lastInsertRowid?: number; error?: string }>
      getMatches: () => Promise<{ success: boolean; data?: Match[]; error?: string }>
      deleteMatch: (id: number) => Promise<{ success: boolean; changes?: number; error?: string }>
      addArchetype: (archetype: Archetype) => Promise<{ success: boolean; lastInsertRowid?: number; error?: string }>
      getArchetypes: (className?: string) => Promise<{ success: boolean; data?: Archetype[]; error?: string }>
      updateArchetype: (archetype: Archetype) => Promise<{ success: boolean; changes?: number; error?: string }>
      deleteArchetype: (id: number) => Promise<{ success: boolean; changes?: number; error?: string }>
      getLatestCrForClass: (className: string, rank: string) => Promise<{ success: boolean; data?: number; error?: string }>
      getLatestMatch: () => Promise<{ success: boolean; data?: Match; error?: string }>
      getLatestMatchByRankTab: (rankTab: 'Beginner-AA' | 'Master' | 'Grand Master') => Promise<{ success: boolean; data?: Match; error?: string }>
    }
  }
}

import type { Match, Archetype } from '@/types'
import { toRaw } from 'vue'
import { useNotificationStore } from '../stores/notification'
import { useLoadingStore } from '../stores/loading'

// ElectronのIPC経由でメインプロセスと通信するためのラッパー

export function useApi() {
  const notificationStore = useNotificationStore()
  const loadingStore = useLoadingStore()

  const api = {
    // Match関連のAPI
    async addMatch(match: Match) {
      const requestId = 'addMatch'
      loadingStore.start(requestId)
      try {
        const result = await window.api.addMatch(toRaw(match))
        if (!result.success) {
          notificationStore.error(result.error || '試合の追加に失敗しました')
          throw new Error(result.error || '試合の追加に失敗しました')
        }
        notificationStore.success('試合を追加しました')
        return result
      } catch (error: any) {
        notificationStore.error(error.message || '試合の追加中にエラーが発生しました')
        throw error
      } finally {
        loadingStore.stop(requestId)
      }
    },

    async getMatches() {
      const requestId = 'getMatches'
      loadingStore.start(requestId)
      try {
        const result = await window.api.getMatches()
        if (!result.success) {
          notificationStore.error(result.error || '試合の取得に失敗しました')
          throw new Error(result.error || '試合の取得に失敗しました')
        }
        return result
      } catch (error: any) {
        notificationStore.error(error.message || '試合の取得中にエラーが発生しました')
        throw error
      } finally {
        loadingStore.stop(requestId)
      }
    },

    async deleteMatch(id: number) {
      const requestId = `deleteMatch-${id}`
      loadingStore.start(requestId)
      try {
        const result = await window.api.deleteMatch(id)
        if (!result.success) {
          notificationStore.error(result.error || '試合の削除に失敗しました')
          throw new Error(result.error || '試合の削除に失敗しました')
        }
        notificationStore.success('試合を削除しました')
        return result
      } catch (error: any) {
        notificationStore.error(error.message || '試合の削除中にエラーが発生しました')
        throw error
      } finally {
        loadingStore.stop(requestId)
      }
    },

    // Archetype関連のAPI
    async addArchetype(archetype: Archetype) {
      const requestId = 'addArchetype'
      loadingStore.start(requestId)
      try {
        const result = await window.api.addArchetype(toRaw(archetype))
        if (!result.success) {
          notificationStore.error(result.error || 'アーキタイプの追加に失敗しました')
          throw new Error(result.error || 'アーキタイプの追加に失敗しました')
        }
        notificationStore.success('アーキタイプを追加しました')
        return result
      } catch (error: any) {
        notificationStore.error(error.message || 'アーキタイプの追加中にエラーが発生しました')
        throw error
      } finally {
        loadingStore.stop(requestId)
      }
    },

    async getArchetypes(className?: string) {
      const requestId = 'getArchetypes'
      loadingStore.start(requestId)
      try {
        const result = await window.api.getArchetypes(className)
        if (!result.success) {
          notificationStore.error(result.error || 'アーキタイプの取得に失敗しました')
          throw new Error(result.error || 'アーキタイプの取得に失敗しました')
        }
        return result
      } catch (error: any) {
        notificationStore.error(error.message || 'アーキタイプの取得中にエラーが発生しました')
        throw error
      } finally {
        loadingStore.stop(requestId)
      }
    },

    async updateArchetype(archetype: Archetype) {
      const requestId = 'updateArchetype'
      loadingStore.start(requestId)
      try {
        const result = await window.api.updateArchetype(toRaw(archetype))
        if (!result.success) {
          notificationStore.error(result.error || 'アーキタイプの更新に失敗しました')
          throw new Error(result.error || 'アーキタイプの更新に失敗しました')
        }
        notificationStore.success('アーキタイプを更新しました')
        return result
      } catch (error: any) {
        notificationStore.error(error.message || 'アーキタイプの更新中にエラーが発生しました')
        throw error
      } finally {
        loadingStore.stop(requestId)
      }
    },

    async deleteArchetype(id: number) {
      const requestId = `deleteArchetype-${id}`
      loadingStore.start(requestId)
      try {
        const result = await window.api.deleteArchetype(id)
        if (!result.success) {
          notificationStore.error(result.error || 'アーキタイプの削除に失敗しました')
          throw new Error(result.error || 'アーキタイプの削除に失敗しました')
        }
        notificationStore.success('アーキタイプを削除しました')
        return result
      } catch (error: any) {
        notificationStore.error(error.message || 'アーキタイプの削除中にエラーが発生しました')
        throw error
      } finally {
        loadingStore.stop(requestId)
      }
    },

    async getLatestCrForClass(className: string, rank: string) {
      const requestId = `getLatestCrForClass-${className}-${rank}`
      loadingStore.start(requestId)
      try {
        const result = await window.api.getLatestCrForClass(className, rank)
        if (!result.success) {
          notificationStore.error(result.error || '最新のCRの取得に失敗しました')
          throw new Error(result.error || '最新のCRの取得に失敗しました')
        }
        return result
      } catch (error: any) {
        notificationStore.error(error.message || '最新のCRの取得中にエラーが発生しました')
        throw error
      } finally {
        loadingStore.stop(requestId)
      }
    },

    async getLatestMatch() {
      const requestId = 'getLatestMatch'
      loadingStore.start(requestId)
      try {
        const result = await window.api.getLatestMatch()
        if (!result.success) {
          notificationStore.error(result.error || '最新の試合データの取得に失敗しました')
          throw new Error(result.error || '最新の試合データの取得に失敗しました')
        }
        return result
      } catch (error: any) {
        notificationStore.error(error.message || '最新の試合データの取得中にエラーが発生しました')
        throw error
      } finally {
        loadingStore.stop(requestId)
      }
    },

    async getLatestMatchByRankTab(rankTab: 'Beginner-AA' | 'Master' | 'Grand Master') {
      const requestId = `getLatestMatchByRankTab-${rankTab}`
      loadingStore.start(requestId)
      try {
        const result = await window.api.getLatestMatchByRankTab(rankTab)
        if (!result.success) {
          notificationStore.error(
            result.error || 'ランクタブに応じた最新の試合データの取得に失敗しました'
          )
          throw new Error(result.error || 'ランクタブに応じた最新の試合データの取得に失敗しました')
        }
        return result
      } catch (error: any) {
        notificationStore.error(
          error.message || 'ランクタブに応じた最新の試合データの取得中にエラーが発生しました'
        )
        throw error
      } finally {
        loadingStore.stop(requestId)
      }
    }
  }
  return api
}

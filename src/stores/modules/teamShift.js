/**
 * 班组/班次 Store (Pinia)
 *
 * 镜像 V1.1 useTeamStore.ts（Zustand）— 1:1 迁移
 * 注意：useTeamStore 已被班组分配功能占用（localStorage 版本），
 * 此处使用 useTeamShiftStore 命名避免冲突。
 * 数据流：TeamManagement.vue → useTeamShiftStore → apiBasicDataService
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getShifts,
  createShift,
  updateShift,
  deleteShift
} from '@/services/apiBasicDataService'

export const useTeamShiftStore = defineStore('teamShift', () => {
  // ---------- 状态 ----------
  const teams = ref([])
  const shifts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)

  // ---------- 班组 CRUD ----------
  /**
   * 加载班组列表（5 分钟缓存）
   */
  async function loadTeams(force = false) {
    const now = Date.now()
    if (!force && lastFetch.value && now - lastFetch.value < 5 * 60 * 1000 && teams.value.length > 0) {
      return
    }
    loading.value = true
    error.value = null
    try {
      const data = await getTeams()
      teams.value = data || []
      lastFetch.value = now
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载班组失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 新增班组
   */
  async function addTeam(team) {
    const result = await createTeam(team)
    teams.value = [...teams.value, result]
    return result
  }

  /**
   * 更新班组
   */
  async function editTeam(id, team) {
    await updateTeam(id, team)
    teams.value = teams.value.map(t => (t.id === id ? { ...t, ...team } : t))
  }

  /**
   * 删除班组
   */
  async function removeTeam(id) {
    await deleteTeam(id)
    teams.value = teams.value.filter(t => t.id !== id)
  }

  // ---------- 班次 CRUD ----------
  /**
   * 加载班次列表
   */
  async function loadShifts() {
    loading.value = true
    error.value = null
    try {
      const data = await getShifts()
      shifts.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载班次失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 新增班次
   */
  async function addShift(shift) {
    const result = await createShift(shift)
    shifts.value = [...shifts.value, result]
    return result
  }

  /**
   * 更新班次
   */
  async function editShift(id, shift) {
    await updateShift(id, shift)
    shifts.value = shifts.value.map(s => (s.id === id ? { ...s, ...shift } : s))
  }

  /**
   * 删除班次
   */
  async function removeShift(id) {
    await deleteShift(id)
    shifts.value = shifts.value.filter(s => s.id !== id)
  }

  return {
    // 状态
    teams,
    shifts,
    loading,
    error,
    // 班组
    loadTeams,
    addTeam,
    editTeam,
    removeTeam,
    // 班次
    loadShifts,
    addShift,
    editShift,
    removeShift
  }
})

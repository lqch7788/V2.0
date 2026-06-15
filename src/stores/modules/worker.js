/**
 * 工人 Store - Pinia 状态管理
 * 迁移自 V1.1 useWorkerStore.ts（zustand）
 *
 * 数据流：Store → 组件 → API → 后端
 * 持久化：localStorage key 'workers'
 *
 * 与 V1.1 useWorkerStore.ts 1:1 对齐：
 * - state: workers / loading / error / lastFetch
 * - action: loadWorkers / refreshWorkers
 *
 * Worker 类型来自 V1.1 types/index.ts：
 * - id, workerId, name, gender, age, birthDate, idCard, photo
 * - phone, email, wechat, address
 * - departmentOid, departmentName, position, positionName
 * - skillLevel, skills, certifications
 * - hireDate, status, notes, createdAt
 *
 * V2.0 扩展：
 * - getter: activeWorkers / workersByDepartment
 * - action: fetchAllWorkers（强制刷新）
 * - 字典动态加载工人状态/类型选项
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'
import { getDictionaries } from '@/services/dictionaryService'

const STORAGE_KEY = 'workers'

export const useWorkerStore = defineStore('worker', () => {
  // ==================== 状态 ====================

  /** 工人列表 */
  const workers = ref([])
  /** 加载状态 */
  const loading = ref(false)
  /** 错误信息 */
  const error = ref(null)
  /** 上次加载时间戳（5 分钟缓存，对齐 V1.1） */
  const lastFetch = ref(null)

  // ----- 字典选项（V2.0 扩展） -----
  const workerStatusOptions = ref([])
  const workerTypeOptions = ref([])

  // ==================== Getters ====================

  /** 活跃工人列表（status === 'active'） */
  const activeWorkers = computed(() => workers.value.filter(w => w.status === 'active'))

  /**
   * 按部门分组工人
   * @param {string} departmentOid
   * @returns {Array}
   */
  const workersByDepartment = computed(() => {
    return (departmentOid) => workers.value.filter(w =>
      w.departmentOid === departmentOid || w.department_oid === departmentOid
    )
  })

  /** 按班组分组工人 */
  const workersByTeam = computed(() => {
    return (teamId) => workers.value.filter(w => w.teamId === teamId)
  })

  /** 工人总数 */
  const totalCount = computed(() => workers.value.length)

  // ==================== Actions ====================

  /**
   * 加载工人列表（对齐 V1.1 loadWorkers）
   * - 5 分钟缓存：lastFetch 距今 < 5min 且数据非空时直接返回
   */
  const loadWorkers = async () => {
    const now = Date.now()
    const lastFetchVal = lastFetch.value
    if (lastFetchVal && now - lastFetchVal < 5 * 60 * 1000 && workers.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null
    try {
      // V1.1 调用 getWorkerList()，对应 V2.0 后端 /labor/workers/active
      const data = await enhancedApiClient.get('/labor/workers/active')
      const list = Array.isArray(data) ? data : (data?.data || [])
      workers.value = list
      lastFetch.value = now
      // 同步到 localStorage
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch (_) { /* 忽略 */ }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载工人列表失败'
      console.warn('[WorkerStore] 加载工人列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  /** 强制刷新工人列表（对齐 V1.1 refreshWorkers） */
  const refreshWorkers = async () => {
    lastFetch.value = null
    await loadWorkers()
  }

  /**
   * 获取所有工人（含已停用），不经过 lastFetch 缓存
   * V2.0 扩展
   */
  const fetchAllWorkers = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await enhancedApiClient.get('/labor/workers')
      const list = Array.isArray(data) ? data : (data?.data || [])
      workers.value = list
      lastFetch.value = Date.now()
      return list
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载工人列表失败'
      console.warn('[WorkerStore] 加载所有工人失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ----- 字典选项加载（V2.0 扩展） -----

  /**
   * 加载工人状态下拉选项
   */
  const loadWorkerStatusOptions = async () => {
    if (workerStatusOptions.value.length > 0) return workerStatusOptions.value
    try {
      const dicts = await getDictionaries('worker_status')
      workerStatusOptions.value = (dicts || []).map(d => ({
        dictCode: d.code,
        dictLabel: d.name
      }))
    } catch (err) {
      console.warn('[WorkerStore] 加载工人状态字典失败:', err)
    }
    return workerStatusOptions.value
  }

  /**
   * 加载工人类型下拉选项
   */
  const loadWorkerTypeOptions = async () => {
    if (workerTypeOptions.value.length > 0) return workerTypeOptions.value
    try {
      const dicts = await getDictionaries('worker_type')
      workerTypeOptions.value = (dicts || []).map(d => ({
        dictCode: d.code,
        dictLabel: d.name
      }))
    } catch (err) {
      console.warn('[WorkerStore] 加载工人类型字典失败:', err)
    }
    return workerTypeOptions.value
  }

  return {
    // 状态
    workers,
    loading,
    error,
    lastFetch,
    workerStatusOptions,
    workerTypeOptions,
    // Getters
    activeWorkers,
    workersByDepartment,
    workersByTeam,
    totalCount,
    // Actions
    loadWorkers,
    refreshWorkers,
    fetchAllWorkers,
    loadWorkerStatusOptions,
    loadWorkerTypeOptions
  }
})

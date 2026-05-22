/**
 * 部门管理 Store - Pinia 版本
 * 对接后端: /api/basic-data/departments
 * 与V1.1 useDepartmentStore 功能完全一致
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

export const useDepartmentStore = defineStore('department', () => {
  // 状态 - 与V1.1一致的state定义
  const departments = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)

  // ==================== 字段映射 ====================

  /** 后端(snake_case) → 前端(camelCase) 字段名映射 */
  const FIELD_MAP = {
    id: 'id',
    oid: 'oid',
    code: 'code',
    name: 'name',
    parent_oid: 'parentOid',
    parent_name: 'parentName',
    manager_id: 'managerId',
    manager_name: 'managerName',
    sort_number: 'sortNumber',
    description: 'description',
    status: 'status',
    staff_count: 'staffCount',
    created_at: 'createdAt',
  }

  /**
   * 后端数据 → 前端数据（API 响应处理）
   */
  function normalize(raw) {
    const result = { ...raw }
    for (const [snake, camel] of Object.entries(FIELD_MAP)) {
      if (snake in result && !(camel in result)) {
        result[camel] = result[snake]
      }
    }
    result.id = result.id || result.oid || String(Date.now())
    result.status = result.status || 'active'
    return result
  }

  /**
   * 前端数据 → 后端数据（API 请求体处理）
   */
  function denormalize(data) {
    const result = {}
    const reverse = {}
    for (const [snake, camel] of Object.entries(FIELD_MAP)) {
      reverse[camel] = snake
    }
    for (const [key, value] of Object.entries(data)) {
      const backendKey = reverse[key] || key
      result[backendKey] = value
    }
    return result
  }

  /**
   * 加载部门列表
   * @param {Object} filters - 筛选条件
   */
  const loadDepartments = async (filters) => {
    const now = Date.now()
    // 5分钟内的缓存不重新加载
    if (lastFetch.value && now - lastFetch.value < 5 * 60 * 1000 && departments.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      }
      const query = params.toString()
      const response = await enhancedApiClient.get(`/basic-data/departments${query ? `?${query}` : ''}`)
      const data = Array.isArray(response) ? response : (response?.data || [])
      departments.value = data.map(normalize)
      lastFetch.value = now
    } catch (err) {
      error.value = err.message || '加载部门失败'
      console.warn('[DepartmentStore] API 加载失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加部门
   * @param {Object} dept - 部门数据
   * @returns {Object|null} 创建的部门
   */
  const addDepartment = async (dept) => {
    loading.value = true
    error.value = null
    try {
      const body = denormalize(dept)
      const response = await enhancedApiClient.post('/basic-data/departments', body)
      const saved = response?.data || response
      const newDept = normalize({ ...dept, ...saved })
      departments.value = [newDept, ...departments.value]
      return newDept
    } catch (err) {
      error.value = err.message || '创建部门失败'
      console.warn('[DepartmentStore] 创建失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新部门
   * @param {string} id - 部门ID
   * @param {Object} updates - 更新数据
   */
  const updateDepartment = async (id, updates) => {
    departments.value = departments.value.map(d =>
      d.id === id || d.oid === id ? { ...d, ...updates } : d
    )
    try {
      const body = denormalize(updates)
      await enhancedApiClient.put(`/basic-data/departments/${id}`, body)
    } catch (err) {
      error.value = err.message || '更新部门失败'
      console.warn('[DepartmentStore] 更新失败:', err)
    }
  }

  /**
   * 删除部门
   * @param {string} id - 部门ID
   * @returns {boolean} 是否删除成功
   */
  const removeDepartment = async (id) => {
    const original = [...departments.value]
    departments.value = departments.value.filter(d => d.id !== id && d.oid !== id)
    try {
      await enhancedApiClient.delete(`/basic-data/departments/${id}`)
      return true
    } catch (err) {
      error.value = err.message || '删除部门失败'
      departments.value = original
      console.warn('[DepartmentStore] 删除失败:', err)
      return false
    }
  }

  /**
   * 刷新部门列表
   */
  const refreshDepartments = async () => {
    lastFetch.value = null
    await loadDepartments()
  }

  return {
    departments,
    loading,
    error,
    lastFetch,
    loadDepartments,
    addDepartment,
    updateDepartment,
    removeDepartment,
    refreshDepartments
  }
})

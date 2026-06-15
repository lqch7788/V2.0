/**
 * 用户 Store - Pinia 状态管理
 * 迁移自 V1.1 useUserStore.ts（zustand）
 *
 * 数据流：Store → 组件 → API → 后端
 * 持久化：localStorage key 'users' + 'user'(当前用户)
 *
 * 与 V1.1 useUserStore.ts 1:1 对齐：
 * - state: users / loading / error / lastFetch
 * - action: loadUsers / refreshUsers
 * - 辅助函数: getUserByOid / getUsersByDepartment / getActiveUsers
 *
 * 在 V2.0 基础上扩展：
 * - getter: activeUsers / usersByRole / usersByDepartment
 * - action: createUser / updateUser / deleteUser
 * - 登录态: token / userInfo / login / logout（保留 V2.0 已有能力）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'user',
  TOKEN: 'token',
}

export const useUserStore = defineStore('user', () => {
  // ==================== 状态 ====================

  /** 用户列表（对齐 V1.1 users） */
  const users = ref([])
  /** 加载状态 */
  const loading = ref(false)
  /** 错误信息 */
  const error = ref(null)
  /** 上次加载时间戳（5 分钟缓存） */
  const lastFetch = ref(null)

  // ----- 登录态（V2.0 已有） -----
  const token = ref(localStorage.getItem(STORAGE_KEYS.TOKEN) || '')
  const userInfo = ref(null)
  const permissions = ref([])

  // ==================== Getters（对齐 V1.1 + V2.0 扩展）====================

  /** 活跃用户列表（status === 'active'）— 对齐 V1.1 getActiveUsers */
  const activeUsers = computed(() => users.value.filter(u => u.status === 'active'))

  /**
   * 按角色分组用户
   * @param {string} role - 角色标识
   * @returns {Array}
   */
  const usersByRole = computed(() => {
    return (role) => users.value.filter(u => {
      // 兼容多种角色字段：role / roles 数组
      if (Array.isArray(u.roles) && u.roles.length > 0) return u.roles.includes(role)
      return u.role === role
    })
  })

  /**
   * 按部门分组用户（对齐 V1.1 getUsersByDepartment）
   * @param {string} departmentOid - 部门 OID
   * @returns {Array}
   */
  const usersByDepartment = computed(() => {
    return (departmentOid) => users.value.filter(u =>
      u.departmentOid === departmentOid || u.department_oid === departmentOid
    )
  })

  /** 是否已登录（V2.0 已有） */
  const isLoggedIn = computed(() => !!token.value)
  const hasPermission = (code) => permissions.value.includes(code)

  // ==================== Actions ====================

  /**
   * 加载用户列表（对齐 V1.1 loadUsers）
   * - 防重入：loading 中直接返回
   * - 5 分钟缓存：lastFetch 距今 < 5min 且数据非空时直接返回
   */
  const loadUsers = async () => {
    if (loading.value) return
    if (users.value.length > 0 && lastFetch.value) {
      const now = Date.now()
      if (now - lastFetch.value < 5 * 60 * 1000) return
    }

    loading.value = true
    error.value = null
    try {
      const data = await enhancedApiClient.get('/authority/users')
      const list = Array.isArray(data) ? data : (data?.data || [])
      users.value = list
      lastFetch.value = Date.now()
      // 同步到 localStorage（V1.1 无此行为，V2.0 增强可观察性）
      try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list)) } catch (_) { /* 忽略 */ }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载用户失败'
      console.warn('[UserStore] 加载用户列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  /** 强制刷新用户列表（对齐 V1.1 refreshUsers） */
  const refreshUsers = async () => {
    lastFetch.value = null
    await loadUsers()
  }

  // ----- CRUD（V2.0 扩展） -----

  /**
   * 创建用户
   * @param {Partial<Object>} userData - 用户数据
   * @returns {Promise<Object|null>}
   */
  const createUser = async (userData) => {
    try {
      const result = await enhancedApiClient.post('/authority/users', userData)
      const saved = result?.data || result
      if (saved && saved.id) {
        users.value = [saved, ...users.value]
      }
      return saved || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建用户失败'
      console.warn('[UserStore] 创建用户失败:', err)
      throw err
    }
  }

  /**
   * 更新用户
   * @param {string} id - 用户 OID
   * @param {Partial<Object>} userData - 更新数据
   */
  const updateUser = async (id, userData) => {
    // 乐观更新
    const original = users.value
    users.value = users.value.map(u =>
      u.oid === id || u.id === id ? { ...u, ...userData } : u
    )
    try {
      await enhancedApiClient.put(`/authority/users/${id}`, userData)
    } catch (err) {
      // 回滚
      users.value = original
      error.value = err instanceof Error ? err.message : '更新用户失败'
      console.warn('[UserStore] 更新用户失败:', err)
      throw err
    }
  }

  /**
   * 删除用户
   * @param {string} id - 用户 OID
   */
  const deleteUser = async (id) => {
    const original = users.value
    users.value = users.value.filter(u => u.oid !== id && u.id !== id)
    try {
      await enhancedApiClient.delete(`/authority/users/${id}`)
    } catch (err) {
      users.value = original
      error.value = err instanceof Error ? err.message : '删除用户失败'
      console.warn('[UserStore] 删除用户失败:', err)
      throw err
    }
  }

  // ----- 登录态（V2.0 已有） -----

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    permissions.value = info.role ? [info.role] : []
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }

  /**
   * 用户登录（V2.0 已有，对接真实 API: POST /authority/auth/login）
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>}
   */
  const login = async (username, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await enhancedApiClient.post('/authority/auth/login', { username, password })
      if (!response?.token) {
        throw new Error('登录失败：未返回 token')
      }

      // 构建用户信息
      const user = {
        id: response.user?.id || 1,
        oid: response.user?.oid || '',
        username: response.user?.username || username,
        name: response.user?.real_name || response.user?.name || username,
        realName: response.user?.real_name || response.user?.name || username,
        orgOid: response.user?.org_oid || '',
        department: response.user?.department || '',
        departmentOid: response.user?.department_oid || response.user?.departmentOid || '',
        position: response.user?.position || '',
        role: response.user?.role || 'admin',
        email: response.user?.email || '',
        phone: response.user?.phone || '',
        status: response.user?.status || 'active',
        createdAt: new Date().toISOString()
      }

      setToken(response.token)
      setUserInfo(user)
      // 持久化当前用户（V1.1 无此行为，V2.0 增强可观察性）
      try { localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user)) } catch (_) { /* 忽略 */ }

      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      console.warn('[UserStore] 登录失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    users,
    loading,
    error,
    lastFetch,
    token,
    userInfo,
    permissions,
    // Getters
    activeUsers,
    usersByRole,
    usersByDepartment,
    isLoggedIn,
    hasPermission,
    // Actions
    loadUsers,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    setToken,
    setUserInfo,
    login,
    logout
  }
})

// ==================== 辅助函数（对齐 V1.1）====================

/**
 * 根据 OID 查找用户
 * @param {string} oid
 * @returns {Object|undefined}
 */
export const getUserByOid = (oid) => {
  return useUserStore().users.find(u => u.oid === oid)
}

/**
 * 根据部门 OID 获取用户列表
 * @param {string} departmentOid
 * @returns {Array}
 */
export const getUsersByDepartment = (departmentOid) => {
  return useUserStore().users.filter(u =>
    u.departmentOid === departmentOid || u.department_oid === departmentOid
  )
}

/**
 * 获取活跃用户列表
 * @returns {Array}
 */
export const getActiveUsers = () => {
  return useUserStore().users.filter(u => u.status === 'active')
}

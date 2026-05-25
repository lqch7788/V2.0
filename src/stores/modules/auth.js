/**
 * 认证与权限 Store (Pinia)
 *
 * 架构：enhancedApiClient → API → IndexedDB → localStorage (三级降级)
 * 数据流：Login → Store → 组件 (组件不直接读写 localStorage)
 *
 * 对接后端: /api/authority/*
 *
 * 基于 V1.1 useAuthStore.ts 完整迁移
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'
import { getProcessOidByRoute } from '@/lib/processRouteMap'

// ==================== 类型定义 ====================

/**
 * 当前登录用户信息
 * @typedef {Object} CurrentUser
 * @property {string} oid - 用户唯一标识
 * @property {string} username - 用户名
 * @property {string} realName - 真实姓名
 * @property {string} orgOid - 组织OID
 * @property {string} [email] - 邮箱
 * @property {string} [phone] - 电话
 * @property {string} [status] - 状态
 */
export const CurrentUserSchema = {
  oid: '',
  username: '',
  realName: '',
  orgOid: '',
  email: '',
  phone: '',
  status: ''
}

/**
 * 角色摘要
 * @typedef {Object} RoleSummary
 * @property {string} oid - 角色OID
 * @property {string} code - 角色代码
 * @property {string} name - 角色名称
 * @property {number} isSystem - 是否系统角色
 */
export const RoleSummarySchema = {
  oid: '',
  code: '',
  name: '',
  isSystem: 0
}

/**
 * 权限条目
 * @typedef {Object} AuthorityEntry
 * @property {string} processOid - 工序OID
 * @property {string} actionOid - 动作OID
 * @property {number} value - 权限值
 */
export const AuthorityEntrySchema = {
  processOid: '',
  actionOid: '',
  value: 0
}

/**
 * 用户特殊权限
 * @typedef {Object} UserAuthorityEntry
 * @property {string} userOid - 用户OID
 * @property {string} processOid - 工序OID
 * @property {string} actionOid - 动作OID
 * @property {number} value - 权限值 (1=强制允许, 0=强制拒绝, -1=清除覆盖)
 */
export const UserAuthorityEntrySchema = {
  userOid: '',
  processOid: '',
  actionOid: '',
  value: 0
}

/**
 * 权限摘要响应
 * @typedef {Object} MyPermissionsResponse
 * @property {CurrentUser} user - 当前用户
 * @property {RoleSummary[]} roles - 角色列表
 * @property {boolean} isAdmin - 是否管理员
 * @property {AuthorityEntry[]} authorities - 角色权限汇总
 * @property {AuthorityEntry[]} userAuthorities - 用户特殊权限
 * @property {string[]} dataOrgOids - 数据权限范围
 */
export const MyPermissionsResponseSchema = {
  user: CurrentUserSchema,
  roles: [],
  isAdmin: false,
  authorities: [],
  userAuthorities: [],
  dataOrgOids: []
}

// ==================== Store ====================

export const useAuthStore = defineStore('auth', () => {
  // ---------- 状态 ----------

  /** @type {import('vue').Ref<string|null>} */
  const token = ref(localStorage.getItem('token') || null)

  /** @type {import('vue').Ref<CurrentUser|null>} */
  const currentUser = ref(null)

  /** @type {import('vue').Ref<boolean>} */
  const isAuthenticated = ref(false)

  /** @type {import('vue').Ref<RoleSummary[]>} */
  const roles = ref([])

  /** @type {import('vue').Ref<boolean>} */
  const isAdmin = ref(false)

  /** @type {import('vue').Ref<AuthorityEntry[]>} */
  const authorities = ref([])

  /** @type {import('vue').Ref<AuthorityEntry[]>} */
  const userAuthorities = ref([])

  /** @type {import('vue').Ref<string[]>} */
  const dataOrgOids = ref([])

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null)

  // ---------- 计算属性 ----------

  const isLoggedIn = computed(() => !!token.value && isAuthenticated.value)

  // ---------- 工具方法 ----------

  /**
   * 从响应中安全提取 authority 条目（兼容 snake_case 和 camelCase）
   * @param {any} a
   * @returns {{ processOid: string, actionOid: string, value: number }}
   */
  function normalizeAuthorityEntry(a) {
    return {
      processOid: a.processOid || a.process_oid || '',
      actionOid: a.actionOid || a.action_oid || '',
      value: typeof a.value === 'number' ? a.value : (a.value === 'true' ? 1 : 0)
    }
  }

  // ---------- 登录 ----------

  /**
   * 用户登录
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async function login(username, password) {
    isLoading.value = true
    error.value = null

    try {
      const response = await enhancedApiClient.post('/authority/auth/login', { username, password })

      if (!response?.token) {
        error.value = '登录失败：未返回 token'
        return { success: false, error: error.value }
      }

      // 构建用户信息对象
      const rawUser = response.user || {}
      /** @type {CurrentUser} */
      const user = {
        oid: rawUser.oid || rawUser.id || '',
        username: rawUser.username || username,
        realName: rawUser.real_name || rawUser.realName || rawUser.name || username,
        orgOid: rawUser.org_oid || rawUser.orgOid || '',
        email: rawUser.email || '',
        phone: rawUser.phone || '',
        status: rawUser.status || 'active'
      }

      // 写入 localStorage，确保 enhancedApiClient 立即可读取
      localStorage.setItem('token', response.token)

      // 更新状态
      token.value = response.token
      currentUser.value = user
      isAuthenticated.value = true
      isLoading.value = false

      // 登录后自动加载权限
      await loadPermissions()

      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '登录失败'
      error.value = msg
      isLoading.value = false
      return { success: false, error: msg }
    }
  }

  // ---------- 登出 ----------

  /**
   * 用户登出
   */
  function logout() {
    token.value = null
    currentUser.value = null
    isAuthenticated.value = false
    roles.value = []
    isAdmin.value = false
    authorities.value = []
    userAuthorities.value = []
    dataOrgOids.value = []
    error.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userRoles')
  }

  // ---------- 加载权限 ----------

  /**
   * 加载用户权限
   * @returns {Promise<void>}
   */
  async function loadPermissions() {
    const currentToken = token.value
    if (!currentToken) return

    isLoading.value = true
    error.value = null

    try {
      const response = await enhancedApiClient.get('/authority/my-permissions')

      if (response) {
        const res = /** @type {MyPermissionsResponse} */ (response)
        roles.value = Array.isArray(res.roles) ? res.roles : []
        isAdmin.value = !!res.isAdmin
        authorities.value = Array.isArray(res.authorities)
          ? res.authorities.map(normalizeAuthorityEntry)
          : []
        userAuthorities.value = Array.isArray(res.userAuthorities)
          ? res.userAuthorities.map(normalizeAuthorityEntry)
          : []
        dataOrgOids.value = Array.isArray(res.dataOrgOids) ? res.dataOrgOids : []

        // 持久化到 localStorage
        localStorage.setItem('userRoles', JSON.stringify(roles.value))
        localStorage.setItem('isAdmin', String(isAdmin.value))
      }

      isLoading.value = false
    } catch (err) {
      console.warn('[AuthStore] 加载权限失败:', err)
      error.value = err instanceof Error ? err.message : '加载权限失败'
      isLoading.value = false
    }
  }

  // ---------- 验证 Token ----------

  /**
   * 验证 token 有效性
   * @returns {Promise<boolean>}
   */
  async function verifyToken() {
    const currentToken = token.value
    if (!currentToken) return false

    try {
      const response = await enhancedApiClient.get('/authority/verify')
      if (response?.success) {
        isAuthenticated.value = true
        await loadPermissions()
        return true
      }
      logout()
      return false
    } catch {
      logout()
      return false
    }
  }

  // ---------- 权限检查 ----------

  /**
   * 检查用户是否有特定工序的特定动作权限
   * Admin 直接返回 true
   * @param {string} processRoute - 页面路由路径（如 /dashboard），内部转为工序OID
   * @param {string} actionCode - 动作代码（如 view/create/edit/delete/export/approve）
   * @returns {boolean}
   */
  function hasPermission(processRoute, actionCode) {
    // Admin 拥有所有权限
    if (isAdmin.value) return true

    const processOid = getProcessOidByRoute(processRoute)
    if (!processOid) return false

    return authorities.value.some(a => {
      const pOid = a.processOid || a.process_oid
      const aOid = a.actionOid || a.action_oid
      return pOid === processOid && aOid === actionCode && a.value >= 1
    })
  }

  /**
   * 检查用户是否能访问某个工序（菜单）
   * 只要有该工序的任一 action 权限即视为可访问
   * @param {string} processRoute - 页面路由路径
   * @returns {boolean}
   */
  function canAccessProcess(processRoute) {
    // Admin 可以访问所有工序
    if (isAdmin.value) return true

    const processOid = getProcessOidByRoute(processRoute)
    if (!processOid) return false

    return authorities.value.some(a => {
      const pOid = a.processOid || a.process_oid
      return pOid === processOid && a.value >= 1
    })
  }

  /**
   * 从菜单路由列表中筛选用户可访问的路由
   * @param {string[]} allRoutes - 所有路由列表
   * @returns {string[]}
   */
  function getAccessibleMenuRoutes(allRoutes) {
    // Admin 可以访问所有路由
    if (isAdmin.value) return allRoutes

    return allRoutes.filter(route => canAccessProcess(route))
  }

  // ---------- 持久化相关 ----------

  /**
   * 从 localStorage 恢复登录状态
   */
  function restoreAuthState() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('currentUser')
    const savedRoles = localStorage.getItem('userRoles')
    const savedIsAdmin = localStorage.getItem('isAdmin')

    if (savedToken) {
      token.value = savedToken
      isAuthenticated.value = true
    }

    if (savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser)
      } catch {
        // ignore parse errors
      }
    }

    if (savedRoles) {
      try {
        roles.value = JSON.parse(savedRoles)
      } catch {
        // ignore parse errors
      }
    }

    if (savedIsAdmin !== null) {
      isAdmin.value = savedIsAdmin === 'true'
    }
  }

  return {
    // 状态
    token,
    currentUser,
    isAuthenticated,
    roles,
    isAdmin,
    authorities,
    userAuthorities,
    dataOrgOids,
    isLoading,
    error,

    // 计算属性
    isLoggedIn,

    // 方法
    login,
    logout,
    loadPermissions,
    verifyToken,
    hasPermission,
    canAccessProcess,
    getAccessibleMenuRoutes,
    restoreAuthState
  }
})

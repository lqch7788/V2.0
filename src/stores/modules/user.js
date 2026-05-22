import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const permissions = ref([])
  const users = ref([])  // 用户列表
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const hasPermission = (code) => permissions.value.includes(code)

  // 方法
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    permissions.value = info.role ? [info.role] : []
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
  }

  /**
   * 加载用户列表
   * 从后端获取所有用户
   */
  const loadUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await enhancedApiClient.get('/authority/users')
      users.value = Array.isArray(response) ? response : (response?.data || [])
    } catch (err) {
      error.value = err.message || '加载用户列表失败'
      console.warn('[UserStore] 加载用户列表失败:', err)
      users.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户登录
   * 调用真实API：POST /authority/auth/login
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
        position: response.user?.position || '',
        role: response.user?.role || 'admin',
        email: response.user?.email || '',
        phone: response.user?.phone || '',
        status: response.user?.status || 'active',
        createdAt: new Date().toISOString()
      }

      setToken(response.token)
      setUserInfo(user)
      localStorage.setItem('currentUser', JSON.stringify(user))

      return user
    } catch (err) {
      error.value = err.message || '登录失败'
      console.warn('[UserStore] 登录失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    userInfo,
    permissions,
    users,
    loading,
    error,
    isLoggedIn,
    hasPermission,
    setToken,
    setUserInfo,
    logout,
    login,
    loadUsers
  }
})

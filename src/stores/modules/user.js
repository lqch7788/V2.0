import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const permissions = ref([])

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
  }

  const login = async (username, password) => {
    // 模拟登录
    const mockToken = 'mock_token_' + Date.now()
    const mockUser = {
      id: 1,
      username: username,
      name: '管理员',
      department: '系统管理部',
      position: '系统管理员',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    }
    setToken(mockToken)
    setUserInfo(mockUser)
    return mockUser
  }

  return {
    token,
    userInfo,
    permissions,
    isLoggedIn,
    hasPermission,
    setToken,
    setUserInfo,
    logout,
    login
  }
})

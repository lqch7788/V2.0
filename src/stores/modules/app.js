import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const theme = ref('light')
  const size = ref('default')
  const sidebarCollapsed = ref(false)
  const loading = ref(false)

  // 计算属性
  const isDark = computed(() => theme.value === 'dark')

  // 方法
  const setTheme = (newTheme) => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const setSize = (newSize) => {
    size.value = newSize
    localStorage.setItem('size', newSize)
  }

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  // 初始化
  const init = () => {
    const savedTheme = localStorage.getItem('theme')
    const savedSize = localStorage.getItem('size')
    if (savedTheme) theme.value = savedTheme
    if (savedSize) size.value = savedSize
  }

  return {
    theme,
    size,
    sidebarCollapsed,
    loading,
    isDark,
    setTheme,
    toggleTheme,
    setSize,
    setSidebarCollapsed,
    toggleSidebar,
    setLoading,
    init
  }
})

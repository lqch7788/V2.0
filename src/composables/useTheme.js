import { ref, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores'

export function useTheme() {
  const appStore = useAppStore()
  const currentTheme = ref(appStore.theme)

  // 设置主题
  const setTheme = (theme) => {
    currentTheme.value = theme
    appStore.setTheme(theme)
    updateDOM(theme)
  }

  // 切换主题
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // 更新 DOM
  const updateDOM = (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
  }

  // 初始化
  onMounted(() => {
    updateDOM(currentTheme.value)
  })

  // 监听变化
  watch(currentTheme, (newTheme) => {
    updateDOM(newTheme)
  })

  return {
    theme: currentTheme,
    setTheme,
    toggleTheme
  }
}

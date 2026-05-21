import { ref, watch } from 'vue'

export function useStorage(key, defaultValue) {
  const data = ref(defaultValue)

  // 初始化
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      data.value = JSON.parse(stored)
    } catch {
      data.value = defaultValue
    }
  }

  // 监听变化
  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  const remove = () => {
    localStorage.removeItem(key)
    data.value = defaultValue
  }

  return {
    data,
    remove
  }
}

import { computed } from 'vue'
import { useUserStore } from '@/stores'

export function usePermission() {
  const userStore = useUserStore()

  const permissions = computed(() => userStore.permissions)
  const isAdmin = computed(() => userStore.userInfo?.role === 'admin')

  const hasPermission = (code) => {
    if (isAdmin.value) return true
    return permissions.value.includes(code)
  }

  const hasAnyPermission = (codes) => {
    if (isAdmin.value) return true
    return codes.some(code => permissions.value.includes(code))
  }

  const hasAllPermissions = (codes) => {
    if (isAdmin.value) return true
    return codes.every(code => permissions.value.includes(code))
  }

  const checkPermission = (code) => {
    return hasPermission(code)
  }

  return {
    permissions,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission
  }
}

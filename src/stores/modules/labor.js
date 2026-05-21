import { defineStore } from 'pinia'
import { ref } from 'vue'
import { laborApi } from '@/api/labor'

export const useLaborStore = defineStore('labor', () => {
  // 状态
  const attendanceList = ref([])
  const total = ref(0)
  const loading = ref(false)

  // 方法
  const fetchAttendance = async (params) => {
    loading.value = true
    try {
      const result = await laborApi.getAttendanceList(params)
      attendanceList.value = result.items
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  const applyRepair = async (data) => {
    await laborApi.applyAttendanceRepair(data)
  }

  return {
    attendanceList,
    total,
    loading,
    fetchAttendance,
    applyRepair
  }
})

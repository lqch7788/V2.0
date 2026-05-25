/**
 * 排班调度 Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref([])
  const swapRequests = ref([])
  const shiftConfigs = ref([
    { name: '早班', startTime: '06:00', endTime: '14:00', color: 'bg-blue-500' },
    { name: '中班', startTime: '14:00', endTime: '22:00', color: 'bg-amber-500' },
    { name: '晚班', startTime: '22:00', endTime: '06:00', color: 'bg-purple-500' },
  ])

  const todayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return schedules.value.filter(s => s.date === today).length
  })

  const executedCount = computed(() =>
    schedules.value.filter(s => s.status === '已执行').length
  )

  const pendingSwapCount = computed(() =>
    swapRequests.value.filter(r => r.status === '待审批').length
  )

  const addSchedule = (data) => {
    schedules.value.push({
      id: Date.now().toString(),
      ...data,
      status: '已排班',
      checkIn: '',
      checkOut: '',
    })
  }

  const cancelSchedule = (id) => {
    const s = schedules.value.find(s => s.id === id)
    if (s) s.status = '已取消'
  }

  const addSwapRequest = (data) => {
    swapRequests.value.push({
      id: Date.now().toString(),
      ...data,
      status: '待审批',
    })
  }

  const approveSwap = (id) => {
    const r = swapRequests.value.find(r => r.id === id)
    if (r) r.status = '已同意'
  }

  const rejectSwap = (id) => {
    const r = swapRequests.value.find(r => r.id === id)
    if (r) r.status = '已拒绝'
  }

  return {
    schedules,
    swapRequests,
    shiftConfigs,
    todayCount,
    executedCount,
    pendingSwapCount,
    addSchedule,
    cancelSchedule,
    addSwapRequest,
    approveSwap,
    rejectSwap,
  }
})

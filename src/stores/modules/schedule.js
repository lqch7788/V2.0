/**
 * 排班调度 Store
 * 从 V1.1 scheduleStore.ts 1:1 迁移
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'
// 与 V1.1 scheduleStore.ts L436 对齐：从 useWorkerStore 动态加载真实工人列表
import { useWorkerStore } from './worker'

// ========== 默认班次配置（与V1.1完全一致）==========
const DEFAULT_SHIFT_CONFIGS = [
  { name: '早班', startTime: '06:00', endTime: '14:00', color: 'bg-amber-500' },
  { name: '中班', startTime: '14:00', endTime: '22:00', color: 'bg-blue-500' },
  { name: '晚班', startTime: '22:00', endTime: '06:00', color: 'bg-indigo-600' },
  { name: '全天', startTime: '08:00', endTime: '20:00', color: 'bg-green-500' },
  { name: '弹性', startTime: '09:00', endTime: '18:00', color: 'bg-purple-500' },
]

// ========== 默认员工列表（fallback）==========
const DEFAULT_STAFF_LIST = [
  { id: 'S001', name: '郭靖', workZone: '1号棚' },
  { id: 'S002', name: '黄蓉', workZone: '2号棚' },
  { id: 'S003', name: '杨过', workZone: '3号棚' },
  { id: 'S004', name: '小龙女', workZone: '4号棚' },
  { id: 'S005', name: '令狐冲', workZone: '1号棚' },
  { id: 'S006', name: '任盈盈', workZone: '5号棚' },
  { id: 'S007', name: '张无忌', workZone: '2号棚' },
  { id: 'S008', name: '赵敏', workZone: '6号棚' },
]

// ========== 生成模拟排班数据（基于真实工人列表）==========
function generateMockSchedule(staffList) {
  if (staffList.length === 0) return []

  const records = []
  const today = new Date()
  const shifts = ['早班', '中班', '晚班', '全天', '弹性']

  for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today)
      date.setDate(today.getDate() + weekOffset * 7 + dayOffset)
      const dateStr = date.toISOString().split('T')[0]

      const staffCount = Math.min(2 + Math.floor(Math.random() * 3), staffList.length)
      const selectedStaff = [...staffList].sort(() => Math.random() - 0.5).slice(0, staffCount)

      selectedStaff.forEach((staff, idx) => {
        const shift = shifts[Math.floor(Math.random() * shifts.length)]
        const isToday = dateStr === today.toISOString().split('T')[0]
        const isPast = date < today && !isToday

        records.push({
          id: `SCH-${dateStr.replace(/-/g, '')}-${staff.id}`,
          staffId: staff.id,
          staffName: staff.name,
          date: dateStr,
          shift,
          workZone: staff.workZone,
          status: isPast ? '已执行' : (Math.random() > 0.1 ? '已排班' : '已取消'),
          checkIn: isPast && Math.random() > 0.3 ? `${6 + idx}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : '',
          checkOut: isPast && Math.random() > 0.5 ? `${14 + idx}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : '',
        })
      })
    }
  }

  return records
}

// ========== 生成模拟调班申请（与V1.1完全一致）==========
function generateMockSwapRequests() {
  return [
    {
      id: 'SWAP001',
      requesterId: 'S001',
      requesterName: '郭靖',
      targetId: 'S002',
      targetName: '黄蓉',
      originalDate: '2026-04-05',
      targetDate: '2026-04-07',
      reason: '家中有事，需要调班',
      status: '待审批',
      createTime: '2026-04-03 10:30:00',
    },
    {
      id: 'SWAP002',
      requesterId: 'S003',
      requesterName: '杨过',
      targetId: 'S004',
      targetName: '小龙女',
      originalDate: '2026-04-06',
      targetDate: '2026-04-08',
      reason: '临时会议冲突',
      status: '已同意',
      createTime: '2026-04-02 14:20:00',
    },
  ]
}

// ========== Store 实现 ==========
export const useScheduleStore = defineStore('schedule', () => {
  // 数据
  const schedules = ref([])
  const shiftConfigs = ref([...DEFAULT_SHIFT_CONFIGS])
  const staffList = ref([])
  const swapRequests = ref([])

  // 视图状态
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  const viewMode = ref('week')

  // 加载状态
  const isLoading = ref(false)
  const error = ref(null)

  // ========== 计算属性 ==========
  const todayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return schedules.value.filter(s => s.date === today).length
  })

  const executedCount = computed(() => {
    const date = new Date(selectedDate.value)
    const dayOfWeek = date.getDay()
    const monday = new Date(date)
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      weekDates.push(d.toISOString().split('T')[0])
    }
    return schedules.value.filter(s => s.status === '已执行' && weekDates.includes(s.date)).length
  })

  const pendingSwapCount = computed(() =>
    swapRequests.value.filter(r => r.status === '待审批').length
  )

  const monthCount = computed(() => {
    const date = new Date(selectedDate.value)
    return schedules.value.filter(s => {
      const d = new Date(s.date)
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    }).length
  })

  // ========== 方法 ==========

  // 初始化种子数据
  function initSeedData() {
    if (staffList.value.length === 0) {
      staffList.value = [...DEFAULT_STAFF_LIST]
    }
    if (schedules.value.length === 0) {
      schedules.value = generateMockSchedule(staffList.value)
    }
    if (swapRequests.value.length === 0) {
      swapRequests.value = generateMockSwapRequests()
    }
  }

  // 从API获取排班
  // 与 V1.1 scheduleStore.ts L203-245 fetchSchedules 1:1 对齐：
  // 先从真实工人库加载工人列表，再尝试 API，空/失败时回退本地种子数据
  async function fetchSchedules() {
    isLoading.value = true
    error.value = null

    // 先从真实工人库加载工人列表（V1.1 L207）
    await loadStaffFromWorkers()

    try {
      const apiSchedules = await enhancedApiClient.get('/schedules')
      if (apiSchedules && Array.isArray(apiSchedules) && apiSchedules.length > 0) {
        schedules.value = apiSchedules.map(s => ({
          ...s,
          staffId: s.staff_id || s.staffId,
          staffName: s.staff_name || s.staffName,
          workZone: s.work_zone || s.workZone,
          checkIn: s.check_in || s.checkIn,
          checkOut: s.check_out || s.checkOut,
        }))
        isLoading.value = false
        return
      }
      // API返回空，检查本地是否已有数据（V1.1 L228-234）
      if (schedules.value.length === 0) {
        initSeedData()
      } else {
        isLoading.value = false
      }
    } catch (e) {
      console.warn('[ScheduleStore] API获取失败，使用本地数据:', e)
      // API失败，检查本地是否已有数据（V1.1 L239-243）
      if (schedules.value.length === 0) {
        initSeedData()
      }
      error.value = e?.message || String(e)
      isLoading.value = false
    }
  }

  // 从 useWorkerStore 加载真实工人列表，映射为排班 Staff 格式
  // 与 V1.1 scheduleStore.ts L433-456 loadStaffFromWorkers 1:1 对齐
  async function loadStaffFromWorkers() {
    try {
      const workerStore = useWorkerStore()
      let workers = workerStore.workers

      // 如果工人数据尚未加载，主动触发加载（V1.1 L440-443）
      if (!workers || workers.length === 0) {
        await workerStore.loadWorkers()
        workers = workerStore.workers
      }

      if (workers && workers.length > 0) {
        staffList.value = workers.map(w => ({
          id: w.id || w.workerId || '',
          name: w.name || '',
          workZone: w.department || w.departmentName || w.workArea || '',
        }))
      }
    } catch (e) {
      console.warn('[ScheduleStore] 加载工人列表失败:', e)
    }
  }

  // 添加排班
  async function addSchedule(record) {
    const newRecord = {
      id: `SCH-${record.date.replace(/-/g, '')}-${record.staffId}-${Date.now()}`,
      ...record,
      status: record.status || '已排班',
      checkIn: record.checkIn || '',
      checkOut: record.checkOut || '',
    }
    schedules.value = [...schedules.value, newRecord]

    try {
      const apiRecord = {
        staff_id: record.staffId,
        staff_name: record.staffName,
        date: record.date,
        shift: record.shift,
        work_zone: record.workZone,
        status: record.status || '已排班',
        check_in: record.checkIn,
        check_out: record.checkOut,
      }
      await enhancedApiClient.post('/schedules', apiRecord)
    } catch (e) {
      console.warn('[ScheduleStore] 创建排班API失败:', e)
    }
    return newRecord
  }

  // 更新排班
  async function updateSchedule(id, updates) {
    schedules.value = schedules.value.map(s =>
      s.id === id ? { ...s, ...updates } : s
    )
    try {
      await enhancedApiClient.put(`/schedules/${id}`, updates)
    } catch (e) {
      console.warn('[ScheduleStore] 更新排班API失败:', e)
    }
  }

  // 删除排班
  async function deleteSchedule(id) {
    schedules.value = schedules.value.filter(s => s.id !== id)
    try {
      await enhancedApiClient.delete(`/schedules/${id}`)
    } catch (e) {
      console.warn('[ScheduleStore] 删除排班API失败:', e)
    }
  }

  // 取消排班
  async function cancelSchedule(id) {
    await updateSchedule(id, { status: '已取消' })
  }

  // 批量更新
  async function batchUpdateSchedule(ids, updates) {
    for (const id of ids) {
      await updateSchedule(id, updates)
    }
  }

  // 更新班次配置
  function updateShiftConfig(name, config) {
    shiftConfigs.value = shiftConfigs.value.map(cfg =>
      cfg.name === name ? { ...cfg, ...config } : cfg
    )
  }

  // 提交调班申请
  async function submitSwapRequest(request) {
    const newRequest = {
      ...request,
      id: `SWAP-${Date.now()}`,
      status: '待审批',
      createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
    }
    swapRequests.value = [...swapRequests.value, newRequest]
    try {
      await enhancedApiClient.post('/schedules/swap-requests', newRequest)
    } catch (e) {
      console.warn('[ScheduleStore] 提交调班申请API失败:', e)
    }
  }

  // 处理调班申请
  async function handleSwapRequest(id, status) {
    swapRequests.value = swapRequests.value.map(req =>
      req.id === id ? { ...req, status } : req
    )
    try {
      await enhancedApiClient.put(`/schedules/swap-requests/${id}`, { status })
      if (status === '已同意') {
        const request = swapRequests.value.find(r => r.id === id)
        if (request) {
          const originalSchedule = schedules.value.find(
            s => s.staffId === request.requesterId && s.date === request.originalDate
          )
          if (originalSchedule) {
            await updateSchedule(originalSchedule.id, {
              staffId: request.targetId,
              staffName: request.targetName,
            })
          }
        }
      }
    } catch (e) {
      console.warn('[ScheduleStore] 处理调班申请API失败:', e)
    }
  }

  // 视图控制
  function setSelectedDate(date) { selectedDate.value = date }
  function setViewMode(mode) { viewMode.value = mode }

  return {
    schedules,
    shiftConfigs,
    staffList,
    swapRequests,
    selectedDate,
    viewMode,
    isLoading,
    error,
    todayCount,
    executedCount,
    pendingSwapCount,
    monthCount,
    fetchSchedules,
    loadStaffFromWorkers,
    initSeedData,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    cancelSchedule,
    batchUpdateSchedule,
    updateShiftConfig,
    submitSwapRequest,
    handleSwapRequest,
    setSelectedDate,
    setViewMode,
  }
})

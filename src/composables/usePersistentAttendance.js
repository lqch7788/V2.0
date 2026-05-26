/**
 * 考勤持久化 Composable
 * 从 V1.1 usePersistentAttendance.ts 1:1迁移
 * 考勤数据保存到 localStorage
 */
import { ref } from 'vue'
import { loadFromStorage, saveToStorage, STORAGE_KEYS, clearAllPersistedData } from './useLocalStorage'

// 初始 mock 考勤数据（与V1.1完全一致）
const INITIAL_ATTENDANCE = [
  { id: 1, workerId: 'W001', name: '郭靖', dept: '生产部', date: '2024-03-14', checkIn: '07:50', checkOut: '18:10', hours: 10, status: '正常', statusClass: 'normal', taskId: 'T001', batchId: 'B001' },
  { id: 2, workerId: 'W002', name: '杨过', dept: '生产部', date: '2024-03-14', checkIn: '08:00', checkOut: '18:00', hours: 10, status: '正常', statusClass: 'normal', taskId: 'T002', batchId: 'B002' },
  { id: 3, workerId: 'W003', name: '张无忌', dept: '生产部', date: '2024-03-14', checkIn: '07:45', checkOut: '17:50', hours: 10, status: '正常', statusClass: 'normal', taskId: 'T003', batchId: 'B003' },
  { id: 4, workerId: 'W004', name: '令狐冲', dept: '技术部', date: '2024-03-13', checkIn: '08:10', checkOut: '18:00', hours: 9.5, status: '迟到', statusClass: 'warning', taskId: 'T004', batchId: 'B004' },
  { id: 5, workerId: 'W005', name: '段誉', dept: '生产部', date: '2024-03-13', checkIn: '-', checkOut: '-', hours: 0, status: '请假', statusClass: 'draft', taskId: undefined, batchId: 'B005' },
  { id: 6, workerId: 'W006', name: '黄蓉', dept: '仓储部', date: '2024-03-12', checkIn: '08:05', checkOut: '17:55', hours: 9.8, status: '正常', statusClass: 'normal', taskId: 'T004', batchId: 'B004' },
  { id: 7, workerId: 'W007', name: '陈家洛', dept: '生产部', date: '2024-03-12', checkIn: '07:30', checkOut: '18:30', hours: 11, status: '加班', statusClass: 'info', taskId: 'T006', batchId: 'B007' },
  { id: 8, workerId: 'W008', name: '任盈盈', dept: '生产部', date: '2024-03-11', checkIn: '08:20', checkOut: '18:00', hours: 9.7, status: '早退', statusClass: 'warning', taskId: 'T001', batchId: 'B001' },
]

let nextAttendanceId = INITIAL_ATTENDANCE.length + 1

/**
 * 考勤持久化 Composable
 */
export function usePersistentAttendance() {
  const attendance = ref(loadFromStorage(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE))

  // 持久化到 localStorage
  function persist() {
    saveToStorage(STORAGE_KEYS.ATTENDANCE, attendance.value)
  }

  // 添加考勤记录
  function addAttendance(entry) {
    const newEntry = { ...entry, id: nextAttendanceId++ }
    attendance.value = [newEntry, ...attendance.value]
    persist()
    return newEntry
  }

  // 更新考勤记录
  function updateAttendance(id, updates) {
    attendance.value = attendance.value.map(record =>
      record.id === id ? { ...record, ...updates } : record
    )
    persist()
  }

  // 删除考勤记录
  function deleteAttendance(id) {
    attendance.value = attendance.value.filter(record => record.id !== id)
    persist()
  }

  // 重置为初始数据
  function resetToInitial() {
    clearAllPersistedData()
    attendance.value = INITIAL_ATTENDANCE
    nextAttendanceId = INITIAL_ATTENDANCE.length + 1
  }

  return {
    attendance,
    addAttendance,
    updateAttendance,
    deleteAttendance,
    resetToInitial,
    resetAttendance: resetToInitial,
  }
}

export { INITIAL_ATTENDANCE }

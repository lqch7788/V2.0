/**
 * localStorage 持久化工具
 * 从 V1.1 useLocalStorage.ts 1:1迁移
 * Vue3 使用 ref + 直接 localStorage 操作
 */

const DATA_VERSION = 9

/** 存储键名常量（与V1.1完全一致） */
export const STORAGE_KEYS = {
  WORK_LOGS: 'yuanxingtu_worklogs',
  INSPECTION_RECORDS: 'yuanxingtu_inspections',
  ATTENDANCE: 'yuanxingtu_attendance',
  DAILY_PROBLEMS: 'yuanxingtu_daily_problems',
  TASKS: 'yuanxingtu_tasks',
  TEMP_TASKS: 'yuanxingtu_tempTasks',
  OPERATION_RECORDS: 'yuanxingtu_operationRecords',
  DISPATCH_RECORDS: 'yuanxingtu_dispatch_records',
  MY_TASKS: 'yuanxingtu_my_tasks',
  PROBLEM_ATTACHMENTS: 'yuanxingtu_problem_attachments',
  DISPATCH_MODE_CONFIG: 'yuanxingtu_dispatch_mode_config',
  TEAMS: 'yuanxingtu_teams',
  UNASSIGNED_WORKERS: 'yuanxingtu_unassigned_workers',
}

/** 从 localStorage 读取数据（带版本控制） */
export function loadFromStorage(key, initialValue) {
  try {
    const item = localStorage.getItem(key)
    if (!item) return initialValue

    const parsed = JSON.parse(item)
    // 带版本控制的数据格式
    if (parsed && typeof parsed.version !== 'undefined' && parsed.version == DATA_VERSION) {
      return parsed.data
    }
    // 旧格式直接使用
    return parsed
  } catch {
    return initialValue
  }
}

/** 保存数据到 localStorage（带版本控制） */
export function saveToStorage(key, value) {
  try {
    const data = { version: DATA_VERSION, data: value }
    localStorage.setItem(key, JSON.stringify(data))
  } catch { /* ignore */ }
}

/** 删除 localStorage 数据 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch { /* ignore */ }
}

/** 清空所有持久化数据 */
export function clearAllPersistedData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      localStorage.removeItem(key)
    } catch { /* ignore */ }
  })
}

/** 检查是否有持久化数据 */
export function hasPersistedData() {
  return Object.values(STORAGE_KEYS).some(key => {
    try {
      return localStorage.getItem(key) !== null
    } catch {
      return false
    }
  })
}

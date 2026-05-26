/**
 * 工单持久化 Composable
 * 从 V1.1 usePersistentWorkLogs.ts 1:1迁移
 * 工单数据保存到 localStorage，刷新页面不丢失
 */
import { ref } from 'vue'
import { loadFromStorage, saveToStorage, STORAGE_KEYS, clearAllPersistedData } from './useLocalStorage'

// 初始 mock 数据（与V1.1完全一致）
const INITIAL_WORK_LOGS = [
  {
    id: 1, code: 'WL20260314001', date: '2026-03-14', worker: '郭靖', weather: '晴', temperature: '25°C', crop: '番茄', greenhouse: '1号棚', growthStatus: '良好',
    tasks: '番茄授粉工作', problems: '无', solutions: '-',
    taskId: 'T001', batchId: 'B001', batchCode: 'FQ2026-001',
    taskCode: 'RW-20260301-001', taskType: 'spraying', taskTypeName: '施肥', progress: 100,
    workloadHours: 6, workloadDays: 1, workers: 2,
    submitTime: '2026-03-14T17:30:00Z', feedbackText: '已完成全部授粉任务'
  },
  {
    id: 2, code: 'WL20260314002', date: '2026-03-14', worker: '杨过', weather: '晴', temperature: '26°C', crop: '黄瓜', greenhouse: '2号棚', growthStatus: '良好',
    tasks: '黄瓜施肥和病虫害防治', problems: '发现少量蚜虫', solutions: '已喷洒吡虫啉',
    taskId: 'T002', batchId: 'B002', batchCode: 'FQ2026-002',
    taskCode: 'RW-20260302-001', taskType: 'fertilizing', taskTypeName: '施肥', progress: 80,
    workloadHours: 8, workloadDays: 1, workers: 1,
    submitTime: '2026-03-14T18:00:00Z', feedbackText: '发现蚜虫已处理，整体进度80%'
  },
  {
    id: 3, code: 'WL20260314003', date: '2026-03-14', worker: '张无忌', weather: '晴', temperature: '24°C', crop: '草莓', greenhouse: '3号棚', growthStatus: '一般',
    tasks: '草莓疏果和浇水', problems: '部分叶片发黄', solutions: '补充氮肥',
    taskId: 'T003', batchId: 'B003', batchCode: 'FQ2026-003',
    taskCode: 'RW-20260303-001', taskType: 'pruning', taskTypeName: '修剪', progress: 60,
    workloadHours: 5, workloadDays: 1, workers: 1,
    submitTime: '2026-03-14T16:45:00Z', feedbackText: '叶片发黄已补充氮肥'
  },
  {
    id: 4, code: 'WL20260313001', date: '2026-03-13', worker: '令狐冲', weather: '多云', temperature: '22°C', crop: '番茄', greenhouse: '1号棚', growthStatus: '良好',
    tasks: '番茄整枝和授粉', problems: '无', solutions: '-',
    taskId: 'T001', batchId: 'B001', batchCode: 'FQ2026-001',
    taskCode: 'RW-20260228-001', taskType: 'pruning', taskTypeName: '修剪', progress: 100,
    workloadHours: 7, workloadDays: 1, workers: 2,
    submitTime: '2026-03-13T17:00:00Z', feedbackText: '整枝授粉完成'
  },
  {
    id: 5, code: 'WL20260313002', date: '2026-03-13', worker: '段誉', weather: '多云', temperature: '23°C', crop: '辣椒', greenhouse: '4号棚', growthStatus: '良好',
    tasks: '辣椒浇水施肥', problems: '无', solutions: '-',
    taskId: 'T005', batchId: 'B005', batchCode: 'FQ2026-005',
    taskCode: 'RW-20260305-001', taskType: 'irrigation', taskTypeName: '灌溉', progress: 100,
    workloadHours: 4, workloadDays: 1, workers: 1,
    submitTime: '2026-03-13T15:30:00Z', feedbackText: '浇水施肥已完成'
  },
  {
    id: 6, code: 'WL20260312001', date: '2026-03-12', worker: '黄蓉', weather: '阴', temperature: '20°C', crop: '生菜', greenhouse: '5号棚', growthStatus: '良好',
    tasks: '生菜采收清洗', problems: '无', solutions: '-',
    taskId: 'T004', batchId: 'B004', batchCode: 'FQ2026-004',
    taskCode: 'RW-20260306-001', taskType: 'harvesting', taskTypeName: '采收', progress: 100,
    workloadHours: 10, workloadDays: 2, workers: 3,
    submitTime: '2026-03-12T18:30:00Z', feedbackText: '生菜采收完毕，共200kg'
  },
  {
    id: 7, code: 'WL20260312002', date: '2026-03-12', worker: '陈家洛', weather: '阴', temperature: '21°C', crop: '菠菜', greenhouse: '6号棚', growthStatus: '一般',
    tasks: '菠菜除草浇水', problems: '发现蜗牛', solutions: '已撒石灰驱除',
    taskId: undefined, batchId: 'B006', batchCode: 'FQ2026-006',
    taskCode: 'RW-20260307-001', taskType: 'weeding', taskTypeName: '除草', progress: 45,
    workloadHours: 3, workloadDays: 1, workers: 1,
    submitTime: '2026-03-12T14:20:00Z', feedbackText: '发现蜗牛，已用石灰处理'
  },
]

let nextWorkLogId = INITIAL_WORK_LOGS.length + 1

/**
 * 工单持久化 Composable
 */
export function usePersistentWorkLogs() {
  const workLogs = ref(loadFromStorage(STORAGE_KEYS.WORK_LOGS, INITIAL_WORK_LOGS))

  // 持久化到 localStorage
  function persist() {
    saveToStorage(STORAGE_KEYS.WORK_LOGS, workLogs.value)
  }

  // 添加新工单
  function addWorkLog(entry) {
    const newEntry = { ...entry, id: nextWorkLogId++ }
    workLogs.value = [newEntry, ...workLogs.value]
    persist()
    return newEntry
  }

  // 更新工单
  function updateWorkLog(id, updates) {
    workLogs.value = workLogs.value.map(log =>
      log.id === id ? { ...log, ...updates } : log
    )
    persist()
  }

  // 删除工单
  function deleteWorkLog(id) {
    workLogs.value = workLogs.value.filter(log => log.id !== id)
    persist()
  }

  // 重置为初始数据
  function resetToInitial() {
    clearAllPersistedData()
    workLogs.value = INITIAL_WORK_LOGS
    nextWorkLogId = INITIAL_WORK_LOGS.length + 1
  }

  // 生成新的工单编号 (WL+年月日+3位数流水号)
  function generateWorkLogCode() {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

    const todayPrefix = `WL${dateStr}`
    const todayLogs = workLogs.value.filter(log => log.code && log.code.startsWith(todayPrefix))

    let maxSeq = 0
    todayLogs.forEach(log => {
      const seqStr = log.code.replace(todayPrefix, '')
      const seq = parseInt(seqStr, 10)
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
    })

    const nextSeq = maxSeq + 1
    return `WL${dateStr}${String(nextSeq).padStart(3, '0')}`
  }

  // 按任务ID查询工单
  function getWorkLogsByTaskId(taskId) {
    return workLogs.value.find(log => log.taskId === taskId)
  }

  // 按任务ID更新工单
  function updateWorkLogByTaskId(taskId, updates) {
    workLogs.value = workLogs.value.map(log =>
      log.taskId === taskId ? { ...log, ...updates } : log
    )
    persist()
  }

  // 从任务进度创建或更新工单（用于每日工单汇总对接）
  function syncWorkLogFromTask(task, progressUpdate) {
    const today = new Date().toISOString().slice(0, 10)
    const existingLog = workLogs.value.find(log => log.taskId === task.id)

    if (existingLog) {
      const updatedLog = {
        ...existingLog,
        tasks: task.title,
        solutions: progressUpdate.notes || existingLog.solutions,
        date: today,
        progress: progressUpdate.progress,
        workloadHours: progressUpdate.workloadHours,
        workloadDays: progressUpdate.workloadDays,
        workers: progressUpdate.workers,
        feedbackText: progressUpdate.notes,
        submitTime: new Date().toISOString(),
      }
      workLogs.value = workLogs.value.map(log =>
        log.id === existingLog.id ? updatedLog : log
      )
      persist()
      return updatedLog
    } else {
      const newLog = {
        id: nextWorkLogId++,
        code: generateWorkLogCode(),
        date: today,
        worker: task.assigneeName,
        weather: '',
        temperature: '',
        crop: task.cropName,
        greenhouse: task.greenhouseName,
        growthStatus: '良好',
        tasks: task.title,
        problems: '',
        solutions: progressUpdate.notes || '',
        taskId: task.id,
        batchId: task.batchId,
        batchCode: task.batchCode,
        taskCode: task.taskCode,
        taskType: task.type,
        taskTypeName: task.typeName,
        progress: progressUpdate.progress,
        workloadHours: progressUpdate.workloadHours,
        workloadDays: progressUpdate.workloadDays,
        workers: progressUpdate.workers,
        submitTime: new Date().toISOString(),
        feedbackText: progressUpdate.notes,
      }
      workLogs.value = [newLog, ...workLogs.value]
      persist()
      return newLog
    }
  }

  return {
    workLogs,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    resetToInitial,
    resetWorkLogs: resetToInitial,
    generateWorkLogCode,
    getWorkLogsByTaskId,
    updateWorkLogByTaskId,
    syncWorkLogFromTask,
  }
}

export { INITIAL_WORK_LOGS }

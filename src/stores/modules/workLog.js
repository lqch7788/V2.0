/**
 * 工作日志 Pinia Store
 * 数据持久化到 localStorage（与V1.1 Zustand persist逻辑一致）
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'worklog-storage'

/** 读取localStorage中的种子/持久化数据 */
function loadInitialData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.state?.workLogs?.length) return parsed.state.workLogs
    }
  } catch { /* ignore */ }
  return [
    { id: 1, code: 'WL20240301', date: '2024-03-14', worker: '郭靖', weather: '晴', temperature: '25°C', crop: '番茄', greenhouse: '1号棚', growthStatus: '良好', tasks: '授粉、浇水', problems: '无', solutions: '-', taskId: 'T001', batchId: 'B001', batchCode: 'FQ2024-001' },
    { id: 2, code: 'WL20240302', date: '2024-03-14', worker: '杨过', weather: '晴', temperature: '26°C', crop: '黄瓜', greenhouse: '2号棚', growthStatus: '良好', tasks: '施肥、病虫害防治', problems: '发现少量蚜虫', solutions: '已喷洒吡虫啉', taskId: 'T002', batchId: 'B002', batchCode: 'FQ2024-002' },
    { id: 3, code: 'WL20240303', date: '2024-03-14', worker: '张无忌', weather: '晴', temperature: '24°C', crop: '草莓', greenhouse: '3号棚', growthStatus: '一般', tasks: '疏果、浇水', problems: '部分叶片发黄', solutions: '补充氮肥', taskId: 'T003', batchId: 'B003', batchCode: 'FQ2024-003' },
    { id: 4, code: 'WL20240304', date: '2024-03-13', worker: '令狐冲', weather: '多云', temperature: '22°C', crop: '番茄', greenhouse: '1号棚', growthStatus: '良好', tasks: '整枝、授粉', problems: '无', solutions: '-', taskId: 'T001', batchId: 'B001', batchCode: 'FQ2024-001' },
    { id: 5, code: 'WL20240305', date: '2024-03-13', worker: '段誉', weather: '多云', temperature: '23°C', crop: '辣椒', greenhouse: '4号棚', growthStatus: '良好', tasks: '浇水、施肥', problems: '无', solutions: '-', taskId: 'T005', batchId: 'B005', batchCode: 'FQ2024-005' },
    { id: 6, code: 'WL20240306', date: '2024-03-12', worker: '黄蓉', weather: '阴', temperature: '20°C', crop: '生菜', greenhouse: '5号棚', growthStatus: '良好', tasks: '采收、清洗', problems: '无', solutions: '-', taskId: 'T004', batchId: 'B004', batchCode: 'FQ2024-004' },
    { id: 7, code: 'WL20240307', date: '2024-03-12', worker: '陈家洛', weather: '阴', temperature: '21°C', crop: '菠菜', greenhouse: '6号棚', growthStatus: '一般', tasks: '除草、浇水', problems: '发现蜗牛', solutions: '已撒石灰驱除', taskId: undefined, batchId: 'B006', batchCode: 'FQ2024-006' },
    { id: 8, code: 'WL20240308', date: '2024-03-11', worker: '任盈盈', weather: '晴', temperature: '24°C', crop: '番茄', greenhouse: '1号棚', growthStatus: '良好', tasks: '绑蔓、修剪', problems: '无', solutions: '-', taskId: 'T001', batchId: 'B001', batchCode: 'FQ2024-001' },
  ]
}

export const useWorkLogStore = defineStore('workLog', () => {
  const workLogs = ref(loadInitialData())
  const filters = ref({ date: '', worker: '', greenhouse: '全部' })

  /** 保存到localStorage */
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { workLogs: workLogs.value } }))
    } catch { /* ignore quota errors */ }
  }

  /** 生成新日志编号 WL+年月日+3位流水号 */
  function generateCode() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const prefix = `WL${today}`
    const todayLogs = workLogs.value.filter(l => l.code?.startsWith(prefix))
    let maxSeq = 0
    todayLogs.forEach(l => {
      const seq = parseInt((l.code || '').replace(prefix, ''), 10)
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
    })
    return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`
  }

  function addWorkLog(data) {
    const newId = Math.max(0, ...workLogs.value.map(l => l.id)) + 1
    const newLog = {
      id: newId,
      code: data.code || generateCode(),
      date: data.date || new Date().toISOString().split('T')[0],
      worker: data.worker || '',
      weather: data.weather || '晴',
      temperature: data.temperature || '',
      crop: data.crop || '',
      greenhouse: data.greenhouse || '',
      growthStatus: data.growthStatus || '良好',
      tasks: data.tasks || '',
      problems: data.problems || '无',
      solutions: data.solutions || '-',
      taskId: data.taskId,
      batchId: data.batchId,
      batchCode: data.batchCode,
      taskCode: data.taskCode,
      taskType: data.taskType,
      taskTypeName: data.taskTypeName,
      progress: data.progress,
      workloadHours: data.workloadHours,
      workloadDays: data.workloadDays,
      workers: data.workers,
      submitTime: data.submitTime || new Date().toISOString(),
      feedbackText: data.feedbackText,
    }
    workLogs.value = [newLog, ...workLogs.value]
    persist()
    return newLog
  }

  function updateWorkLog(id, updates) {
    workLogs.value = workLogs.value.map(log =>
      log.id === id ? { ...log, ...updates } : log
    )
    persist()
  }

  function deleteWorkLog(id) {
    workLogs.value = workLogs.value.filter(log => log.id !== id)
    persist()
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    workLogs,
    filters,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    setFilters,
    generateCode,
  }
})

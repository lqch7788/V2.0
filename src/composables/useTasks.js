/**
 * 统一任务管理 Composable
 * 从 V1.1 src/hooks/useTasks.ts 1:1迁移
 *
 * 数据层：
 * - 农事任务：farmTaskStore (Pinia) → enhancedApiClient → API
 * - 临时任务：tempTaskStore (Pinia)
 * - 巡查记录：inspectionDataStore (Pinia)
 * - 操作记录/催办记录：localStorage
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useFarmTaskStore } from '@/stores/modules/farmTask'
import { useTempTaskStore } from '@/stores/modules/tempTask'
import { useInspectionDataStore } from '@/stores/modules/inspectionData'
import { usePersistentWorkLogs } from './usePersistentWorkLogs'
import { usePersistentAttendance } from './usePersistentAttendance'
import { enhancedApiClient } from '@/lib/apiClient'
import { STORAGE_KEYS, saveToStorage, loadFromStorage, clearAllPersistedData } from './useLocalStorage'
import {
  TASK_ACTION_CONFIG,
  TASK_STATUS_CONFIG,
  OVERTIME_CONFIG,
  DEADLINE_CONFIG,
  REMINDER_CONFIG,
  REWORK_CONFIG,
  STORAGE_CONFIG,
  detectOvertime as detectOvertimeFn,
} from '@/config/taskConfig'

// ========== 辅助函数 ==========

/** 检查存储容量 */
function checkStorageCapacity() {
  try {
    let totalSize = 0
    const keys = Object.values(STORAGE_KEYS)
    for (const key of keys) {
      const item = localStorage.getItem(key)
      if (item) totalSize += item.length
    }
    const limitKB = 5120 // 5MB
    const usedKB = totalSize / 1024
    if (usedKB > limitKB * 0.9) {
      return { ok: false, message: `存储容量接近上限(${usedKB.toFixed(0)}KB/${limitKB}KB)` }
    }
    return { ok: true }
  } catch {
    return { ok: true }
  }
}

/** 根据任务来源路由到正确的 Store */
function getStoreForTask(task) {
  if (task.dispatchMode === 'tempTask' || task.sourceType === 'tempTask') {
    const store = useTempTaskStore()
    return {
      updateTask: (id, updates) => store.updateTask(id, updates),
      deleteTask: (id) => store.deleteTask(id),
    }
  }
  if (task.dispatchMode === 'inspection') {
    const store = useInspectionDataStore()
    return {
      updateTask: (id, updates) => store.updateRecord(id, updates),
      deleteTask: (id) => store.deleteRecord(id),
    }
  }
  const store = useFarmTaskStore()
  return {
    updateTask: (id, updates) => store.updateTask(id, updates),
    deleteTask: (id) => store.removeTask(id),
  }
}

// ========== Store → Task 转换函数（与V1.1完全一致）==========

const PROGRESS_MAP = {
  pending: 0,
  accepted: 0,
  in_progress: 50,
  waiting_acceptance: 100,
  completed: 100,
  rejected: 0,
}

/** 将 farmTaskStore 数据转换为统一 Task 格式 */
function convertStoreFarmTaskToTask(t) {
  const rawFeedbackList = (t.feedbackRequirements || t.requiredFeedback || []).map(f => {
    if (typeof f === 'string') return f
    if (typeof f === 'object' && f !== null && 'type' in f) return f.type
    return ''
  }).filter(Boolean)

  const defaultFeedback = (t.feedbackRequirements || t.requiredFeedback || []).map(f => {
    if (typeof f === 'string') {
      const feedbackMap = {
        gps: { type: 'gps', label: 'GPS位置', required: true },
        photo_before: { type: 'image_before', label: '作业前照片', required: true },
        photo_after: { type: 'image_after', label: '作业后照片', required: true },
        material: { type: 'materials', label: '物料使用', required: true },
      }
      return feedbackMap[f] || { type: 'text', label: f, required: false }
    }
    return f
  })

  return {
    id: t.id || '',
    taskCode: t.taskCode || t.id || '',
    title: t.title || '',
    type: t.type || 'other',
    typeName: t.typeName || t.type || '其他',
    status: t.status || 'pending',
    priority: t.priority || 'normal',
    progress: t.progress || 0,
    sourceType: t.sourceType || 'dispatch',
    dispatchMode: t.dispatchMode || 'farm',
    assigneeId: t.assigneeId || '',
    assigneeName: t.assigneeName || '',
    assignerId: t.assignerId || '',
    assignerName: t.assignerName || '',
    dueDate: t.dueDate || '',
    startTime: t.startTime || undefined,
    greenhouseId: t.greenhouseId || '',
    greenhouseName: t.greenhouseName || '',
    cropName: t.cropName || '',
    types: (() => {
      const raw = t.types
      if (Array.isArray(raw) && raw.length > 0) return raw
      const typeStr = t.type || t.typeName || ''
      return typeStr ? typeStr.split(',').map(s => s.trim()).filter(Boolean) : []
    })(),
    field: t.field || t.greenhouseName || '',
    assignee: t.assignee || t.assigneeName || '',
    crop: t.crop || t.cropName || '',
    planStart: t.planStart || '',
    planEnd: t.planEnd || '',
    estimatedDays: t.estimatedDays || 0,
    estimatedHours: t.estimatedHours || 0,
    feedbackRequirements: defaultFeedback,
    requiredFeedback: rawFeedbackList,
    materials: t.materials || [],
    tools: t.tools || [],
    sopContent: t.sopContent || '',
    typeConfig: t.typeConfig || {},
    sourceProblemId: t.sourceProblemId || undefined,
    sourceInspectionId: t.sourceInspectionId || undefined,
    reworkCount: t.reworkCount || 0,
    reworkHistory: t.reworkHistory || [],
    deadlineExtensions: t.deadlineExtensions || [],
    version: t.version || 1,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
  }
}

/** 将 tempTaskStore 数据转换为统一 Task 格式 */
function convertStoreTempTaskToTask(t) {
  const id = t.taskCode || t.id || ''
  const title = t.title || t.task_title || ''
  const type = t.type || t.task_type || ''
  const assigneeId = t.assigneeId || t.assignee_id || ''
  const assigneeName = t.assigneeName || t.assignee_name || ''
  const requesterId = t.requesterId || t.requester_id || ''
  const requesterName = t.requesterName || t.requester_name || ''
  const location = t.location || t.greenhouseName || t.greenhouse_name || t.area_name || ''
  const greenhouseId = t.greenhouseId || t.greenhouse_id || ''
  const greenhouseName = t.greenhouseName || t.greenhouse_name || location || ''
  const createdAt = t.createdAt || t.createTime || t.create_time || new Date().toISOString()
  const status = t.status || 'pending'

  return {
    id,
    taskCode: id,
    title,
    type: type || 'other',
    typeName: t.typeName || t.task_type_name || type || '其他',
    status,
    priority: t.priority || t.urgency || 'normal',
    progress: t.progress || 0,
    sourceType: 'tempTask',
    dispatchMode: 'tempTask',
    assigneeId,
    assigneeName,
    assignerId: requesterId,
    assignerName: requesterName,
    dueDate: t.dueDate || '',
    feedbackRequirements: [],
    greenhouseId,
    greenhouseName,
    cropName: '',
    field: location,
    reworkCount: t.rejectCount || 0,
    reworkHistory: [],
    deadlineExtensions: [],
    version: 1,
    createdAt,
    updatedAt: t.updatedAt || t.updateTime || t.update_time || createdAt,
    acceptedAt: undefined,
    completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    workLocation: location,
    urgency: t.urgency || 'normal',
    tempTaskType: type,
    estimatedDays: 0,
    estimatedHours: t.estimatedHours || 0,
    workerCount: t.workerCount || 1,
    remarks: t.remarks || t.description || '',
    requiredFeedback: [],
    startDate: '',
  }
}

/** 将 inspectionDataStore 数据转换为统一 Task 格式 */
function convertStoreInspectionToTask(t) {
  const id = t.id || ''
  const recordCode = t.recordCode || t.record_code || id
  const greenhouseName = t.greenhouseName || t.greenhouse_name || '园区'
  const inspectorId = t.inspectorId || t.inspector_id || ''
  const inspectorName = t.inspectorName || t.inspector_name || ''
  const checkDate = t.checkDate || t.check_date || ''
  const checkTime = t.checkTime || t.check_time || '08:00'
  const issues = Array.isArray(t.issues) ? t.issues : []
  const feedbackUsers = Array.isArray(t.feedbackUsers) ? t.feedbackUsers : []
  const assigneeName = feedbackUsers.length > 0 ? feedbackUsers[0] : inspectorName
  const status = t.status || 'pending'
  const issueSeverity = t.issueSeverity || t.issue_severity || '轻微'

  return {
    id,
    taskCode: recordCode,
    title: `${greenhouseName} 巡查反馈`,
    type: 'other',
    typeName: '巡查反馈处理',
    status,
    priority: issueSeverity === '严重' ? 'high' : 'normal',
    progress: PROGRESS_MAP[status] || 0,
    sourceType: 'dispatch',
    dispatchMode: 'inspection',
    assigneeId: feedbackUsers.length > 0 ? `EMP_${assigneeName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)}` : '',
    assigneeName,
    assignerId: inspectorId,
    assignerName: inspectorName,
    dueDate: checkDate,
    startTime: undefined,
    greenhouseId: t.greenhouseId || t.greenhouse_id || '',
    greenhouseName,
    cropName: t.cropName || '',
    types: issues,
    field: greenhouseName,
    assignee: assigneeName,
    crop: t.cropName || '',
    planStart: checkDate ? `${checkDate} ${checkTime}` : '',
    planEnd: checkDate ? `${checkDate} 17:00` : '',
    estimatedDays: 1,
    estimatedHours: 8,
    feedbackRequirements: [],
    materials: [],
    tools: [],
    sopContent: '',
    typeConfig: {},
    sourceProblemId: undefined,
    sourceInspectionId: id,
    sourceId: id,
    recordCode,
    inspectionType: t.inspectionType || t.inspection_type || '',
    submitterId: inspectorId,
    submitterName: inspectorName,
    location: greenhouseName,
    checkDate,
    checkTime,
    checkResult: t.checkResult || t.check_result || (issueSeverity === '严重' ? '严重' : issueSeverity === '中等' ? '异常' : '轻微'),
    issueCategories: issues,
    issueSeverity,
    issueText: t.issueText || t.issue_text || '',
    photos: Array.isArray(t.images) ? t.images : [],
    feedbackStatus: status === 'pending' ? '待接受' : status === 'in_progress' ? '处理中' : status === 'rejected' ? '已返工' : status === 'waiting_acceptance' ? '待验收' : status === 'completed' ? '已完成' : '未知',
    feedbackUsers,
    processProgress: PROGRESS_MAP[status] ? String(PROGRESS_MAP[status]) : '0',
    inspectorId,
    inspectorName,
    reworkCount: 0,
    reworkHistory: [],
    deadlineExtensions: [],
    version: 1,
    createdAt: t.createdAt || t.createTime || t.create_time || (checkDate ? `${checkDate}T${checkTime}:00Z` : new Date().toISOString()),
    updatedAt: t.updatedAt || t.updateTime || t.update_time || new Date().toISOString(),
  }
}

// ========== 超时检测（与V1.1完全一致）==========
function detectOvertime(task) {
  return detectOvertimeFn(task)
}

// ========== 操作记录存储键 ==========
const RECORDS_KEY = `${STORAGE_KEYS.TASKS}_records`
const REMINDERS_KEY = `${STORAGE_KEYS.TASKS}_reminders`

/**
 * useTasks Composable
 * 返回与 V1.1 useTasks 完全相同的 API
 */
export function useTasks() {
  const farmTaskStore = useFarmTaskStore()
  const tempTaskStore = useTempTaskStore()
  const inspectionDataStore = useInspectionDataStore()

  // 工单汇总同步
  const { syncWorkLogFromTask } = usePersistentWorkLogs()

  // 考勤记录
  const { attendance, addAttendance, updateAttendance } = usePersistentAttendance()

  // ========== 响应式数据：合并三个 Store 的数据为统一 Task 格式 ==========
  const tasks = computed(() => {
    const farmTasks = farmTaskStore.tasks.map(convertStoreFarmTaskToTask)
    const convertedTempTasks = tempTaskStore.tasks.map(convertStoreTempTaskToTask)
    const convertedInspectionTasks = inspectionDataStore.records.map(convertStoreInspectionToTask)
    const all = [...farmTasks, ...convertedTempTasks, ...convertedInspectionTasks]
    return Array.isArray(all) ? all : []
  })

  // 初始化：触发三个 Store 从 API 拉取数据
  onMounted(() => {
    farmTaskStore.fetchTasks()
    tempTaskStore.fetchTasks()
    inspectionDataStore.fetchRecords()
  })

  // 操作记录
  const taskRecords = ref(loadFromStorage(RECORDS_KEY, []))
  // 使用一个单独的 ref 保存最新值（避免闭包问题）
  const taskRecordsRef = ref(loadFromStorage(RECORDS_KEY, []))

  // 催办记录
  const reminderRecords = ref(loadFromStorage(REMINDERS_KEY, []))

  // 同步 taskRecords → taskRecordsRef
  watch(taskRecords, (val) => { taskRecordsRef.value = val }, { deep: true })

  // ========== 存储容量管理 ==========

  function ensureStorageCapacity() {
    const cap = checkStorageCapacity()
    if (!cap.ok) {
      console.warn(`[useTasks] ${cap.message}，自动修剪旧操作记录`)
      const stored = loadFromStorage(RECORDS_KEY, [])
      if (stored.length > STORAGE_CONFIG.maxRecords) {
        const trimmed = stored.slice(-STORAGE_CONFIG.maxRecords)
        saveToStorage(RECORDS_KEY, trimmed)
        taskRecordsRef.value = trimmed
        taskRecords.value = trimmed
      }
    }
  }

  // 保存操作记录到 localStorage（与V1.1完全一致）
  function saveTaskRecords(records) {
    taskRecordsRef.value = records
    taskRecords.value = records
    ensureStorageCapacity()
    saveToStorage(RECORDS_KEY, records)
  }

  // 保存催办记录到 localStorage
  function saveReminderRecords(records) {
    reminderRecords.value = records
    ensureStorageCapacity()
    saveToStorage(REMINDERS_KEY, records)
  }

  // ========== 创建操作记录（与V1.1 createTaskRecord 完全一致）==========
  function createTaskRecord(task, action, fromStatus, options = {}) {
    const now = new Date()
    const nowStr = now.toISOString().split('T')[0]
    return {
      id: `TR_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      taskId: task.id,
      taskCode: task.taskCode,
      taskTitle: task.title,
      operatorId: task.assigneeId,
      operatorName: task.assigneeName,
      action,
      actionName: TASK_ACTION_CONFIG[action]?.label || action,
      fromStatus,
      toStatus: task.status,
      progress: options.progress ?? task.progress,
      progressIncrement: options.progressIncrement,
      feedback: options.feedback,
      comment: options.comment,
      reason: options.reason,
      actionTime: now.toISOString(),
      createdAt: nowStr,
    }
  }

  // ========== 查询 ==========

  function getTask(id) {
    return tasks.value.find(t => t.id === id)
  }

  function getTasksByAssignee(assigneeId) {
    return tasks.value.filter(t => t.assigneeId === assigneeId)
  }

  function getTaskRecordsByTaskId(taskId) {
    return taskRecords.value.filter(r => r.taskId === taskId)
  }

  // ========== 创建任务 ==========

  async function createTask(taskData, dispatchMode, initialStatus) {
    const now = new Date().toISOString()
    const finalAssigneeName = taskData.assigneeName || taskData.assignee || ''
    const finalAssigneeId = taskData.assigneeId ||
      (finalAssigneeName ? `EMP_${finalAssigneeName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)}` : '')

    const apiData = {
      title: taskData.title || '',
      type: taskData.type || '',
      typeName: taskData.typeName || '',
      status: initialStatus || taskData.status || 'pending',
      priority: taskData.priority || 'normal',
      progress: 0,
      sourceType: taskData.sourceType || 'dispatch',
      dispatchMode: dispatchMode || taskData.dispatchMode || 'farm',
      assigneeId: finalAssigneeId,
      assigneeName: finalAssigneeName,
      assignerId: taskData.assignerId || '',
      assignerName: taskData.assignerName || '',
      dueDate: taskData.dueDate,
      planStart: taskData.planStart || taskData.plannedDate || '',
      planEnd: taskData.planEnd || taskData.plannedDate || '',
      estimatedDays: taskData.estimatedDays,
      estimatedHours: taskData.estimatedHours,
      materials: taskData.materials || [],
      tools: taskData.tools || [],
      sopContent: taskData.sopContent,
      typeConfig: taskData.typeConfig,
      feedbackRequirements: taskData.feedbackRequirements || taskData.requiredFeedback || [],
      greenhouseId: taskData.greenhouseId,
      greenhouseName: taskData.greenhouseName,
      cropName: taskData.cropName,
      batchId: taskData.batchId || '',
      batchCode: taskData.batchCode || '',
      description: taskData.description || '',
      remarks: taskData.remarks || '',
      field: taskData.field || '',
      assignee: taskData.assignee || '',
      crop: taskData.crop || '',
      teamId: taskData.teamId || '',
      teamName: taskData.teamName || '',
      toolsRemarks: taskData.toolsRemarks || '',
      requiredFeedback: taskData.requiredFeedback || [],
      sourceProblemId: taskData.sourceProblemId || '',
      sourceId: taskData.sourceId || '',
      sourceCode: taskData.sourceCode || '',
    }

    const result = await farmTaskStore.createTask(apiData)
    return result
  }

  // ========== 发布任务 ==========
  async function publishTask(id) {
    const task = getTask(id)
    if (!task || task.status !== 'draft') return

    const publishedTask = { ...task, status: 'pending' }
    const record = createTaskRecord(publishedTask, 'publish', 'draft')
    saveTaskRecords([record, ...taskRecordsRef.value])

    return farmTaskStore.updateTask(id, { status: 'pending', updatedAt: new Date().toISOString(), version: (task.version || 1) + 1 })
  }

  // ========== 撤回任务 ==========
  async function withdrawTask(id, reason) {
    const task = getTask(id)
    if (!task || task.status !== 'pending') return

    const now = new Date().toISOString()
    const cancelledTask = { ...task, status: 'cancelled' }
    const record = createTaskRecord(cancelledTask, 'withdraw', 'pending', { reason })
    saveTaskRecords([record, ...taskRecordsRef.value])

    return farmTaskStore.updateTask(id, {
      status: 'cancelled',
      cancelledReason: reason,
      cancelledAt: now,
      cancelledBy: task.assignerId,
    })
  }

  // ========== 取消任务 ==========
  async function cancelTask(id, reason) {
    const task = getTask(id)
    if (!task || !['pending', 'accepted', 'in_progress'].includes(task.status)) return

    const now = new Date().toISOString()
    const cancelledTask = { ...task, status: 'cancelled' }
    const record = createTaskRecord(cancelledTask, 'cancel', task.status, { reason })
    saveTaskRecords([record, ...taskRecordsRef.value])

    return farmTaskStore.updateTask(id, {
      status: 'cancelled',
      cancelledReason: reason,
      cancelledAt: now,
      cancelledBy: task.assignerId,
    })
  }

  // ========== 接受任务（含考勤记录创建，与V1.1完全一致）==========
  async function acceptTask(id) {
    const task = getTask(id)
    if (!task || task.status !== 'pending') return

    const now = new Date()
    const nowStr = now.toISOString().split('T')[0]
    const timeStr = now.toTimeString().slice(0, 5)

    const record = createTaskRecord({ ...task, status: 'accepted' }, 'accept', 'pending')
    saveTaskRecords([record, ...taskRecordsRef.value])

    // 创建考勤记录
    try {
      addAttendance({
        workerId: task.assigneeId,
        name: task.assigneeName,
        dept: task.dept || '生产部',
        date: nowStr,
        checkIn: timeStr,
        checkOut: '',
        hours: 0,
        status: '进行中',
        statusClass: 'info',
        taskId: task.id,
        batchId: task.batchId,
      })
    } catch (error) {
      console.error('创建考勤记录失败:', error)
    }

    getStoreForTask(task).updateTask(id, {
      status: 'accepted',
      acceptedAt: now.toISOString(),
      startTime: nowStr,
      updatedAt: now.toISOString(),
      version: task.version + 1,
    })
  }

  // ========== 选择执行人并派工 ==========
  async function acceptAndAssign(id, assigneeId, assigneeName) {
    const task = getTask(id)
    if (!task) return

    const now = new Date().toISOString()
    const assignedTask = { ...task, assigneeId, assigneeName }

    const record = createTaskRecord(assignedTask, 'assign', task.status)
    saveTaskRecords([record, ...taskRecordsRef.value])

    getStoreForTask(task).updateTask(id, {
      assigneeId,
      assigneeName,
      status: 'pending',
      updatedAt: now,
      version: task.version + 1,
    })
  }

  // ========== 提交进度（含考勤/工单同步，与V1.1完全一致）==========
  async function submitProgress(id, progress, options = {}) {
    const task = getTask(id)
    if (!task) return

    const now = new Date()
    const nowIso = now.toISOString()

    const progressIncrement = progress - (task.progress || 0)
    let newStatus = task.status

    const action = options.isFinal ? 'submit' : 'progress'

    if (options.isFinal) {
      newStatus = 'waiting_acceptance'
    } else if (task.status === 'accepted') {
      newStatus = 'in_progress'
    }

    const feedbackData = {
      text: options.remarks,
      materials: options.materials,
      gpsLocation: options.gpsLocation,
      images: [...(options.photosBefore || []), ...(options.photosAfter || [])],
      voiceNote: options.voiceNote,
      workloadDays: options.workloadDays,
      workloadHours: options.workloadHours,
      workers: options.workers,
      materialCode: options.materialCode,
    }

    const updatedTask = { ...task, status: newStatus, progress }
    const record = createTaskRecord(updatedTask, action, task.status, {
      progress,
      progressIncrement,
      feedback: feedbackData,
      comment: options.remarks,
    })
    saveTaskRecords([record, ...taskRecordsRef.value])

    // 更新考勤记录
    if (options.startTime && options.endTime) {
      const [sh, sm] = options.startTime.split(':').map(Number)
      const [eh, em] = options.endTime.split(':').map(Number)
      const hoursWorked = ((eh * 60 + em) - (sh * 60 + sm)) / 60

      const attendanceRecord = attendance.value.find(a => a.taskId === task.id)
      if (attendanceRecord) {
        updateAttendance(attendanceRecord.id, {
          checkOut: options.endTime,
          hours: hoursWorked,
        })
      }
    }

    // 同步到每日工单汇总
    syncWorkLogFromTask({
      id: task.id,
      taskCode: task.taskCode,
      assigneeName: task.assigneeName,
      cropName: task.cropName || '',
      greenhouseName: task.greenhouseName || '',
      title: task.title,
      batchId: task.batchId,
      batchCode: task.batchCode,
      type: task.type,
      typeName: task.typeName,
    }, {
      progress,
      notes: options.remarks,
      workload: options.workload,
      workloadDays: options.workloadDays,
      workloadHours: options.workloadHours,
      workers: options.workers,
      unit: options.unit,
      startTime: options.startTime,
      endTime: options.endTime,
    })

    getStoreForTask(task).updateTask(id, {
      progress,
      status: newStatus,
      startTime: task.startTime || options.startTime,
      endTime: options.endTime,
      updatedAt: nowIso,
      version: (task.version || 1) + 1,
    })
  }

  // ========== 超时处理 ==========
  async function handleOvertime(id, action, options = {}) {
    const task = getTask(id)
    if (!task || task.status !== 'in_progress') return

    const now = new Date().toISOString()
    const taskAction = action === 'continue' ? 'overtime_continue' : 'overtime_abandon'

    const updatedTask = { ...task, status: action === 'continue' ? 'in_progress' : 'abandoned' }
    const record = createTaskRecord(updatedTask, taskAction, task.status, { reason: options.reason })
    saveTaskRecords([record, ...taskRecordsRef.value])

    if (action === 'continue') {
      const extension = {
        id: `EXT_${Date.now()}`,
        originalDeadline: task.dueDate || '',
        newDeadline: options.newDeadline || '',
        reason: options.reason || '',
        extendedBy: task.assigneeId,
        extendedAt: now,
      }
      getStoreForTask(task).updateTask(id, {
        status: 'in_progress',
        dueDate: options.newDeadline || task.dueDate,
        deadlineExtensions: [...(task.deadlineExtensions || []), extension],
        updatedAt: now,
        version: (task.version || 1) + 1,
      })
    } else {
      getStoreForTask(task).updateTask(id, {
        status: 'abandoned',
        abandonedReason: options.reason,
        abandonedAt: now,
        updatedAt: now,
        version: (task.version || 1) + 1,
      })
    }
  }

  // ========== 验收通过（含考勤更新，与V1.1完全一致）==========
  async function acceptCompletion(id, comments) {
    const task = getTask(id)
    if (!task || task.status !== 'waiting_acceptance') return

    const now = new Date().toISOString()

    const completedTask = { ...task, status: 'completed' }
    const record = createTaskRecord(completedTask, 'complete', 'waiting_acceptance', { comment: comments })
    saveTaskRecords([record, ...taskRecordsRef.value])

    // 更新考勤记录状态为已完成
    const attendanceRecord = attendance.value.find(a => a.taskId === task.id)
    if (attendanceRecord) {
      updateAttendance(attendanceRecord.id, {
        status: '已完成',
        statusClass: 'success',
      })
    }

    getStoreForTask(task).updateTask(id, {
      status: 'completed',
      completedAt: now,
      progress: 100,
      acceptanceRecord: {
        acceptedBy: task.assignerId,
        acceptedByName: task.assignerName,
        acceptedAt: now,
        comments,
      },
      updatedAt: now,
      version: (task.version || 1) + 1,
    })
  }

  // ========== 验收驳回 ==========
  async function rejectForRework(id, reason) {
    const task = getTask(id)
    if (!task || task.status !== 'waiting_acceptance') return

    const now = new Date().toISOString()
    const newReworkCount = (task.reworkCount || 0) + 1
    const newStatus = newReworkCount >= REWORK_CONFIG.maxReworkCount ? 'failed' : 'rejected'

    const reworkRecord = {
      reworkCount: newReworkCount,
      reworkReason: reason,
      reworkBy: task.assignerId,
      reworkAt: now,
      taskStatusBeforeRework: task.status,
    }

    const updatedTask = { ...task, status: newStatus, reworkCount: newReworkCount }
    const record = createTaskRecord(updatedTask, 'reject', 'waiting_acceptance', { reason })
    saveTaskRecords([record, ...taskRecordsRef.value])

    getStoreForTask(task).updateTask(id, {
      status: newStatus,
      reworkCount: newReworkCount,
      reworkHistory: [...(task.reworkHistory || []), reworkRecord],
      rejectReason: reason,
      updatedAt: now,
      version: (task.version || 1) + 1,
    })
  }

  // ========== 继续执行（返工后）==========
  async function continueExecution(id) {
    const task = getTask(id)
    if (!task || task.status !== 'rejected') return

    const now = new Date().toISOString()
    const inProgressTask = { ...task, status: 'in_progress' }
    const record = createTaskRecord(inProgressTask, 'continue', 'rejected')
    saveTaskRecords([record, ...taskRecordsRef.value])

    getStoreForTask(task).updateTask(id, {
      status: 'in_progress',
      updatedAt: now,
      version: (task.version || 1) + 1,
    })
  }

  // ========== 重新派发 ==========
  async function reassignTask(id, newAssigneeId, newAssigneeName) {
    const task = getTask(id)
    if (!task || !['failed', 'abandoned', 'rejected'].includes(task.status)) return

    const now = new Date().toISOString()
    const rejectCount = (task.executorRejectCount) || 0
    const mustClearAssignee = rejectCount >= 2
    const finalAssigneeId = mustClearAssignee ? '' : newAssigneeId
    const finalAssigneeName = mustClearAssignee ? '' : newAssigneeName

    const reassignedTask = { ...task, status: 'pending', assigneeId: finalAssigneeId, assigneeName: finalAssigneeName }
    const record = createTaskRecord(reassignedTask, 'reassign', task.status)
    saveTaskRecords([record, ...taskRecordsRef.value])

    getStoreForTask(task).updateTask(id, {
      status: 'pending',
      assigneeId: finalAssigneeId,
      assigneeName: finalAssigneeName,
      reworkCount: 0,
      reworkHistory: [],
      deadlineExtensions: [],
      updatedAt: now,
      version: (task.version || 1) + 1,
    })
  }

  // ========== 执行人拒绝任务 ==========
  async function rejectByExecutor(id, rejectReason, executorId, executorName) {
    const task = getTask(id) || tasks.value.find(t => t.taskCode === id)
    if (!task) {
      console.warn('[useTasks] rejectByExecutor: 任务不存在 id=', id)
      return
    }

    const now = new Date().toISOString()
    const record = {
      id: `TR_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      taskId: task.id,
      taskCode: task.taskCode,
      taskTitle: task.title,
      operatorId: executorId,
      operatorName: executorName,
      action: 'reject',
      actionName: '执行人拒绝',
      fromStatus: task.status,
      toStatus: 'rejected',
      reason: rejectReason,
      actionTime: now,
      createdAt: now.split('T')[0],
    }
    saveTaskRecords([record, ...taskRecordsRef.value])

    getStoreForTask(task).updateTask(task.id, {
      status: 'rejected',
      assigneeId: '',
      assigneeName: '',
      rejectReason,
      executorRejectCount: (task.executorRejectCount || 0) + 1,
      updatedAt: now,
      version: (task.version || 1) + 1,
    })
  }

  // ========== 催办（含API同步，与V1.1完全一致）==========
  function sendReminder(id, message) {
    const task = getTask(id)
    if (!task) return

    const now = new Date()
    const nowStr = now.toISOString()
    const today = nowStr.split('T')[0]

    // 检查催办限制
    const todayReminders = reminderRecords.value.filter(
      r => r.taskId === id && r.remindedAt.startsWith(today)
    )
    if (todayReminders.length >= REMINDER_CONFIG.maxRemindersPerDay) {
      console.warn('今日催办次数已达上限')
      return
    }

    const lastReminder = reminderRecords.value.find(r => r.taskId === id)
    if (lastReminder) {
      const lastTime = new Date(lastReminder.remindedAt).getTime()
      const interval = now.getTime() - lastTime
      if (interval < REMINDER_CONFIG.minIntervalMinutes * 60 * 1000) {
        console.warn('催办间隔需大于1小时')
        return
      }
    }

    const reminder = {
      id: `REM_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      taskId: task.id,
      taskCode: task.taskCode,
      remindedBy: task.assignerId,
      remindedByName: task.assignerName,
      remindedTo: task.assigneeId,
      remindedToName: task.assigneeName,
      remindType: 'manual',
      message,
      remindedAt: nowStr,
    }
    saveReminderRecords([reminder, ...reminderRecords.value])

    const record = createTaskRecord(task, 'remind', undefined, { comment: message })
    saveTaskRecords([record, ...taskRecords.value])

    // API异步同步
    Promise.resolve().then(async () => {
      try {
        await enhancedApiClient.post(`/farm-tasks/${id}/remind`, { message })
      } catch (error) {
        console.warn(`[useTasks] sendReminder(${id}) API同步失败:`, error)
      }
    })
  }

  // ========== 延期 ==========
  async function extendDeadline(id, newDeadline, reason) {
    const task = getTask(id)
    if (!task) return

    if ((task.deadlineExtensions || []).length >= DEADLINE_CONFIG.maxExtensions) {
      console.warn('延期次数已达上限')
      return
    }

    const now = new Date().toISOString()
    const extension = {
      id: `EXT_${Date.now()}`,
      originalDeadline: task.dueDate || '',
      newDeadline,
      reason,
      extendedBy: task.assigneeId,
      extendedAt: now,
    }

    const updatedTask = { ...task, dueDate: newDeadline }
    const record = createTaskRecord(updatedTask, 'extend_deadline', task.status, { comment: reason })
    saveTaskRecords([record, ...taskRecordsRef.value])

    getStoreForTask(task).updateTask(id, {
      dueDate: newDeadline,
      deadlineExtensions: [...(task.deadlineExtensions || []), extension],
      updatedAt: now,
      version: (task.version || 1) + 1,
    })
  }

  // ========== 删除任务 ==========
  async function deleteTask(id) {
    const task = getTask(id)
    const store = task ? getStoreForTask(task) : { deleteTask: (id) => farmTaskStore.removeTask(id) }
    await store.deleteTask(id)
  }

  // ========== 更新任务 ==========
  async function updateTask(id, updates) {
    const task = getTask(id)
    const store = task ? getStoreForTask(task) : { updateTask: (id, u) => farmTaskStore.updateTask(id, u) }
    store.updateTask(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })
  }

  // ========== 更新任务状态 ==========
  async function updateTaskStatus(id, status) {
    const task = getTask(id)
    const store = task ? getStoreForTask(task) : { updateTask: (id, u) => farmTaskStore.updateTask(id, u) }
    store.updateTask(id, {
      status,
      updatedAt: new Date().toISOString(),
    })
  }

  // ========== 更新任务进度 ==========
  async function updateTaskProgress(id, progress, options = {}) {
    const task = getTask(id)
    if (!task) return

    const newStatus = options.isFinal ? 'waiting_acceptance'
      : progress > 0 && task.status === 'accepted' ? 'in_progress'
      : task.status

    getStoreForTask(task).updateTask(id, {
      progress,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      version: (task.version || 1) + 1,
    })
  }

  return {
    // 响应式数据
    tasks,
    taskRecords,
    reminderRecords,

    // 查询
    getTask,
    getTasksByAssignee,
    getTaskRecordsByTaskId,
    detectOvertime,

    // 任务创建
    createTask,
    publishTask,

    // 状态流转
    withdrawTask,
    cancelTask,
    acceptTask,
    acceptAndAssign,
    submitProgress,
    handleOvertime,
    acceptCompletion,
    rejectForRework,
    rejectByExecutor,
    continueExecution,
    reassignTask,

    // 辅助操作
    sendReminder,
    extendDeadline,
    deleteTask,
    updateTask,
    updateTaskStatus,
    updateTaskProgress,
  }
}

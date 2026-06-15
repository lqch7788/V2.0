/**
 * 临时任务 Pinia Store
 * 从 V1.1 useTempTaskStore.ts + useTempTasks.ts 1:1 迁移
 *
 * 状态机：5 状态
 *   pending(待执行) → in_progress(进行中) → waiting_acceptance(待验收) → completed(已完成)
 *   + cancelled(已取消) / rejected(已驳回/pending_reassign)
 *
 * 持久化：localStorage key 'temp-tasks'（与 V1.1 一致）
 * 联动：farmOperationRecord（提交完成 / 审核通过 / 审核驳回时写入）
 * 驳回超限：rejectCount >= 2 → 状态进入 pending_reassign
 *
 * 对接后端: /api/temp-tasks
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'
import { storageGet, storageSet } from '@/lib/storageService'

// ================== 状态枚举（与 V1.1 1:1） ==================

export const TEMP_TASK_STATUS = {
  PENDING: 'pending',                 // 待执行
  IN_PROGRESS: 'in_progress',         // 进行中
  WAITING_ACCEPTANCE: 'waiting_acceptance', // 待验收
  COMPLETED: 'completed',             // 已完成
  CANCELLED: 'cancelled',             // 已取消
  REJECTED: 'rejected',               // 已驳回
  PENDING_REASSIGN: 'pending_reassign', // 待重新派发（驳回 2 次）
}

const STATUS_LABEL_MAP = {
  pending: '待执行',
  in_progress: '进行中',
  waiting_acceptance: '待验收',
  completed: '已完成',
  cancelled: '已取消',
  rejected: '已驳回',
  pending_reassign: '待重新派发',
  draft: '草稿',
}

// ================== 字段映射 ==================

const FIELD_MAP = {
  task_code: 'taskCode',
  task_title: 'title',
  task_type: 'type',
  task_content: 'description',
  requester_id: 'requesterId',
  requester_name: 'requesterName',
  assignee_id: 'assigneeId',
  assignee_name: 'assigneeName',
  greenhouse_id: 'greenhouseId',
  greenhouse_name: 'greenhouseName',
  area_name: 'location',
  request_date: 'requestDate',
  request_time: 'requestTime',
  completion_date: 'completionDate',
  completion_note: 'completionRemarks',
  create_time: 'createdAt',
  update_time: 'updatedAt',
  reject_reason: 'rejectReason',
  acceptance_remarks: 'acceptanceRemarks',
  due_date: 'dueDate',
  estimated_hours: 'estimatedHours',
  estimated_days: 'estimatedDays',
  worker_count: 'workerCount',
  actual_hours: 'actualHours',
  progress: 'progress',
  reject_count: 'rejectCount',
  urgency: 'urgency',
  operation_records: 'operationRecords',
  start_time: 'startTime',
  accepted_at: 'acceptedAt',
  completed_at: 'completedAt',
  assigner_id: 'assignerId',
  assigner_name: 'assignerName',
  source_type: 'sourceType',
  dispatch_mode: 'dispatchMode',
  version: 'version',
  required_feedback: 'requiredFeedback',
  title: 'title',
  location: 'location',
  priority: 'priority',
  status: 'status',
  remarks: 'remarks',
}

function normalizeTask(db) {
  if (!db || typeof db !== 'object') return db
  const result = { ...db }
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (snake in result && !(camel in result)) {
      result[camel] = result[snake]
    }
  }
  result.title = result.title || result.taskTitle || result.task_title || ''
  result.type = result.type || result.taskType || result.task_type || ''
  result.description = result.description || result.taskContent || result.task_content || ''
  result.taskCode = result.taskCode || result.task_code || ''
  result.priority = result.priority || result.urgency || 'normal'
  result.status = result.status || 'draft'
  result.statusLabel = STATUS_LABEL_MAP[result.status] || result.status
  result.createdAt = result.createdAt || result.create_time || new Date().toISOString()
  // requiredFeedback JSON 双重编码兼容
  if (typeof result.requiredFeedback === 'string') {
    try {
      const parsed = JSON.parse(result.requiredFeedback)
      if (typeof parsed === 'string') {
        try { result.requiredFeedback = JSON.parse(parsed) } catch { result.requiredFeedback = [] }
      } else {
        result.requiredFeedback = parsed
      }
    } catch { result.requiredFeedback = [] }
  }
  if (!Array.isArray(result.requiredFeedback)) result.requiredFeedback = []
  return result
}

function denormalizeTask(task) {
  if (!task || typeof task !== 'object') return task
  const result = {}
  const reverse = {}
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (!(camel in reverse) || snake !== camel) {
      reverse[camel] = snake
    }
  }
  for (const [key, value] of Object.entries(task)) {
    const backendKey = reverse[key] || key
    if (backendKey === 'required_feedback' && Array.isArray(value)) {
      result[backendKey] = JSON.stringify(value)
    } else {
      result[backendKey] = value
    }
  }
  return result
}

// ================== 持久化（localStorage 'temp-tasks'） ==================

const STORAGE_KEY = 'temp-tasks'

function loadFromStorage() {
  try {
    const raw = storageGet(STORAGE_KEY)
    if (!raw) return []
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(arr) ? arr.map(normalizeTask) : []
  } catch {
    return []
  }
}

function saveToStorage(list) {
  try {
    storageSet(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // 静默失败
  }
}

// ================== 临时任务编号生成 ==================

function getNextTempTaskSeq(list) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seqs = list
    .filter((t) => typeof t.taskCode === 'string' && t.taskCode.startsWith(`TT${today}`))
    .map((t) => {
      const m = t.taskCode.replace(`TT${today}`, '')
      return parseInt(m || '0', 10)
    })
  const maxSeq = seqs.length > 0 ? Math.max(...seqs) : 0
  return String(maxSeq + 1).padStart(3, '0')
}

function generateTempTaskCode(list) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = getNextTempTaskSeq(list)
  return `TT${today}${seq}`
}

function generateRecordCode() {
  return `TEMP_OP_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

// ================== 联动：写入 farmOperationRecord ==================

async function writeOperationRecord(payload) {
  try {
    await enhancedApiClient.post('/farm-operation-records', {
      sourceType: 'tempTask',
      sourceId: payload.taskId,
      sourceCode: payload.taskCode || '',
      operationType: payload.operationType,
      operationTypeName: payload.operationTypeName,
      status: payload.status,
      greenhouseId: payload.greenhouseId,
      greenhouseName: payload.greenhouseName,
      operatorId: payload.operatorId,
      operatorName: payload.operatorName,
      operationDate: payload.operationDate || new Date().toISOString().split('T')[0],
      time: payload.time,
      hours: payload.hours,
      remarks: payload.remarks || '',
      rejectReason: payload.rejectReason,
      createdAt: new Date().toISOString(),
    })
  } catch {
    // 静默
  }
}

// ================== Store ==================

export const useTempTaskStore = defineStore('tempTask', () => {
  const tasks = ref(loadFromStorage())
  const operationRecords = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  watch(tasks, (val) => saveToStorage(val), { deep: true })

  // ================== Getter ==================

  /** 按状态分组 */
  const tempTasksByStatus = computed(() => {
    const groups = {
      pending: [],
      in_progress: [],
      waiting_acceptance: [],
      completed: [],
      cancelled: [],
      rejected: [],
      pending_reassign: [],
    }
    tasks.value.forEach((t) => {
      const s = t.status || 'pending'
      if (groups[s]) groups[s].push(t)
    })
    return groups
  })

  /** 待执行 */
  const pendingTasks = computed(() =>
    tasks.value.filter((t) => t.status === TEMP_TASK_STATUS.PENDING)
  )

  /** 进行中 */
  const inProgressTasks = computed(() =>
    tasks.value.filter((t) => t.status === TEMP_TASK_STATUS.IN_PROGRESS)
  )

  /** 待验收 */
  const waitingAcceptanceTasks = computed(() =>
    tasks.value.filter((t) => t.status === TEMP_TASK_STATUS.WAITING_ACCEPTANCE)
  )

  /** 已完成 */
  const completedTasks = computed(() =>
    tasks.value.filter((t) => t.status === TEMP_TASK_STATUS.COMPLETED)
  )

  // ================== CRUD Action（与 V1.1 1:1） ==================

  async function fetchTasks(filters) {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      }
      const query = params.toString()
      const url = `/temp-tasks${query ? `?${query}` : ''}`
      const response = await enhancedApiClient.get(url)
      const data = Array.isArray(response) ? response : []
      const normalized = data.map(normalizeTask)
      tasks.value = normalized
    } catch (e) {
      console.warn('[TempTaskStore] API获取失败，使用本地数据:', e)
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(task) {
    const now = new Date().toISOString()
    const tempId = task.id || `TEMP_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    // 自动生成 taskCode（与 V1.1 generateTempTaskCode 行为一致）
    const finalTaskCode = task.taskCode || generateTempTaskCode(tasks.value)

    const optimisticTask = normalizeTask({
      ...task,
      id: tempId,
      taskCode: finalTaskCode,
      createTime: now,
      create_time: now,
      createdAt: task.createdAt || now,
      updateTime: now,
      update_time: now,
      updatedAt: now,
      status: task.status || TEMP_TASK_STATUS.PENDING,
      rejectCount: task.rejectCount || 0,
    })

    // 乐观更新
    tasks.value = [optimisticTask, ...tasks.value]

    // 写操作记录
    const opRecord = {
      id: `TEMP_OP_${Date.now()}`,
      recordCode: generateRecordCode(),
      taskId: tempId,
      taskCode: finalTaskCode,
      taskTitle: optimisticTask.title,
      operationType: 'create',
      operationTypeName: '创建临时任务',
      operatorId: optimisticTask.assignerId,
      operatorName: optimisticTask.assignerName,
      operationDate: now.split('T')[0],
      createdAt: now,
    }
    operationRecords.value = [opRecord, ...operationRecords.value]

    try {
      const body = denormalizeTask(optimisticTask)
      const savedTask = await enhancedApiClient.post('/temp-tasks', body)
      if (savedTask && savedTask.id) {
        const normalized = normalizeTask(savedTask)
        tasks.value = tasks.value.map((t) => (t.id === tempId ? { ...t, ...normalized, id: normalized.id || tempId } : t))
        return normalized
      }
      return optimisticTask
    } catch (e) {
      console.warn('[TempTaskStore] 创建任务API失败，保留本地乐观数据:', e)
      error.value = e.message
      return optimisticTask
    }
  }

  async function updateTask(id, updates) {
    // 兼容 id 或 taskCode
    const existing = tasks.value.find((t) => t.id === id || t.taskCode === id)
    const realId = existing?.id || id
    const now = new Date().toISOString()

    tasks.value = tasks.value.map((t) =>
      t.id === realId || t.taskCode === id
        ? { ...t, ...updates, updatedAt: now }
        : t
    )

    try {
      const body = denormalizeTask(updates)
      await enhancedApiClient.put(`/temp-tasks/${realId}`, body)
    } catch (e) {
      console.warn('[TempTaskStore] 更新任务API失败:', e)
    }
  }

  async function deleteTask(id) {
    const existing = tasks.value.find((t) => t.id === id || t.taskCode === id)
    const realId = existing?.id || id
    tasks.value = tasks.value.filter((t) => t.id !== realId && t.taskCode !== id)
    try {
      await enhancedApiClient.delete(`/temp-tasks/${realId}`)
      return true
    } catch (e) {
      console.warn('[TempTaskStore] 删除任务API失败:', e)
      return false
    }
  }

  async function deleteTasks(ids) {
    const allTasks = tasks.value
    const realIds = ids.map((id) => {
      const existing = allTasks.find((t) => t.id === id || t.taskCode === id)
      return existing?.id || id
    })
    const idSet = new Set(ids)
    const realIdSet = new Set(realIds)
    tasks.value = tasks.value.filter((t) => !realIdSet.has(t.id) && !idSet.has(t.taskCode || ''))
    try {
      await Promise.all(
        realIds.map((rid) => enhancedApiClient.delete(`/temp-tasks/${rid}`).catch(() => {}))
      )
      return true
    } catch {
      return false
    }
  }

  // ================== 流转 Action（与 V1.1 useTempTasks 1:1） ==================

  /**
   * 内部：更新任务状态
   * 对应 V1.1 updateTempTaskStatus
   */
  async function updateTempTaskStatus(id, status, rejectReason) {
    const task = tasks.value.find((t) => t.id === id || t.taskCode === id)
    if (!task) return null

    const now = new Date().toISOString()
    const updates = { status, updatedAt: now }

    if (status === TEMP_TASK_STATUS.COMPLETED) {
      updates.completedAt = now
    }
    if (status === TEMP_TASK_STATUS.IN_PROGRESS && !task.acceptedAt) {
      updates.acceptedAt = now
    }
    if (rejectReason) updates.rejectReason = rejectReason

    await updateTask(id, updates)
    return tasks.value.find((t) => t.id === id || t.taskCode === id)
  }

  /**
   * 接单：pending → in_progress
   * 对应 V1.1 addTempTask/接单动作
   */
  async function acceptTempTask(id, operatorId, operatorName) {
    const task = tasks.value.find((t) => t.id === id || t.taskCode === id)
    if (!task) return null

    const now = new Date().toISOString()
    await updateTask(id, {
      status: TEMP_TASK_STATUS.IN_PROGRESS,
      statusLabel: STATUS_LABEL_MAP[TEMP_TASK_STATUS.IN_PROGRESS],
      acceptedAt: now,
      acceptedBy: operatorName,
      acceptedById: operatorId,
    })

    await writeOperationRecord({
      taskId: task.id,
      taskCode: task.taskCode,
      operationType: 'accept',
      operationTypeName: '接单',
      status: TEMP_TASK_STATUS.IN_PROGRESS,
      greenhouseId: task.greenhouseId,
      greenhouseName: task.greenhouseName,
      operatorId,
      operatorName,
      operationDate: now.split('T')[0],
      time: now.split('T')[1]?.slice(0, 5),
    })

    return tasks.value.find((t) => t.id === id || t.taskCode === id)
  }

  /**
   * 提交完成：in_progress → waiting_acceptance
   * 对应 V1.1 submitCompletion
   */
  async function submitCompletion(id, hours, remarks) {
    const task = tasks.value.find((t) => t.id === id || t.taskCode === id)
    if (!task) return null

    const now = new Date()
    const nowStr = now.toISOString()
    const dateStr = nowStr.split('T')[0]
    const timeStr = now.toTimeString().slice(0, 5)

    // 操作记录
    const opRecord = {
      id: `TEMP_OP_${Date.now()}`,
      recordCode: generateRecordCode(),
      taskId: task.id,
      taskCode: task.taskCode,
      taskTitle: task.title,
      operationType: 'complete',
      operationTypeName: '提交完成',
      operatorId: task.assigneeId,
      operatorName: task.assigneeName,
      operationDate: dateStr,
      time: timeStr,
      hours,
      remarks,
      createdAt: nowStr,
    }
    operationRecords.value = [opRecord, ...operationRecords.value]

    await updateTask(id, {
      status: TEMP_TASK_STATUS.WAITING_ACCEPTANCE,
      statusLabel: STATUS_LABEL_MAP[TEMP_TASK_STATUS.WAITING_ACCEPTANCE],
      actualHours: hours,
      completionRemarks: remarks,
    })

    await writeOperationRecord({
      taskId: task.id,
      taskCode: task.taskCode,
      operationType: 'complete',
      operationTypeName: '提交完成',
      status: TEMP_TASK_STATUS.WAITING_ACCEPTANCE,
      greenhouseId: task.greenhouseId,
      greenhouseName: task.greenhouseName,
      operatorId: task.assigneeId,
      operatorName: task.assigneeName,
      operationDate: dateStr,
      time: timeStr,
      hours,
      remarks,
    })

    return tasks.value.find((t) => t.id === id || t.taskCode === id)
  }

  /**
   * 审核通过：waiting_acceptance → completed
   * 对应 V1.1 acceptCompletion
   */
  async function acceptCompletion(id, acceptanceRemarks) {
    const task = tasks.value.find((t) => t.id === id || t.taskCode === id)
    if (!task) return null

    const now = new Date()
    const nowStr = now.toISOString()
    const dateStr = nowStr.split('T')[0]
    const timeStr = now.toTimeString().slice(0, 5)

    const opRecord = {
      id: `TEMP_OP_${Date.now()}`,
      recordCode: generateRecordCode(),
      taskId: task.id,
      taskCode: task.taskCode,
      taskTitle: task.title,
      operationType: 'accept_confirm',
      operationTypeName: '审核通过',
      operatorId: task.assignerId,
      operatorName: task.assignerName,
      operationDate: dateStr,
      time: timeStr,
      remarks: acceptanceRemarks,
      createdAt: nowStr,
    }
    operationRecords.value = [opRecord, ...operationRecords.value]

    await updateTask(id, {
      status: TEMP_TASK_STATUS.COMPLETED,
      statusLabel: STATUS_LABEL_MAP[TEMP_TASK_STATUS.COMPLETED],
      completedAt: nowStr,
      acceptanceRemarks,
    })

    await writeOperationRecord({
      taskId: task.id,
      taskCode: task.taskCode,
      operationType: 'accept_confirm',
      operationTypeName: '审核通过',
      status: TEMP_TASK_STATUS.COMPLETED,
      greenhouseId: task.greenhouseId,
      greenhouseName: task.greenhouseName,
      operatorId: task.assignerId,
      operatorName: task.assignerName,
      operationDate: dateStr,
      time: timeStr,
      remarks: acceptanceRemarks,
    })

    return tasks.value.find((t) => t.id === id || t.taskCode === id)
  }

  /**
   * 审核驳回：rejectCount >= 2 → pending_reassign（自动转分派重审）
   * 对应 V1.1 rejectCompletion
   */
  async function rejectCompletion(id, reason) {
    const task = tasks.value.find((t) => t.id === id || t.taskCode === id)
    if (!task) return null

    const now = new Date()
    const nowStr = now.toISOString()
    const dateStr = nowStr.split('T')[0]
    const timeStr = now.toTimeString().slice(0, 5)

    const opRecord = {
      id: `TEMP_OP_${Date.now()}`,
      recordCode: generateRecordCode(),
      taskId: task.id,
      taskCode: task.taskCode,
      taskTitle: task.title,
      operationType: 'reject',
      operationTypeName: '审核驳回',
      operatorId: task.assignerId,
      operatorName: task.assignerName,
      operationDate: dateStr,
      time: timeStr,
      rejectReason: reason,
      createdAt: nowStr,
    }
    operationRecords.value = [opRecord, ...operationRecords.value]

    const newRejectCount = (task.rejectCount || 0) + 1
    const newStatus = newRejectCount >= 2 ? TEMP_TASK_STATUS.PENDING_REASSIGN : TEMP_TASK_STATUS.IN_PROGRESS

    await updateTask(id, {
      rejectCount: newRejectCount,
      rejectReason: reason,
      status: newStatus,
      statusLabel: STATUS_LABEL_MAP[newStatus],
    })

    await writeOperationRecord({
      taskId: task.id,
      taskCode: task.taskCode,
      operationType: 'reject',
      operationTypeName: '审核驳回',
      status: newStatus,
      greenhouseId: task.greenhouseId,
      greenhouseName: task.greenhouseName,
      operatorId: task.assignerId,
      operatorName: task.assignerName,
      operationDate: dateStr,
      time: timeStr,
      rejectReason: reason,
      remarks: newRejectCount >= 2 ? '（第2次驳回，进入待重新派发）' : '',
    })

    return tasks.value.find((t) => t.id === id || t.taskCode === id)
  }

  /** 取消任务 */
  async function cancelTask(id, operatorId, operatorName, reason) {
    const task = tasks.value.find((t) => t.id === id || t.taskCode === id)
    if (!task) return null

    await updateTask(id, {
      status: TEMP_TASK_STATUS.CANCELLED,
      statusLabel: STATUS_LABEL_MAP[TEMP_TASK_STATUS.CANCELLED],
      cancelReason: reason,
      cancelTime: new Date().toISOString(),
    })

    await writeOperationRecord({
      taskId: task.id,
      taskCode: task.taskCode,
      operationType: 'cancel',
      operationTypeName: '取消任务',
      status: TEMP_TASK_STATUS.CANCELLED,
      greenhouseId: task.greenhouseId,
      greenhouseName: task.greenhouseName,
      operatorId,
      operatorName,
      remarks: reason,
    })

    return tasks.value.find((t) => t.id === id || t.taskCode === id)
  }

  /** 按 assignee 查询 */
  function getTempTasksByAssignee(assigneeId) {
    return tasks.value.filter((t) => t.assigneeId === assigneeId)
  }

  /** 按 id 查询（兼容 taskCode） */
  function getTempTask(id) {
    return tasks.value.find((t) => t.id === id || t.taskCode === id)
  }

  /** 按 taskId 查询操作记录 */
  function getOperationRecordsByTaskId(taskId) {
    return operationRecords.value.filter((r) => r.taskId === taskId)
  }

  return {
    // 状态
    tasks,
    operationRecords,
    isLoading,
    error,

    // Getter
    tempTasksByStatus,
    pendingTasks,
    inProgressTasks,
    waitingAcceptanceTasks,
    completedTasks,

    // CRUD
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    deleteTasks,

    // 流转 Action（与 V1.1 useTempTasks 1:1）
    updateTempTaskStatus,
    acceptTempTask,
    submitCompletion,
    acceptCompletion,
    rejectCompletion,
    cancelTask,

    // 查询
    getTempTask,
    getTempTasksByAssignee,
    getOperationRecordsByTaskId,
  }
})

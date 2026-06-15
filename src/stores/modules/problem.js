/**
 * 问题管理 Pinia Store
 * 从 V1.1 useProblemStore.ts + useProblemDispatch.ts 1:1 迁移
 *
 * 状态机：7 状态
 *   pending(待分派) → in_progress(已分派/处理中) → waiting_acceptance(待验收) → completed(已处理)
 *   另外支持：rework(返工中) → pending（自动转分派），closed(已关闭)
 *
 * 4 来源：task(任务) / tempTask(临时任务) / manual(手动) / inspection(巡查)
 * 持久化：localStorage key 'problems'（与 V1.1 一致）
 * 联动：farmOperationRecord（验收通过 / 返工时写入操作记录）
 * 返工超限：reworkCount >= 2 → 自动转 pending 重新分派
 *
 * 对接后端: /api/problems
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'
import { storageGet, storageSet } from '@/lib/storageService'

// ================== 状态枚举（与 V1.1 1:1 对齐） ==================

/** 7 大状态：中文标签 */
export const PROBLEM_STATUS = {
  PENDING: 'pending',                  // 待分派
  DISPATCHED: 'dispatched',            // 已分派
  IN_PROGRESS: 'in_progress',          // 处理中
  WAITING_ACCEPTANCE: 'waiting_acceptance', // 待验收
  COMPLETED: 'completed',              // 已处理
  REWORK: 'rework',                    // 返工中
  CLOSED: 'closed',                    // 已关闭
}

/** 4 大来源 */
export const PROBLEM_SOURCE = {
  TASK: 'task',
  TEMP_TASK: 'tempTask',
  MANUAL: 'manual',
  INSPECTION: 'inspection',
}

/** 状态中文标签 */
const STATUS_LABEL_MAP = {
  pending: '待分派',
  dispatched: '已分派',
  in_progress: '处理中',
  waiting_acceptance: '待验收',
  completed: '已处理',
  rework: '返工中',
  closed: '已关闭',
}

const STATUS_EN_TO_CN = STATUS_LABEL_MAP

/** 检查问题状态（兼容 status / statusLabel / 英文→中文映射） */
function isStatus(p, status) {
  return (
    p.status === status ||
    p.statusLabel === STATUS_LABEL_MAP[status] ||
    p.statusLabel === status
  )
}

// ================== 字段映射（与 V1.1 normalize 完全一致） ==================

const FIELD_MAP = {
  problem_code: 'problemCode', problem_title: 'title', problem_description: 'description',
  problem_type: 'problemType', source_type: 'sourceType', source_id: 'sourceId',
  inspection_id: 'inspectionId', inspection_code: 'inspectionCode',
  greenhouse_id: 'greenhouseId', greenhouse_name: 'greenhouseName',
  batch_id: 'batchId', batch_code: 'batchCode',
  handler_id: 'handlerId', handler_name: 'handlerName',
  handle_result: 'handleResult', create_time: 'createdAt', update_time: 'updatedAt',
  resolve_time: 'resolvedAt', assigned_at: 'assignedAt',
  reporter_id: 'reporterId', reporter_name: 'reporterName',
  assignee_id: 'assigneeId', assignee_name: 'assigneeName',
  crop_name: 'cropName', inspector_id: 'inspectorId', inspector_name: 'inspectorName',
  check_date: 'checkDate', check_time: 'checkTime',
  crop_status: 'cropStatus', plant_height: 'plantHeight', leaf_count: 'leafCount',
  issue_text: 'issueText', issue_severity: 'issueSeverity',
  handle_date: 'handleDate', source_task_id: 'sourceTaskId',
  flow_records: 'flowRecords', rework_count: 'reworkCount',
  accepted_by: 'acceptedBy', accepted_time: 'acceptedTime',
  rejected_by: 'rejectedBy', rejected_reason: 'rejectedReason', rejected_time: 'rejectedTime',
  completion_time: 'completionTime', expected_completion: 'expectedCompletion',
  source_module: 'sourceModule', source_detail: 'sourceDetail',
}

function normalize(db) {
  if (!db || typeof db !== 'object') return db
  const r = {}
  for (const [k, v] of Object.entries(db)) {
    r[FIELD_MAP[k] || k] = v
  }
  r.title = r.title || r.problem_title || ''
  r.status = r.status || 'pending'
  r.statusLabel = r.statusLabel || STATUS_LABEL_MAP[r.status] || r.status
  r.createdAt = r.createdAt || r.create_time || new Date().toISOString()
  if (typeof r.flowRecords === 'string' && r.flowRecords) {
    try { r.flowRecords = JSON.parse(r.flowRecords) } catch { r.flowRecords = [] }
  }
  if (!r.flowRecords) r.flowRecords = []
  if (typeof r.images === 'string' && r.images) {
    try { r.images = JSON.parse(r.images) } catch { r.images = [] }
  }
  return r
}

// ================== 持久化（localStorage 'problems'） ==================

const STORAGE_KEY = 'problems'

function loadFromStorage() {
  try {
    const raw = storageGet(STORAGE_KEY)
    if (!raw) return []
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(arr) ? arr.map(normalize) : []
  } catch {
    return []
  }
}

function saveToStorage(list) {
  try {
    storageSet(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // 静默失败：localStorage 满 / 不可用时不影响主流程
  }
}

// ================== 联动：写入 farmOperationRecord ==================

async function writeOperationRecord(payload) {
  try {
    await enhancedApiClient.post('/farm-operation-records', {
      sourceType: 'problem',
      sourceId: payload.problemId,
      sourceCode: payload.problemCode || '',
      operationType: payload.operationType,
      operationTypeName: payload.operationTypeName,
      status: payload.status,
      greenhouseId: payload.greenhouseId,
      greenhouseName: payload.greenhouseName,
      operatorId: payload.operatorId,
      operatorName: payload.operatorName,
      operationDate: new Date().toISOString().split('T')[0],
      remarks: payload.remarks || '',
      createdAt: new Date().toISOString(),
    })
  } catch {
    // 操作记录写入失败不影响主流程
  }
}

// ================== 计算下一个问题序号 ==================

function getNextProblemSeq(list, prefix) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seqs = list
    .filter((p) => typeof p.problemCode === 'string' && p.problemCode.startsWith(`${prefix}-${today}`))
    .map((p) => {
      const m = p.problemCode.split('-').pop()
      return parseInt(m || '0', 10)
    })
  const maxSeq = seqs.length > 0 ? Math.max(...seqs) : 0
  return String(maxSeq + 1).padStart(3, '0')
}

function generateProblemCode(list) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = getNextProblemSeq(list, 'PRB')
  return `PRB-${today}-${seq}`
}

// ================== Store ==================

export const useProblemStore = defineStore('problem', () => {
  // 初始从 localStorage 恢复（与 V1.1 持久化一致）
  const problems = ref(loadFromStorage())
  const isLoading = ref(false)
  const error = ref(null)

  // 监听变化自动持久化
  watch(
    problems,
    (val) => saveToStorage(val),
    { deep: true }
  )

  // ================== Getter ==================

  /** 按状态统计问题数（与 V1.1 problemCountByStatus 等价） */
  const problemCountByStatus = computed(() => {
    const counts = {
      pending: 0,
      dispatched: 0,
      in_progress: 0,
      waiting_acceptance: 0,
      completed: 0,
      rework: 0,
      closed: 0,
    }
    problems.value.forEach((p) => {
      const s = p.status || 'pending'
      if (counts[s] !== undefined) counts[s]++
    })
    return counts
  })

  /** 按来源分组 */
  const problemsBySource = computed(() => {
    const groups = { task: [], tempTask: [], manual: [], inspection: [], other: [] }
    problems.value.forEach((p) => {
      const src = p.sourceType || p.sourceModule || 'other'
      if (groups[src]) groups[src].push(p)
      else groups.other.push(p)
    })
    return groups
  })

  /** 返工中的问题（reworkCount >= 1） */
  const reworkProblems = computed(() =>
    problems.value.filter((p) => (p.reworkCount || 0) >= 1 || p.status === PROBLEM_STATUS.REWORK)
  )

  /** 待分派问题（status=pending 且无关联任务） */
  const pendingProblems = computed(() =>
    problems.value.filter((p) => isStatus(p, 'pending') && !p.sourceTaskId)
  )

  /** 已分派 / 处理中 */
  const dispatchedProblems = computed(() =>
    problems.value.filter(
      (p) =>
        isStatus(p, 'in_progress') ||
        isStatus(p, 'dispatched') ||
        (isStatus(p, 'pending') && p.sourceTaskId)
    )
  )

  /** 待验收 */
  const waitingAcceptanceProblems = computed(() =>
    problems.value.filter((p) => isStatus(p, 'waiting_acceptance'))
  )

  /** 已处理 */
  const handledProblems = computed(() =>
    problems.value.filter((p) => isStatus(p, 'completed'))
  )

  // ================== CRUD Action（与 V1.1 1:1） ==================

  async function fetchProblems(filters) {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      }
      const query = params.toString()
      const url = `/problems${query ? `?${query}` : ''}`
      const response = await enhancedApiClient.get(url)
      const data = Array.isArray(response) ? response : []
      const normalized = data.map(normalize)
      problems.value = normalized
    } catch (e) {
      console.warn('[ProblemStore] API获取失败，使用本地数据:', e)
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function createProblem(problem) {
    try {
      // 若未传 problemCode，自动生成
      const body = { ...problem }
      if (!body.problemCode) {
        body.problemCode = generateProblemCode(problems.value)
      }
      if (!body.status) body.status = PROBLEM_STATUS.PENDING
      if (!body.statusLabel) body.statusLabel = STATUS_LABEL_MAP[body.status]
      if (!body.createdAt) body.createdAt = new Date().toISOString()
      if (!body.flowRecords) body.flowRecords = []
      if (body.reworkCount === undefined) body.reworkCount = 0

      const response = await enhancedApiClient.post('/problems', body)
      const newId = response?.id || `LOCAL-${Date.now()}`
      const newProblem = normalize({ ...body, ...response, id: newId })
      problems.value = [newProblem, ...problems.value]
      return newProblem
    } catch (e) {
      console.warn('[ProblemStore] 创建失败，使用本地乐观更新:', e)
      error.value = e.message
      // 离线兜底：仍写入本地
      const fallbackId = `LOCAL-${Date.now()}`
      const fallback = normalize({ ...problem, id: fallbackId, problemCode: problem.problemCode || generateProblemCode(problems.value) })
      problems.value = [fallback, ...problems.value]
      return fallback
    }
  }

  async function updateProblem(id, updates) {
    // 乐观更新
    problems.value = problems.value.map((p) => (p.id === id ? { ...p, ...updates } : p))
    try {
      await enhancedApiClient.put(`/problems/${id}`, updates)
    } catch (e) {
      console.warn('[ProblemStore] 更新失败:', e)
    }
  }

  async function deleteProblem(id) {
    problems.value = problems.value.filter((p) => p.id !== id)
    try {
      await enhancedApiClient.delete(`/problems/${id}`)
      return true
    } catch (e) {
      console.warn('[ProblemStore] 删除失败:', e)
      return false
    }
  }

  async function deleteProblems(ids) {
    const idSet = new Set(ids)
    problems.value = problems.value.filter((p) => !idSet.has(p.id))
    try {
      await Promise.all(
        ids.map((id) => enhancedApiClient.delete(`/problems/${id}`).catch(() => {}))
      )
      return true
    } catch {
      return false
    }
  }

  // ================== 流转 Action（与 V1.1 useProblemDispatch 1:1） ==================

  /**
   * 内部工具：向指定问题追加一条 flowRecord
   */
  function pushFlowRecord(problem, record) {
    const current = Array.isArray(problem.flowRecords) ? problem.flowRecords : []
    return { ...problem, flowRecords: [...current, record] }
  }

  /**
   * 分派问题给处理人
   * 对应 V1.1 dispatchProblem：状态 pending → in_progress，写入 flowRecord
   */
  async function dispatchProblem(problemId, assigneeId, assigneeName, dispatcherId = 'U001', dispatcherName = '系统管理员', expectedCompletion, requiredFeedback, customPriority) {
    const problem = problems.value.find((p) => p.id === problemId)
    if (!problem) return null

    const now = new Date().toISOString()
    const flowRecord = {
      id: `FR-${Date.now()}`,
      problemId,
      operatorId: dispatcherId,
      operatorName: dispatcherName,
      action: 'dispatch',
      fromStatus: STATUS_LABEL_MAP[PROBLEM_STATUS.PENDING],
      toStatus: STATUS_LABEL_MAP[PROBLEM_STATUS.IN_PROGRESS],
      comment: `分派给 ${assigneeName} 处理`,
      actionTime: now,
    }

    await updateProblem(problemId, {
      status: PROBLEM_STATUS.IN_PROGRESS,
      statusLabel: STATUS_LABEL_MAP[PROBLEM_STATUS.IN_PROGRESS],
      handler: assigneeName,
      handlerId: assigneeId,
      handlerName: assigneeName,
      handleDate: '',
      handleResult: '',
      flowRecords: [...(problem.flowRecords || []), flowRecord],
      expectedCompletion: expectedCompletion || '',
      assignedAt: now,
    })

    // 联动：写入 farm-operation-records
    await writeOperationRecord({
      problemId,
      problemCode: problem.problemCode,
      operationType: 'dispatch',
      operationTypeName: '问题分派',
      status: PROBLEM_STATUS.IN_PROGRESS,
      greenhouseId: problem.greenhouseId,
      greenhouseName: problem.greenhouseName,
      operatorId: dispatcherId,
      operatorName: dispatcherName,
      remarks: `分派给 ${assigneeName}`,
    })

    return { ...problem, status: PROBLEM_STATUS.IN_PROGRESS, handler: assigneeName }
  }

  /**
   * 处理人接单
   * 对应 V1.1 acceptProblem
   */
  async function acceptProblem(problemId, operatorId, operatorName) {
    const problem = problems.value.find((p) => p.id === problemId)
    if (!problem) return null

    const now = new Date().toISOString()
    const currentStatusLabel = problem.statusLabel || STATUS_LABEL_MAP[problem.status] || problem.status
    const flowRecord = {
      id: `FR-${Date.now()}`,
      problemId,
      operatorId,
      operatorName,
      action: 'accept',
      fromStatus: currentStatusLabel,
      toStatus: currentStatusLabel,
      comment: '已接单，开始处理',
      actionTime: now,
    }

    await updateProblem(problemId, {
      acceptedBy: operatorName,
      acceptedById: operatorId,
      acceptedTime: now,
      flowRecords: [...(problem.flowRecords || []), flowRecord],
    })
    return problems.value.find((p) => p.id === problemId)
  }

  /**
   * 处理人拒绝接单 → 状态回退 pending
   * 对应 V1.1 rejectProblem
   */
  async function rejectProblem(problemId, operatorId, operatorName, reason) {
    const problem = problems.value.find((p) => p.id === problemId)
    if (!problem) return null

    const now = new Date().toISOString()
    const currentStatusLabel = problem.statusLabel || STATUS_LABEL_MAP[problem.status] || problem.status
    const flowRecord = {
      id: `FR-${Date.now()}`,
      problemId,
      operatorId,
      operatorName,
      action: 'reject',
      fromStatus: currentStatusLabel,
      toStatus: STATUS_LABEL_MAP[PROBLEM_STATUS.PENDING],
      comment: `拒绝原因：${reason}`,
      actionTime: now,
    }

    await updateProblem(problemId, {
      status: PROBLEM_STATUS.PENDING,
      statusLabel: STATUS_LABEL_MAP[PROBLEM_STATUS.PENDING],
      rejectedBy: operatorName,
      rejectedById: operatorId,
      rejectedReason: reason,
      rejectedTime: now,
      handler: '',
      handlerId: '',
      sourceTaskId: '',
      flowRecords: [...(problem.flowRecords || []), flowRecord],
    })

    await writeOperationRecord({
      problemId,
      problemCode: problem.problemCode,
      operationType: 'reject',
      operationTypeName: '拒绝接单',
      status: PROBLEM_STATUS.PENDING,
      greenhouseId: problem.greenhouseId,
      greenhouseName: problem.greenhouseName,
      operatorId,
      operatorName,
      remarks: `拒绝原因：${reason}`,
    })

    return problems.value.find((p) => p.id === problemId)
  }

  /**
   * 处理人提交反馈（待验收）
   * 对应 V1.1 submitProblemFeedback
   */
  async function submitFeedback(problemId, operatorId, operatorName, feedback) {
    const problem = problems.value.find((p) => p.id === problemId)
    if (!problem) return null

    const now = new Date().toISOString()
    const today = now.split('T')[0]
    const currentStatusLabel = problem.statusLabel || STATUS_LABEL_MAP[problem.status] || problem.status
    const flowRecord = {
      id: `FR-${Date.now()}`,
      problemId,
      operatorId,
      operatorName,
      action: 'submit',
      fromStatus: currentStatusLabel,
      toStatus: STATUS_LABEL_MAP[PROBLEM_STATUS.WAITING_ACCEPTANCE],
      comment: feedback?.resultText || '处理完成，提交验收',
      actionTime: now,
      feedbackData: feedback?.feedbackData,
    }

    await updateProblem(problemId, {
      status: PROBLEM_STATUS.WAITING_ACCEPTANCE,
      statusLabel: STATUS_LABEL_MAP[PROBLEM_STATUS.WAITING_ACCEPTANCE],
      handleResult: feedback?.resultText || '',
      handleDate: today,
      flowRecords: [...(problem.flowRecords || []), flowRecord],
    })
    return problems.value.find((p) => p.id === problemId)
  }

  /**
   * 验收通过 → completed
   * 对应 V1.1 approveProblemCompletion
   */
  async function acceptProblemCompletion(problemId, operatorId, operatorName, comment) {
    const problem = problems.value.find((p) => p.id === problemId)
    if (!problem) return null

    const now = new Date().toISOString()
    const currentStatusLabel = problem.statusLabel || STATUS_LABEL_MAP[problem.status] || problem.status
    const flowRecord = {
      id: `FR-${Date.now()}`,
      problemId,
      operatorId,
      operatorName,
      action: 'approve',
      fromStatus: currentStatusLabel,
      toStatus: STATUS_LABEL_MAP[PROBLEM_STATUS.COMPLETED],
      comment: comment || '验收通过，问题关闭',
      actionTime: now,
    }

    await updateProblem(problemId, {
      status: PROBLEM_STATUS.COMPLETED,
      statusLabel: STATUS_LABEL_MAP[PROBLEM_STATUS.COMPLETED],
      completionTime: now,
      flowRecords: [...(problem.flowRecords || []), flowRecord],
    })

    // 联动：写入 farm-operation-records（验收通过）
    await writeOperationRecord({
      problemId,
      problemCode: problem.problemCode,
      operationType: 'approve',
      operationTypeName: '验收通过',
      status: PROBLEM_STATUS.COMPLETED,
      greenhouseId: problem.greenhouseId,
      greenhouseName: problem.greenhouseName,
      operatorId,
      operatorName,
      remarks: comment || '验收通过',
    })

    return problems.value.find((p) => p.id === problemId)
  }

  /**
   * 验收驳回 → 返工；reworkCount >= 2 自动转 pending 重新分派
   * 对应 V1.1 rejectAcceptance
   */
  async function rejectProblemAcceptance(problemId, operatorId, operatorName, reason) {
    const problem = problems.value.find((p) => p.id === problemId)
    if (!problem) return null

    const newReworkCount = (problem.reworkCount || 0) + 1
    const shouldReassign = newReworkCount >= 2

    const now = new Date().toISOString()
    const currentStatusLabel = problem.statusLabel || STATUS_LABEL_MAP[problem.status] || problem.status
    const flowRecord = {
      id: `FR-${Date.now()}`,
      problemId,
      operatorId,
      operatorName,
      action: 'reject_acceptance',
      fromStatus: currentStatusLabel,
      toStatus: shouldReassign ? STATUS_LABEL_MAP[PROBLEM_STATUS.PENDING] : currentStatusLabel,
      comment: `返工原因：${reason}${shouldReassign ? '【已超限，退回重新分派】' : ''}`,
      actionTime: now,
    }

    if (shouldReassign) {
      await updateProblem(problemId, {
        status: PROBLEM_STATUS.PENDING,
        statusLabel: STATUS_LABEL_MAP[PROBLEM_STATUS.PENDING],
        handler: '',
        handlerId: '',
        sourceTaskId: '',
        reworkCount: newReworkCount,
        flowRecords: [...(problem.flowRecords || []), flowRecord],
      })
    } else {
      await updateProblem(problemId, {
        status: PROBLEM_STATUS.REWORK,
        statusLabel: STATUS_LABEL_MAP[PROBLEM_STATUS.REWORK],
        reworkCount: newReworkCount,
        flowRecords: [...(problem.flowRecords || []), flowRecord],
      })
    }

    await writeOperationRecord({
      problemId,
      problemCode: problem.problemCode,
      operationType: 'reject_acceptance',
      operationTypeName: '验收返工',
      status: shouldReassign ? PROBLEM_STATUS.PENDING : PROBLEM_STATUS.REWORK,
      greenhouseId: problem.greenhouseId,
      greenhouseName: problem.greenhouseName,
      operatorId,
      operatorName,
      remarks: `返工原因：${reason}${shouldReassign ? '（第2次，已退回重新分派）' : ''}`,
    })

    return problems.value.find((p) => p.id === problemId)
  }

  /**
   * 巡查异常自动创建问题
   * 对应 V1.1 autoCreateFromInspection
   */
  async function autoCreateFromInspection(inspection) {
    const payload = {
      problemCode: generateProblemCode(problems.value),
      title: inspection.issueText || inspection.title || '巡查异常',
      description: inspection.issueText || inspection.description || '',
      problemType: inspection.issueSeverity || inspection.problemType || '其他',
      severity: inspection.issueSeverity || '中等',
      sourceType: PROBLEM_SOURCE.INSPECTION,
      sourceId: inspection.id,
      sourceModule: 'inspection',
      inspectionId: inspection.id,
      inspectionCode: inspection.inspectionCode,
      greenhouseId: inspection.greenhouseId,
      greenhouseName: inspection.greenhouseName,
      cropName: inspection.cropName,
      cropStatus: inspection.cropStatus,
      plantHeight: inspection.plantHeight,
      leafCount: inspection.leafCount,
      inspectorId: inspection.inspectorId,
      inspectorName: inspection.inspectorName,
      checkDate: inspection.checkDate,
      checkTime: inspection.checkTime,
      weather: inspection.weather,
      temperature: inspection.temperature,
      humidity: inspection.humidity,
      issueText: inspection.issueText,
      issueSeverity: inspection.issueSeverity,
      status: PROBLEM_STATUS.PENDING,
      statusLabel: STATUS_LABEL_MAP[PROBLEM_STATUS.PENDING],
      flowRecords: [
        {
          id: `FR-${Date.now()}`,
          problemId: 0,
          operatorId: inspection.inspectorId || 'system',
          operatorName: inspection.inspectorName || '巡查系统',
          action: 'report',
          fromStatus: '',
          toStatus: STATUS_LABEL_MAP[PROBLEM_STATUS.PENDING],
          comment: '巡查异常自动上报',
          actionTime: new Date().toISOString(),
        },
      ],
    }
    return createProblem(payload)
  }

  /**
   * 进度上报（在 in_progress 状态下追加进度记录）
   * 对应 V1.1 addProgressRecord
   */
  async function addProgressRecord(problemId, operatorId, operatorName, progress, comment, feedbackData) {
    const problem = problems.value.find((p) => p.id === problemId)
    if (!problem) return null

    const now = new Date().toISOString()
    const currentStatusLabel = problem.statusLabel || STATUS_LABEL_MAP[problem.status] || problem.status
    const flowRecord = {
      id: `FR-${Date.now()}`,
      problemId,
      operatorId,
      operatorName,
      action: 'progress',
      fromStatus: currentStatusLabel,
      toStatus: STATUS_LABEL_MAP[PROBLEM_STATUS.IN_PROGRESS],
      comment: comment || `提交进度：${progress}%`,
      actionTime: now,
      feedbackData,
    }

    await updateProblem(problemId, {
      flowRecords: [...(problem.flowRecords || []), flowRecord],
    })

    await writeOperationRecord({
      problemId,
      problemCode: problem.problemCode,
      operationType: 'progress',
      operationTypeName: '进度上报',
      status: PROBLEM_STATUS.IN_PROGRESS,
      greenhouseId: problem.greenhouseId,
      greenhouseName: problem.greenhouseName,
      operatorId,
      operatorName,
      remarks: comment || `进度：${progress}%`,
    })

    return problems.value.find((p) => p.id === problemId)
  }

  /** 工具：获取问题的流转记录 */
  function getFlowRecords(problemId) {
    const problem = problems.value.find((p) => p.id === problemId)
    return Array.isArray(problem?.flowRecords) ? problem.flowRecords : []
  }

  return {
    // 状态
    problems,
    isLoading,
    error,

    // Getter
    problemCountByStatus,
    problemsBySource,
    reworkProblems,
    pendingProblems,
    dispatchedProblems,
    waitingAcceptanceProblems,
    handledProblems,

    // CRUD
    fetchProblems,
    createProblem,
    updateProblem,
    deleteProblem,
    deleteProblems,

    // 流转 Action（与 V1.1 useProblemDispatch 1:1）
    dispatchProblem,
    acceptProblem,
    rejectProblem,
    submitFeedback,
    acceptProblemCompletion,
    rejectProblemAcceptance,
    autoCreateFromInspection,
    addProgressRecord,

    // 查询
    getFlowRecords,
  }
})

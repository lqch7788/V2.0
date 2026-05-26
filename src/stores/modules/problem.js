/**
 * 问题管理 Pinia Store
 * 从 V1.1 useProblemStore.ts 1:1迁移
 * 对接后端: /api/problems
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

function normalize(db) {
  const map = {
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
  const r = {}
  for (const [k, v] of Object.entries(db)) {
    r[map[k] || k] = v
  }
  r.title = r.title || r.problem_title || ''
  r.status = r.status || 'pending'
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

export const useProblemStore = defineStore('problem', () => {
  const problems = ref([])
  const isLoading = ref(false)
  const error = ref(null)

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
      problems.value = data.map(normalize)
    } catch (e) {
      console.warn('[ProblemStore] API获取失败:', e)
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function createProblem(problem) {
    try {
      const response = await enhancedApiClient.post('/problems', problem)
      const newId = response?.id || Date.now()
      const newProblem = { ...problem, id: newId }
      problems.value = [newProblem, ...problems.value]
      return newProblem
    } catch (e) {
      console.warn('[ProblemStore] 创建失败:', e)
      return null
    }
  }

  async function updateProblem(id, updates) {
    problems.value = problems.value.map(p => p.id === id ? { ...p, ...updates } : p)
    try {
      await enhancedApiClient.put(`/problems/${id}`, updates)
    } catch (e) {
      console.warn('[ProblemStore] 更新失败:', e)
    }
  }

  async function deleteProblem(id) {
    problems.value = problems.value.filter(p => p.id !== id)
    try {
      await enhancedApiClient.delete(`/problems/${id}`)
      return true
    } catch (e) {
      console.warn('[ProblemStore] 删除失败:', e)
      return false
    }
  }

  async function deleteProblems(ids) {
    problems.value = problems.value.filter(p => !ids.includes(p.id))
    try {
      await Promise.all(ids.map(id => enhancedApiClient.delete(`/problems/${id}`).catch(() => {})))
      return true
    } catch { return false }
  }

  return {
    problems, isLoading, error,
    fetchProblems, createProblem, updateProblem, deleteProblem, deleteProblems,
  }
})

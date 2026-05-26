/**
 * 巡查记录 Pinia Store
 * 从 V1.1 useInspectionDataStore.ts 1:1迁移
 * 对接后端: /api/inspections
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

/** 后端→前端字段映射 */
function normalize(db) {
  const map = {
    record_code: 'recordCode', inspection_type: 'inspectionType',
    inspector_id: 'inspectorId', inspector_name: 'inspectorName',
    greenhouse_name: 'greenhouseName', greenhouse_id: 'greenhouseId',
    check_date: 'checkDate', check_time: 'checkTime',
    check_result: 'checkResult', issue_severity: 'issueSeverity',
    issue_text: 'issueText', feedback_users: 'feedbackUsers',
    create_time: 'createdAt', update_time: 'updatedAt',
  }
  const r = {}
  for (const [k, v] of Object.entries(db)) {
    r[map[k] || k] = v
  }
  // 序列化字段
  if (typeof r.feedbackUsers === 'string') {
    try { r.feedbackUsers = JSON.parse(r.feedbackUsers) } catch { r.feedbackUsers = [] }
  }
  if (!Array.isArray(r.feedbackUsers)) r.feedbackUsers = []
  if (typeof r.issues === 'string') {
    try { r.issues = JSON.parse(r.issues) } catch { r.issues = r.issues ? [r.issues] : [] }
  }
  if (!Array.isArray(r.issues)) r.issues = []
  if (typeof r.images === 'string') {
    try { r.images = JSON.parse(r.images) } catch { r.images = [] }
  }
  if (!Array.isArray(r.images)) r.images = []
  return r
}

export const useInspectionDataStore = defineStore('inspectionData', () => {
  const records = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchRecords(filters) {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      }
      const query = params.toString()
      const url = `/inspections${query ? `?${query}` : ''}`
      const response = await enhancedApiClient.get(url)
      const data = Array.isArray(response) ? response : []
      records.value = data.map(normalize)
    } catch (e) {
      console.warn('[InspectionDataStore] API获取失败:', e)
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function createRecord(record) {
    try {
      const response = await enhancedApiClient.post('/inspections', record)
      const newId = response?.id || `INS${Date.now()}`
      const newRecord = { ...record, id: newId }
      records.value = [newRecord, ...records.value]
      return newRecord
    } catch (e) {
      console.warn('[InspectionDataStore] 创建失败:', e)
      return null
    }
  }

  async function updateRecord(id, updates) {
    records.value = records.value.map(r => r.id === id ? { ...r, ...updates } : r)
    try {
      await enhancedApiClient.put(`/inspections/${id}`, updates)
    } catch (e) {
      console.warn('[InspectionDataStore] 更新失败:', e)
    }
  }

  async function deleteRecord(id) {
    records.value = records.value.filter(r => r.id !== id)
    try {
      await enhancedApiClient.delete(`/inspections/${id}`)
      return true
    } catch (e) {
      console.warn('[InspectionDataStore] 删除失败:', e)
      return false
    }
  }

  return {
    records, isLoading, error,
    fetchRecords, createRecord, updateRecord, deleteRecord,
  }
})

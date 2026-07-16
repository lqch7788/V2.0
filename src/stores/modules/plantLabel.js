/**
 * 种植标签管理 Store
 * 管理标签、标签履历、标记数据
 * 数据流：API → Store → 组件
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/crop'

export const usePlantLabelStore = defineStore('plantLabel', () => {
  // 标签列表
  const labels = ref([])
  const labelsLoading = ref(false)

  // 履历缓存 (labelId → resumes)
  const resumeMap = ref({})
  const resumeLoading = ref(false)

  // 标记列表
  const marks = ref([
    { id: 1, name: '正常', color: '#22c55e', icon: 'CheckCircle', parent_id: 0, mark_aid: 'normal', is_use: 1, sort_order: 1 },
    { id: 2, name: '关注', color: '#f59e0b', icon: 'AlertTriangle', parent_id: 0, mark_aid: 'normal', is_use: 1, sort_order: 2 },
    { id: 3, name: '问题', color: '#ef4444', icon: 'AlertCircle', parent_id: 0, mark_aid: 'normal', is_use: 1, sort_order: 3 },
    { id: 4, name: '优质', color: '#3b82f6', icon: 'Star', parent_id: 0, mark_aid: 'normal', is_use: 1, sort_order: 4 }
  ])
  const marksLoading = ref(false)

  /**
   * 加载标签列表
   * @param {Object} params - 查询参数，支持 seedling_id 或 planting_id
   * @returns {Promise<Array>} 标签列表（V1.1 一致：返回数据让调用方可立即使用）
   */
  const loadLabels = async (params = {}) => {
    labelsLoading.value = true
    try {
      const res = await api.getPlantLabelList({ limit: 200, ...params })
      // API 返回的数据结构处理
      let list = []
      if (Array.isArray(res)) {
        list = res
      } else if (res && Array.isArray(res.data)) {
        list = res.data
      } else if (res && Array.isArray(res.items)) {
        list = res.items
      }
      labels.value = list
      return list
    } catch (error) {
      console.error('获取标签数据失败:', error)
      labels.value = []
      return []
    } finally {
      labelsLoading.value = false
    }
  }

  /**
   * P0 修复：批量入库标签（V1.1 usePlantLabelStore.batchCreateLabels 1:1 对齐）
   * 用于种源标签打印 — 在批量生成前先持久化 labelNumber 到 plant_labels 表
   * @param {Array} newLabels 标签数组，每项含 labelNumber/seedlingId/plantingId/seedSourceId/moveInAreaName/moveInDate/quantity
   * @returns {Promise<{inserted:number, insertedIds:number[]}|null>} 成功返回 inserted 数据，失败返回 null
   */
  const batchCreateLabels = async (newLabels) => {
    try {
      const { enhancedApiClient } = await import('@/lib/apiClient')
      const res = await enhancedApiClient.post('/plant-labels/batch-create', {
        labels: newLabels.map(l => ({
          labelNumber: l.labelNumber,
          seedlingId: l.seedlingId || null,
          plantingId: l.plantingId || null,
          seedSourceId: l.seedSourceId || null,
          moveInAreaName: l.moveInAreaName || null,
          moveInDate: l.moveInDate || null,
          quantity: l.quantity != null ? l.quantity : 1
        }))
      })
      if (res && typeof res.inserted === 'number' && res.inserted > 0) {
        // 入库成功 — 刷新 Store
        await loadLabels()
        return res
      }
      return null
    } catch (error) {
      console.error('[usePlantLabelStore] batchCreateLabels 失败:', error)
      return null
    }
  }

  /**
   * 加载单个标签的履历
   * @param {number} labelId - 标签ID
   * @returns {Promise<Array>} 履历列表
   */
  const loadResumes = async (labelId) => {
    try {
      const res = await api.getPlantLabelResumes(labelId)
      // 处理返回数据
      let resumeList = []
      if (Array.isArray(res)) {
        resumeList = res
      } else if (res && Array.isArray(res.data)) {
        resumeList = res.data
      } else if (res && Array.isArray(res.items)) {
        resumeList = res.items
      }
      // 更新缓存
      resumeMap.value = { ...resumeMap.value, [labelId]: resumeList }
      return resumeList
    } catch (error) {
      console.error('获取履历数据失败:', error)
      resumeMap.value = { ...resumeMap.value, [labelId]: [] }
      return []
    }
  }

  /**
   * 批量加载多个标签的履历
   * @param {number[]} labelIds - 标签ID数组
   */
  const loadResumesForLabels = async (labelIds) => {
    if (!labelIds || labelIds.length === 0) return
    resumeLoading.value = true
    try {
      await Promise.all(
        labelIds.map(async (id) => {
          try {
            const res = await api.getPlantLabelResumes(id)
            let resumeList = []
            if (Array.isArray(res)) {
              resumeList = res
            } else if (res && Array.isArray(res.data)) {
              resumeList = res.data
            } else if (res && Array.isArray(res.items)) {
              resumeList = res.items
            }
            resumeMap.value = { ...resumeMap.value, [id]: resumeList }
          } catch {
            resumeMap.value = { ...resumeMap.value, [id]: [] }
          }
        })
      )
    } finally {
      resumeLoading.value = false
    }
  }

  /**
   * 加载标记列表
   */
  const loadMarks = async () => {
    marksLoading.value = true
    try {
      const res = await api.getAllMarks()
      // 处理返回数据
      let markList = []
      if (Array.isArray(res)) {
        markList = res
      } else if (res && Array.isArray(res.data)) {
        markList = res.data
      } else if (res && Array.isArray(res.items)) {
        markList = res.items
      }
      if (markList.length > 0) {
        marks.value = markList
      }
    } catch (error) {
      console.error('获取标记数据失败:', error)
    } finally {
      marksLoading.value = false
    }
  }

  return {
    // 状态
    labels,
    labelsLoading,
    resumeMap,
    resumeLoading,
    marks,
    marksLoading,
    // 方法
    loadLabels,
    loadResumes,
    loadResumesForLabels,
    loadMarks,
    batchCreateLabels
  }
})

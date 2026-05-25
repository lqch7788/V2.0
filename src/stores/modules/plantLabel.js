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
   */
  const loadLabels = async (params = {}) => {
    labelsLoading.value = true
    try {
      const res = await api.getPlantLabelList({ limit: 200, ...params })
      // API 返回的数据结构处理
      if (Array.isArray(res)) {
        labels.value = res
      } else if (res && Array.isArray(res.data)) {
        labels.value = res.data
      } else if (res && Array.isArray(res.items)) {
        labels.value = res.items
      } else {
        labels.value = []
      }
    } catch (error) {
      console.error('获取标签数据失败:', error)
      labels.value = []
    } finally {
      labelsLoading.value = false
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
    loadMarks
  }
})

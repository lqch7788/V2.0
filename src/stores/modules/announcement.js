/**
 * 公告管理 Store 模块
 * 使用 Pinia 管理公告数据状态
 * 对接后端: /api/announcements
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enhancedApiClient } from '@/lib/apiClient'

// ============================================
// 工具函数
// ============================================

/**
 * 将后端 snake_case 字段转换为前端 camelCase
 */
function normalizeNotice(db) {
  return {
    id: db.id,
    code: db.code,
    title: db.title,
    type: db.type,
    category: db.category,
    priority: db.priority,
    status: db.status,
    sender: db.sender,
    date: db.date,
    deadline: db.deadline,
    readCount: db.read_count,
    recipients: db.recipients,
    content: db.content,
    createTime: db.create_time,
    updateTime: db.update_time
  }
}

/**
 * 将后端模板 snake_case 字段转换为前端 camelCase
 */
function normalizeTemplate(db) {
  return {
    id: db.id,
    code: db.code,
    name: db.name,
    type: db.type,
    category: db.category,
    titleTemplate: db.title_template,
    contentTemplate: db.content,
    defaultPriority: db.default_priority,
    usageCount: db.usage_count,
    status: db.status,
    createTime: db.create_time,
    updateTime: db.update_time
  }
}

/**
 * 将前端 camelCase 字段转换为后端 snake_case（用于创建/更新）
 */
function denormalizeNotice(data) {
  const result = {}
  const fieldMap = {
    id: 'id',
    code: 'code',
    title: 'title',
    type: 'type',
    category: 'category',
    priority: 'priority',
    status: 'status',
    sender: 'sender',
    date: 'date',
    deadline: 'deadline',
    readCount: 'read_count',
    recipients: 'recipients',
    content: 'content'
  }
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (data[camel] !== undefined) {
      result[snake] = data[camel]
    }
  }
  return result
}

/**
 * 将前端 camelCase 字段转换为后端 snake_case（用于模板）
 */
function denormalizeTemplate(data) {
  const result = {}
  const fieldMap = {
    id: 'id',
    code: 'code',
    name: 'name',
    type: 'type',
    category: 'category',
    titleTemplate: 'title_template',
    contentTemplate: 'content',
    defaultPriority: 'default_priority',
    usageCount: 'usage_count',
    status: 'status',
    // 兼容 component 发送的 priority 字段
    priority: 'default_priority'
  }
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (data[camel] !== undefined) {
      result[snake] = data[camel]
    }
  }
  return result
}

export const useAnnouncementStore = defineStore('announcement', () => {
  // ========== 状态定义 ==========

  // 公告列表数据
  const notices = ref([])

  // 公告模板数据
  const templates = ref([])

  // 加载状态
  const isLoading = ref(false)

  // 分页信息
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0
  })

  // ========== Actions ==========

  /**
   * 获取公告列表
   * @param {Object} filters - 筛选条件 { type, priority, status, keyword }
   */
  const fetchNotices = async (filters = {}) => {
    isLoading.value = true
    try {
      const params = new URLSearchParams()
      if (filters.type && filters.type !== '全部') params.set('type', filters.type)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.status) params.set('status', filters.status)
      if (filters.keyword) params.set('keyword', filters.keyword)
      params.set('page', String(pagination.value.page))
      params.set('limit', String(pagination.value.limit))

      const query = params.toString()
      const url = `/announcements${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response || []
      const meta = response?.meta || {}

      notices.value = Array.isArray(data) ? data.map(item => normalizeNotice(item)) : []
      pagination.value.total = meta.total || notices.value.length
    } catch (error) {
      console.error('[AnnouncementStore] 获取公告列表失败:', error)
      notices.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取公告模板列表
   * @param {Object} filters - 筛选条件 { type, status, keyword }
   */
  const fetchTemplates = async (filters = {}) => {
    isLoading.value = true
    try {
      const params = new URLSearchParams()
      if (filters.type && filters.type !== '全部') params.set('type', filters.type)
      if (filters.status) params.set('status', filters.status)
      if (filters.keyword) params.set('keyword', filters.keyword)
      params.set('page', '1')
      params.set('limit', '100')

      const query = params.toString()
      const url = `/announcements/templates${query ? `?${query}` : ''}`

      const response = await enhancedApiClient.get(url)
      const data = response?.data || response || []

      templates.value = Array.isArray(data) ? data.map(item => normalizeTemplate(item)) : []
    } catch (error) {
      console.error('[AnnouncementStore] 获取公告模板列表失败:', error)
      templates.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建公告
   */
  const createNotice = async (noticeData) => {
    try {
      const body = denormalizeNotice(noticeData)
      const response = await enhancedApiClient.post('/announcements', body)
      const saved = response?.data || response
      const newNotice = normalizeNotice({ ...noticeData, ...saved })
      notices.value.unshift(newNotice)
      return newNotice
    } catch (error) {
      console.error('[AnnouncementStore] 创建公告失败:', error)
      throw error
    }
  }

  /**
   * 更新公告
   */
  const updateNotice = async (id, noticeData) => {
    try {
      const body = denormalizeNotice(noticeData)
      await enhancedApiClient.put(`/announcements/${id}`, body)
      const index = notices.value.findIndex(item => item.id === id)
      if (index !== -1) {
        notices.value[index] = {
          ...notices.value[index],
          ...noticeData,
          updateTime: new Date().toLocaleString()
        }
      }
    } catch (error) {
      console.error('[AnnouncementStore] 更新公告失败:', error)
      throw error
    }
  }

  /**
   * 删除公告
   */
  const deleteNotice = async (id) => {
    try {
      await enhancedApiClient.delete(`/announcements/${id}`)
      notices.value = notices.value.filter(item => item.id !== id)
    } catch (error) {
      console.error('[AnnouncementStore] 删除公告失败:', error)
      throw error
    }
  }

  /**
   * 批量删除公告
   */
  const deleteNotices = async (ids) => {
    try {
      await enhancedApiClient.delete('/announcements/batch', { ids })
      notices.value = notices.value.filter(item => !ids.includes(item.id))
    } catch (error) {
      console.error('[AnnouncementStore] 批量删除公告失败:', error)
      throw error
    }
  }

  /**
   * 更新公告状态
   */
  const updateNoticeStatus = async (id, status) => {
    try {
      await enhancedApiClient.put(`/announcements/${id}/status`, { status })
      const index = notices.value.findIndex(item => item.id === id)
      if (index !== -1) {
        notices.value[index].status = status
        notices.value[index].updateTime = new Date().toLocaleString()
      }
    } catch (error) {
      console.error('[AnnouncementStore] 更新公告状态失败:', error)
      throw error
    }
  }

  /**
   * 创建模板
   */
  const createTemplate = async (templateData) => {
    try {
      const body = denormalizeTemplate(templateData)
      const response = await enhancedApiClient.post('/announcements/templates', body)
      const saved = response?.data || response
      const newTemplate = normalizeTemplate({ ...templateData, ...saved })
      templates.value.push(newTemplate)
      return newTemplate
    } catch (error) {
      console.error('[AnnouncementStore] 创建模板失败:', error)
      throw error
    }
  }

  /**
   * 更新模板
   */
  const updateTemplate = async (id, templateData) => {
    try {
      const body = denormalizeTemplate(templateData)
      await enhancedApiClient.put(`/announcements/templates/${id}`, body)
      const index = templates.value.findIndex(item => item.id === id)
      if (index !== -1) {
        templates.value[index] = {
          ...templates.value[index],
          ...templateData,
          updateTime: new Date().toLocaleString()
        }
      }
    } catch (error) {
      console.error('[AnnouncementStore] 更新模板失败:', error)
      throw error
    }
  }

  /**
   * 删除模板
   */
  const deleteTemplate = async (id) => {
    try {
      await enhancedApiClient.delete(`/announcements/templates/${id}`)
      templates.value = templates.value.filter(item => item.id !== id)
    } catch (error) {
      console.error('[AnnouncementStore] 删除模板失败:', error)
      throw error
    }
  }

  return {
    // 状态
    notices,
    templates,
    isLoading,
    pagination,
    // Actions
    fetchNotices,
    fetchTemplates,
    createNotice,
    updateNotice,
    deleteNotice,
    deleteNotices,
    updateNoticeStatus,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
})

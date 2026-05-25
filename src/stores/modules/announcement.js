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
   * 创建公告（乐观更新 + 回滚，与V1.1一致）
   */
  const createNotice = async (noticeData) => {
    const localId = `ANN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date().toISOString()
    // 构造乐观更新项
    const optimisticItem = {
      id: localId,
      code: '',
      title: noticeData.title || '',
      type: noticeData.type || '生产公告',
      category: noticeData.category || '',
      priority: noticeData.priority || '中',
      status: noticeData.status || '草稿',
      sender: noticeData.sender || '',
      date: noticeData.date || '',
      deadline: noticeData.deadline || '',
      readCount: noticeData.readCount || 0,
      recipients: noticeData.recipients || '',
      content: noticeData.content || '',
      createTime: now,
      updateTime: now,
    }
    // 乐观更新
    notices.value = [optimisticItem, ...notices.value]
    try {
      const body = { ...denormalizeNotice(noticeData), id: localId }
      const response = await enhancedApiClient.post('/announcements', body)
      const saved = response?.data || response
      const savedId = saved?.id || localId
      const savedCode = saved?.code || ''
      notices.value = notices.value.map(item =>
        item.id === localId ? { ...item, id: savedId, code: savedCode } : item
      )
      return { ...optimisticItem, id: savedId, code: savedCode }
    } catch (err) {
      console.warn('[AnnouncementStore] 创建公告失败，回滚:', err)
      notices.value = notices.value.filter(item => item.id !== localId)
      throw err
    }
  }

  /**
   * 更新公告（乐观更新 + 回滚）
   */
  const updateNotice = async (id, noticeData) => {
    const prev = notices.value.find(item => item.id === id)
    // 乐观更新
    notices.value = notices.value.map(item =>
      item.id === id ? { ...item, ...noticeData, updateTime: new Date().toISOString() } : item
    )
    try {
      const body = denormalizeNotice(noticeData)
      await enhancedApiClient.put(`/announcements/${id}`, body)
    } catch (err) {
      console.warn('[AnnouncementStore] 更新公告失败，回滚:', err)
      if (prev) {
        notices.value = notices.value.map(item => (item.id === id ? prev : item))
      }
      throw err
    }
  }

  /**
   * 删除公告（乐观删除 + 回滚）
   */
  const deleteNotice = async (id) => {
    const prev = notices.value.find(item => item.id === id)
    notices.value = notices.value.filter(item => item.id !== id)
    try {
      await enhancedApiClient.delete(`/announcements/${id}`)
      return true
    } catch (err) {
      console.warn('[AnnouncementStore] 删除公告失败，回滚:', err)
      if (prev) notices.value = [...notices.value, prev]
      return false
    }
  }

  /**
   * 批量删除公告（乐观删除 + 回滚）
   */
  const deleteNotices = async (ids) => {
    const prevItems = notices.value.filter(item => ids.includes(item.id))
    notices.value = notices.value.filter(item => !ids.includes(item.id))
    try {
      await Promise.all(ids.map(id =>
        enhancedApiClient.delete(`/announcements/${id}`).catch(() => {})
      ))
      return true
    } catch (err) {
      console.warn('[AnnouncementStore] 批量删除公告失败，回滚:', err)
      if (prevItems.length > 0) notices.value = [...notices.value, ...prevItems]
      return false
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
   * 提交公告审批（与V1.1 submitForApproval一致）
   */
  const submitForApproval = async (id) => {
    const item = notices.value.find(i => i.id === id)
    if (!item) {
      console.warn('[AnnouncementStore] 提交审批失败：公告不存在')
      return false
    }
    try {
      // 调用审批提交API
      const result = await enhancedApiClient.post('/announcements/submit-approval', {
        announcementId: id,
        announcementCode: item.code || '',
        announcementTitle: item.title,
        announcementType: item.type,
      })
      if (result?.success || result?.data?.success) {
        notices.value = notices.value.map(i =>
          i.id === id ? { ...i, status: '审批中', approvalId: result.approvalId || result.data?.approvalId } : i
        )
        return true
      }
      return false
    } catch (err) {
      console.warn('[AnnouncementStore] 提交审批失败:', err)
      return false
    }
  }

  /**
   * 创建模板（乐观更新 + 回滚）
   */
  const createTemplate = async (templateData) => {
    const localId = `TPL_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date().toISOString()
    const optimisticItem = {
      id: localId,
      code: templateData.code || '',
      name: templateData.name || '',
      type: templateData.type || '',
      category: templateData.category || '',
      titleTemplate: templateData.titleTemplate || '',
      contentTemplate: templateData.contentTemplate || templateData.content || '',
      defaultPriority: templateData.defaultPriority || '中',
      usageCount: templateData.usageCount ?? 0,
      status: templateData.status || '启用',
      createTime: now,
      updateTime: now,
    }
    templates.value = [optimisticItem, ...templates.value]
    try {
      const body = denormalizeTemplate(templateData)
      const response = await enhancedApiClient.post('/announcements/templates', body)
      const saved = response?.data || response
      const savedId = saved?.id || localId
      const savedCode = saved?.code || ''
      templates.value = templates.value.map(item =>
        item.id === localId ? { ...item, id: savedId, code: savedCode } : item
      )
      return { ...optimisticItem, id: savedId, code: savedCode }
    } catch (err) {
      console.warn('[AnnouncementStore] 创建模板失败，回滚:', err)
      templates.value = templates.value.filter(item => item.id !== localId)
      throw err
    }
  }

  /**
   * 更新模板（乐观更新 + 回滚）
   */
  const updateTemplate = async (id, templateData) => {
    const prev = templates.value.find(item => item.id === id)
    templates.value = templates.value.map(item =>
      item.id === id ? { ...item, ...templateData, updateTime: new Date().toISOString() } : item
    )
    try {
      const body = denormalizeTemplate(templateData)
      await enhancedApiClient.put(`/announcements/templates/${id}`, body)
    } catch (err) {
      console.warn('[AnnouncementStore] 更新模板失败，回滚:', err)
      if (prev) {
        templates.value = templates.value.map(item => (item.id === id ? prev : item))
      }
      throw err
    }
  }

  /**
   * 删除模板（乐观删除 + 回滚）
   */
  const deleteTemplate = async (id) => {
    const prev = templates.value.find(item => item.id === id)
    templates.value = templates.value.filter(item => item.id !== id)
    try {
      await enhancedApiClient.delete(`/announcements/templates/${id}`)
      return true
    } catch (err) {
      console.warn('[AnnouncementStore] 删除模板失败，回滚:', err)
      if (prev) templates.value = [...templates.value, prev]
      return false
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
    submitForApproval,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
})

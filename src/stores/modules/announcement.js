/**
 * 公告管理 Store 模块
 * 使用 Pinia 管理公告数据状态
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  mockNotices,
  mockTemplates
} from '@/data/announcementData'

export const useAnnouncementStore = defineStore('announcement', () => {
  // ========== 状态定义 ==========

  // 公告列表数据
  const notices = ref([...mockNotices])

  // 公告模板数据
  const templates = ref([...mockTemplates])

  // 加载状态
  const isLoading = ref(false)

  // ========== Actions ==========

  /**
   * 获取公告列表
   */
  const fetchNotices = async () => {
    isLoading.value = true
    try {
      // 模拟异步请求
      await new Promise(resolve => setTimeout(resolve, 300))
      notices.value = [...mockNotices]
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取公告模板列表
   */
  const fetchTemplates = async () => {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      templates.value = [...mockTemplates]
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建公告
   */
  const createNotice = async (noticeData) => {
    const newNotice = {
      id: `ANN_${Date.now()}`,
      code: `GG${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(notices.value.length + 1).padStart(3, '0')}`,
      title: noticeData.title || '',
      type: noticeData.type || '生产公告',
      category: noticeData.category || '',
      priority: noticeData.priority || '中',
      status: noticeData.status || '草稿',
      sender: noticeData.sender || '陆启闯',
      date: noticeData.date || new Date().toISOString().slice(0, 10),
      deadline: noticeData.deadline || '',
      readCount: 0,
      recipients: noticeData.recipients || '',
      content: noticeData.content || '',
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString()
    }
    notices.value.unshift(newNotice)
    return newNotice
  }

  /**
   * 更新公告
   */
  const updateNotice = async (id, noticeData) => {
    const index = notices.value.findIndex(item => item.id === id)
    if (index !== -1) {
      notices.value[index] = {
        ...notices.value[index],
        ...noticeData,
        updateTime: new Date().toLocaleString()
      }
    }
  }

  /**
   * 删除公告
   */
  const deleteNotice = async (id) => {
    const index = notices.value.findIndex(item => item.id === id)
    if (index !== -1) {
      notices.value.splice(index, 1)
    }
  }

  /**
   * 批量删除公告
   */
  const deleteNotices = async (ids) => {
    notices.value = notices.value.filter(item => !ids.includes(item.id))
  }

  /**
   * 创建模板
   */
  const createTemplate = async (templateData) => {
    const newTemplate = {
      id: `TPL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code: `TPL${String(templates.value.length + 1).padStart(3, '0')}`,
      name: templateData.name || '',
      type: templateData.type || '',
      category: templateData.category || '',
      titleTemplate: templateData.titleTemplate || '',
      contentTemplate: templateData.contentTemplate || '',
      priority: templateData.priority || '中',
      status: templateData.status || '启用',
      usageCount: 0,
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString()
    }
    templates.value.push(newTemplate)
    return newTemplate
  }

  /**
   * 更新模板
   */
  const updateTemplate = async (id, templateData) => {
    const index = templates.value.findIndex(item => item.id === id)
    if (index !== -1) {
      templates.value[index] = {
        ...templates.value[index],
        ...templateData,
        updateTime: new Date().toLocaleString()
      }
    }
  }

  /**
   * 删除模板
   */
  const deleteTemplate = async (id) => {
    const index = templates.value.findIndex(item => item.id === id)
    if (index !== -1) {
      templates.value.splice(index, 1)
    }
  }

  return {
    // 状态
    notices,
    templates,
    isLoading,
    // Actions
    fetchNotices,
    fetchTemplates,
    createNotice,
    updateNotice,
    deleteNotice,
    deleteNotices,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
})

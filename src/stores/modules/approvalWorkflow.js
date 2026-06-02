/**
 * 审批工作流 Store — Pinia 状态管理
 * 管理审批工作流和节点数据
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getApprovalWorkflows,
  createApprovalWorkflow as apiCreateWorkflow,
  updateApprovalWorkflow as apiUpdateWorkflow,
  deleteApprovalWorkflow as apiDeleteWorkflow,
  toggleApprovalWorkflowStatus as apiToggleStatus
} from '@/api/system/approvalWorkflow'

export const useApprovalWorkflowStore = defineStore('approvalWorkflow', () => {
  // 状态
  const workflows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)

  // 加载所有工作流
  const loadWorkflows = async () => {
    const now = Date.now()
    // 5分钟内不重复加载
    if (lastFetch.value && now - lastFetch.value < 5 * 60 * 1000 && workflows.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null
    try {
      const data = await getApprovalWorkflows()
      workflows.value = data || []
      lastFetch.value = now
    } catch (err) {
      console.warn('[ApprovalWorkflowStore] 加载工作流列表失败:', err)
      error.value = err.message || '加载工作流列表失败'
    } finally {
      loading.value = false
    }
  }

  // 刷新所有工作流
  const refreshWorkflows = async () => {
    lastFetch.value = null
    await loadWorkflows()
  }

  // 新增工作流 - 乐观更新（与 V1.1 addWorkflow 一致）
  const addWorkflow = async (data) => {
    loading.value = true
    error.value = null
    try {
      const created = await apiCreateWorkflow(data)
      if (created && created.id) {
        workflows.value = [...workflows.value, created]
      } else {
        await loadWorkflows()
      }
      return created
    } catch (err) {
      console.warn('[ApprovalWorkflowStore] 创建工作流失败:', err)
      error.value = err.message || '创建工作流失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新工作流 - 乐观更新
  const editWorkflow = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const updated = await apiUpdateWorkflow(id, data)
      if (updated && updated.id) {
        workflows.value = workflows.value.map(w => w.id === id ? { ...w, ...updated } : w)
      } else {
        workflows.value = workflows.value.map(w => w.id === id ? { ...w, ...data } : w)
      }
    } catch (err) {
      console.warn('[ApprovalWorkflowStore] 更新工作流失败:', err)
      error.value = err.message || '更新工作流失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除工作流 - 乐观更新
  const removeWorkflow = async (id) => {
    loading.value = true
    error.value = null
    try {
      await apiDeleteWorkflow(id)
      workflows.value = workflows.value.filter(w => w.id !== id)
    } catch (err) {
      console.warn('[ApprovalWorkflowStore] 删除工作流失败:', err)
      error.value = err.message || '删除工作流失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 切换状态 - 乐观更新
  const toggleWorkflowStatus = async (id) => {
    try {
      const target = workflows.value.find(w => w.id === id)
      const newStatus = target?.status === 'active' ? 'inactive' : 'active'
      await apiToggleStatus(id)
      workflows.value = workflows.value.map(w => w.id === id ? { ...w, status: newStatus } : w)
    } catch (err) {
      console.warn('[ApprovalWorkflowStore] 切换工作流状态失败:', err)
      error.value = err.message || '切换工作流状态失败'
      throw err
    }
  }

  return {
    // 状态
    workflows,
    loading,
    error,
    // 方法
    loadWorkflows,
    refreshWorkflows,
    addWorkflow,
    editWorkflow,
    removeWorkflow,
    toggleWorkflowStatus
  }
})

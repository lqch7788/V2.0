/**
 * 审批管理 Store — Pinia 状态管理
 * 文件路径：src/stores/modules/approval.js
 * 功能：管理审批列表、筛选、统计数据和审批操作
 *
 * 架构：Store → API服务 → enhancedApiClient → API
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  apiApprovalService,
  ApprovalStatus,
} from '@/services/apiApprovalService'

// ============================================================
// 统计数据计算
// ============================================================

/**
 * 从审批列表计算统计数据
 */
function computeStats(approvals) {
  return {
    total: approvals.length,
    pending: approvals.filter(a => a.status === ApprovalStatus.PENDING).length,
    approved: approvals.filter(a => a.status === ApprovalStatus.APPROVED).length,
    rejected: approvals.filter(a => a.status === ApprovalStatus.REJECTED).length,
    partiallyApproved: approvals.filter(a => a.status === ApprovalStatus.PARTIALLY_APPROVED).length,
    myPending: 0,
    mySubmitted: 0,
    overdue: 0,
    urgent: approvals.filter(a => a.priority === 'urgent' && a.status === ApprovalStatus.PENDING).length,
  }
}

// ============================================================
// Store 定义
// ============================================================

export const useApprovalStore = defineStore('approval', () => {
  // ========== 状态 ==========
  const approvals = ref([])
  const filters = ref({})
  const stats = ref(computeStats([]))
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  // ========== 计算属性 ==========

  /**
   * 筛选后的审批列表（前端筛选）
   */
  const filteredApprovals = computed(() => {
    return approvals.value.filter(approval => {
      // 类型筛选
      if (filters.value.type?.length) {
        if (!filters.value.type.includes(approval.type)) return false
      }
      // 状态筛选
      if (filters.value.status?.length) {
        if (!filters.value.status.includes(approval.status)) return false
      }
      // 分类筛选
      if (filters.value.category?.length) {
        if (!filters.value.category.includes(approval.category)) return false
      }
      // 关键词筛选
      if (filters.value.keyword) {
        const keyword = filters.value.keyword.toLowerCase()
        const matchCode = approval.code?.toLowerCase().includes(keyword)
        const matchTitle = approval.title?.toLowerCase().includes(keyword)
        const matchApplicant = approval.applicantName?.toLowerCase().includes(keyword)
        if (!matchCode && !matchTitle && !matchApplicant) return false
      }
      // 日期范围筛选
      if (filters.value.startDate) {
        if (approval.applyDate < filters.value.startDate) return false
      }
      if (filters.value.endDate) {
        if (approval.applyDate > filters.value.endDate) return false
      }
      // 我的待审批
      if (filters.value.myPending) {
        if (approval.status !== ApprovalStatus.PENDING) return false
      }
      // 我提交的
      if (filters.value.mySubmitted) {
        const currentUserId = localStorage.getItem('userId') || ''
        if (approval.applicantId !== currentUserId) return false
      }
      return true
    })
  })

  /**
   * 待审批列表
   */
  const pendingApprovals = computed(() => {
    return approvals.value.filter(a => a.status === ApprovalStatus.PENDING)
  })

  /**
   * 已通过列表
   */
  const approvedApprovals = computed(() => {
    return approvals.value.filter(a => a.status === ApprovalStatus.APPROVED)
  })

  /**
   * 已拒绝列表
   */
  const rejectedApprovals = computed(() => {
    return approvals.value.filter(a => a.status === ApprovalStatus.REJECTED)
  })

  // ========== 方法 ==========

  /**
   * 设置审批列表（外部加载后调用）
   */
  const setApprovals = (list) => {
    approvals.value = list
    stats.value = computeStats(list)
    isLoaded.value = true
  }

  /**
   * 获取审批列表（从API加载）
   */
  const fetchApprovals = async (filterParams) => {
    isLoading.value = true
    error.value = null
    try {
      const list = await apiApprovalService.getApprovals(filterParams)
      approvals.value = list
      stats.value = computeStats(list)
      isLoaded.value = true
      return list
    } catch (err) {
      error.value = err.message || '获取审批列表失败'
      console.error('[ApprovalStore] 获取审批列表失败:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 刷新审批列表
   */
  const refreshApprovals = async () => {
    return fetchApprovals(filters.value)
  }

  /**
   * 设置筛选条件
   */
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 重置筛选条件
   */
  const resetFilters = () => {
    filters.value = {}
  }

  /**
   * 根据ID获取审批
   */
  const getApprovalById = (id) => {
    return approvals.value.find(a => a.id === id)
  }

  /**
   * 审批通过
   */
  const approve = async (id, comment) => {
    try {
      const result = await apiApprovalService.approve(id, comment)
      if (result.success) {
        // 更新本地状态
        const index = approvals.value.findIndex(a => a.id === id)
        if (index !== -1) {
          approvals.value[index] = {
            ...approvals.value[index],
            status: ApprovalStatus.APPROVED,
            updatedAt: new Date().toISOString()
          }
          stats.value = computeStats(approvals.value)
        }
        return true
      } else {
        error.value = result.error || '审批通过失败'
        return false
      }
    } catch (err) {
      error.value = err.message || '审批通过失败'
      console.error('[ApprovalStore] 审批通过失败:', err)
      return false
    }
  }

  /**
   * 审批拒绝
   */
  const reject = async (id, comment) => {
    try {
      const result = await apiApprovalService.reject(id, comment)
      if (result.success) {
        // 更新本地状态
        const index = approvals.value.findIndex(a => a.id === id)
        if (index !== -1) {
          approvals.value[index] = {
            ...approvals.value[index],
            status: ApprovalStatus.REJECTED,
            updatedAt: new Date().toISOString()
          }
          stats.value = computeStats(approvals.value)
        }
        return true
      } else {
        error.value = result.error || '审批拒绝失败'
        return false
      }
    } catch (err) {
      error.value = err.message || '审批拒绝失败'
      console.error('[ApprovalStore] 审批拒绝失败:', err)
      return false
    }
  }

  /**
   * 批量审批通过
   */
  const batchApprove = async (ids, comment) => {
    try {
      const result = await apiApprovalService.batchApprove(ids, comment)
      if (result.success) {
        // 重新加载列表
        await fetchApprovals(filters.value)
        return true
      } else {
        error.value = result.error || '批量审批通过失败'
        return false
      }
    } catch (err) {
      error.value = err.message || '批量审批通过失败'
      console.error('[ApprovalStore] 批量审批通过失败:', err)
      return false
    }
  }

  /**
   * 批量审批拒绝
   */
  const batchReject = async (ids, comment) => {
    try {
      const result = await apiApprovalService.batchReject(ids, comment)
      if (result.success) {
        // 重新加载列表
        await fetchApprovals(filters.value)
        return true
      } else {
        error.value = result.error || '批量审批拒绝失败'
        return false
      }
    } catch (err) {
      error.value = err.message || '批量审批拒绝失败'
      console.error('[ApprovalStore] 批量审批拒绝失败:', err)
      return false
    }
  }

  // ========== 返回 ==========
  return {
    // 状态
    approvals,
    filters,
    stats,
    isLoaded,
    isLoading,
    error,
    // 计算属性
    filteredApprovals,
    pendingApprovals,
    approvedApprovals,
    rejectedApprovals,
    // 方法
    setApprovals,
    fetchApprovals,
    refreshApprovals,
    setFilters,
    resetFilters,
    getApprovalById,
    approve,
    reject,
    batchApprove,
    batchReject,
  }
})

export default useApprovalStore

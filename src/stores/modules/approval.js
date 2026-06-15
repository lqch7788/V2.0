/**
 * 审批管理 Store — Pinia 状态管理
 * 文件路径：src/stores/modules/approval.js
 * 功能：管理审批列表、筛选、统计数据和审批操作
 *
 * 数据流：Store → API服务 → enhancedApiClient → API（无本地降级）
 * 与V1.1 useApprovalStore.ts 完全一致
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  apiApprovalService,
  ApprovalStatus,
} from '@/services/apiApprovalService'

/**
 * 2026-06-14: 审批操作后,联动刷新相关业务 Store
 * 根因: 后端 approvalLinkage.js L104-138 已联动修改 production_plans.batch_status + publish_date,
 *       但前端业务 Store 不会自动感知,需要在审批成功后主动重拉
 * 1:1 翻译 V1.1 useApprovalStore.ts:31-38 refreshRelatedBusinessStores
 * 用 dynamic import 避免与 useProductionPlanStore 形成循环依赖
 */
async function refreshRelatedBusinessStores() {
  try {
    const { useProductionPlanStore } = await import('./productionPlan')
    await useProductionPlanStore().fetchPlans()
  } catch (err) {
    // 静默失败 — 不阻塞审批主流程
    console.warn('[ApprovalStore] 联动刷新生产计划失败:', err)
  }
}

// ============================================================
// 统计数据计算（与V1.1 computeStats 完全一致）
// ============================================================

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
   * 已办审批列表（已通过 + 部分通过，与V1.1 useApprovedApprovals L160-162 1:1 一致）
   * P0-008 修复（2026-06-03）：原 V2.0 = APPROVED + REJECTED 是数据源语义错位
   * V1.1 useApprovedApprovals = APPROVED + PARTIALLY_APPROVED
   */
  const approvedApprovals = computed(() => {
    return approvals.value.filter(
      a => a.status === ApprovalStatus.APPROVED || a.status === ApprovalStatus.PARTIALLY_APPROVED
    )
  })

  /**
   * 已拒绝列表
   */
  const rejectedApprovals = computed(() => {
    return approvals.value.filter(a => a.status === ApprovalStatus.REJECTED)
  })

  /**
   * 我提交的审批列表（与V1.1 useMyApprovals 一致）
   */
  const myApprovals = computed(() => {
    const currentUserId = localStorage.getItem('userId') || ''
    return approvals.value.filter(a => a.applicantId === currentUserId)
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
   * 审批通过（与V1.1完全一致：乐观更新+刷新）
   * 2026-06-14: 审批通过后联动刷新 productionPlan store
   * 根因: 后端 approval.ts:832-849 已联动修改 production_plans.batch_status + publish_date,
   *       但前端业务 Store 不会自动感知,需要在审批成功后主动重拉生产计划列表
   * 1:1 翻译 V1.1 useApprovalStore.ts:334-361 approve
   */
  const approve = async (id, comment) => {
    try {
      const result = await apiApprovalService.approve(id, comment)
      if (result.success) {
        // 乐观更新本地状态
        approvals.value = approvals.value.map(a =>
          a.id === id
            ? { ...a, status: ApprovalStatus.APPROVED, updatedAt: new Date().toISOString() }
            : a
        )
        stats.value = computeStats(approvals.value)
        // 重新加载以获取最新数据（与V1.1一致）
        await fetchApprovals(filters.value)
        // 2026-06-14: 联动刷新生产计划列表,让生产计划状态从 'pending' 变为 'published'
        await refreshRelatedBusinessStores()
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
   * 审批拒绝（与V1.1完全一致：乐观更新+刷新）
   * 2026-06-14: 同样需要联动刷新生产计划列表 (rejected -> cancelled)
   */
  const reject = async (id, comment) => {
    try {
      const result = await apiApprovalService.reject(id, comment)
      if (result.success) {
        // 乐观更新本地状态
        approvals.value = approvals.value.map(a =>
          a.id === id
            ? { ...a, status: ApprovalStatus.REJECTED, updatedAt: new Date().toISOString() }
            : a
        )
        stats.value = computeStats(approvals.value)
        // 重新加载以获取最新数据（与V1.1一致）
        await fetchApprovals(filters.value)
        // 2026-06-14: 联动刷新生产计划列表
        await refreshRelatedBusinessStores()
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

  /**
   * 撤回审批（与V1.1 cancel 完全一致）
   */
  const cancel = async (id, reason) => {
    try {
      const result = await apiApprovalService.executeAction(
        id,
        'cancel',
        reason || '',
        localStorage.getItem('userId') || '',
        localStorage.getItem('username') || '系统'
      )
      if (result.success) {
        approvals.value = approvals.value.map(a =>
          a.id === id
            ? { ...a, status: ApprovalStatus.CANCELLED, updatedAt: new Date().toISOString() }
            : a
        )
        stats.value = computeStats(approvals.value)
        await fetchApprovals(filters.value)
        return true
      } else {
        error.value = result.error || '撤回失败'
        return false
      }
    } catch (err) {
      error.value = err.message || '撤回失败'
      console.error('[ApprovalStore] 撤回审批失败:', err)
      return false
    }
  }

  // ========== 本地状态操作（与V1.1完全一致） ==========

  /** 乐观更新本地审批状态（不调API） */
  const updateApprovalLocal = (id, updates) => {
    approvals.value = approvals.value.map(a =>
      a.id === id ? { ...a, ...updates } : a
    )
    stats.value = computeStats(approvals.value)
  }

  /** 乐观删除本地审批（不调API） */
  const deleteApprovalLocal = (id) => {
    approvals.value = approvals.value.filter(a => a.id !== id)
    stats.value = computeStats(approvals.value)
  }

  /** 乐观添加本地审批（不调API） */
  const addApprovalLocal = (approval) => {
    approvals.value = [approval, ...approvals.value]
    stats.value = computeStats(approvals.value)
  }

  // ========== CRUD 操作（与V1.1完全一致） ==========

  /** 创建审批 */
  const addApproval = async (approval) => {
    try {
      const result = await apiApprovalService.createApproval(approval)
      if (result) {
        approvals.value = [result, ...approvals.value]
        stats.value = computeStats(approvals.value)
        return result
      }
      return null
    } catch (err) {
      console.error('[ApprovalStore] 创建审批失败:', err)
      return null
    }
  }

  /** 更新审批 */
  const updateApproval = async (id, updates) => {
    try {
      const result = await apiApprovalService.updateApproval(id, updates)
      if (result) {
        approvals.value = approvals.value.map(a =>
          a.id === id ? { ...a, ...updates } : a
        )
        stats.value = computeStats(approvals.value)
      }
    } catch (err) {
      console.error('[ApprovalStore] 更新审批失败:', err)
    }
  }

  /** 删除审批 */
  const deleteApproval = async (id) => {
    try {
      const result = await apiApprovalService.deleteApproval(id)
      if (result.success) {
        approvals.value = approvals.value.filter(a => a.id !== id)
        stats.value = computeStats(approvals.value)
        return true
      }
      return false
    } catch (err) {
      console.error('[ApprovalStore] 删除审批失败:', err)
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
    myApprovals,
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
    cancel,
    updateApprovalLocal,
    deleteApprovalLocal,
    addApprovalLocal,
    addApproval,
    updateApproval,
    deleteApproval,
  }
})

export default useApprovalStore

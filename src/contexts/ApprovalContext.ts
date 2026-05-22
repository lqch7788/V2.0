// ============================================================
// 审批上下文 Context
// 文件路径：src/contexts/ApprovalContext.ts
// 功能：提供审批相关的全局状态和操作
// ============================================================

import { ref, computed } from 'vue';

// 审批上下文状态
const approvalContext = ref<{
  currentApproval: Record<string, any> | null;
  pendingApprovals: Record<string, any>[];
  historyApprovals: Record<string, any>[];
  isLoading: boolean;
}>({
  currentApproval: null,
  pendingApprovals: [],
  historyApprovals: [],
  isLoading: false,
});

/**
 * 获取审批上下文
 */
export function useApprovalContext() {
  // 当前审批
  const currentApproval = computed(() => approvalContext.value.currentApproval);

  // 待审批列表
  const pendingApprovals = computed(() => approvalContext.value.pendingApprovals);

  // 历史审批列表
  const historyApprovals = computed(() => approvalContext.value.historyApprovals);

  // 加载状态
  const isLoading = computed(() => approvalContext.value.isLoading);

  /**
   * 设置当前审批
   */
  function setCurrentApproval(approval: Record<string, any> | null) {
    approvalContext.value.currentApproval = approval;
  }

  /**
   * 添加待审批
   */
  function addPendingApproval(approval: Record<string, any>) {
    approvalContext.value.pendingApprovals.push(approval);
  }

  /**
   * 移除待审批
   */
  function removePendingApproval(approvalId: string) {
    approvalContext.value.pendingApprovals = approvalContext.value.pendingApprovals.filter(
      (a) => a.id !== approvalId
    );
  }

  /**
   * 清空待审批
   */
  function clearPendingApprovals() {
    approvalContext.value.pendingApprovals = [];
  }

  /**
   * 添加历史审批
   */
  function addHistoryApproval(approval: Record<string, any>) {
    approvalContext.value.historyApprovals.push(approval);
  }

  /**
   * 设置加载状态
   */
  function setLoading(loading: boolean) {
    approvalContext.value.isLoading = loading;
  }

  return {
    currentApproval,
    pendingApprovals,
    historyApprovals,
    isLoading,
    setCurrentApproval,
    addPendingApproval,
    removePendingApproval,
    clearPendingApprovals,
    addHistoryApproval,
    setLoading,
  };
}

export default useApprovalContext;

/**
 * MaterialApproval 状态/类型/分类映射工具
 * 从 MaterialApproval.vue 中拆分提取（保持 1:1 逻辑）
 */

// 物料分类辅助函数
export const getCategoryByCode = (code) => {
  const prefix = code.substring(0, 2)
  const categoryMap = {
    'SP': '种质资源',
    'EQ': '农业机械',
    'OP': '劳保与防护用品',
    'PH': '采收容器',
    'IT': '监测设备',
  }
  if (prefix === 'SP') {
    const subPrefix = code.substring(2, 4)
    if (subPrefix === '02') return '肥料与土壤改良剂'
    if (subPrefix === '03') return '农药与植保产品'
    if (subPrefix === '01') return '种质资源'
  }
  return categoryMap[prefix] || '其他'
}

// 状态显示
export const getStatusText = (status) => {
  const statusMap = {
    approved: '已通过',
    rejected: '已拒绝',
    // P0-MA-002: "待审核" → "待审批"（V1.1 useMaterialApproval hook L199-200）
    pending: '待审批',
    cancelled: '已取消',
    draft: '草稿',
  }
  return statusMap[status] || status
}

export const getStatusTagType = (status) => {
  const typeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning',
    cancelled: 'info',
    draft: 'info',
  }
  return typeMap[status] || 'info'
}

// 退料状态显示
export const getReturnStatusText = (status) => {
  const statusMap = {
    approved: '已完成',
    rejected: '已驳回',
    // P0-MA-002: "待审核" → "待审批"（V1.1 useMaterialApproval hook L216）
    pending: '待审批',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

export const getReturnStatusTagType = (status) => {
  const typeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning',
    cancelled: 'info',
  }
  return typeMap[status] || 'info'
}

// 退料类型映射（P0修复: V1.1 useMaterialApproval.tsx:226-231 1:1 对齐）
export const getReturnType = (item) => {
  if (item.businessLink?.returnType) return item.businessLink.returnType
  if (item.description?.includes('生产退料')) return '生产退料'
  if (item.description?.includes('品质退料')) return '品质退料'
  if (item.description?.includes('试制退料')) return '试制退料'
  return '生产退料'
}

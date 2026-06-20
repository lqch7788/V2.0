/**
 * 采收状态徽章工具
 * 对标 V1.1 src/components/farm/harvest/statusBadgeUtils.tsx
 */

export const STATUS_MAP = {
  pending: { tag: 'warning', text: '待处理', color: '#f59e0b' },
  completed: { tag: 'success', text: '已完成', color: '#10b981' },
  stored: { tag: 'primary', text: '已入库', color: '#3b82f6' },
  rejected: { tag: 'danger', text: '已拒绝', color: '#ef4444' },
}

export const getStatusTagType = (status) => STATUS_MAP[status]?.tag || 'info'
export const getStatusText = (status) => STATUS_MAP[status]?.text || status
export const getStatusColor = (status) => STATUS_MAP[status]?.color || '#9ca3af'

export const getStatusBadgeClass = (status) => {
  const map = {
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    stored: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}
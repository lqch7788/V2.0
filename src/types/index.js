// API 相关类型
export * from './api'

// 业务模块类型
export * from './farm'
export * from './labor'
export * from './crop'
export * from './inventory'
export * from './production'
export * from './system'
// approval 单独导出避免 ApprovalStatus 重复
export { ApprovalStatus } from './approval'
export { ApprovalRecord, Approver, ApprovalType } from './approval'
export * from './purchase'

// 通用类型
export const BaseEntity = {
  id: 0,
  createdAt: '',
  updatedAt: ''
}

export const PaginationParams = {
  page: 1,
  pageSize: 10
}

export const SelectOption = {
  label: '',
  value: ''
}

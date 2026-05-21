// 审批状态
export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

// 审批类型
export const ApprovalType = {
  MATERIAL: 'material',
  LEAVE: 'leave',
  OVERTIME: 'overtime',
  EXPENSE: 'expense',
  PRODUCTION: 'production'
}

// 审批记录
export const ApprovalRecord = {
  id: 0,
  type: 'material',
  title: '',
  content: '',
  applicantId: 0,
  applicantName: '',
  department: '',
  applyDate: '',
  status: 'pending',
  currentLevel: 0,
  totalLevel: 0,
  approvers: [],
  attachments: [],
  remark: ''
}

// 审批人
export const Approver = {
  level: 0,
  userId: 0,
  userName: '',
  status: 'pending',
  comment: '',
  actionDate: ''
}

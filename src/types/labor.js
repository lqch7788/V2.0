/**
 * 人工管理模块 类型定义
 * 覆盖: 考勤/请假/加班/工资/计件/预算/合同/技能/招聘/入职/离职/排班/绩效/风险/临时工/工作日志/岗位/班组
 */

// ============================================
// 基础枚举/常量
// ============================================

/** 考勤状态 */
export const AttendanceStatus = {
  NORMAL: 'normal',
  LATE: 'late',
  EARLY: 'early',
  LEAVE: 'leave',
  ABSENT: 'absent'
}

/** 工人类型 */
export const WorkerType = {
  PERMANENT: 'permanent',
  TEMPORARY: 'temporary',
  CONTRACTOR: 'contractor'
}

/** 工人状态 */
export const WorkerStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LEFT: 'left'
}

/** 请假类型 */
export const LeaveType = {
  ANNUAL: '年假',
  SICK: '病假',
  PERSONAL: '事假',
  MARRIAGE: '婚假',
  MATERNITY: '产假',
  PATERNITY: '陪产假',
  FUNERAL: '丧假',
  INJURY: '工伤假'
}

/** 请假状态 */
export const LeaveStatus = {
  PENDING: '待审批',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
  CANCELLED: '已取消',
  WITHDRAWN: '已撤回'
}

/** 加班类型 */
export const OvertimeType = {
  WORKDAY: '工作日加班',
  WEEKEND: '休息日加班',
  HOLIDAY: '节假日加班'
}

/** 加班状态 */
export const OvertimeStatus = {
  PENDING: '待审批',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
  CANCELLED: '已取消'
}

/** 工资计算类型 */
export const SalaryCalcType = {
  MONTHLY: '月薪制',
  DAILY: '日薪制',
  HOURLY: '时薪制'
}

/** 工资状态 */
export const SalaryStatus = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  PAID: '已发放'
}

/** 审批状态（通用） */
export const ApprovalStatus = {
  PENDING: '待审批',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
  CANCELLED: '已取消'
}

/** 招聘优先级 */
export const RecruitmentPriority = {
  URGENT: '紧急',
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低'
}

/** 入职状态 */
export const OnboardingStatus = {
  PENDING: '待入职',
  IN_PROGRESS: '办理中',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}

/** 合同类型 */
export const ContractType = {
  FIXED: '固定期限',
  OPEN_ENDED: '无固定期限',
  PROJECT: '项目合同',
  PROBATION: '试用期合同'
}

/** 离职类型 */
export const ResignationType = {
  VOLUNTARY: '主动离职',
  INVOLUNTARY: '被动离职',
  CONTRACT_EXPIRY: '合同到期',
  RETIREMENT: '退休'
}

/** 任务状态 */
export const TaskStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

/** 任务优先级 */
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

/** 排班类型 */
export const ScheduleType = {
  DAY: '白班',
  NIGHT: '夜班',
  MIDDLE: '中班',
  REST: '休息'
}

/** 风险等级 */
export const RiskLevel = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  CRITICAL: '严重'
}

// ============================================
// 考勤相关类型
// ============================================

/**
 * @typedef {Object} AttendanceRecord
 * @property {number} id
 * @property {string} workerId
 * @property {string} name - 员工姓名
 * @property {string} dept - 部门
 * @property {string} date - 日期 YYYY-MM-DD
 * @property {string} checkIn - 签到时间
 * @property {string} checkOut - 签退时间
 * @property {number} hours - 工时
 * @property {string} status - 状态
 * @property {string} [taskId] - 关联任务ID
 * @property {string} [batchId] - 关联批次ID
 */

/**
 * @typedef {Object} AttendanceFilters
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} dept
 * @property {string} keyword
 */

/**
 * @typedef {Object} AttendanceRepairRecord
 * @property {string} id
 * @property {string} workerId
 * @property {string} workerName
 * @property {string} date
 * @property {string} originalCheckIn
 * @property {string} originalCheckOut
 * @property {string} repairCheckIn
 * @property {string} repairCheckOut
 * @property {string} reason
 * @property {string} status
 * @property {string} applyTime
 */

// ============================================
// 请假相关类型
// ============================================

/**
 * @typedef {Object} LeaveRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} staffName
 * @property {string} leaveType - 请假类型
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} days - 请假天数
 * @property {string} reason
 * @property {string} status - 审批状态
 * @property {string} [approver]
 * @property {string} [approveTime]
 * @property {string} [remarks]
 */

/**
 * @typedef {Object} LeaveQuota
 * @property {string} staffId
 * @property {string} staffName
 * @property {number} year
 * @property {number} annualLeaveTotal
 * @property {number} annualLeaveUsed
 * @property {number} annualLeaveRemaining
 * @property {number} sickLeaveTotal
 * @property {number} sickLeaveUsed
 * @property {number} sickLeaveRemaining
 */

// ============================================
// 加班相关类型
// ============================================

/**
 * @typedef {Object} OvertimeRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} staffName
 * @property {string} dept
 * @property {string} date
 * @property {string} type - 加班类型
 * @property {number} hours - 加班时长
 * @property {string} reason
 * @property {string} status - 审批状态
 * @property {number} [calculatedPay] - 计算出的加班费
 * @property {string} [approver]
 * @property {string} [approveTime]
 */

// ============================================
// 人员/工人相关类型
// ============================================

/**
 * @typedef {Object} Worker
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} idCard
 * @property {string} department - 部门
 * @property {string} position - 岗位
 * @property {string} type - 员工类型
 * @property {string} status - 在职状态
 * @property {string} joinDate - 入职日期
 * @property {string} [leaveDate] - 离职日期
 * @property {string} [email]
 * @property {string} [gender]
 * @property {string} [birthDate]
 * @property {string} [address]
 * @property {string[]} [skills] - 技能标签
 * @property {string} [emergencyContact]
 * @property {string} [emergencyPhone]
 */

// ============================================
// 工资相关类型
// ============================================

/**
 * @typedef {Object} SalaryRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} staffName
 * @property {string} month - YYYY-MM
 * @property {string} calcType - 计算类型
 * @property {number} baseSalary - 基本工资
 * @property {number} overtimePay - 加班费
 * @property {number} bonuses - 奖金
 * @property {number} deductions - 扣款
 * @property {number} lateDeductions - 迟到扣款
 * @property {number} absenceDeductions - 缺勤扣款
 * @property {number} socialSecurity - 社保
 * @property {number} housingFund - 公积金
 * @property {number} personalTax - 个税
 * @property {number} netSalary - 实发工资
 * @property {string} status - 状态
 */

/**
 * @typedef {Object} PieceworkRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} staffName
 * @property {string} date
 * @property {string} taskType - 任务类型
 * @property {string} taskName - 任务名称
 * @property {number} quantity - 完成数量
 * @property {string} unit - 单位
 * @property {number} unitPrice - 单价
 * @property {number} totalAmount - 总金额
 * @property {string} status
 * @property {string} [remarks]
 */

/**
 * @typedef {Object} SalaryBudget
 * @property {string} id
 * @property {string} department
 * @property {string} year
 * @property {string} month
 * @property {number} budgetAmount - 预算金额
 * @property {number} actualAmount - 实际支出
 * @property {number} variancePercent - 差异百分比
 * @property {string} status
 * @property {string} [notes]
 */

// ============================================
// 合同相关类型
// ============================================

/**
 * @typedef {Object} ContractRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} staffName
 * @property {string} contractType - 合同类型
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} [signDate]
 * @property {string} status - 状态(生效/即将到期/已到期/已终止)
 * @property {string} [remarks]
 */

// ============================================
// 招聘相关类型
// ============================================

/**
 * @typedef {Object} RecruitmentRecord
 * @property {string} id
 * @property {string} department
 * @property {string} position
 * @property {number} headcount - 招聘人数
 * @property {string} priority - 紧急程度
 * @property {string} reqDate - 需求日期
 * @property {string} reason
 * @property {string} status
 * @property {string} [requirements]
 * @property {string} [salaryRange]
 */

// ============================================
// 入职相关类型
// ============================================

/**
 * @typedef {Object} OnboardingRecord
 * @property {string} id
 * @property {string} staffName
 * @property {string} department
 * @property {string} position
 * @property {string} onboardDate - 入职日期
 * @property {string} status - 入职状态
 * @property {string} [type] - 员工类型
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [idCard]
 * @property {string} [probationEndDate] - 试用期结束日期
 * @property {string} [remarks]
 */

// ============================================
// 离职相关类型
// ============================================

/**
 * @typedef {Object} ResignationRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} staffName
 * @property {string} department
 * @property {string} position
 * @property {string} resignType - 离职类型
 * @property {string} resignDate - 离职日期
 * @property {string} reason
 * @property {string} status
 * @property {string} [applyDate]
 * @property {string} [approver]
 */

// ============================================
// 排班相关类型
// ============================================

/**
 * @typedef {Object} ScheduleRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} staffName
 * @property {string} date
 * @property {string} shiftType - 班次类型
 * @property {string} startTime
 * @property {string} endTime
 * @property {string} [location]
 * @property {string} [remarks]
 */

// ============================================
// 绩效相关类型
// ============================================

/**
 * @typedef {Object} PerformanceRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} staffName
 * @property {string} department
 * @property {string} period - 考核周期 YYYY-MM
 * @property {number} score - 考核分数
 * @property {string} grade - 考核等级(A/B/C/D)
 * @property {string} [evaluator]
 * @property {string} [evaluateDate]
 * @property {string} [comments]
 * @property {string} status
 */

// ============================================
// 风险相关类型
// ============================================

/**
 * @typedef {Object} RiskAlert
 * @property {string} id
 * @property {string} type - 风险类型
 * @property {string} level - 风险等级
 * @property {string} title
 * @property {string} description
 * @property {string} dept - 涉及部门
 * @property {string} foundDate - 发现日期
 * @property {string} [resolvedDate] - 解决日期
 * @property {string} status
 * @property {string} [actionPlan]
 * @property {string} [responsible]
 */

// ============================================
// 技能相关类型
// ============================================

/**
 * @typedef {Object} SkillRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} staffName
 * @property {string[]} skillTags - 技能标签列表
 * @property {string} skillLevel - 技能等级(初级/中级/高级/专家)
 * @property {string} [certificate] - 证书
 * @property {string} [certDate] - 获证日期
 * @property {string} [updateDate] - 最近更新日期
 */

// ============================================
// 临时工相关类型
// ============================================

/**
 * @typedef {Object} TempWorkerRecord
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} idCard
 * @property {string} dept - 所属部门
 * @property {string} position - 岗位
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} dailyRate - 日工资
 * @property {string} status
 * @property {string} [remarks]
 */

// ============================================
// 工作日志相关类型
// ============================================

/**
 * @typedef {Object} WorkLogRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} staffName
 * @property {string} date
 * @property {string} taskType
 * @property {string} taskDescription
 * @property {number} hours - 工时
 * @property {string} location
 * @property {string} status
 * @property {string} [remarks]
 */

// ============================================
// 岗位相关类型
// ============================================

/**
 * @typedef {Object} Position
 * @property {string} id
 * @property {string} name - 岗位名称
 * @property {string} departmentId - 所属部门ID
 * @property {number} level - 岗位级别
 * @property {string} [description]
 * @property {string} [requirements]
 */

// ============================================
// 部门相关类型
// ============================================

/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} [managerId]
 * @property {string} [managerName]
 * @property {string} [parentId]
 */

// ============================================
// 班组相关类型
// ============================================

/**
 * @typedef {Object} TeamRecord
 * @property {string} id
 * @property {string} name - 班组名称
 * @property {string} leaderId - 班组长ID
 * @property {string} leaderName - 班组长姓名
 * @property {string[]} memberIds - 成员ID列表
 * @property {string} department
 * @property {string} [description]
 */

// ============================================
// 人效分析相关类型
// ============================================

/**
 * @typedef {Object} EfficiencyRecord
 * @property {string} id
 * @property {string} department
 * @property {string} period - 周期 YYYY-MM
 * @property {number} totalHours - 总工时
 * @property {number} output - 产出量
 * @property {number} efficiency - 人效指数
 * @property {number} costPerUnit - 单位成本
 * @property {number} [targetEfficiency] - 目标人效
 */

// ============================================
// 月报相关类型
// ============================================

/**
 * @typedef {Object} MonthlyReport
 * @property {string} id
 * @property {string} department
 * @property {string} month - YYYY-MM
 * @property {number} totalWorkers - 总人数
 * @property {number} attendanceRate - 出勤率
 * @property {number} totalLaborCost - 总人工成本
 * @property {number} totalOutput - 总产出
 * @property {number} efficiency - 人效指数
 * @property {string} status
 */

// ============================================
// 通用分页类型
// ============================================

/**
 * @typedef {Object} PaginationInfo
 * @property {number} currentPage
 * @property {number} pageSize
 * @property {number} total
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {string} [message]
 * @property {{ total: number, page: number, pageSize: number }} [pagination]
 */

// ============================================
// 状态颜色映射（通用）
// ============================================

export const STATUS_COLORS = {
  '待审批': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  '已通过': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  '已拒绝': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  '已取消': { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
  '已撤回': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  '待确认': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  '已确认': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  '已发放': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  '正常': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  '迟到': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  '早退': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  '请假': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  '缺勤': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
}

export const WORKER_TYPE_COLORS = {
  'permanent': { label: '正式员工', color: '#22c55e' },
  'temporary': { label: '临时工', color: '#f59e0b' },
  'contractor': { label: '外包人员', color: '#6b7280' }
}

export const RISK_LEVEL_COLORS = {
  '低': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '中': { bg: 'bg-amber-100', text: 'text-amber-700' },
  '高': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '严重': { bg: 'bg-red-100', text: 'text-red-700' }
}

export const TASK_PRIORITY_COLORS = {
  'low': { bg: 'bg-gray-100', text: 'text-gray-600', label: '低' },
  'medium': { bg: 'bg-blue-100', text: 'text-blue-700', label: '中' },
  'high': { bg: 'bg-orange-100', text: 'text-orange-700', label: '高' },
  'urgent': { bg: 'bg-red-100', text: 'text-red-700', label: '紧急' }
}

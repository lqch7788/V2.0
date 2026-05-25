/**
 * 人工管理 配置数据
 * 集中管理所有配置常量，避免硬编码
 * 来源: V1.1 laborConfig.ts + laborData.ts + leaveConfig.ts + overtimeConfig.ts
 */

// ============================================
// 通用审批状态
// ============================================

export const APPROVAL_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '待审批', label: '待审批' },
  { value: '已通过', label: '已通过' },
  { value: '已拒绝', label: '已拒绝' },
  { value: '已取消', label: '已取消' }
]

export const APPROVAL_STATUS_COLORS = {
  '待审批': 'bg-amber-100 text-amber-700',
  '已通过': 'bg-emerald-100 text-emerald-700',
  '已拒绝': 'bg-red-100 text-red-700',
  '已取消': 'bg-gray-100 text-gray-500',
  '已撤回': 'bg-gray-100 text-gray-600'
}

// ============================================
// 请假配置
// ============================================

export const LEAVE_TYPE_OPTIONS = [
  { value: '年假', label: '年假' },
  { value: '病假', label: '病假' },
  { value: '事假', label: '事假' },
  { value: '婚假', label: '婚假' },
  { value: '产假', label: '产假' },
  { value: '陪产假', label: '陪产假' },
  { value: '丧假', label: '丧假' },
  { value: '工伤假', label: '工伤假' }
]

export const LEAVE_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '待审批', label: '待审批' },
  { value: '已通过', label: '已通过' },
  { value: '已拒绝', label: '已拒绝' },
  { value: '已撤回', label: '已撤回' },
  { value: '已取消', label: '已取消' }
]

// ============================================
// 加班配置
// ============================================

export const OVERTIME_TYPE_OPTIONS = [
  { value: '工作日加班', label: '工作日加班' },
  { value: '休息日加班', label: '休息日加班' },
  { value: '节假日加班', label: '节假日加班' }
]

export const OVERTIME_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '待审批', label: '待审批' },
  { value: '已通过', label: '已通过' },
  { value: '已拒绝', label: '已拒绝' },
  { value: '已取消', label: '已取消' }
]

// ============================================
// 考勤配置
// ============================================

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'normal', label: '正常' },
  { value: 'late', label: '迟到' },
  { value: 'early', label: '早退' },
  { value: 'leave', label: '请假' },
  { value: 'absent', label: '缺勤' }
]

export const ATTENDANCE_STATUS_MAP = {
  normal: { label: '正常', color: '#22c55e' },
  late: { label: '迟到', color: '#f59e0b' },
  early: { label: '早退', color: '#f97316' },
  leave: { label: '请假', color: '#3b82f6' },
  absent: { label: '缺勤', color: '#ef4444' }
}

export const REPAIR_REASON_OPTIONS = [
  { value: '忘打卡', label: '忘打卡' },
  { value: '设备故障', label: '设备故障' },
  { value: '外出办公', label: '外出办公' },
  { value: '其他', label: '其他' }
]

// ============================================
// 人员/员工配置
// ============================================

export const WORKER_TYPE_OPTIONS = [
  { value: 'permanent', label: '正式员工' },
  { value: 'temporary', label: '临时工' },
  { value: 'contractor', label: '外包人员' }
]

export const WORKER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'active', label: '在职' },
  { value: 'inactive', label: '停职' },
  { value: 'left', label: '离职' }
]

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: '试用期', label: '试用期' },
  { value: '正式员工', label: '正式员工' },
  { value: '临时工', label: '临时工' },
  { value: '外包', label: '外包' }
]

// ============================================
// 部门数据（模拟）
// ============================================

export const DEPARTMENTS = [
  { id: 'D001', name: '生产部', managerId: 'U002', managerName: '李明辉' },
  { id: 'D002', name: '技术部', managerId: 'U004', managerName: '赵文静' },
  { id: 'D003', name: '仓储部', managerId: 'U010', managerName: '孙丽娜' },
  { id: 'D004', name: '财务部', managerId: 'U013', managerName: '财务经理' },
  { id: 'D005', name: '综合办', managerId: 'U014', managerName: '行政经理' }
]

export const DEPT_OPTIONS = [
  { value: '', label: '全部' },
  { value: '生产部', label: '生产部' },
  { value: '技术部', label: '技术部' },
  { value: '仓储部', label: '仓储部' },
  { value: '财务部', label: '财务部' },
  { value: '综合办', label: '综合办' }
]

// ============================================
// 岗位数据（模拟）
// ============================================

export const POSITIONS = [
  { id: 'P001', name: '生产主管', departmentId: 'D001', level: 1 },
  { id: 'P002', name: '生产经理', departmentId: 'D001', level: 2 },
  { id: 'P003', name: '生产组长', departmentId: 'D001', level: 3 },
  { id: 'P004', name: '种植工', departmentId: 'D001', level: 4 },
  { id: 'P005', name: '农技员', departmentId: 'D001', level: 3 },
  { id: 'P006', name: '农机手', departmentId: 'D001', level: 4 },
  { id: 'P007', name: '技术总监', departmentId: 'D002', level: 1 },
  { id: 'P008', name: '技术员', departmentId: 'D002', level: 3 },
  { id: 'P009', name: '设备维护员', departmentId: 'D002', level: 4 },
  { id: 'P010', name: '仓储主管', departmentId: 'D003', level: 1 },
  { id: 'P011', name: '仓库管理员', departmentId: 'D003', level: 4 },
  { id: 'P012', name: '搬运工', departmentId: 'D003', level: 5 },
  { id: 'P013', name: '财务经理', departmentId: 'D004', level: 1 },
  { id: 'P014', name: '会计', departmentId: 'D004', level: 3 },
  { id: 'P015', name: '出纳', departmentId: 'D004', level: 4 },
  { id: 'P016', name: '行政经理', departmentId: 'D005', level: 1 },
  { id: 'P017', name: '行政助理', departmentId: 'D005', level: 3 },
  { id: 'P018', name: '招聘专员', departmentId: 'D005', level: 3 },
  { id: 'P019', name: '人事专员', departmentId: 'D005', level: 3 }
]

// ============================================
// 合同配置
// ============================================

export const CONTRACT_TYPE_OPTIONS = [
  { value: '固定期限', label: '固定期限' },
  { value: '无固定期限', label: '无固定期限' },
  { value: '项目合同', label: '项目合同' },
  { value: '试用期合同', label: '试用期合同' }
]

export const CONTRACT_PERIOD_OPTIONS = [
  { value: '1年', label: '1年' },
  { value: '2年', label: '2年' },
  { value: '3年', label: '3年' },
  { value: '5年', label: '5年' },
  { value: '无固定期限', label: '无固定期限' }
]

export const CONTRACT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '生效中', label: '生效中' },
  { value: '即将到期', label: '即将到期' },
  { value: '已到期', label: '已到期' },
  { value: '已终止', label: '已终止' }
]

// ============================================
// 招聘配置
// ============================================

export const RECRUITMENT_PRIORITY_OPTIONS = [
  { value: '紧急', label: '紧急', color: 'red' },
  { value: '高', label: '高', color: 'orange' },
  { value: '中', label: '中', color: 'blue' },
  { value: '低', label: '低', color: 'gray' }
]

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '全职', label: '全职' },
  { value: '兼职', label: '兼职' },
  { value: '实习', label: '实习' },
  { value: '外包', label: '外包' }
]

// ============================================
// 入职配置
// ============================================

export const ONBOARDING_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '待入职', label: '待入职' },
  { value: '办理中', label: '办理中' },
  { value: '已完成', label: '已完成' },
  { value: '已取消', label: '已取消' }
]

// ============================================
// 离职配置
// ============================================

export const RESIGNATION_TYPE_OPTIONS = [
  { value: '主动离职', label: '主动离职' },
  { value: '被动离职', label: '被动离职' },
  { value: '合同到期', label: '合同到期' },
  { value: '退休', label: '退休' }
]

// ============================================
// 调薪配置
// ============================================

export const ADJUSTMENT_TYPE_OPTIONS = [
  { value: '晋升调薪', label: '晋升调薪' },
  { value: '年度调薪', label: '年度调薪' },
  { value: '绩效调薪', label: '绩效调薪' },
  { value: '市场调薪', label: '市场调薪' },
  { value: '其他', label: '其他' }
]

// ============================================
// 工资配置
// ============================================

export const SALARY_CALC_TYPE_OPTIONS = [
  { value: '月薪制', label: '月薪制' },
  { value: '日薪制', label: '日薪制' },
  { value: '时薪制', label: '时薪制' }
]

export const SALARY_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '待确认', label: '待确认' },
  { value: '已确认', label: '已确认' },
  { value: '已发放', label: '已发放' }
]

// ============================================
// 排班配置
// ============================================

export const SHIFT_TYPE_OPTIONS = [
  { value: '白班', label: '白班 (08:00-16:00)' },
  { value: '夜班', label: '夜班 (16:00-00:00)' },
  { value: '中班', label: '中班 (00:00-08:00)' },
  { value: '休息', label: '休息' }
]

// ============================================
// 考核配置
// ============================================

export const PERFORMANCE_GRADE_OPTIONS = [
  { value: 'A', label: 'A - 优秀' },
  { value: 'B', label: 'B - 良好' },
  { value: 'C', label: 'C - 合格' },
  { value: 'D', label: 'D - 待改进' }
]

// ============================================
// 风险配置
// ============================================

export const RISK_LEVEL_OPTIONS = [
  { value: '', label: '全部' },
  { value: '低', label: '低' },
  { value: '中', label: '中' },
  { value: '高', label: '高' },
  { value: '严重', label: '严重' }
]

export const RISK_TYPE_OPTIONS = [
  { value: '工伤风险', label: '工伤风险' },
  { value: '人员流失', label: '人员流失' },
  { value: '劳动纠纷', label: '劳动纠纷' },
  { value: '合规风险', label: '合规风险' },
  { value: '安全风险', label: '安全风险' }
]

// ============================================
// 技能配置
// ============================================

export const SKILL_LEVEL_OPTIONS = [
  { value: '初级', label: '初级' },
  { value: '中级', label: '中级' },
  { value: '高级', label: '高级' },
  { value: '专家', label: '专家' }
]

export const SKILL_TAG_OPTIONS = [
  '种植', '施肥', '灌溉', '病虫害防治', '农机操作',
  '设备维修', '仓储管理', '质量控制', '数据分析',
  '项目管理', '团队管理', '安全管理', '技术培训'
]

// ============================================
// 任务配置
// ============================================

export const TASK_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待接受' },
  { value: 'accepted', label: '已接受' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'rejected', label: '已驳回' },
  { value: 'cancelled', label: '已取消' }
]

export const TASK_PRIORITY_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' }
]

export const TASK_TYPE_OPTIONS = [
  { value: 'equipment_repair', label: '设备维修' },
  { value: 'farm_repair', label: '农事抢修' },
  { value: 'cleaning', label: '清洁作业' },
  { value: 'handling', label: '搬运作业' },
  { value: 'other', label: '其他' }
]

// ============================================
// 默认配置
// ============================================

export const DEFAULT_BASE_SALARY = 6000
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

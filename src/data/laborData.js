// 人工管理相关 Mock 数据

// 部门列表
export const departments = [
  { id: 1, name: '技术部', manager: '张三', phone: '13800138001' },
  { id: 2, name: '运营部', manager: '李四', phone: '13800138002' },
  { id: 3, name: '市场部', manager: '王五', phone: '13800138003' },
  { id: 4, name: '财务部', manager: '赵六', phone: '13800138004' }
]

// 岗位列表
export const positions = [
  { id: 1, name: '农艺师', department: '技术部' },
  { id: 2, name: '技术员', department: '技术部' },
  { id: 3, name: '运营专员', department: '运营部' },
  { id: 4, name: '市场专员', department: '市场部' }
]

// 请假类型
export const leaveTypes = [
  { value: 'annual', label: '年假' },
  { value: 'sick', label: '病假' },
  { value: 'personal', label: '事假' },
  { value: 'other', label: '其他' }
]

// 考勤状态
export const attendanceStatusMap = {
  normal: { label: '正常', color: '#22c55e' },
  late: { label: '迟到', color: '#f59e0b' },
  early: { label: '早退', color: '#f97316' },
  leave: { label: '请假', color: '#3b82f6' },
  absent: { label: '缺勤', color: '#ef4444' }
}

// 人员类型
export const workerTypes = {
  permanent: { label: '正式员工', color: '#22c55e' },
  temporary: { label: '临时工', color: '#f59e0b' },
  contractor: { label: '外包人员', color: '#6b7280' }
}

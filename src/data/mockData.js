// 用户 Mock 数据
export const mockUsers = [
  { id: 1, username: 'admin', name: '管理员', role: 'admin', department: '系统管理部', status: 'active' },
  { id: 2, username: 'zhangsan', name: '张三', role: 'user', department: '技术部', status: 'active' },
  { id: 3, username: 'lisi', name: '李四', role: 'user', department: '运营部', status: 'active' },
  { id: 4, username: 'wangwu', name: '王五', role: 'user', department: '市场部', status: 'inactive' },
]

// 农事任务 Mock 数据
export const mockFarmTasks = [
  {
    id: 1,
    title: '番茄浇水',
    content: '对1号大棚番茄进行浇水作业',
    status: 'pending',
    priority: 'high',
    assigneeId: 2,
    assigneeName: '张三',
    planStartTime: '2026-05-21 08:00',
    planEndTime: '2026-05-21 10:00',
    blockId: 1,
    blockName: '1号大棚-A区',
    createdAt: '2026-05-20 10:00:00'
  },
  {
    id: 2,
    title: '施肥',
    content: '对2号地块进行有机肥施用',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 3,
    assigneeName: '李四',
    planStartTime: '2026-05-21 14:00',
    planEndTime: '2026-05-21 16:00',
    blockId: 2,
    blockName: '2号地块',
    createdAt: '2026-05-20 14:00:00'
  },
  {
    id: 3,
    title: '病虫害检查',
    content: '检查黄瓜生长情况及病虫害',
    status: 'completed',
    priority: 'low',
    assigneeId: 2,
    assigneeName: '张三',
    planStartTime: '2026-05-20 09:00',
    planEndTime: '2026-05-20 11:00',
    actualStartTime: '2026-05-20 09:00',
    actualEndTime: '2026-05-20 10:30',
    blockId: 3,
    blockName: '3号大棚',
    createdAt: '2026-05-19 16:00:00'
  },
  {
    id: 4,
    title: '采收番茄',
    content: '采收成熟的番茄',
    status: 'pending',
    priority: 'urgent',
    assigneeId: 3,
    assigneeName: '李四',
    planStartTime: '2026-05-22 07:00',
    planEndTime: '2026-05-22 12:00',
    blockId: 1,
    blockName: '1号大棚-A区',
    createdAt: '2026-05-21 08:00:00'
  }
]

// 考勤记录 Mock 数据
export const mockAttendanceRecords = [
  { id: 1, userId: 2, userName: '张三', department: '技术部', date: '2026-05-21', checkInTime: '08:30', checkOutTime: '18:00', status: 'normal' },
  { id: 2, userId: 3, userName: '李四', department: '运营部', date: '2026-05-21', checkInTime: '08:00', checkOutTime: '17:30', status: 'normal' },
  { id: 3, userId: 4, userName: '王五', department: '市场部', date: '2026-05-21', checkInTime: '09:15', checkOutTime: '18:00', status: 'late' },
  { id: 4, userId: 2, userName: '张三', department: '技术部', date: '2026-05-20', checkInTime: '08:00', checkOutTime: '17:45', status: 'normal' },
  { id: 5, userId: 3, userName: '李四', department: '运营部', date: '2026-05-20', checkInTime: '08:00', checkOutTime: '18:00', status: 'normal' },
]

// 作物 Mock 数据
export const mockCrops = [
  { id: 1, name: '番茄', category: '茄果类', growthCycle: 120, expectedYield: 5000 },
  { id: 2, name: '黄瓜', category: '瓜类', growthCycle: 90, expectedYield: 4000 },
  { id: 3, name: '辣椒', category: '茄果类', growthCycle: 100, expectedYield: 3000 },
  { id: 4, name: '茄子', category: '茄果类', growthCycle: 110, expectedYield: 4500 },
  { id: 5, name: '生菜', category: '叶菜类', growthCycle: 60, expectedYield: 2000 },
]

// 地块 Mock 数据
export const mockBlocks = [
  { id: 1, name: '1号大棚-A区', zoneName: '大棚区', area: 1000, cropType: '番茄', status: 'planted' },
  { id: 2, name: '1号大棚-B区', zoneName: '大棚区', area: 1000, cropType: '黄瓜', status: 'planted' },
  { id: 3, name: '2号大棚', zoneName: '大棚区', area: 1500, cropType: '辣椒', status: 'growing' },
  { id: 4, name: '3号地块', zoneName: '露天区', area: 2000, status: 'idle' },
  { id: 5, name: '4号地块', zoneName: '露天区', area: 1800, cropType: '生菜', status: 'harvested' },
]

// 库存 Mock 数据
export const mockInventory = [
  { id: 1, code: 'MAT001', name: '有机肥', category: '肥料', specification: '50kg/袋', unit: '袋', safeStock: 100, currentStock: 150, price: 120 },
  { id: 2, code: 'MAT002', name: '复合肥', category: '肥料', specification: '25kg/袋', unit: '袋', safeStock: 80, currentStock: 60, price: 85 },
  { id: 3, code: 'MAT003', name: '农药A', category: '农药', specification: '500ml/瓶', unit: '瓶', safeStock: 50, currentStock: 45, price: 35 },
  { id: 4, code: 'MAT004', name: '农膜', category: '农具', specification: '2m*100m', unit: '卷', safeStock: 20, currentStock: 25, price: 280 },
  { id: 5, code: 'MAT005', name: '浇水带', category: '农具', specification: '50m/卷', unit: '卷', safeStock: 30, currentStock: 28, price: 95 },
]

// 审批 Mock 数据
export const mockApprovals = [
  {
    id: 1,
    type: 'material',
    title: '物料采购申请 - 有机肥',
    content: '申请采购有机肥50袋',
    applicantId: 2,
    applicantName: '张三',
    department: '技术部',
    applyDate: '2026-05-20 10:00',
    status: 'pending',
    currentLevel: 1,
    totalLevel: 2,
    approvers: [
      { level: 1, userId: 5, userName: '审批人A', status: 'pending' },
      { level: 2, userId: 1, userName: '审批人B', status: 'pending' }
    ]
  },
  {
    id: 2,
    type: 'leave',
    title: '请假申请 - 年假',
    content: '申请5月22日-5月23日年假',
    applicantId: 3,
    applicantName: '李四',
    department: '运营部',
    applyDate: '2026-05-19 14:00',
    status: 'approved',
    currentLevel: 2,
    totalLevel: 2,
    approvers: [
      { level: 1, userId: 5, userName: '审批人A', status: 'approved', actionDate: '2026-05-19 15:00' },
      { level: 2, userId: 1, userName: '审批人B', status: 'approved', actionDate: '2026-05-19 16:00' }
    ]
  }
]

// 统计数据 Mock
export const mockDashboardStats = {
  todayTasks: { total: 12, completed: 8, pending: 4 },
  attendance: { present: 45, absent: 3, late: 2 },
  inventory: { total: 15680, lowStock: 3 },
  alerts: { warning: 5, danger: 1 }
}

// 图表 Mock 数据
export const mockChartData = {
  weeklyTasks: [
    { day: '周一', completed: 15, pending: 5 },
    { day: '周二', completed: 18, pending: 3 },
    { day: '周三', completed: 12, pending: 8 },
    { day: '周四', completed: 20, pending: 2 },
    { day: '周五', completed: 16, pending: 6 },
    { day: '周六', completed: 8, pending: 4 },
    { day: '周日', completed: 5, pending: 3 }
  ],
  cropDistribution: [
    { name: '番茄', value: 35 },
    { name: '黄瓜', value: 25 },
    { name: '辣椒', value: 20 },
    { name: '茄子', value: 15 },
    { name: '其他', value: 5 }
  ],
  monthlyYield: [
    { month: '1月', yield: 1200 },
    { month: '2月', yield: 1500 },
    { month: '3月', yield: 1800 },
    { month: '4月', yield: 2200 },
    { month: '5月', yield: 2500 }
  ]
}

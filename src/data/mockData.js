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

// 仓库 Mock 数据
export const mockWarehouses = [
  { id: 1, code: 'WH001', name: '原料仓库A', warehouseType: '原料仓库', location: '基地东北角', capacity: 5000, currentStock: 3200, managerName: '张三', status: 'active', description: '主要存储生产原材料' },
  { id: 2, code: 'WH002', name: '成品仓库B', warehouseType: '成品仓库', location: '基地西南角', capacity: 8000, currentStock: 4500, managerName: '李四', status: 'active', description: '存储各类成品' },
  { id: 3, code: 'WH003', name: '农药仓库', warehouseType: '农药仓库', location: '基地西北角', capacity: 1000, currentStock: 850, managerName: '王五', status: 'active', description: '专门存放农药' },
  { id: 4, code: 'WH004', name: '化肥仓库', warehouseType: '化肥仓库', location: '基地东南角', capacity: 3000, currentStock: 1200, managerName: '赵六', status: 'active', description: '存放各类化肥' },
  { id: 5, code: 'WH005', name: '设备仓库', warehouseType: '设备仓库', location: '基地中部', capacity: 2000, currentStock: 800, managerName: '钱七', status: 'inactive', description: '农业设备存放' },
  { id: 6, code: 'WH006', name: '耗材仓库', warehouseType: '耗材仓库', location: '基地东区', capacity: 1500, currentStock: 900, managerName: '孙八', status: 'active', description: '日常耗材存储' },
]

// 系统配置 Mock 数据
export const mockSystemConfigs = [
  {
    id: 'CFG_001',
    configKey: 'system.site_name',
    configValue: '智慧种植管理系统',
    configType: 'string',
    category: 'system',
    description: '系统站点名称',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_002',
    configKey: 'system.maintenance_mode',
    configValue: 'false',
    configType: 'boolean',
    category: 'system',
    description: '维护模式开关',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_003',
    configKey: 'system.max_upload_size',
    configValue: '10',
    configType: 'number',
    category: 'system',
    description: '最大上传文件大小(MB)',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_004',
    configKey: 'ui.theme',
    configValue: 'light',
    configType: 'string',
    category: 'ui',
    description: '界面主题',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_005',
    configKey: 'ui.page_size',
    configValue: '20',
    configType: 'number',
    category: 'ui',
    description: '默认分页大小',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_006',
    configKey: 'feature.auto_save',
    configValue: 'true',
    configType: 'boolean',
    category: 'feature',
    description: '自动保存草稿',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_007',
    configKey: 'demo.enabled',
    configValue: 'true',
    configType: 'boolean',
    category: 'demo',
    description: '演示模式开关',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_008',
    configKey: 'task.accept_warning_hours',
    configValue: '24',
    configType: 'number',
    category: 'task',
    description: '任务接单预警小时数',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_009',
    configKey: 'task.overdue_check_interval',
    configValue: '60',
    configType: 'number',
    category: 'task',
    description: '任务逾期检查间隔(分钟)',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_010',
    configKey: 'approval.delegation.rules',
    configValue: JSON.stringify([
      { fromRole: 'manager', toRole: 'department_head', enabled: true, remark: '经理请假时委托给部门主管' },
      { fromRole: 'hr', toRole: 'hr_manager', enabled: true, remark: '人事专员委托给人事经理' }
    ]),
    configType: 'json',
    category: 'approval',
    description: '审批委托规则列表',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_011',
    configKey: 'business.default_currency',
    configValue: 'CNY',
    configType: 'string',
    category: 'business',
    description: '默认货币',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_012',
    configKey: 'business.tax_rate',
    configValue: '0.13',
    configType: 'number',
    category: 'business',
    description: '默认税率',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_013',
    configKey: 'crop.growth.crop-configs',
    configValue: JSON.stringify([
      {
        name: '番茄',
        stages: [
          { stage: 'seedling', startDay: 1, endDay: 30, tasks: [] },
          { stage: 'vegetative', startDay: 31, endDay: 75, tasks: [] },
          { stage: 'flowering', startDay: 76, endDay: 105, tasks: [] },
          { stage: 'fruiting', startDay: 106, endDay: 145, tasks: [] },
          { stage: 'harvest', startDay: 146, endDay: 165, tasks: [] }
        ]
      }
    ]),
    configType: 'json',
    category: 'crop',
    description: '作物生长配置',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'CFG_014',
    configKey: 'crop.pest.alert-rules',
    configValue: JSON.stringify([
      { id: 'pest_001', name: '白粉虱', symptom: ['叶片发黄', '虫卵'], cropType: ['番茄', '黄瓜'], severity: 'medium', suggestion: '使用黄板诱杀', priority: 'medium' }
    ]),
    configType: 'json',
    category: 'crop',
    description: '虫害预警规则',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
]

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

// 农事相关的 Mock 数据

// 巡检记录
export const mockInspectionRecords = [
  {
    id: 1,
    blockId: 1,
    blockName: '1号大棚-A区',
    inspectorId: 2,
    inspectorName: '张三',
    inspectTime: '2026-05-21 08:30',
    weather: '晴',
    temperature: 25,
    humidity: 65,
    发现问题: 2,
    status: 'normal',
    remark: '番茄长势良好，轻微虫害迹象'
  },
  {
    id: 2,
    blockId: 2,
    blockName: '1号大棚-B区',
    inspectorId: 3,
    inspectorName: '李四',
    inspectTime: '2026-05-21 09:00',
    weather: '晴',
    temperature: 26,
    humidity: 60,
    发现问题: 0,
    status: 'normal',
    remark: '黄瓜生长正常'
  }
]

// 农事活动类型
export const farmActivityTypes = [
  { value: 'planting', label: '播种' },
  { value: 'watering', label: '浇水' },
  { value: 'fertilizing', label: '施肥' },
  { value: 'pest_control', label: '病虫害防治' },
  { value: 'harvesting', label: '采收' },
  { value: 'inspection', label: '巡检' },
  { value: 'other', label: '其他' }
]

// 任务状态配置
export const taskStatusConfig = {
  pending: { label: '待开始', color: '#9ca3af' },
  in_progress: { label: '进行中', color: '#3b82f6' },
  completed: { label: '已完成', color: '#22c55e' },
  cancelled: { label: '已取消', color: '#6b7280' }
}

// 优先级配置
export const priorityConfig = {
  low: { label: '低', color: '#22c55e' },
  medium: { label: '中', color: '#f59e0b' },
  high: { label: '高', color: '#f97316' },
  urgent: { label: '紧急', color: '#ef4444' }
}

// 产量统计（与V1.1 farmData.ts 完全一致）
export const yieldStats = [
  { month: '1月', yield: 1250, region: 'G001', crop: 'C001' },
  { month: '2月', yield: 1580, region: 'G001', crop: 'C001' },
  { month: '3月', yield: 2100, region: 'G002', crop: 'C002' },
  { month: '4月', yield: 1850, region: 'G002', crop: 'C002' },
  { month: '5月', yield: 2200, region: 'G003', crop: 'C003' },
  { month: '6月', yield: 1950, region: 'G004', crop: 'C004' },
]

// 成本分析（与V1.1 farmData.ts 完全一致）
export const costAnalysis = [
  { name: '人工成本', value: 45000, period: 'month', crop: '', areaType: '' },
  { name: '化肥成本', value: 28000, period: 'month', crop: 'C001', areaType: 'greenhouse' },
  { name: '农药成本', value: 15000, period: 'month', crop: 'C002', areaType: 'greenhouse' },
  { name: '种子种苗', value: 22000, period: 'quarter', crop: '', areaType: '' },
  { name: '基质农膜', value: 18000, period: 'quarter', crop: 'C001', areaType: 'field' },
  { name: '能源成本', value: 15000, period: 'year', crop: '', areaType: '' },
  { name: '其他成本', value: 13800, period: 'month', crop: 'C003', areaType: 'field' },
]

/**
 * 指标数据 Mock 数据
 * 用于 V2.0 指标数据页面
 */

// 指标列表 Mock 数据
export const mockIndicators = [
  {
    id: '1',
    code: 'IND001',
    name: '单位面积产量',
    category: '生产指标',
    unit: 'kg/亩',
    target: 5000,
    actual: 5200,
    trend: 'up',
    frequency: '月度',
    source: '自动采集',
    warning: 4500,
    weight: 20,
    createTime: '2026-01-01 08:00:00',
    updateTime: '2026-05-20 10:30:00'
  },
  {
    id: '2',
    code: 'IND002',
    name: '产品合格率',
    category: '质量指标',
    unit: '%',
    target: 98,
    actual: 97.5,
    trend: 'stable',
    frequency: '月度',
    source: '自动采集',
    warning: 95,
    weight: 15,
    createTime: '2026-01-01 08:00:00',
    updateTime: '2026-05-20 10:30:00'
  },
  {
    id: '3',
    code: 'IND003',
    name: '生产成本',
    category: '成本指标',
    unit: '元/kg',
    target: 2.5,
    actual: 2.3,
    trend: 'down',
    frequency: '月度',
    source: '自动采集',
    warning: 2.8,
    weight: 15,
    createTime: '2026-01-01 08:00:00',
    updateTime: '2026-05-20 10:30:00'
  },
  {
    id: '4',
    code: 'IND004',
    name: '劳动生产率',
    category: '效率指标',
    unit: 'kg/人',
    target: 800,
    actual: 850,
    trend: 'up',
    frequency: '月度',
    source: '人工录入',
    warning: 700,
    weight: 10,
    createTime: '2026-01-01 08:00:00',
    updateTime: '2026-05-20 10:30:00'
  },
  {
    id: '5',
    code: 'IND005',
    name: '水资源利用率',
    category: '资源指标',
    unit: 'm³/亩',
    target: 300,
    actual: 280,
    trend: 'down',
    frequency: '月度',
    source: '自动采集',
    warning: 320,
    weight: 10,
    createTime: '2026-01-01 08:00:00',
    updateTime: '2026-05-20 10:30:00'
  },
  {
    id: '6',
    code: 'IND006',
    name: '客户满意度',
    category: '服务指标',
    unit: '%',
    target: 95,
    actual: 96,
    trend: 'up',
    frequency: '季度',
    source: '人工录入',
    warning: 90,
    weight: 10,
    createTime: '2026-01-01 08:00:00',
    updateTime: '2026-05-20 10:30:00'
  },
  {
    id: '7',
    code: 'IND007',
    name: '设备利用率',
    category: '设备指标',
    unit: '%',
    target: 85,
    actual: 82,
    trend: 'stable',
    frequency: '月度',
    source: '自动采集',
    warning: 80,
    weight: 8,
    createTime: '2026-01-01 08:00:00',
    updateTime: '2026-05-20 10:30:00'
  },
  {
    id: '8',
    code: 'IND008',
    name: '安全事故数',
    category: '安全指标',
    unit: '起',
    target: 0,
    actual: 0,
    trend: 'stable',
    frequency: '月度',
    source: '人工录入',
    warning: 1,
    weight: 12,
    createTime: '2026-01-01 08:00:00',
    updateTime: '2026-05-20 10:30:00'
  }
]

// 评估数据 Mock 数据 - 与V1.1保持一致
export const mockEvaluationData = [
  { id: '1', name: '上海松江基地', productionScore: 92, qualityScore: 95, costScore: 88, efficiencyScore: 90, totalScore: 91.25, rank: 1 },
  { id: '2', name: '上海崇明基地', productionScore: 88, qualityScore: 92, costScore: 85, efficiencyScore: 87, totalScore: 88.0, rank: 2 },
  { id: '3', name: '上海嘉定基地', productionScore: 85, qualityScore: 90, costScore: 90, efficiencyScore: 85, totalScore: 87.5, rank: 3 },
  { id: '4', name: '上海奉贤基地', productionScore: 90, qualityScore: 88, costScore: 82, efficiencyScore: 88, totalScore: 87.0, rank: 4 },
  { id: '5', name: '西安雁塔基地', productionScore: 82, qualityScore: 85, costScore: 88, efficiencyScore: 86, totalScore: 85.25, rank: 5 },
  { id: '6', name: '西安高新基地', productionScore: 80, qualityScore: 88, costScore: 85, efficiencyScore: 84, totalScore: 84.25, rank: 6 },
  { id: '7', name: '宁波北仑基地', productionScore: 78, qualityScore: 82, costScore: 86, efficiencyScore: 82, totalScore: 82.0, rank: 7 },
  { id: '8', name: '宁波镇海基地', productionScore: 75, qualityScore: 80, costScore: 84, efficiencyScore: 80, totalScore: 79.75, rank: 8 }
]

// 分析数据 Mock 数据 - 与V1.1保持一致，使用"达成率"作为key
export const mockAnalyzeData = [
  { month: '1月', target: 4800, actual: 4900, 达成率: 102.1 },
  { month: '2月', target: 4900, actual: 5000, 达成率: 102.0 },
  { month: '3月', target: 5000, actual: 5100, 达成率: 102.0 },
  { month: '4月', target: 5100, actual: 5050, 达成率: 99.0 },
  { month: '5月', target: 5000, actual: 5200, 达成率: 104.0 },
  { month: '6月', target: 5200, actual: 5300, 达成率: 101.9 }
]

// 分类汇总 Mock 数据 - 与V1.1保持一致的颜色
export const mockCategorySummary = [
  { name: '生产指标', count: 12, avgAchievement: 98.5, color: '#06b6d4' },
  { name: '质量指标', count: 8, avgAchievement: 97.2, color: '#7C3AED' },
  { name: '成本指标', count: 6, avgAchievement: 95.8, color: '#22c55e' },
  { name: '效率指标', count: 5, avgAchievement: 96.5, color: '#f59e0b' },
  { name: '服务指标', count: 3, avgAchievement: 98.0, color: '#ec4899' },
  { name: '设备指标', count: 5, avgAchievement: 92.5, color: '#0891b2' },
  { name: '资源指标', count: 4, avgAchievement: 94.2, color: '#3b82f6' },
  { name: '安全指标', count: 2, avgAchievement: 100.0, color: '#ef4444' }
]

// 指标类别选项 - 与V1.1和数据保持一致
export const indicatorCategories = [
  '全部',
  '生产指标',
  '质量指标',
  '成本指标',
  '效率指标',
  '资源指标',
  '服务指标',
  '设备指标',
  '安全指标'
]

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

// 评估数据 Mock 数据
export const mockEvaluationData = [
  {
    id: '1',
    name: '崇明岛基地',
    productionScore: 92,
    qualityScore: 88,
    costScore: 85,
    efficiencyScore: 90,
    totalScore: 88.75,
    rank: 1
  },
  {
    id: '2',
    name: '浦东基地',
    productionScore: 88,
    qualityScore: 90,
    costScore: 82,
    efficiencyScore: 85,
    totalScore: 86.25,
    rank: 2
  },
  {
    id: '3',
    name: '嘉定基地',
    productionScore: 85,
    qualityScore: 85,
    costScore: 88,
    efficiencyScore: 82,
    totalScore: 85.0,
    rank: 3
  },
  {
    id: '4',
    name: '松江基地',
    productionScore: 80,
    qualityScore: 82,
    costScore: 85,
    efficiencyScore: 80,
    totalScore: 81.75,
    rank: 4
  },
  {
    id: '5',
    name: '青浦基地',
    productionScore: 78,
    qualityScore: 80,
    costScore: 78,
    efficiencyScore: 75,
    totalScore: 77.75,
    rank: 5
  }
]

// 分析数据 Mock 数据
export const mockAnalyzeData = [
  { month: '1月', target: 4800, actual: 4900, achievementRate: 102.1 },
  { month: '2月', target: 4900, actual: 5000, achievementRate: 102.0 },
  { month: '3月', target: 5000, actual: 5100, achievementRate: 102.0 },
  { month: '4月', target: 5100, actual: 5050, achievementRate: 99.0 },
  { month: '5月', target: 5000, actual: 5200, achievementRate: 104.0 },
  { month: '6月', target: 5200, actual: 5300, achievementRate: 101.9 }
]

// 分类汇总 Mock 数据
export const mockCategorySummary = [
  { name: '生产指标', count: 12, avgAchievement: 98.5, color: '#3B82F6' },
  { name: '质量指标', count: 8, avgAchievement: 97.2, color: '#10B981' },
  { name: '成本指标', count: 6, avgAchievement: 95.8, color: '#F59E0B' },
  { name: '效率指标', count: 5, avgAchievement: 96.5, color: '#8B5CF6' },
  { name: '资源指标', count: 4, avgAchievement: 94.2, color: '#EC4899' },
  { name: '服务指标', count: 3, avgAchievement: 98.0, color: '#06B6D4' },
  { name: '设备指标', count: 5, avgAchievement: 92.5, color: '#84CC16' },
  { name: '安全指标', count: 2, avgAchievement: 100.0, color: '#EF4444' }
]

// 指标类别选项
export const indicatorCategories = [
  '全部',
  '生产指标',
  '资源指标',
  '质量指标',
  '成本指标',
  '效率指标',
  '效益指标',
  '服务指标',
  '设备指标',
  '安全指标'
]

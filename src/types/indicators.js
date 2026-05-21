/**
 * 指标数据类型定义
 * 用于 Indicators.vue 页面组件的类型声明
 */

// 指标项基础信息
export const Indicator = {
  id: '',
  code: '',
  name: '',
  category: '',
  unit: '',
  target: 0,
  actual: 0,
  trend: 'stable',
  frequency: '',
  source: '',
  warning: 0,
  weight: 0,
  createTime: '',
  updateTime: ''
}

// 评估数据项
export const EvaluationItem = {
  id: '',
  name: '',
  productionScore: 0,
  qualityScore: 0,
  costScore: 0,
  efficiencyScore: 0,
  totalScore: 0,
  rank: 0
}

// 分析数据项
export const AnalyzeItem = {
  month: '',
  target: 0,
  actual: 0,
  achievementRate: 0
}

// 分类汇总项
export const CategorySummary = {
  name: '',
  count: 0,
  avgAchievement: 0,
  color: ''
}

// 指标类别选项
export const IndicatorCategory = {
  ALL: '全部',
  PRODUCTION: '生产指标',
  RESOURCE: '资源指标',
  QUALITY: '质量指标',
  COST: '成本指标',
  EFFICIENCY: '效率指标',
  BENEFIT: '效益指标',
  SERVICE: '服务指标',
  EQUIPMENT: '设备指标',
  SAFETY: '安全指标'
}

// 弹窗类型
export const ModalType = {
  ADD: 'add',
  EDIT: 'edit',
  VIEW: 'view',
  ANALYZE: 'analyze',
  EVALUATE: 'evaluate'
}

// 标签页类型
export const ActiveTab = {
  LIST: 'list',
  CATEGORY: 'category',
  ANALYZE: 'analyze',
  EVALUATE: 'evaluate'
}

// 指标筛选器Props
export const IndicatorsFiltersProps = {
  searchKeyword: '',
  categoryFilter: '全部',
  onSearchChange: () => {},
  onCategoryChange: () => {}
}

// 指标表格Props
export const IndicatorsTableProps = {
  indicators: [],
  selectedIds: [],
  exportMode: false,
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalCount: 0,
  onPageChange: () => {},
  onPageSizeChange: () => {},
  onSelectAll: () => {},
  onToggleSelect: () => {},
  onView: () => {},
  onAnalyze: () => {},
  onEdit: () => {},
  onDelete: () => {}
}

// 指标弹窗通用Props
export const IndicatorsModalCommonProps = {
  isOpen: false,
  onClose: () => {},
  onSave: () => {}
}

// 详情弹窗Props
export const IndicatorsDetailModalProps = {
  isOpen: false,
  indicator: null,
  type: 'view',
  onClose: () => {},
  onSave: () => {}
}

// 创建/编辑弹窗Props
export const IndicatorsFormModalProps = {
  isOpen: false,
  indicator: null,
  mode: 'add',
  onClose: () => {},
  onSave: () => {}
}

// 删除确认弹窗Props
export const IndicatorsDeleteModalProps = {
  isOpen: false,
  item: null,
  onClose: () => {},
  onConfirm: () => {}
}

// 导出弹窗Props
export const IndicatorsExportModalProps = {
  isOpen: false,
  exportFormat: 'excel',
  selectedCount: 0,
  totalCount: 0,
  onClose: () => {},
  onFormatChange: () => {},
  onConfirm: () => {}
}

// 分类管理面板Props
export const CategoryPanelProps = {
  categorySummary: [],
  indicators: []
}

// 达成分析面板Props
export const AnalyzePanelProps = {
  analyzeData: []
}

// 考核评价面板Props
export const EvaluatePanelProps = {
  evaluationData: []
}

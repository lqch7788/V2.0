/**
 * MaterialReceiving 配置常量与工具函数
 * 从 MaterialReceiving.vue 中拆分提取（保持 1:1 逻辑，与 V1.1 ApplicationTab.tsx / ExecuteTab.tsx 一致）
 */

// V1.1 仅 7 个物料分类 key（白名单，防止混入领料单字段）
export const CATEGORY_KEY_WHITELIST = ['生产投入', '设施装备', '作业支持', '采后流通', '数字管理', '能源耗材', '其他']

// 通用基础数据
export const departments = ['生产部', '技术部', '设备部', '后勤部', '采后处理部']
export const warehouses = ['仓库A区', '仓库B区', '仓库C区', '仓库D区', '仓库E区']
export const PRODUCTION_BATCH_CODES = ['FQ2024-001', 'FQ2024-002', 'FQ2024-003', 'FQ2024-004', 'FQ2024-005', 'FQ2024-006', 'FQ2024-007', 'FQ2024-008']

export const userListData = [
  { id: '1', name: '张伟民' }, { id: '2', name: '李明轩' }, { id: '3', name: '王建国' },
  { id: '4', name: '赵俊杰' }, { id: '5', name: '钱文涛' }, { id: '6', name: '孙晓峰' },
  { id: '7', name: '周志强' }, { id: '8', name: '吴海龙' }, { id: '9', name: '郑志远' },
  { id: '10', name: '陈思远' }, { id: '11', name: '刘志伟' }, { id: '12', name: '杨文博' },
  { id: '13', name: '王志刚' }, { id: '14', name: '李志刚' }, { id: '15', name: '张志远' },
  { id: '16', name: '陈志明' }, { id: '17', name: '赵志鹏' }, { id: '18', name: '张志明' },
  { id: '19', name: '李志远' }, { id: '20', name: '赵文静' }, { id: '21', name: '刘志刚' },
  { id: '22', name: '王秀英' }, { id: '23', name: '郑志明' }, { id: '24', name: '周志刚' }
]

export const exportFormats = [
  { value: 'xlsx', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'doc', label: 'Word (.doc)', desc: '适用于文档编辑和分享' }
]

export const materialBaseDB = [
  { materialCode: 'SP0201001', materialName: '商品有机肥', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', stockQuantity: 150, unitPrice: 45, warehousePosition: 'A-01-01', remark: '正常出库' },
  { materialCode: 'SP0202001', materialName: '尿素', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', stockQuantity: 80, unitPrice: 85, warehousePosition: 'A-01-02', remark: '库存充足' },
  { materialCode: 'SP0301001', materialName: '吡虫啉', spec: '100g/瓶', unit: '瓶', category: '农药与植保产品', stockQuantity: 120, unitPrice: 28, warehousePosition: 'B-02-03', remark: '正常出库' },
  { materialCode: 'SP0302001', materialName: '多菌灵', spec: '200g/袋', unit: '袋', category: '农药与植保产品', stockQuantity: 45, unitPrice: 35, warehousePosition: 'C-03-01', remark: '待审批' },
  { materialCode: 'SP0103001', materialName: '番茄种子', spec: '50g/袋', unit: '袋', category: '种质资源', stockQuantity: 60, unitPrice: 120, warehousePosition: 'A-02-01', remark: '正常出库' },
  { materialCode: 'SP0101001', materialName: '水稻种子', spec: '20kg/袋', unit: '袋', category: '种质资源', stockQuantity: 100, unitPrice: 65, warehousePosition: 'B-02-01', remark: '正常出库' },
  { materialCode: 'OP0201001', materialName: '锄头', spec: '标准型', unit: '把', category: '劳保与防护用品', stockQuantity: 35, unitPrice: 42, warehousePosition: 'C-04-01', remark: '正常出库' },
  { materialCode: 'OP0102001', materialName: '劳保胶靴', spec: '标准码', unit: '双', category: '劳保与防护用品', stockQuantity: 50, unitPrice: 68, warehousePosition: 'C-04-02', remark: '正常出库' },
  { materialCode: 'EQ0103001', materialName: '电动喷雾机', spec: '标准型', unit: '台', category: '农业机械', stockQuantity: 15, unitPrice: 580, warehousePosition: 'A-05-01', remark: '正常出库' },
  { materialCode: 'EQ0306001', materialName: '滴灌带', spec: '50m/卷', unit: '卷', category: '农业机械', stockQuantity: 200, unitPrice: 38, warehousePosition: 'C-05-01', remark: '待审批' },
  { materialCode: 'PH0104001', materialName: '塑料袋', spec: '标准型', unit: '卷', category: '采收容器', stockQuantity: 500, unitPrice: 8.5, warehousePosition: 'A-03-01', remark: '正常出库' },
  { materialCode: 'IT0101001', materialName: '土壤温湿度传感器', spec: '标准型', unit: '个', category: '监测设备', stockQuantity: 30, unitPrice: 260, warehousePosition: 'A-04-01', remark: '正常出库' }
]

export const findMaterialByCode = (code) => materialBaseDB.find(m => m.materialCode === code)

// ============ 申请领料 状态映射 ============
export const mapAppStatus = (s) => {
  const m = { approved: '已审批', pending: '待审批', rejected: '已拒绝', voided: '已作废', cancelled: '已取消' }
  return m[s] || '待审批'
}

export const mapAppStatusClass = (s) => {
  const m = { approved: 'approved', pending: 'pending', rejected: 'rejected', voided: 'voided', cancelled: 'cancelled' }
  return m[s] || 'pending'
}

// 状态徽章样式 - 严格对齐 V1.1 (ApplicationTab.tsx 第 414-421 行)
export const STATUS_STYLE_MAP_APP = {
  'approved': 'bg-green-100 text-green-700',
  'pending': 'bg-amber-100 text-amber-700',
  'rejected': 'bg-red-100 text-red-700',
  'voided': 'bg-gray-200 text-gray-600',
  'cancelled': 'bg-gray-100 text-blue-700',
  'partial': 'bg-blue-100 text-blue-700'
}

// 执行状态徽章样式 - 严格对齐 V1.1 (ExecuteTab.tsx 第 399-404 行)
export const STATUS_STYLE_MAP_EX = {
  '已出库': 'bg-green-100 text-green-700',
  '部分出库': 'bg-blue-100 text-blue-700',
  '待出库': 'bg-amber-100 text-amber-700',
  '已取消': 'bg-gray-100 text-gray-700'
}

export const getAppStatusClass = (status) => {
  const cls = mapAppStatusClass(status)
  return STATUS_STYLE_MAP_APP[cls] || 'bg-gray-100 text-gray-700'
}

export const getExStatusClass = (status) => STATUS_STYLE_MAP_EX[status] || 'bg-gray-100 text-gray-700'

// V1.1 后端 /api/material-requests 实际返回 camelCase 字段
// (curl http://localhost:3001/api/material-requests 验证：顶层 key 是 requestCode/applicantName/applyDate/...)
export const mapAppRecord = (r) => ({
  id: r.id || r.requestCode || r.request_code,
  code: r.requestCode || r.request_code || r.code || '',
  date: r.applyDate || r.apply_date || r.date || '',
  applicant: r.applicantName || r.applicant_name || r.applicant || '',
  department: r.departmentName || r.department_name || r.department || '',
  warehouseLocation: r.warehouseName || r.warehouse_name || r.warehouseLocation || '',
  plantArea: r.plantArea || r.plant_area || '',
  reviewer: r.reviewer || r.approver_name || '',
  productionBatchCode: r.productionBatchCode || r.production_batch_code || '',
  status: mapAppStatus(r.approvalStatus || r.approval_status || r.status),
  statusClass: r.statusClass || mapAppStatusClass(r.approvalStatus || r.approval_status || r.status),
  rejectReason: r.rejectReason || r.reject_reason || r.remarks || '',
  materials: Array.isArray(r.materials) ? r.materials : (typeof r.materials === 'string' ? JSON.parse(r.materials || '[]') : [])
})

// ============ 成本核算 配置 ============
export const COST_CATEGORY_COLOR_MAP = {
  '种质资源': '#06B6D4',
  '肥料与土壤改良剂': '#8B5CF6',
  '农药与植保产品': '#F59E0B',
  '农业机械': '#F97316',
  '劳保与防护用品': '#EC4899',
  '采收容器': '#64748B',
  '监测设备': '#10B981',
  '其他': '#9CA3AF'
}

export const getCategoryColor = (cat) => COST_CATEGORY_COLOR_MAP[cat] || '#9CA3AF'

export const costQuickPeriods = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季', value: 'quarter' },
  { label: '本年', value: 'year' }
]

export const getInitialCostFilters = () => {
  const now = new Date()
  return {
    quickPeriod: 'year',
    dateRange: {
      start: `${now.getFullYear()}-01-01`,
      end: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    },
    departments: [],
    categories: [],
    batches: [],
    warehouses: []
  }
}

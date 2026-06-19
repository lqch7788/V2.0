/**
 * MaterialReturn 配置常量与工具函数
 * 从 MaterialReturn.vue 中拆分提取（保持 1:1 逻辑，与 V1.1 config.ts 一致）
 */

export const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: '待审批', label: '待审批' },
  { value: '已审批', label: '已审批' },
  { value: '已驳回', label: '已驳回' },
  { value: '已完成', label: '已完成' },
  { value: '已作废', label: '已作废' }
]

export const STATUS_STYLE_MAP = {
  'approved': { bg: 'bg-green-100', text: 'text-green-700' },
  'pending': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-700' },
  'completed': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'voided': { bg: 'bg-gray-200', text: 'text-gray-500' },
  '': { bg: 'bg-gray-100', text: 'text-gray-700' }
}

export const STATUS_TO_CLASS = {
  '待审批': 'pending',
  '已审批': 'approved',
  '已驳回': 'rejected',
  '已完成': 'completed',
  '已作废': 'voided'
}

export const RETURN_REASONS = ['生产剩余', '产品质量问题', '领错物料', '规格不符', '过期产品', '运输损坏', '库存积压', '其他']
export const RETURN_TYPES = ['生产退料', '品质退料', '试制退料']
export const APPLICANTS = ['李建国', '王建华', '张建华', '赵技术', '陈技术', '周管理员', '吴主管']
export const WAREHOUSE_LOCATIONS = ['A区-01', 'A区-02', 'A区-03', 'A区-04', 'B区-01', 'B区-02', 'B区-03', 'C区-01', 'C区-05']
export const OPERATORS = ['郭靖', '杨过', '张无忌', '令狐冲', '段誉', '萧峰', '虚竹', '胡斐', '陈家洛', '袁承志']
export const REVIEWERS = ['黄药师', '小龙女', '周芷若', '任盈盈', '霍青桐', '夏雪宜', '程灵素', '扫地僧', '丁典']
export const EDITABLE_STATUSES = ['待审批', '已审批', '已驳回', '已完成']
export const DELETABLE_STATUSES = ['待审批', '已审批', '已驳回']
export const EXPORT_FORMATS = [
  { value: 'xlsx', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' }
]

export const departmentOptions = ['生产部', '种植部', '设备部', '品质部', '仓储部', '技术部']

/** 生成退料单号（TL+YYYYMMDD+3位流水号） */
export const generateReturnCode = (existingCodes) => {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const prefix = `TL${y}${m}${d}`
  let maxSeq = 0
  existingCodes.forEach(code => {
    if (code && code.startsWith(prefix)) {
      const seq = parseInt(code.substring(prefix.length), 10)
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  })
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`
}

/** 获取状态对应的样式类 */
export const getStatusClass = (record) => {
  const cls = record.statusClass || STATUS_TO_CLASS[record.status] || ''
  const style = STATUS_STYLE_MAP[cls] || STATUS_STYLE_MAP['']
  return `${style.bg} ${style.text}`
}

/** 创建空的新增表单（V1.1 createEmptyAddForm 1:1） */
export const createEmptyAddForm = (currentOperatorName = '系统管理员') => ({
  code: '',
  date: new Date().toISOString().split('T')[0],
  type: '生产退料',
  applicant: '',
  department: '',
  warehouseLocation: '',
  remark: '',
  operator: currentOperatorName,
  reviewer: '',
  reviewDate: '',
  rejectReason: '',
  materials: []
})

/** 创建空的编辑表单（V1.1 createEmptyEditForm 1:1） */
export const createEmptyEditForm = () => ({
  date: '',
  type: '',
  applicant: '',
  department: '',
  warehouseLocation: '',
  status: '',
  remark: '',
  operator: '',
  reviewer: '',
  reviewDate: '',
  rejectReason: '',
  materials: []
})

/** 创建空物料行 */
export const createEmptyMaterial = () => ({
  sourceApplicationCode: '',
  materialCode: '',
  category: '',
  materialName: '',
  spec: '',
  unit: '',
  returnQuantity: 0,
  unitPrice: 0,
  warehousePosition: '',
  reason: '',
  remark: ''
})

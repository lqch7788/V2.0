/**
 * 领料统计 Mock 数据 - 严格 1:1 对齐 V1.1
 * V1.1: D:\TMcrop\yuanxingtu\V1.1\src\data\materialReceivingData.ts
 *
 * 包含：部门统计 / 大棚统计 / 大田统计 / 种植批次统计
 * 兜底使用：当后端 /api/material-statistics/ 返回为空时，前端兜底展示
 */

// 部门统计数据 - 对齐 V1.1 departmentStatisticsData
export const departmentStatisticsData = [
  { applicant: '张伟民', department: '生产部', requisitionCount: 18, requisitionOrders: 12, materialTypes: 15, totalQuantity: 680, totalAmount: 18650, avgPerOrder: 38, avgAmount: 1036, topMaterials: ['商品有机肥', '尿素', '吡虫啉'] },
  { applicant: '李明轩', department: '生产部', requisitionCount: 15, requisitionOrders: 10, materialTypes: 12, totalQuantity: 520, totalAmount: 14280, avgPerOrder: 35, avgAmount: 952, topMaterials: ['商品有机肥', '番茄种子', '滴灌带'] },
  { applicant: '王建国', department: '生产部', requisitionCount: 20, requisitionOrders: 14, materialTypes: 18, totalQuantity: 750, totalAmount: 20580, avgPerOrder: 38, avgAmount: 1029, topMaterials: ['尿素', '多菌灵', '锄头'] },
  { applicant: '赵俊杰', department: '生产部', requisitionCount: 16, requisitionOrders: 11, materialTypes: 14, totalQuantity: 580, totalAmount: 15860, avgPerOrder: 36, avgAmount: 990, topMaterials: ['商品有机肥', '水稻种子', '劳保胶靴'] },
  { applicant: '郑志远', department: '技术部', requisitionCount: 12, requisitionOrders: 8, materialTypes: 10, totalQuantity: 280, totalAmount: 7680, avgPerOrder: 23, avgAmount: 640, topMaterials: ['多菌灵', '土壤温湿度传感器', '吡虫啉'] },
  { applicant: '陈思远', department: '技术部', requisitionCount: 10, requisitionOrders: 7, materialTypes: 8, totalQuantity: 220, totalAmount: 6040, avgPerOrder: 22, avgAmount: 604, topMaterials: ['土壤温湿度传感器', '滴灌带', '多菌灵'] },
  { applicant: '吴海龙', department: '设备部', requisitionCount: 8, requisitionOrders: 6, materialTypes: 7, totalQuantity: 180, totalAmount: 12480, avgPerOrder: 23, avgAmount: 1560, topMaterials: ['电动喷雾机', '滴灌带', '锄头'] },
  { applicant: '孙晓峰', department: '生产部', requisitionCount: 14, requisitionOrders: 9, materialTypes: 12, totalQuantity: 480, totalAmount: 13160, avgPerOrder: 34, avgAmount: 940, topMaterials: ['商品有机肥', '尿素', '塑料袋'] }
]

// 大棚统计数据 - 对齐 V1.1 greenhouseStatisticsData
export const greenhouseStatisticsData = [
  { greenhouse: '玻璃温室A区', greenhouseType: '玻璃温室', period: '2025-03', requisitionCount: 8, materialTypes: 6, totalQuantity: 520, totalAmount: 14260, comparison: { lastMonth: { quantity: 480, amount: 12850, changeRate: 8.3 } } },
  { greenhouse: '玻璃温室B区', greenhouseType: '玻璃温室', period: '2025-03', requisitionCount: 6, materialTypes: 5, totalQuantity: 380, totalAmount: 9840, comparison: { lastMonth: { quantity: 350, amount: 8920, changeRate: 8.6 } } },
  { greenhouse: '玻璃温室C区', greenhouseType: '玻璃温室', period: '2025-03', requisitionCount: 5, materialTypes: 4, totalQuantity: 280, totalAmount: 7260, comparison: { lastMonth: { quantity: 260, amount: 6580, changeRate: 7.7 } } },
  { greenhouse: '日光温室1号', greenhouseType: '日光温室', period: '2025-03', requisitionCount: 4, materialTypes: 4, totalQuantity: 180, totalAmount: 4860, comparison: { lastMonth: { quantity: 160, amount: 4280, changeRate: 12.5 } } },
  { greenhouse: '日光温室2号', greenhouseType: '日光温室', period: '2025-03', requisitionCount: 4, materialTypes: 3, totalQuantity: 160, totalAmount: 4320, comparison: { lastMonth: { quantity: 150, amount: 3980, changeRate: 6.7 } } },
  { greenhouse: '日光温室3号', greenhouseType: '日光温室', period: '2025-03', requisitionCount: 3, materialTypes: 3, totalQuantity: 120, totalAmount: 3240, comparison: { lastMonth: { quantity: 110, amount: 2920, changeRate: 9.1 } } },
  { greenhouse: '日光温室4号', greenhouseType: '日光温室', period: '2025-03', requisitionCount: 4, materialTypes: 4, totalQuantity: 150, totalAmount: 4080, comparison: { lastMonth: { quantity: 140, amount: 3720, changeRate: 7.1 } } },
  { greenhouse: '塑料大棚1号', greenhouseType: '塑料大棚', period: '2025-03', requisitionCount: 5, materialTypes: 4, totalQuantity: 220, totalAmount: 5980, comparison: { lastMonth: { quantity: 200, amount: 5360, changeRate: 10.0 } } },
  { greenhouse: '塑料大棚2号', greenhouseType: '塑料大棚', period: '2025-03', requisitionCount: 4, materialTypes: 3, totalQuantity: 180, totalAmount: 4860, comparison: { lastMonth: { quantity: 165, amount: 4380, changeRate: 9.1 } } },
  { greenhouse: '露天种植区', greenhouseType: '露天', period: '2025-03', requisitionCount: 3, materialTypes: 3, totalQuantity: 140, totalAmount: 3780, comparison: { lastMonth: { quantity: 130, amount: 3440, changeRate: 7.7 } } }
]

// 大田统计数据 - 对齐 V1.1 fieldStatisticsData
export const fieldStatisticsData = [
  { field: 'A1地块', crop: '水稻', period: '2025-03', requisitionCount: 5, materialTypes: 6, totalQuantity: 380, totalAmount: 10360, comparison: { lastMonth: { quantity: 350, amount: 9360, changeRate: 8.6 } } },
  { field: 'A2地块', crop: '水稻', period: '2025-03', requisitionCount: 5, materialTypes: 5, totalQuantity: 360, totalAmount: 9820, comparison: { lastMonth: { quantity: 330, amount: 8820, changeRate: 9.1 } } },
  { field: 'A3地块', crop: '水稻', period: '2025-03', requisitionCount: 4, materialTypes: 5, totalQuantity: 320, totalAmount: 8720, comparison: { lastMonth: { quantity: 290, amount: 7760, changeRate: 10.3 } } },
  { field: 'B1地块', crop: '小麦', period: '2025-03', requisitionCount: 4, materialTypes: 4, totalQuantity: 280, totalAmount: 7640, comparison: { lastMonth: { quantity: 260, amount: 6980, changeRate: 7.7 } } },
  { field: 'B2地块', crop: '小麦', period: '2025-03', requisitionCount: 4, materialTypes: 4, totalQuantity: 260, totalAmount: 7080, comparison: { lastMonth: { quantity: 240, amount: 6420, changeRate: 8.3 } } },
  { field: 'C1地块', crop: '油菜', period: '2025-03', requisitionCount: 3, materialTypes: 3, totalQuantity: 180, totalAmount: 4920, comparison: { lastMonth: { quantity: 165, amount: 4420, changeRate: 9.1 } } },
  { field: 'C2地块', crop: '油菜', period: '2025-03', requisitionCount: 3, materialTypes: 3, totalQuantity: 160, totalAmount: 4360, comparison: { lastMonth: { quantity: 145, amount: 3880, changeRate: 10.3 } } },
  { field: 'D1地块', crop: '蔬菜', period: '2025-03', requisitionCount: 4, materialTypes: 5, totalQuantity: 240, totalAmount: 6540, comparison: { lastMonth: { quantity: 220, amount: 5860, changeRate: 9.1 } } }
]

// 种植批次统计数据 - 对齐 V1.1 batchStatisticsData
export const batchStatisticsData = [
  {
    batchCode: 'FQ2024-001', cropName: '番茄', variety: '红果番茄', plantArea: '玻璃温室A区', areaSize: '3000 m²',
    plannedStartDate: '2026-03-01', plannedEndDate: '2026-09-30', requisitionCount: 12, materialTypes: 8,
    totalQuantity: 680, actualQuantity: 665, totalAmount: 18560,
    details: [
      { materialCode: 'SP0201001', materialName: '商品有机肥', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', totalQuantity: 150, actualQuantity: 148, totalAmount: 6660, mainWarehouse: '仓库A区', mainApplicant: '张伟民' },
      { materialCode: 'SP0202001', materialName: '尿素', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', totalQuantity: 80, actualQuantity: 78, totalAmount: 6630, mainWarehouse: '仓库A区', mainApplicant: '王建国' },
      { materialCode: 'SP0301001', materialName: '吡虫啉', category: '农药与植保产品', spec: '100g/瓶', unit: '瓶', totalQuantity: 60, actualQuantity: 58, totalAmount: 1624, mainWarehouse: '仓库B区', mainApplicant: '李明轩' },
      { materialCode: 'SP0302001', materialName: '多菌灵', category: '农药与植保产品', spec: '200g/袋', unit: '袋', totalQuantity: 45, actualQuantity: 44, totalAmount: 1540, mainWarehouse: '仓库B区', mainApplicant: '赵俊杰' }
    ]
  },
  {
    batchCode: 'FQ2024-002', cropName: '黄瓜', variety: '水果黄瓜', plantArea: '玻璃温室B区', areaSize: '2500 m²',
    plannedStartDate: '2026-03-01', plannedEndDate: '2026-08-31', requisitionCount: 10, materialTypes: 6,
    totalQuantity: 520, actualQuantity: 510, totalAmount: 14240,
    details: [
      { materialCode: 'SP0201001', materialName: '商品有机肥', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', totalQuantity: 120, actualQuantity: 118, totalAmount: 5310, mainWarehouse: '仓库A区', mainApplicant: '张伟民' },
      { materialCode: 'SP0202001', materialName: '尿素', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', totalQuantity: 70, actualQuantity: 68, totalAmount: 5780, mainWarehouse: '仓库A区', mainApplicant: '王建国' },
      { materialCode: 'EQ0306001', materialName: '滴灌带', category: '农业机械', spec: '50m/卷', unit: '卷', totalQuantity: 50, actualQuantity: 50, totalAmount: 1900, mainWarehouse: '仓库C区', mainApplicant: '孙晓峰' }
    ]
  },
  {
    batchCode: 'FQ2024-003', cropName: '草莓', variety: '红颜', plantArea: '日光温室1号', areaSize: '600 m²',
    plannedStartDate: '2026-01-01', plannedEndDate: '2026-05-31', requisitionCount: 8, materialTypes: 5,
    totalQuantity: 280, actualQuantity: 275, totalAmount: 7680,
    details: [
      { materialCode: 'SP0201001', materialName: '商品有机肥', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', totalQuantity: 60, actualQuantity: 60, totalAmount: 2700, mainWarehouse: '仓库A区', mainApplicant: '张伟民' },
      { materialCode: 'OP0102001', materialName: '劳保胶靴', category: '劳保与防护用品', spec: '标准码', unit: '双', totalQuantity: 20, actualQuantity: 20, totalAmount: 1360, mainWarehouse: '仓库C区', mainApplicant: '赵俊杰' }
    ]
  },
  {
    batchCode: 'FQ2024-004', cropName: '生菜', variety: '散叶生菜', plantArea: '日光温室2号', areaSize: '500 m²',
    plannedStartDate: '2026-02-01', plannedEndDate: '2026-06-30', requisitionCount: 6, materialTypes: 4,
    totalQuantity: 180, actualQuantity: 178, totalAmount: 4920,
    details: [
      { materialCode: 'SP0201001', materialName: '商品有机肥', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', totalQuantity: 40, actualQuantity: 40, totalAmount: 1800, mainWarehouse: '仓库A区', mainApplicant: '李明轩' }
    ]
  },
  {
    batchCode: 'FQ2024-005', cropName: '辣椒', variety: '青椒', plantArea: '玻璃温室C区', areaSize: '2000 m²',
    plannedStartDate: '2026-03-01', plannedEndDate: '2026-08-31', requisitionCount: 9, materialTypes: 7,
    totalQuantity: 420, actualQuantity: 412, totalAmount: 11480,
    details: [
      { materialCode: 'SP0201001', materialName: '商品有机肥', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', totalQuantity: 100, actualQuantity: 98, totalAmount: 4410, mainWarehouse: '仓库A区', mainApplicant: '张伟民' }
    ]
  },
  {
    batchCode: 'FQ2024-006', cropName: '菠菜', variety: '圆叶菠菜', plantArea: '塑料大棚1号', areaSize: '800 m²',
    plannedStartDate: '2026-01-15', plannedEndDate: '2026-04-30', requisitionCount: 5, materialTypes: 4,
    totalQuantity: 160, actualQuantity: 158, totalAmount: 4360,
    details: [
      { materialCode: 'SP0201001', materialName: '商品有机肥', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', totalQuantity: 35, actualQuantity: 35, totalAmount: 1575, mainWarehouse: '仓库A区', mainApplicant: '孙晓峰' }
    ]
  },
  {
    batchCode: 'FQ2024-007', cropName: '西瓜', variety: '小型西瓜', plantArea: '露天种植区', areaSize: '5000 m²',
    plannedStartDate: '2026-03-15', plannedEndDate: '2026-07-31', requisitionCount: 7, materialTypes: 5,
    totalQuantity: 320, actualQuantity: 315, totalAmount: 8740,
    details: [
      { materialCode: 'SP0201001', materialName: '商品有机肥', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', totalQuantity: 80, actualQuantity: 78, totalAmount: 3510, mainWarehouse: '仓库A区', mainApplicant: '周志强' }
    ]
  },
  {
    batchCode: 'FQ2024-008', cropName: '茄子', variety: '紫茄', plantArea: '日光温室4号', areaSize: '600 m²',
    plannedStartDate: '2026-02-15', plannedEndDate: '2026-07-15', requisitionCount: 6, materialTypes: 5,
    totalQuantity: 220, actualQuantity: 215, totalAmount: 6020,
    details: [
      { materialCode: 'SP0201001', materialName: '商品有机肥', category: '肥料与土壤改良剂', spec: '50kg/袋', unit: '袋', totalQuantity: 50, actualQuantity: 50, totalAmount: 2250, mainWarehouse: '仓库A区', mainApplicant: '赵文静' }
    ]
  }
]

// 部门下拉选项
export const STAT_DEPARTMENT_OPTIONS = ['生产部', '技术部', '设备部', '后勤部', '采后处理部']

// 大棚类型下拉选项
export const GREENHOUSE_TYPE_OPTIONS = ['玻璃温室', '日光温室', '塑料大棚', '露天']

// 具体大棚下拉选项
export const GREENHOUSE_OPTIONS = [
  '玻璃温室A区', '玻璃温室B区', '玻璃温室C区',
  '日光温室1号', '日光温室2号', '日光温室3号', '日光温室4号',
  '塑料大棚1号', '塑料大棚2号', '露天种植区'
]

// 具体大田下拉选项
export const FIELD_OPTIONS = [
  'A1地块', 'A2地块', 'A3地块', 'B1地块', 'B2地块', 'C1地块', 'C2地块', 'D1地块'
]

// 批次下拉选项（含描述）
export const BATCH_FILTER_OPTIONS = [
  { value: 'ZZB2026-001', label: 'ZZB2026-001（番茄-玻璃温室A区）' },
  { value: 'ZZB2026-002', label: 'ZZB2026-002（黄瓜-玻璃温室B区）' },
  { value: 'ZZB2026-003', label: 'ZZB2026-003（草莓-日光温室1号）' },
  { value: 'YMB2026-001', label: 'YMB2026-001（番茄育苗-育苗基地A区）' },
  { value: 'YMB2026-002', label: 'YMB2026-002（黄瓜育苗-育苗基地B区）' },
  { value: 'JZB2026-001', label: 'JZB2026-001（番茄种源-先正达种业）' },
  { value: 'JZB2026-002', label: 'JZB2026-002（黄瓜种源-圣尼斯种业）' }
]

// 对比周期下拉选项
export const COMPARISON_PERIOD_OPTIONS = [
  { value: 'none', label: '不对比' },
  { value: 'lastWeek', label: '上周对比' },
  { value: 'lastMonth', label: '上月对比' },
  { value: 'lastQuarter', label: '上季度对比' },
  { value: 'lastYear', label: '去年同期' }
]

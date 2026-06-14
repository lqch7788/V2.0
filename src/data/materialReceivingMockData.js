/**
 * 领料单 Mock 数据 - 严格 1:1 对齐 V1.1
 * V1.1: D:\TMcrop\yuanxingtu\V1.1\src\data\materialReceivingData.ts (前 60 行)
 *
 * 用途：当后端 /api/material-requests 返回为空时兜底；
 *      用于成本核算 Tab 的真实数据驱动（聚合计算）
 */

/**
 * 物料分类辅助函数 - 1:1 对齐 V1.1
 * 根据物料编码前缀映射到 8 大分类
 */
export const getCategoryByCode = (code) => {
  if (!code) return '其他'
  const prefix = code.substring(0, 2)
  const categoryMap = {
    SP: '种质资源',
    EQ: '农业机械',
    OP: '劳保与防护用品',
    PH: '采收容器',
    IT: '监测设备'
  }
  // SP 开头需要进一步判断
  if (prefix === 'SP') {
    const subPrefix = code.substring(2, 4)
    if (subPrefix === '02') return '肥料与土壤改良剂'
    if (subPrefix === '03') return '农药与植保产品'
    if (subPrefix === '01') return '种质资源'
  }
  return categoryMap[prefix] || '其他'
}

/**
 * 领料单详情 - 1:1 对齐 V1.1 materialReceivingDetails (12 条)
 */
export const materialReceivingDetails = [
  { id: 1, code: 'LL20260301001', date: '2026-03-01', applicant: '张伟民', department: '生产部', warehouseLocation: '仓库A区', plantArea: '1号棚-叶菜区', reviewer: '王志刚', productionBatchCode: 'FQ2024-001', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'SP0201001', materialName: '商品有机肥', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', requestedQuantity: 10, stockQuantity: 150, unitPrice: 45.00, warehousePosition: 'A-01-01', remark: '正常出库' },
    { materialCode: 'SP0202001', materialName: '尿素', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', requestedQuantity: 5, stockQuantity: 80, unitPrice: 85.00, warehousePosition: 'A-01-02', remark: '正常出库' }
  ]},
  { id: 2, code: 'LL20260302002', date: '2026-03-02', applicant: '李明轩', department: '生产部', warehouseLocation: '仓库B区', plantArea: '2号棚-茄果区', reviewer: '李志刚', productionBatchCode: 'FQ2024-002', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'SP0301001', materialName: '吡虫啉', spec: '100g/瓶', unit: '瓶', category: '农药与植保产品', requestedQuantity: 8, stockQuantity: 120, unitPrice: 28.00, warehousePosition: 'B-02-03', remark: '正常出库' }
  ]},
  { id: 3, code: 'LL20260303003', date: '2026-03-03', applicant: '王建国', department: '生产部', warehouseLocation: '仓库C区', plantArea: '3号棚-育苗区', reviewer: '张志远', productionBatchCode: 'FQ2024-003', status: '待审批', statusClass: 'pending', materials: [
    { materialCode: 'SP0302001', materialName: '多菌灵', spec: '200g/袋', unit: '袋', category: '农药与植保产品', requestedQuantity: 15, stockQuantity: 45, unitPrice: 35.00, warehousePosition: 'C-03-01', remark: '待审批' },
    { materialCode: 'SP0301001', materialName: '吡虫啉', spec: '100g/瓶', unit: '瓶', category: '农药与植保产品', requestedQuantity: 10, stockQuantity: 120, unitPrice: 28.00, warehousePosition: 'C-03-02', remark: '待审批' }
  ]},
  { id: 4, code: 'LL20260304004', date: '2026-03-04', applicant: '赵俊杰', department: '生产部', warehouseLocation: '仓库A区', plantArea: '1号棚-叶菜区', reviewer: '王志刚', productionBatchCode: 'FQ2024-004', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'SP0103001', materialName: '番茄种子', spec: '50g/袋', unit: '袋', category: '种质资源', requestedQuantity: 12, stockQuantity: 60, unitPrice: 120.00, warehousePosition: 'A-02-01', remark: '正常出库' }
  ]},
  { id: 5, code: 'LL20260305005', date: '2026-03-05', applicant: '钱文涛', department: '后勤部', warehouseLocation: '仓库D区', plantArea: '办公区绿化', reviewer: '陈志明', productionBatchCode: 'FQ2024-005', status: '已拒绝', statusClass: 'rejected', rejectReason: '库存不足，该物料当前库存为0，无法满足申请数量', materials: []},
  { id: 6, code: 'LL20260306006', date: '2026-03-06', applicant: '孙晓峰', department: '生产部', warehouseLocation: '仓库B区', plantArea: '4号棚-水稻区', reviewer: '李志刚', productionBatchCode: 'FQ2024-006', status: '待审批', statusClass: 'pending', materials: [
    { materialCode: 'SP0202001', materialName: '尿素', spec: '50kg/袋', unit: '袋', category: '肥料与土壤改良剂', requestedQuantity: 20, stockQuantity: 80, unitPrice: 85.00, warehousePosition: 'B-01-02', remark: '库存充足' }
  ]},
  { id: 7, code: 'LL20260307007', date: '2026-03-07', applicant: '周志强', department: '生产部', warehouseLocation: '仓库C区', plantArea: '5号棚-水果区', reviewer: '张志远', productionBatchCode: 'FQ2024-007', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'OP0201001', materialName: '锄头', spec: '标准型', unit: '把', category: '劳保与防护用品', requestedQuantity: 5, stockQuantity: 35, unitPrice: 42.00, warehousePosition: 'C-04-01', remark: '正常出库' },
    { materialCode: 'OP0102001', materialName: '劳保胶靴', spec: '标准码', unit: '双', category: '劳保与防护用品', requestedQuantity: 10, stockQuantity: 50, unitPrice: 68.00, warehousePosition: 'C-04-02', remark: '正常出库' }
  ]},
  { id: 8, code: 'LL20260308008', date: '2026-03-08', applicant: '吴海龙', department: '设备部', warehouseLocation: '仓库A区', plantArea: '灌溉系统维护', reviewer: '王志刚', productionBatchCode: 'FQ2024-008', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'EQ0103001', materialName: '电动喷雾机', spec: '标准型', unit: '台', category: '农业机械', requestedQuantity: 2, stockQuantity: 15, unitPrice: 580.00, warehousePosition: 'A-05-01', remark: '正常出库' }
  ]},
  { id: 9, code: 'LL20260309009', date: '2026-03-09', applicant: '郑志远', department: '技术部', warehouseLocation: '仓库E区', plantArea: '实验室', reviewer: '赵志鹏', productionBatchCode: 'FQ2024-001', status: '已取消', statusClass: 'cancelled', materials: []},
  { id: 10, code: 'LL20260310010', date: '2026-03-10', applicant: '陈思远', department: '生产部', warehouseLocation: '仓库B区', plantArea: '2号棚-茄果区', reviewer: '李志刚', productionBatchCode: 'FQ2024-002', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'SP0101001', materialName: '水稻种子', spec: '20kg/袋', unit: '袋', category: '种质资源', requestedQuantity: 30, stockQuantity: 100, unitPrice: 65.00, warehousePosition: 'B-02-01', remark: '正常出库' }
  ]},
  { id: 11, code: 'LL20260311011', date: '2026-03-11', applicant: '刘志伟', department: '生产部', warehouseLocation: '仓库C区', plantArea: '6号棚-花卉区', reviewer: '张志远', productionBatchCode: 'FQ2024-003', status: '待审批', statusClass: 'pending', materials: [
    { materialCode: 'EQ0306001', materialName: '滴灌带', spec: '50m/卷', unit: '卷', category: '农业机械', requestedQuantity: 20, stockQuantity: 200, unitPrice: 38.00, warehousePosition: 'C-05-01', remark: '待审批' }
  ]},
  { id: 12, code: 'LL20260312012', date: '2026-03-12', applicant: '杨文博', department: '采后处理部', warehouseLocation: '仓库A区', plantArea: '采后处理车间', reviewer: '王志刚', productionBatchCode: 'FQ2024-004', status: '已审批', statusClass: 'approved', materials: [
    { materialCode: 'PH0104001', materialName: '塑料袋', spec: '标准型', unit: '卷', category: '采收容器', requestedQuantity: 50, stockQuantity: 500, unitPrice: 8.50, warehousePosition: 'A-03-01', remark: '正常出库' },
    { materialCode: 'IT0101001', materialName: '土壤温湿度传感器', spec: '标准型', unit: '个', category: '监测设备', requestedQuantity: 5, stockQuantity: 30, unitPrice: 260.00, warehousePosition: 'A-04-01', remark: '正常出库' }
  ]}
]

/**
 * ProductionApproval 字段/类型/业务值映射工具
 * 从 ProductionApproval.vue 中拆分提取（保持 1:1 逻辑）
 */

// 业务类型标签
export const getBusinessTypeLabel = (type) => {
  const labels = {
    production: '生产计划信息',
    production_batch: '生产批次信息',
    batch_change: '批次变更信息',
    batch_void: '批次作废信息',
    tech_solution: '技术方案信息',
    harvest: '采收申请信息',
    material: '领料申请信息',
    purchase: '采购申请信息',
    // P0-PA-003: 业务类型 typeLabelMap 补 4 键（V1.1 L640-643 leave/overtime/transfer/resign）
    leave: '请假申请信息',
    overtime: '加班申请信息',
    transfer: '转岗申请信息',
    resign: '离职申请信息',
  }
  return labels[type] || '业务信息'
}

// 字段中文映射
export const getFieldLabel = (key) => {
  const labels = {
    type: '业务类型',
    requestId: '请求ID',
    requestCode: '计划编号',
    batchCode: '批次编号',
    cropName: '作物名称',
    cropCode: '作物编码',
    variety: '品种',
    greenhouseName: '温室区域',
    greenhouseId: '温室ID',
    startDate: '开始日期',
    expectedHarvestDate: '预计采收',
    responsiblePerson: '负责人',
    targetYield: '目标产量',
    plantingArea: '种植面积',
    plantingMode: '种植方式',
    unit: '单位',
    quantity: '数量',
    solutionTitle: '方案标题',
    stage: '阶段',
    version: '版本号',
    remarks: '备注',
    description: '描述',
  }
  return labels[key] || key
}

// 格式化业务数据
export const formatBusinessValue = (key, value) => {
  if (key === 'type') {
    const typeMap = {
      production: '生产计划', production_batch: '生产批次',
      batch_change: '批次变更', batch_void: '批次作废',
      tech_solution: '技术方案', harvest: '采收申请',
      material: '领料申请', purchase: '采购申请',
      // P0-PA-003: type 映射补 4 键（V1.1 L690-693 leave/overtime/transfer/resign）
      leave: '请假', overtime: '加班', transfer: '转岗', resign: '离职',
    }
    return typeMap[value] || value
  }
  if (key === 'targetYield') return `${value} kg`
  if (key === 'plantingArea') return `${value} m²`
  if (key === 'plantingMode') {
    const modeMap = {
      internal_seed: '自育种', external_purchase: '外购',
      open_field: '露天栽培', greenhouse: '温室栽培',
      hydroponics: '水培', aeroponics: '气雾培',
      substrate: '基质栽培', soil: '土培',
    }
    return modeMap[value] || value
  }
  if (key === 'stage') {
    const stageMap = {
      seedling: '苗期', vegetative: '营养生长',
      flowering: '开花期', fruiting: '结果期',
      harvest: '采收期', entire: '整个生命周期', whole_lifecycle: '整个生命周期',
    }
    return stageMap[value] || value
  }
  return String(value)
}

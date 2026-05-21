// 生产计划
export const ProductionPlan = {
  id: 0,
  title: '',
  cropId: 0,
  cropName: '',
  blockId: 0,
  blockName: '',
  plantingArea: 0,
  expectedYield: 0,
  actualYield: 0,
  startDate: '',
  endDate: '',
  status: 'planning',
  remark: ''
}

// 批次
export const Batch = {
  id: 0,
  batchCode: '',
  cropId: 0,
  cropName: '',
  plantingDate: '',
  harvestDate: '',
  plantingArea: 0,
  yield: 0,
  quality: 'A',
  status: 'growing'
}

// 兼容 CropBatch 类型别名 (用于 productionPlan store)
export const CropBatch = {
  id: '',
  batchCode: '',
  batchName: '',
  planType: '',
  cropName: '',
  cropType: '',
  variety: '',
  greenhouseId: '',
  greenhouseName: '',
  plantingArea: 0,
  stage: '',
  stageName: '',
  startDate: '',
  expectedHarvestDate: '',
  targetYield: 0,
  actualYield: 0,
  status: '',
  plantingMode: '',
  responsiblePerson: '',
  publisher: '',
  publishDate: '',
  lastModifyDate: '',
  batchStatus: '',
  planTypeName: '',
  description: '',
  planDetail: ''
}

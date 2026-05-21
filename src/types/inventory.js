// 物料
export const Material = {
  id: 0,
  code: '',
  name: '',
  category: '',
  specification: '',
  unit: '',
  safeStock: 0,
  currentStock: 0,
  price: 0,
  supplier: '',
  remark: ''
}

// 入库记录
export const InboundRecord = {
  id: 0,
  materialId: 0,
  materialName: '',
  inboundDate: '',
  quantity: 0,
  unit: '',
  supplier: '',
  warehouseId: 0,
  warehouseName: '',
  operator: '',
  status: 'pending',
  remark: ''
}

// 出库记录
export const OutboundRecord = {
  id: 0,
  materialId: 0,
  materialName: '',
  outboundDate: '',
  quantity: 0,
  unit: '',
  applicant: '',
  warehouseId: 0,
  warehouseName: '',
  operator: '',
  status: 'pending',
  remark: ''
}

// 仓库
export const Warehouse = {
  id: 0,
  name: '',
  location: '',
  capacity: 0,
  currentStock: 0,
  manager: '',
  status: 'active'
}

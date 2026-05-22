// 用户
export const User = {
  id: 0,
  username: '',
  name: '',
  email: '',
  phone: '',
  avatar: '',
  department: '',
  position: '',
  role: '',
  status: 'active',
  lastLoginTime: '',
  createdAt: ''
}

// 角色
export const Role = {
  id: 0,
  code: '',
  name: '',
  description: '',
  permissions: [],
  status: 'active',
  createdAt: ''
}

// 权限
export const Permission = {
  id: '',
  name: '',
  code: '',
  type: 'menu',
  path: '',
  parentId: '',
  order: 0
}

// 部门
export const Department = {
  id: 0,
  name: '',
  parentId: 0,
  parentName: '',
  manager: '',
  phone: '',
  status: 'active'
}

// 字典
export const Dictionary = {
  id: 0,
  code: '',
  name: '',
  items: []
}

export const DictionaryItem = {
  label: '',
  value: '',
  sort: 0,
  remark: ''
}

// 设备
export const Device = {
  id: 0,
  oid: '',
  deviceName: '',
  deviceCode: '',
  deviceType: '',
  manufacturer: '',
  serialNumber: '',
  greenhouseOid: '',
  greenhouseName: '',
  location: '',
  installDate: '',
  status: 'online',
  description: ''
}

// 设备状态
export const DeviceStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance'
}

// 设备类型
export const DEVICE_TYPES = ['传感器', '摄像头', '控制器', '气象站', '灌溉设备', '施肥设备', '其他']

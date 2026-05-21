// 农事任务状态
export const FarmTaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// 任务优先级
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

// 农事任务
export const FarmTask = {
  id: 0,
  title: '',
  content: '',
  status: 'pending',
  priority: 'medium',
  assigneeId: 0,
  assigneeName: '',
  planStartTime: '',
  planEndTime: '',
  actualStartTime: '',
  actualEndTime: '',
  blockId: 0,
  blockName: '',
  createdAt: '',
  updatedAt: ''
}

// 巡检记录
export const InspectionRecord = {
  id: 0,
  blockId: 0,
  blockName: '',
  inspectorId: 0,
  inspectorName: '',
  inspectTime: '',
  weather: '',
  temperature: 0,
  humidity: 0,
  发现问题: 0,
  status: 'normal',
  remark: '',
  attachments: []
}

// 地块
export const Block = {
  id: 0,
  name: '',
  zoneId: 0,
  zoneName: '',
  area: 0,
  cropType: '',
  status: 'idle'
}

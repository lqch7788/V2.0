import { get, post, put, del } from '../request'

// 获取任务列表
export function getTaskList(params) {
  return get('/farm/task/list', params)
}

// 获取任务详情
export function getTaskDetail(id) {
  return get(`/farm/task/${id}`)
}

// 创建任务
export function createTask(data) {
  return post('/farm/task', data)
}

// 更新任务
export function updateTask(id, data) {
  return put(`/farm/task/${id}`, data)
}

// 删除任务
export function deleteTask(id) {
  return del(`/farm/task/${id}`)
}

// 完成任务
export function completeTask(id) {
  return put(`/farm/task/${id}/complete`)
}

// 导出 API
export const farmApi = {
  getTaskList,
  getTaskDetail,
  createTask,
  updateTask,
  deleteTask,
  completeTask
}

export default farmApi

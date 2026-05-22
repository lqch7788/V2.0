import { get, post, put, del } from '../request'

// 获取考勤列表
export function getAttendanceList(params) {
  return get('/attendance', params)
}

// 获取考勤详情
export function getAttendanceDetail(id) {
  return get(`/attendance/${id}`)
}

// 补卡申请
export function applyAttendanceRepair(data) {
  return post('/attendance/repair', data)
}

// 导出 API
export const laborApi = {
  getAttendanceList,
  getAttendanceDetail,
  applyAttendanceRepair
}

export default laborApi

/**
 * 报警配置 API 模块
 * 对接后端: /api/alarm-configs
 */
import { get, post, put, del } from './request'

// 获取警报级别列表
export function getAlarmLevels() {
  return get('/alarm-configs/levels')
}

// 保存警报级别配置
export function saveAlarmLevel(level, data) {
  return put(`/alarm-configs/levels/${level}`, data)
}

// 获取联系人列表
export function getContacts(level) {
  const params = level ? { level } : {}
  return get('/alarm-configs/contacts', params)
}

// 添加联系人
export function addContact(data) {
  return post('/alarm-configs/contacts', data)
}

// 删除联系人
export function deleteContact(oid) {
  return del(`/alarm-configs/contacts/${oid}`)
}

export default {
  getAlarmLevels,
  saveAlarmLevel,
  getContacts,
  addContact,
  deleteContact
}

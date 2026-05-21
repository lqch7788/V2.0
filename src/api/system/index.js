import { get, post, put, del } from '../request'

// 获取用户列表
export function getUserList(params) {
  return get('/system/user/list', params)
}

// 获取用户详情
export function getUserDetail(id) {
  return get(`/system/user/${id}`)
}

// 创建用户
export function createUser(data) {
  return post('/system/user', data)
}

// 更新用户
export function updateUser(id, data) {
  return put(`/system/user/${id}`, data)
}

// 删除用户
export function deleteUser(id) {
  return del(`/system/user/${id}`)
}

// 获取字典列表
export function getDictionaryList() {
  return get('/system/dictionary/list')
}

export const systemApi = {
  getUserList,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  getDictionaryList
}

export default systemApi

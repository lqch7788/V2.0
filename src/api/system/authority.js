/**
 * 权限管理 API 服务
 * 对接后端权限相关接口
 */
import { get, post, put, del } from '@/api/request'

// ============================================
// 类型定义
// ============================================

/**
 * 组织结构
 */
export const Organization = {
  oid: '',
  oidParent: null,
  aid: '',
  name: '',
  description: '',
  orgType: 'department',
  departmentId: null,
  departmentName: null,
  sortNumber: 0,
  status: 'active',
  children: []
}

/**
 * 角色
 */
export const Role = {
  oid: '',
  aid: '',
  name: '',
  orgOid: '',
  description: '',
  sortNumber: 0,
  status: 'active'
}

/**
 * 用户
 */
export const User = {
  oid: '',
  username: '',
  aid: '',
  real_name: '',
  name: '',
  passwordHash: '',
  org_oid: '',
  orgOid: '',
  department_oid: '',
  departmentOid: '',
  email: '',
  phone: '',
  status: 'active'
}

/**
 * 工序/菜单
 */
export const Process = {
  oid: '',
  process_name: '',
  process_code: '',
  route: '',
  description: '',
  parent_oid: null,
  parentOid: null,
  app_type: 0,
  children: []
}

/**
 * 角色权限项
 */
export const RoleAuthorityItem = {
  processOid: '',
  actionOid: '',
  value: 0
}

// ============================================
// 组织管理 API
// ============================================

/**
 * 获取组织列表
 */
export function getOrganizations() {
  return get('/authority/organizations')
}

/**
 * 保存组织（新增/编辑）
 */
export function saveOrganization(data) {
  if (data.oid) {
    return put(`/authority/organizations/${data.oid}`, data)
  }
  return post('/authority/organizations', data)
}

/**
 * 删除组织
 */
export function deleteOrganization(oid) {
  return del(`/authority/organizations/${oid}`)
}

// ============================================
// 角色管理 API
// ============================================

/**
 * 获取角色列表
 */
export function getRoles() {
  return get('/authority/roles')
}

/**
 * 保存角色（新增/编辑）
 */
export function saveRole(data) {
  if (data.oid) {
    return put(`/authority/roles/${data.oid}`, data)
  }
  return post('/authority/roles', data)
}

/**
 * 删除角色
 */
export function deleteRole(oid) {
  return del(`/authority/roles/${oid}`)
}

// ============================================
// 用户管理 API
// ============================================

/**
 * 获取用户列表
 */
export function getUsers() {
  return get('/authority/users')
}

/**
 * 保存用户（新增/编辑）
 */
export function saveUser(data) {
  if (data.oid) {
    return put(`/authority/users/${data.oid}`, data)
  }
  return post('/authority/users', data)
}

/**
 * 删除用户
 */
export function deleteUser(oid) {
  return del(`/authority/users/${oid}`)
}

/**
 * 修改用户状态
 */
export function updateUserStatus(oid, status) {
  return put(`/authority/users/${oid}/status`, { status })
}

/**
 * 修改用户密码
 */
export function updateUserPassword(oid, newPassword) {
  return put(`/authority/users/${oid}/password`, { newPassword })
}

/**
 * 获取用户角色
 */
export function getUserRoles(oid) {
  return get(`/authority/users/${oid}/roles`)
}

/**
 * 分配用户角色
 */
export function assignUserRoles(oid, roleOids) {
  return post(`/authority/users/${oid}/roles`, { roleOids })
}

// ============================================
// 工序/菜单管理 API
// ============================================

/**
 * 获取工序列表
 */
export function getProcesses(params) {
  return get('/authority/processes', params)
}

/**
 * 保存工序（新增/编辑）
 */
export function saveProcess(data) {
  if (data.oid) {
    return put(`/authority/processes/${data.oid}`, data)
  }
  return post('/authority/processes', data)
}

/**
 * 删除工序
 */
export function deleteProcess(oid) {
  return del(`/authority/processes/${oid}`)
}

// ============================================
// 权限管理 API
// ============================================

/**
 * 获取角色权限
 */
export function getRoleAuthority(roleOid, appType = 0) {
  return get(`/authority/roles/${roleOid}/authority`, { appType })
}

/**
 * 保存角色权限
 */
export function saveRoleAuthority(roleOid, authorities) {
  return post(`/authority/roles/${roleOid}/authority`, { authorities })
}

/**
 * 获取角色数据权限
 */
export function getRoleDataAuthority(roleOid) {
  return get(`/authority/roles/${roleOid}/data-authority`)
}

/**
 * 保存角色数据权限
 */
export function saveRoleDataAuthority(roleOid, orgOids, authorized) {
  return post(`/authority/roles/${roleOid}/data-authority`, { orgOids, authorized })
}

/**
 * 获取用户特殊权限
 */
export function getUserAuthority(userOid) {
  return get(`/authority/users/${userOid}/authority`)
}

/**
 * 保存用户特殊权限
 */
export function saveUserAuthority(userOid, authorities) {
  return post(`/authority/users/${userOid}/authority`, { authorities })
}

/**
 * 获取用户角色权限（用于对比展示）
 */
export function getUserRolesAuthority(userOid) {
  return get(`/authority/users/${userOid}/roles-authority`)
}

// ============================================
// 导出 API 对象
// ============================================

export const authorityApi = {
  // 组织
  getOrganizations,
  saveOrganization,
  deleteOrganization,
  // 角色
  getRoles,
  saveRole,
  deleteRole,
  // 用户
  getUsers,
  saveUser,
  deleteUser,
  updateUserStatus,
  updateUserPassword,
  getUserRoles,
  assignUserRoles,
  // 工序
  getProcesses,
  saveProcess,
  deleteProcess,
  // 权限
  getRoleAuthority,
  saveRoleAuthority,
  getRoleDataAuthority,
  saveRoleDataAuthority,
  getUserAuthority,
  saveUserAuthority,
  getUserRolesAuthority
}

export default authorityApi

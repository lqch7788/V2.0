/**
 * 权限管理 Store — Pinia 状态管理
 * 管理组织、角色、用户、工序等权限相关数据
 * 含 localStorage 回退数据（匹配V1.1 authorityService）
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getOrganizations,
  saveOrganization as apiSaveOrganization,
  deleteOrganization as apiDeleteOrganization,
  getRoles,
  saveRole as apiSaveRole,
  deleteRole as apiDeleteRole,
  getUsers,
  saveUser as apiSaveUser,
  deleteUser as apiDeleteUser,
  getProcesses,
  saveProcess as apiSaveProcess,
  deleteProcess as apiDeleteProcess
} from '@/api/system/authority'

// ============================================
// 本地默认数据（与V1.1 authorityService.ts完全一致）
// ============================================

const DEFAULT_ORGANIZATIONS = [
  { oid: 'ORG001', name: '宁波帮帮忙公司', oidParent: null, sortNumber: 1, status: 'active', description: '总公司' },
  { oid: 'ORG002', name: '生产部', oidParent: 'ORG001', sortNumber: 2, status: 'active', description: '生产管理部门' },
  { oid: 'ORG003', name: '技术部', oidParent: 'ORG001', sortNumber: 3, status: 'active', description: '技术研发部门' },
  { oid: 'ORG004', name: '后勤部', oidParent: 'ORG001', sortNumber: 4, status: 'active', description: '后勤保障部门' },
  { oid: 'ORG005', name: '财务部', oidParent: 'ORG001', sortNumber: 5, status: 'active', description: '财务管理部门' }
]

const DEFAULT_ROLES = [
  { oid: 'ROLE001', name: '系统管理员', orgOid: 'ORG001', description: '系统全部权限', status: 'active', sortNumber: 1 },
  { oid: 'ROLE002', name: '生产主管', orgOid: 'ORG002', description: '生产管理权限', status: 'active', sortNumber: 2 },
  { oid: 'ROLE003', name: '技术员', orgOid: 'ORG003', description: '技术操作权限', status: 'active', sortNumber: 3 },
  { oid: 'ROLE004', name: '普通员工', orgOid: 'ORG001', description: '基本操作权限', status: 'active', sortNumber: 4 }
]

const DEFAULT_USERS = [
  { oid: 'USER001', aid: 'admin', username: 'admin', real_name: '系统管理员', name: '系统管理员', org_oid: 'ORG001', status: 'active' },
  { oid: 'USER002', aid: 'lcq', username: 'lcq', real_name: '陆启闯', name: '陆启闯', org_oid: 'ORG002', status: 'active' },
  { oid: 'USER003', aid: 'guojing', username: 'guojing', real_name: '郭靖', name: '郭靖', org_oid: 'ORG002', status: 'active' },
  { oid: 'USER004', aid: 'huangrong', username: 'huangrong', real_name: '黄蓉', name: '黄蓉', org_oid: 'ORG003', status: 'active' }
]

const DEFAULT_PROCESSES = [
  { oid: 'PROC001', process_name: '采收管理', process_code: 'harvest', app_type: 0, sortNumber: 1, status: 'active', description: '采收相关工序', parent_oid: null },
  { oid: 'PROC002', process_name: '种植管理', process_code: 'planting', app_type: 0, sortNumber: 2, status: 'active', description: '种植相关工序', parent_oid: null },
  { oid: 'PROC003', process_name: '施肥管理', process_code: 'fertilizer', app_type: 0, sortNumber: 3, status: 'active', description: '施肥相关工序', parent_oid: null },
  { oid: 'PROC004', process_name: '浇水管理', process_code: 'irrigation', app_type: 0, sortNumber: 4, status: 'active', description: '浇水相关工序', parent_oid: null },
  { oid: 'PROC005', process_name: '巡检管理', process_code: 'inspection', app_type: 0, sortNumber: 5, status: 'active', description: '巡检相关工序', parent_oid: null }
]

// LocalStorage 键名（与V1.1一致）
const STORAGE_KEYS = {
  organizations: 'yuanxingtu_organizations',
  roles: 'yuanxingtu_roles',
  users: 'yuanxingtu_users',
  processes: 'yuanxingtu_processes'
}

// localStorage 读写工具
function getStoredData(key, defaultData) {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.warn(`[AuthorityStore] 读取 ${key} 失败:`, e)
  }
  // 首次使用时保存默认数据
  try {
    localStorage.setItem(key, JSON.stringify(defaultData))
  } catch (e) { /* 忽略存储失败 */ }
  return defaultData
}

function saveStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.warn(`[AuthorityStore] 保存 ${key} 失败:`, e)
  }
}

export const useAuthorityStore = defineStore('authority', () => {
  // ============================================
  // 组织管理状态
  // ============================================
  const organizations = ref([])
  const organizationsLoading = ref(false)
  const organizationsError = ref(null)

  // 加载组织列表（API失败时回退localStorage）
  const loadOrganizations = async () => {
    organizationsLoading.value = true
    organizationsError.value = null
    try {
      const data = await getOrganizations()
      if (data && data.length > 0) {
        organizations.value = data
        saveStoredData(STORAGE_KEYS.organizations, data)
        return
      }
    } catch (err) {
      console.warn('[AuthorityStore] API加载组织列表失败，使用本地数据:', err)
    }
    // 回退到本地数据
    organizations.value = getStoredData(STORAGE_KEYS.organizations, DEFAULT_ORGANIZATIONS)
    organizationsLoading.value = false
  }

  // 保存组织
  const saveOrganization = async (data) => {
    try {
      await apiSaveOrganization(data)
      await loadOrganizations()
    } catch (err) {
      console.error('[AuthorityStore] 保存组织失败:', err)
      throw err
    }
  }

  // 删除组织
  const deleteOrganization = async (oid) => {
    try {
      await apiDeleteOrganization(oid)
      await loadOrganizations()
    } catch (err) {
      console.error('[AuthorityStore] 删除组织失败:', err)
      throw err
    }
  }

  // ============================================
  // 角色管理状态
  // ============================================
  const roles = ref([])
  const rolesLoading = ref(false)
  const rolesError = ref(null)

  // 加载角色列表（API失败时回退localStorage）
  // params 可选: { orgOid, sort, order } 透传给后端 (与 V1.1 authorityService.getRoles 一致)
  const loadRoles = async (params) => {
    rolesLoading.value = true
    rolesError.value = null
    try {
      const data = await getRoles(params)
      if (data && data.length > 0) {
        roles.value = data
        saveStoredData(STORAGE_KEYS.roles, data)
        return
      }
    } catch (err) {
      console.warn('[AuthorityStore] API加载角色列表失败，使用本地数据:', err)
    }
    roles.value = getStoredData(STORAGE_KEYS.roles, DEFAULT_ROLES)
    rolesLoading.value = false
  }

  // 保存角色
  const saveRole = async (data) => {
    try {
      await apiSaveRole(data)
      await loadRoles()
    } catch (err) {
      console.error('[AuthorityStore] 保存角色失败:', err)
      throw err
    }
  }

  // 删除角色
  const deleteRole = async (oid) => {
    try {
      await apiDeleteRole(oid)
      await loadRoles()
    } catch (err) {
      console.error('[AuthorityStore] 删除角色失败:', err)
      throw err
    }
  }

  // ============================================
  // 用户管理状态
  // ============================================
  const users = ref([])
  const usersLoading = ref(false)
  const usersError = ref(null)

  // 加载用户列表（API失败时回退localStorage）
  // params 可选: { orgOid, status } 透传给后端 (与 V1.1 authorityService.getUsers 一致)
  const loadUsers = async (params) => {
    usersLoading.value = true
    usersError.value = null
    try {
      const data = await getUsers(params)
      if (data && data.length > 0) {
        users.value = data
        saveStoredData(STORAGE_KEYS.users, data)
        return
      }
    } catch (err) {
      console.warn('[AuthorityStore] API加载用户列表失败，使用本地数据:', err)
    }
    users.value = getStoredData(STORAGE_KEYS.users, DEFAULT_USERS)
    usersLoading.value = false
  }

  // 保存用户
  const saveUser = async (data) => {
    try {
      await apiSaveUser(data)
      await loadUsers()
    } catch (err) {
      console.error('[AuthorityStore] 保存用户失败:', err)
      throw err
    }
  }

  // 删除用户
  const deleteUser = async (oid) => {
    try {
      await apiDeleteUser(oid)
      await loadUsers()
    } catch (err) {
      console.error('[AuthorityStore] 删除用户失败:', err)
      throw err
    }
  }

  // ============================================
  // 工序管理状态
  // ============================================
  const processes = ref([])
  const processesLoading = ref(false)
  const processesError = ref(null)

  // 加载工序列表（API失败时回退localStorage）
  const loadProcesses = async (params = {}) => {
    processesLoading.value = true
    processesError.value = null
    try {
      const data = await getProcesses(params)
      if (data && data.length > 0) {
        processes.value = data
        saveStoredData(STORAGE_KEYS.processes, data)
        return
      }
    } catch (err) {
      console.warn('[AuthorityStore] API加载工序列表失败，使用本地数据:', err)
    }
    processes.value = getStoredData(STORAGE_KEYS.processes, DEFAULT_PROCESSES)
    processesLoading.value = false
  }

  // 保存工序
  const saveProcess = async (data) => {
    try {
      await apiSaveProcess(data)
      await loadProcesses()
    } catch (err) {
      console.error('[AuthorityStore] 保存工序失败:', err)
      throw err
    }
  }

  // 删除工序
  const deleteProcess = async (oid) => {
    try {
      await apiDeleteProcess(oid)
      await loadProcesses()
    } catch (err) {
      console.error('[AuthorityStore] 删除工序失败:', err)
      throw err
    }
  }

  // ============================================
  // 加载所有数据
  // ============================================
  const loadAll = async () => {
    await Promise.all([
      loadOrganizations(),
      loadRoles(),
      loadUsers(),
      loadProcesses()
    ])
  }

  // ============================================
  // 导出
  // ============================================
  return {
    // 组织状态
    organizations,
    organizationsLoading,
    organizationsError,
    loadOrganizations,
    saveOrganization,
    deleteOrganization,
    // 角色状态
    roles,
    rolesLoading,
    rolesError,
    loadRoles,
    saveRole,
    deleteRole,
    // 用户状态
    users,
    usersLoading,
    usersError,
    loadUsers,
    saveUser,
    deleteUser,
    // 工序状态
    processes,
    processesLoading,
    processesError,
    loadProcesses,
    saveProcess,
    deleteProcess,
    // 加载所有
    loadAll
  }
})

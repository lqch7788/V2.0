/**
 * 权限管理 Store — Pinia 状态管理
 * 管理组织、角色、用户、工序等权限相关数据
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

export const useAuthorityStore = defineStore('authority', () => {
  // ============================================
  // 组织管理状态
  // ============================================
  const organizations = ref([])
  const organizationsLoading = ref(false)
  const organizationsError = ref(null)

  // 加载组织列表
  const loadOrganizations = async () => {
    organizationsLoading.value = true
    organizationsError.value = null
    try {
      const data = await getOrganizations()
      organizations.value = data || []
    } catch (err) {
      console.warn('[AuthorityStore] 加载组织列表失败:', err)
      organizationsError.value = err.message || '加载组织列表失败'
    } finally {
      organizationsLoading.value = false
    }
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

  // 加载角色列表
  const loadRoles = async () => {
    rolesLoading.value = true
    rolesError.value = null
    try {
      const data = await getRoles()
      roles.value = data || []
    } catch (err) {
      console.warn('[AuthorityStore] 加载角色列表失败:', err)
      rolesError.value = err.message || '加载角色列表失败'
    } finally {
      rolesLoading.value = false
    }
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

  // 加载用户列表
  const loadUsers = async () => {
    usersLoading.value = true
    usersError.value = null
    try {
      const data = await getUsers()
      users.value = data || []
    } catch (err) {
      console.warn('[AuthorityStore] 加载用户列表失败:', err)
      usersError.value = err.message || '加载用户列表失败'
    } finally {
      usersLoading.value = false
    }
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

  // 加载工序列表
  const loadProcesses = async (params = {}) => {
    processesLoading.value = true
    processesError.value = null
    try {
      const data = await getProcesses(params)
      processes.value = data || []
    } catch (err) {
      console.warn('[AuthorityStore] 加载工序列表失败:', err)
      processesError.value = err.message || '加载工序列表失败'
    } finally {
      processesLoading.value = false
    }
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

<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <a
            href="/settings"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20" color="#4b5563">
              <ArrowLeft />
            </el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><User /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">用户管理</h1>
            <p class="text-gray-500">管理系统用户账号、角色分配与状态</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-2 ml-auto">
        <div class="relative">
          <el-icon class="absolute left-2.5 top-1/2 -translate-y-1/2" :size="14" color="#9ca3af">
            <Search />
          </el-icon>
          <el-input
            v-model="searchTerm"
            placeholder="请输入..."
            clearable
            class="w-36 pl-8"
            size="small"
            @clear="handleSearch"
          />
        </div>
        <el-select v-model="statusFilter" placeholder="全部" clearable size="small" class="w-24" @change="currentPage = 1">
          <el-option value="all" label="全部" />
          <el-option value="active" label="启用" />
          <el-option value="inactive" label="禁用" />
        </el-select>
        <el-button size="small" @click="handleReset">重置</el-button>
        <el-button type="primary" size="small" @click="openAddModal">
          <el-icon :size="14"><Plus /></el-icon>
          新增用户
        </el-button>
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="bg-white rounded-xl shadow-none overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-b">
            <th class="text-left py-2.5 px-4 font-medium text-white">用户名</th>
            <th class="text-left py-2.5 px-4 font-medium text-white">姓名</th>
            <th class="text-left py-2.5 px-4 font-medium text-white">所属组织</th>
            <th class="text-left py-2.5 px-4 font-medium text-white">部门</th>
            <th class="text-left py-2.5 px-4 font-medium text-white">邮箱/电话</th>
            <th class="text-center py-2.5 px-4 font-medium text-white w-20">状态</th>
            <th class="text-right py-2.5 px-4 font-medium text-white w-36">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && users.length === 0">
            <td colspan="7" class="py-8 text-center text-gray-500">
              <el-icon class="is-loading" :size="24"><Loading /></el-icon>
            </td>
          </tr>
          <tr v-else-if="pagedUsers.length === 0">
            <td colspan="7" class="py-12 text-center text-gray-400">暂无用户数据</td>
          </tr>
          <tr
            v-for="user in pagedUsers"
            :key="user.oid"
            class="border-b border-gray-200 hover:bg-blue-50"
          >
            <td class="py-2 px-4 text-gray-700 font-medium">{{ user.username || user.aid }}</td>
            <td class="py-2 px-4 text-gray-700">{{ user.real_name || user.name }}</td>
            <td class="py-2 px-4 text-gray-500">{{ getOrgName(user.org_oid || user.orgOid) }}</td>
            <td class="py-2 px-4">
              <!-- 3层显示: 直接部门 → 组织关联部门 → "-"（与V1.1 100%一致） -->
              <template v-if="user.department_oid || user.departmentOid">
                <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded">
                  {{ getDeptName(user.department_oid || user.departmentOid) }}
                </span>
              </template>
              <template v-else>
                <span v-if="getOrgLinkedDept(user.org_oid || user.orgOid)" class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded" title="保存后自动关联">
                  {{ getOrgLinkedDept(user.org_oid || user.orgOid) }}
                </span>
                <span v-else class="text-xs text-gray-400">-</span>
              </template>
            </td>
            <td class="py-2 px-4 text-xs text-gray-400">
              <span v-if="user.email">{{ user.email }}</span>
              <span v-if="user.phone" class="ml-2">{{ user.phone }}</span>
            </td>
            <td class="py-2 px-4 text-center">
              <el-tag :type="user.status === 'active' ? 'success' : 'danger'" size="small">
                {{ user.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </td>
            <td class="py-2 px-4">
              <div class="flex items-center justify-end gap-1">
                <el-button text size="small" @click="openEditModal(user)" title="编辑">
                  <el-icon :size="16" color="#2563eb"><Edit /></el-icon>
                </el-button>
                <el-button text size="small" @click="openPasswordModal(user)" title="修改密码">
                  <el-icon :size="16" color="#d97706"><Key /></el-icon>
                </el-button>
                <el-button text size="small" @click="handleToggleStatus(user)" :title="user.status === 'active' ? '禁用' : '启用'">
                  <el-icon :size="16" :color="user.status === 'active' ? '#7c3aed' : '#10b981'">
                    <component :is="user.status === 'active' ? 'Close' : 'Plus'" />
                  </el-icon>
                </el-button>
                <el-button text size="small" @click="handleDelete(user.oid)" title="删除">
                  <el-icon :size="16" color="#dc2626"><Delete /></el-icon>
                </el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t bg-blue-50/30">
        <span class="text-sm text-gray-500">共 {{ filteredUsers.length }} 名用户</span>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredUsers.length"
          layout="prev, pager, next, sizes"
          background
        />
      </div>
    </div>

    <!-- ========== 新增/编辑用户弹窗 ========== -->
    <el-dialog
      v-model="userDialogVisible"
      :title="editingUser ? '编辑用户' : '新增用户'"
      width="700px"
      :close-on-click-modal="false"
      draggable
    >
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-500 mb-1">用户名 <span class="text-red-500">*</span></label>
            <el-input v-model="userForm.username" placeholder="登录账号" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">姓名 <span class="text-red-500">*</span></label>
            <el-input v-model="userForm.realName" placeholder="真实姓名" />
          </div>
        </div>
        <div v-if="!editingUser">
          <label class="block text-xs text-gray-500 mb-1">初始密码</label>
          <el-input v-model="userForm.password" type="password" placeholder="留空则使用默认密码" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">所属组织</label>
          <el-select v-model="userForm.orgOid" class="w-full" placeholder="请选择组织">
            <el-option
              v-for="org in organizations"
              :key="org.oid"
              :label="org.name"
              :value="org.oid"
            />
          </el-select>
          <!-- 自动关联部门提示（与V1.1 100%一致） -->
          <p v-if="userForm.orgOid && getOrgLinkedDept(userForm.orgOid)" class="text-xs text-emerald-600 mt-1">
            自动关联部门：{{ getOrgLinkedDept(userForm.orgOid) }}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-500 mb-1">邮箱</label>
            <el-input v-model="userForm.email" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">电话</label>
            <el-input v-model="userForm.phone" />
          </div>
        </div>
        <!-- 角色分配 -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">角色分配</label>
          <div class="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
            <div
              v-for="role in roles"
              :key="role.oid"
              class="flex items-center gap-2 text-sm cursor-pointer hover:bg-blue-50 py-0.5 px-1 rounded"
              @click="toggleUserRole(role.oid)"
            >
              <el-checkbox :model-value="userRoleOids.includes(role.oid)" size="small" />
              <span class="text-gray-700">{{ role.role_name || role.name }}</span>
              <span class="text-xs text-gray-400 font-mono ml-auto">{{ role.aid }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUserSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- ========== 修改密码弹窗 ========== -->
    <el-dialog
      v-model="passwordDialogVisible"
      :title="'修改密码' + (passwordUser ? ' - ' + (passwordUser.real_name || passwordUser.name) : '')"
      width="500px"
      :close-on-click-modal="false"
      draggable
    >
      <div>
        <label class="block text-xs text-gray-500 mb-1">新密码</label>
        <el-input v-model="newPassword" type="password" placeholder="输入新密码" show-password />
      </div>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button style="background:#f59e0b;border-color:#f59e0b;color:#fff" @click="handlePasswordChange" :loading="saving">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- ========== 删除确认弹窗 ========== -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除用户"
      width="500px"
      :close-on-click-modal="false"
      draggable
    >
      <p class="text-sm text-gray-600">删除后用户将无法登录系统，确定要删除吗？</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="saving">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Search,
  Plus,
  Edit,
  Delete,
  Key,
  Loading,
  Close,
  ArrowLeft
} from '@element-plus/icons-vue'
import { useAuthorityStore } from '@/stores/modules/authority'
import { useDepartmentStore } from '@/stores/modules/department'
import { updateUserStatus, updateUserPassword, getUserRoles, assignUserRoles } from '@/api/system/authority'

// Store
const authorityStore = useAuthorityStore()
const departmentStore = useDepartmentStore()
const {
  users,
  loading,
  loadUsers,
  saveUser,
  deleteUser,
  organizations,
  loadOrganizations,
  roles,
  loadRoles
} = authorityStore

// 部门
const departments = computed(() => departmentStore.departments || [])

// UI 状态
const searchTerm = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗状态
const userDialogVisible = ref(false)
const editingUser = ref(null)
const userForm = reactive({
  username: '',
  realName: '',
  password: '',
  orgOid: '',
  email: '',
  phone: '',
  status: 'active'
})
const userRoleOids = ref([])

const passwordDialogVisible = ref(false)
const passwordUser = ref(null)
const newPassword = ref('')

const deleteDialogVisible = ref(false)
const deleteTarget = ref(null)
const saving = ref(false)

// 筛选
const filteredUsers = computed(() => {
  return (users.value || []).filter(u => {
    if (statusFilter.value !== 'all' && u.status !== statusFilter.value) return false
    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      const name = (u.real_name || u.name || '').toLowerCase()
      const uname = (u.username || u.aid || '').toLowerCase()
      if (!name.includes(term) && !uname.includes(term)) return false
    }
    return true
  })
})

// 分页
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value))
const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

// 获取组织名称
const getOrgName = (orgOid) => {
  const org = organizations.value.find(o => o.oid === orgOid)
  return org?.name || orgOid || '-'
}

// 获取组织关联的部门信息（与V1.1 getOrgLinkedDept 100%一致）
const getOrgLinkedDept = (orgOid) => {
  const org = organizations.value.find(o => o.oid === orgOid)
  if (org?.departmentId) {
    const dept = departments.value.find(d => (d.id || d.oid) === org.departmentId)
    return dept?.name || org.departmentName || org.departmentId
  }
  return null
}

// 获取部门名称
const getDeptName = (deptOid) => {
  if (!deptOid) return null
  const dept = departments.value.find(d => (d.id || d.oid) === deptOid)
  return dept?.name || deptOid
}

// 搜索和重置
const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  searchTerm.value = ''
  statusFilter.value = 'all'
  currentPage.value = 1
  // V1.1 一致: 重置后重新拉取数据,服务端按 status=all 过滤(若后端支持)
  loadUsers({ status: 'all' })
}

// 状态筛选变化时,推到服务端做 query 过滤(若后端支持);前端仍保留 client-side 过滤作为兜底
watch(statusFilter, (newVal) => {
  loadUsers({ status: newVal === 'all' ? undefined : newVal })
})

// 弹窗操作
const openAddModal = () => {
  editingUser.value = null
  Object.assign(userForm, {
    username: '',
    realName: '',
    password: '',
    orgOid: organizations.value[0]?.oid || '',
    email: '',
    phone: '',
    status: 'active'
  })
  userRoleOids.value = []
  userDialogVisible.value = true
}

const openEditModal = async (user) => {
  editingUser.value = user
  userForm.username = user.username || user.aid || ''
  userForm.realName = user.real_name || user.name || ''
  userForm.password = ''
  userForm.orgOid = user.org_oid || user.orgOid || ''
  userForm.email = user.email || ''
  userForm.phone = user.phone || ''
  userForm.status = user.status || 'active'

  // 加载用户角色
  try {
    const roleOids = await getUserRoles(user.oid)
    userRoleOids.value = roleOids || []
  } catch {
    userRoleOids.value = []
  }
  userDialogVisible.value = true
}

const handleUserSave = async () => {
  if (!userForm.username || !userForm.realName) {
    ElMessage.warning('请填写用户名和姓名')
    return
  }
  saving.value = true
  try {
    const payload = {
      oid: editingUser.value?.oid || `USER_${Date.now()}`,
      username: userForm.username,
      real_name: userForm.realName,
      org_oid: userForm.orgOid,
      email: userForm.email,
      phone: userForm.phone,
      status: userForm.status,
      passwordHash: userForm.password || undefined
    }
    await saveUser(payload)

    // 保存用户角色
    if (userRoleOids.value.length > 0) {
      try {
        await assignUserRoles(payload.oid, userRoleOids.value)
      } catch (err) {
        ElMessage.error('保存用户角色失败')
      }
    }

    userDialogVisible.value = false
    await loadUsers()
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = (oid) => {
  deleteTarget.value = oid
  deleteDialogVisible.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await deleteUser(deleteTarget.value)
    deleteDialogVisible.value = false
    deleteTarget.value = null
    await loadUsers()
  } catch (err) {
    ElMessage.error('删除失败')
  } finally {
    saving.value = false
  }
}

const openPasswordModal = (user) => {
  passwordUser.value = user
  newPassword.value = ''
  passwordDialogVisible.value = true
}

const handlePasswordChange = async () => {
  if (!passwordUser.value || !newPassword.value) return
  saving.value = true
  try {
    await updateUserPassword(passwordUser.value.oid, newPassword.value)
    passwordDialogVisible.value = false
  } catch (err) {
    ElMessage.error('修改失败')
  } finally {
    saving.value = false
  }
}

const handleToggleStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  try {
    await updateUserStatus(user.oid, newStatus)
    await loadUsers()
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

const toggleUserRole = (roleOid) => {
  const index = userRoleOids.value.indexOf(roleOid)
  if (index > -1) {
    userRoleOids.value.splice(index, 1)
  } else {
    userRoleOids.value.push(roleOid)
  }
}

// 初始化
onMounted(async () => {
  await loadUsers()
  await loadOrganizations()
  await departmentStore.loadDepartments?.()
  await loadRoles()
})
</script>

<style scoped>
/* 弹窗头部渐变 - 与V1.1保持一致: 3-stop emerald渐变 */
:deep(.el-dialog__header) {
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  border-radius: 8px 8px 0 0;
  margin: 0;
  padding: 16px 20px;
}
:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}
:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}
:deep(.el-dialog__body) {
  padding: 20px;
}
</style>

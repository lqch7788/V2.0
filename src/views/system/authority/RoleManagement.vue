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
            <el-icon :size="24" color="white"><Lock /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">角色管理</h1>
            <p class="text-gray-500">管理系统角色和权限配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center gap-3 flex-wrap">
      <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
        {{ roles.length }} 个角色
      </span>
      <div class="flex items-center gap-2 ml-auto">
        <div class="relative">
          <el-icon class="absolute left-2.5 top-1/2 -translate-y-1/2" :size="14" color="#9ca3af">
            <Search />
          </el-icon>
          <el-input
            v-model="searchTerm"
            placeholder="请输入..."
            clearable
            class="w-40"
            size="small"
          />
        </div>
        <el-button size="small" @click="loadRoles" :loading="loading">
          <el-icon :size="14"><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" size="small" @click="handleAdd">
          <el-icon :size="14"><Plus /></el-icon>
          新增角色
        </el-button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- 角色列表 -->
    <div class="bg-white rounded-xl shadow-none overflow-hidden">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th class="text-left py-3 px-4 text-sm font-semibold">角色编码</th>
            <th class="text-left py-3 px-4 text-sm font-semibold">角色名称</th>
            <th class="text-left py-3 px-4 text-sm font-semibold">所属组织</th>
            <th class="text-left py-3 px-4 text-sm font-semibold">描述</th>
            <th class="text-left py-3 px-4 text-sm font-semibold">排序</th>
            <th class="text-left py-3 px-4 text-sm font-semibold">状态</th>
            <th class="text-left py-3 px-4 text-sm font-semibold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading && roles.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-500">
              <el-icon class="is-loading" :size="24"><Loading /></el-icon>
            </td>
          </tr>
          <tr v-else-if="paginatedRoles.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-500">
              暂无角色数据，点击"新增角色"创建
            </td>
          </tr>
          <tr
            v-for="role in paginatedRoles"
            :key="role.oid"
            class="hover:bg-blue-50"
          >
            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ role.aid }}</td>
            <td class="px-4 py-3 text-sm text-gray-900">{{ role.role_name || role.name }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ getOrgName(role.orgOid) }}</td>
            <td class="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
              {{ role.description || '-' }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ role.sortNumber }}</td>
            <td class="px-4 py-3">
              <el-tag :type="role.status === 'active' ? 'success' : 'info'" size="small">
                {{ role.status === 'active' ? '正常' : '停用' }}
              </el-tag>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <el-button text size="small" @click="handleEdit(role)" title="编辑">
                  <el-icon :size="16" color="#2563eb"><Edit /></el-icon>
                </el-button>
                <el-button text size="small" @click="handleDelete(role.oid)" title="删除">
                  <el-icon :size="16" color="#dc2626"><Delete /></el-icon>
                </el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-100 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredRoles.length"
          layout="prev, pager, next, sizes"
          background
        />
      </div>
    </div>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingRole?.oid ? '编辑角色' : '新增角色'"
      width="700px"
      :close-on-click-modal="false"
      draggable
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            角色编码 <span class="text-red-500">*</span>
          </label>
          <el-input v-model="formData.aid" placeholder="请输入角色编码" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            角色名称 <span class="text-red-500">*</span>
          </label>
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">所属组织</label>
          <el-select v-model="formData.orgOid" class="w-full" placeholder="请选择组织">
            <el-option
              v-for="org in organizations"
              :key="org.oid"
              :label="org.name"
              :value="org.oid"
            />
          </el-select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">排序号</label>
          <el-input-number v-model="formData.sortNumber" :min="0" class="w-full" />
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Lock,
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Loading,
  ArrowLeft
} from '@element-plus/icons-vue'
import { useAuthorityStore } from '@/stores/modules/authority'

// Store
const authorityStore = useAuthorityStore()
const {
  roles,
  loading,
  error,
  loadRoles,
  saveRole,
  deleteRole,
  organizations,
  loadOrganizations
} = authorityStore

// 搜索和分页
const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗状态
const dialogVisible = ref(false)
const editingRole = ref(null)
const saving = ref(false)

// 表单数据
const formData = reactive({
  aid: '',
  name: '',
  orgOid: '',
  description: '',
  sortNumber: 0
})

// 过滤角色
const filteredRoles = computed(() => {
  if (!searchTerm.value) return roles.value || []
  const term = searchTerm.value.toLowerCase()
  return (roles.value || []).filter(role =>
    role.name?.toLowerCase().includes(term) ||
    role.aid?.toLowerCase().includes(term) ||
    role.description?.toLowerCase().includes(term)
  )
})

// 分页
const totalPages = computed(() => Math.ceil(filteredRoles.value.length / pageSize.value))
const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRoles.value.slice(start, start + pageSize.value)
})

// 获取组织名称
const getOrgName = (orgOid) => {
  const org = organizations.value.find(o => o.oid === orgOid)
  return org?.name || orgOid || '-'
}

// 打开新增弹窗
const handleAdd = () => {
  editingRole.value = null
  Object.assign(formData, {
    aid: '',
    name: '',
    orgOid: '',
    description: '',
    sortNumber: 0
  })
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (role) => {
  editingRole.value = role
  Object.assign(formData, {
    aid: role.aid,
    name: role.name,
    orgOid: role.orgOid || '',
    description: role.description || '',
    sortNumber: role.sortNumber || 0
  })
  dialogVisible.value = true
}

// 保存
const handleSave = async () => {
  if (!formData.aid || !formData.name) {
    ElMessage.warning('请填写角色编码和名称')
    return
  }
  saving.value = true
  try {
    const payload = {
      ...formData,
      oid: editingRole.value?.oid || undefined
    }
    await saveRole(payload)
    dialogVisible.value = false
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 删除
const handleDelete = async (oid) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRole(oid)
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 初始化
onMounted(async () => {
  await loadRoles()
  await loadOrganizations()
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

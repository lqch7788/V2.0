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
            <el-icon :size="20" color="#4B5563">
              <ArrowLeft />
            </el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Aim />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">部门设置</h1>
            <p class="text-gray-500">组织架构与部门信息管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" color="#2563EB">
              <Aim />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ departments.length }}</p>
            <p class="text-xs text-gray-500">部门总数</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <span class="text-green-600 text-lg font-bold">✓</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ activeCount }}</p>
            <p class="text-xs text-gray-500">启用中</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            <span class="text-gray-600 text-lg">○</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ departments.length - activeCount }}</p>
            <p class="text-xs text-gray-500">停用</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex justify-between items-center">
        <div class="relative w-64">
          <el-input
            v-model="searchText"
            placeholder="搜索部门编码/名称/负责人..."
            clearable
            @clear="handleSearchClear"
            @input="handleSearchInput"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon>
          新增部门
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">部门编码</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">部门名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">上级部门</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">负责人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">排序</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <template v-if="loading">
              <tr>
                <td colspan="7" class="px-4 py-12 text-center text-gray-400">加载中...</td>
              </tr>
            </template>
            <template v-else-if="paginatedData.length === 0">
              <tr>
                <td colspan="7" class="px-4 py-12 text-center text-gray-400">
                  {{ searchText ? '没有匹配的部门' : '暂无部门数据' }}
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="dept in paginatedData"
                :key="dept.id || dept.oid"
                class="hover:bg-blue-100 transition-colors"
              >
                <td class="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {{ dept.code || '—' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ dept.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {{ dept.parentName || '—' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ dept.managerName || '—' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ dept.sortNumber || 0 }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                      dept.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ dept.status === 'active' ? '启用' : '停用' }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <el-button
                      link
                      class="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      @click="openEditModal(dept)"
                      title="编辑"
                    >
                      <el-icon :size="16"><Edit /></el-icon>
                    </el-button>
                    <el-button
                      link
                      class="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                      @click="openDeleteConfirm(dept)"
                      title="删除"
                    >
                      <el-icon :size="16"><Delete /></el-icon>
                    </el-button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
        <div class="text-sm text-gray-500">共 {{ filteredData.length }} 条</div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredData.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="isEdit ? '编辑部门' : '新增部门'"
      width="560px"
      :close-on-click-modal="false"
      @close="handleModalClose"
    >
      <div class="p-6 overflow-y-auto max-h-[60vh] space-y-4">
        <!-- 基本信息区块 -->
        <div class="bg-emerald-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-emerald-700 mb-3">基本信息</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-emerald-700 mb-1">
                部门编码 <span class="text-red-500">*</span>
              </label>
              <el-input
                v-model="formData.code"
                placeholder="如: DEPT_TECH"
              />
            </div>
            <div>
              <label class="block text-xs text-emerald-700 mb-1">
                部门名称 <span class="text-red-500">*</span>
              </label>
              <el-input
                v-model="formData.name"
                placeholder="如: 技术部"
              />
            </div>
          </div>
        </div>
        <!-- 其他信息区块 -->
        <div class="rounded-lg p-4 border border-gray-100 space-y-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">上级部门</label>
            <el-select v-model="formData.parentOid" placeholder="-- 无（顶级部门）--" clearable class="w-full">
              <el-option label="-- 无（顶级部门）--" value="" />
              <el-option
                v-for="dept in parentOptions"
                :key="dept.oid || dept.id"
                :label="`${dept.code} ${dept.name}`"
                :value="dept.oid"
              />
            </el-select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">部门负责人</label>
            <el-input
              v-model="formData.managerName"
              placeholder="负责人姓名"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">排序号</label>
              <el-input
                type="number"
                v-model.number="formData.sortNumber"
                placeholder="排序号"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">状态</label>
              <el-select v-model="formData.status" class="w-full">
                <el-option label="启用" value="active" />
                <el-option label="停用" value="inactive" />
              </el-select>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">职能描述</label>
            <el-input
              v-model="formData.description"
              placeholder="部门职能描述..."
              type="textarea"
              :rows="2"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showModal = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :disabled="saving || !formData.name.trim()">
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="确认删除"
      width="400px"
    >
      <div class="p-6">
        <p class="text-sm text-gray-600">
          确定要删除部门 <span class="font-semibold text-gray-900">{{ deleteTargetName }}</span> 吗？如果存在子部门，请先删除子部门。
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showDeleteDialog = false">取消</el-button>
          <el-button type="danger" @click="handleDelete">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 部门设置页面
 * 与V1.1 DepartmentSettings.tsx 功能完全一致
 * Vue3 Composition API 版本
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { useDepartmentStore } from '@/stores/modules/department'
import { ElMessage } from 'element-plus'
// 引入 Element Plus 图标 - 与V1.1 lucide-react 图标对应
import {
  ArrowLeft,
  Aim,
  Search,
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'

// Store
const departmentStore = useDepartmentStore()

// 状态 - 与V1.1一致的state定义
const currentPage = ref(1)
const searchText = ref('')
const showModal = ref(false)
const showDeleteDialog = ref(false)
const isEdit = ref(false)
const editItem = ref(null)
const deleteTarget = ref(null)
const saving = ref(false)

// 分页配置 - 与V1.1 pageSize 一致
const pageSize = 10

// 表单数据 - 与V1.1 form state 一致
const formData = reactive({
  code: '',
  name: '',
  parentOid: '',
  managerId: '',
  managerName: '',
  sortNumber: 0,
  description: '',
  status: 'active'
})

// 从store获取数据
const departments = computed(() => departmentStore.departments)
const loading = computed(() => departmentStore.loading)

// 搜索过滤 - 与V1.1 filtered 逻辑一致
const filteredData = computed(() => {
  if (!searchText.value) {
    return departments.value
  }
  const kw = searchText.value.toLowerCase()
  return departments.value.filter(d =>
    (d.code && d.code.toLowerCase().includes(kw)) ||
    (d.name && d.name.toLowerCase().includes(kw)) ||
    (d.managerName && d.managerName.toLowerCase().includes(kw))
  )
})

// 分页数据 - 与V1.1 paginated 一致
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredData.value.slice(start, start + pageSize)
})

// 启用数量 - 与V1.1 activeCount 一致
const activeCount = computed(() => {
  return departments.value.filter(d => d.status === 'active').length
})

// 父部门选项 - 过滤掉自身
const parentOptions = computed(() => {
  return departments.value.filter(d =>
    d.id !== editItem.value?.id && d.oid !== editItem.value?.oid
  )
})

// 删除目标名称
const deleteTargetName = computed(() => {
  if (!deleteTarget.value) return ''
  return `${deleteTarget.value.code} ${deleteTarget.value.name}`
})

// 打开新增弹窗 - 与V1.1 一致
const openAddModal = () => {
  editItem.value = null
  resetForm()
  isEdit.value = false
  showModal.value = true
}

// 打开编辑弹窗 - 与V1.1 一致
const openEditModal = (dept) => {
  editItem.value = dept
  formData.code = dept.code || ''
  formData.name = dept.name || ''
  formData.parentOid = dept.parentOid || ''
  formData.managerId = dept.managerId || ''
  formData.managerName = dept.managerName || ''
  formData.sortNumber = dept.sortNumber || 0
  formData.description = dept.description || ''
  formData.status = dept.status || 'active'
  isEdit.value = true
  showModal.value = true
}

// 打开删除确认弹窗 - 与V1.1 一致
const openDeleteConfirm = (dept) => {
  deleteTarget.value = dept
  showDeleteDialog.value = true
}

// 重置表单 - 与V1.1 一致
const resetForm = () => {
  formData.code = ''
  formData.name = ''
  formData.parentOid = ''
  formData.managerId = ''
  formData.managerName = ''
  formData.sortNumber = 0
  formData.description = ''
  formData.status = 'active'
}

// 弹窗关闭处理 - 与V1.1 一致
const handleModalClose = () => {
  if (!isEdit.value) {
    resetForm()
  }
}

// 搜索清除
const handleSearchClear = () => {
  currentPage.value = 1
}

// 搜索输入
const handleSearchInput = () => {
  currentPage.value = 1
}

// 提交处理 - 新增
const handleAdd = async () => {
  if (!formData.name.trim()) return

  saving.value = true
  try {
    // 编码为空时自动生成 - 与V1.1 一致
    const payload = {
      ...formData,
      code: formData.code.trim() || `DEPT_${Date.now()}`
    }

    await departmentStore.addDepartment(payload)
    showModal.value = false
    currentPage.value = 1
    resetForm()
  } finally {
    saving.value = false
  }
}

// 提交处理 - 编辑
const handleEdit = async () => {
  if (!editItem.value) return

  saving.value = true
  try {
    const id = editItem.value.id || editItem.value.oid
    await departmentStore.updateDepartment(id, formData)
    showModal.value = false
    editItem.value = null
    resetForm()
  } finally {
    saving.value = false
  }
}

// 提交表单
const handleSubmit = () => {
  if (isEdit.value) {
    handleEdit()
  } else {
    handleAdd()
  }
}

// 删除处理 - 与V1.1 handleDelete 一致
const handleDelete = async () => {
  if (!deleteTarget.value) return

  const id = deleteTarget.value.id || deleteTarget.value.oid
  const success = await departmentStore.removeDepartment(id)

  if (success) {
    showDeleteDialog.value = false
    deleteTarget.value = null

    // 调整当前页码
    const newTotal = Math.ceil((filteredData.value.length - 1) / pageSize)
    if (currentPage.value > newTotal && newTotal > 0) {
      currentPage.value = newTotal
    }
  }
}

// 页面加载时获取数据 - 与V1.1 useEffect 一致
onMounted(() => {
  if (departments.value.length === 0 && !loading.value) {
    departmentStore.loadDepartments()
  }
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
/* 主按钮改为emerald绿色 - 与V1.1保持一致 */
:deep(.el-button--primary) {
  --el-button-bg-color: #059669;
  --el-button-border-color: #059669;
  --el-button-hover-bg-color: #047857;
  --el-button-hover-border-color: #047857;
}
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.from-emerald-500 {
  --tw-gradient-from: #10b981;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(5 150 105 / 0));
}

.to-green-600 {
  --tw-gradient-to: #059669;
}

.from-blue-500 {
  --tw-gradient-from: #3b82f6;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(59 130 246 / 0));
}

.to-blue-600 {
  --tw-gradient-to: #2563eb;
}
</style>

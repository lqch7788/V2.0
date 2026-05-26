<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
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
            <UserFilled />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">人事管理</h1>
          <p class="text-gray-500">组织架构与职务岗位设置</p>
        </div>
      </div>
    </div>

    <!-- HR 子功能卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <router-link
        v-for="(item, index) in hrSubItems"
        :key="index"
        :to="item.path"
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
      >
        <div class="flex flex-col items-start gap-3">
          <div class="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
            <el-icon :size="24" class="text-emerald-600">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="flex-1 w-full">
            <h3 class="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{{ item.label }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ item.desc }}</p>
          </div>
          <el-icon :size="16" class="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all self-end">
            <ArrowRight />
          </el-icon>
        </div>
      </router-link>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" color="#2563EB">
              <Briefcase />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ positions.length }}</p>
            <p class="text-xs text-gray-500">职务总数</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <span class="text-green-600 text-lg font-bold">✓</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ activePositionsCount }}</p>
            <p class="text-xs text-gray-500">启用中</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <span class="text-amber-600 text-lg font-bold">!</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ totalStaffCount }}</p>
            <p class="text-xs text-gray-500">在职人数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-3 items-end">
        <!-- 搜索框 -->
        <div class="flex-1 min-w-[200px]">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索职务编号、名称、部门..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <!-- 级别筛选 -->
        <el-select
          v-model="filters.level"
          placeholder="选择级别"
          clearable
          style="width: 120px"
        >
          <el-option label="全部级别" value="" />
          <el-option label="高层" value="1" />
          <el-option label="中层" value="2" />
          <el-option label="基层" value="3" />
        </el-select>
        <!-- 状态筛选 -->
        <el-select
          v-model="filters.status"
          placeholder="选择状态"
          clearable
          style="width: 120px"
        >
          <el-option label="全部状态" value="" />
          <el-option label="启用" value="active" />
          <el-option label="停用" value="inactive" />
        </el-select>
        <!-- 重置和搜索按钮 -->
        <div class="flex gap-2">
          <el-button @click="handleResetFilters">重置</el-button>
          <el-button @click="handleSearch">搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex justify-end gap-2">
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon>
          新增职务
        </el-button>
      </div>
    </div>

    <!-- 职务列表表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">职务列表</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">职务编号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">职务名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">所属部门</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">职务级别</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">基本工资(元)</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">岗位人数</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">职责描述</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-if="loading">
              <tr>
                <td colspan="9" class="px-4 py-12 text-center text-gray-400">加载中...</td>
              </tr>
            </template>
            <template v-else-if="paginatedPositions.length === 0">
              <tr>
                <td colspan="9" class="px-4 py-12 text-center text-gray-400">暂无职务数据</td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="pos in paginatedPositions"
                :key="pos.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{{ pos.code || '—' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ pos.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ pos.departmentName || '—' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ formatLevel(pos.level) }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ pos.salary || 0 }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ pos.staffCount || 0 }}人</td>
                <td class="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate whitespace-nowrap">{{ pos.description || '—' }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                      pos.status === 'active' || pos.status === '启用'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ pos.status === 'active' || pos.status === '启用' ? '启用' : '停用' }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <el-button
                      link
                      class="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      @click="openEditModal(pos)"
                      title="编辑"
                    >
                      <el-icon :size="16"><Edit /></el-icon>
                    </el-button>
                    <el-button
                      link
                      class="p-1.5 text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded"
                      title="查看"
                    >
                      <el-icon :size="16"><View /></el-icon>
                    </el-button>
                    <el-button
                      link
                      class="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                      @click="handleDelete(pos)"
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
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>每页</span>
          <el-select
            v-model="pageSize"
            style="width: 100px"
            @change="handlePageSizeChange"
          >
            <el-option :value="10" label="10条" />
            <el-option :value="20" label="20条" />
            <el-option :value="50" label="50条" />
          </el-select>
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredPositions.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="isEdit ? '编辑职务' : '新增职务'"
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
                职务编码 <span class="text-red-500">*</span>
              </label>
              <el-input
                v-model="formData.code"
                placeholder="如: POS_MANAGER"
              />
            </div>
            <div>
              <label class="block text-xs text-emerald-700 mb-1">
                职务名称 <span class="text-red-500">*</span>
              </label>
              <el-input
                v-model="formData.name"
                placeholder="如: 总经理"
              />
            </div>
          </div>
        </div>
        <!-- 其他信息区块 -->
        <div class="rounded-lg p-4 border border-gray-100 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">所属部门</label>
              <el-input
                v-model="formData.departmentName"
                placeholder="部门名称"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">职务级别</label>
              <el-select v-model="formData.level" class="w-full" placeholder="选择级别">
                <el-option label="高层" :value="1" />
                <el-option label="中层" :value="2" />
                <el-option label="基层" :value="3" />
              </el-select>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">职责描述</label>
            <el-input
              v-model="formData.description"
              placeholder="职务职责描述..."
              type="textarea"
              :rows="3"
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
      <div class="p-4">
        <p class="text-gray-600">
          确定要删除职务 <span class="font-semibold text-gray-900">{{ deletingItem?.name }}</span> 吗？
        </p>
        <p class="text-sm text-gray-400 mt-2">此操作不可恢复</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showDeleteDialog = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 人事管理页面
 * 与V1.1 PersonnelManagement.tsx 功能完全一致
 * Vue3 Composition API 版本
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { usePositionStore } from '@/stores/modules/position'
import { ElMessage } from 'element-plus'
// Element Plus 图标
import {
  ArrowLeft,
  ArrowRight,
  UserFilled,
  User,
  Briefcase,
  Calendar,
  Document,
  Clock,
  Plus,
  Edit,
  View,
  Delete,
  Search
} from '@element-plus/icons-vue'

// Store
const positionStore = usePositionStore()

// HR 子功能卡片 - 与V1.1 hrSubItems 一致
const hrSubItems = [
  { icon: User, label: '人员管理', path: '/settings/personnel/staff', desc: '园区员工信息管理' },
  { icon: Briefcase, label: '职务管理', path: '/settings/personnel/position', desc: '组织架构与职务岗位设置' },
  { icon: Calendar, label: '员工考勤', path: '/settings/personnel/attendance', desc: '正式员工考勤记录与统计' },
  { icon: Clock, label: '审批单', path: '/settings/personnel/hr-approval', desc: '人事相关审批流程管理' },
  { icon: Document, label: '考勤单据', path: '/settings/personnel/hr-documents', desc: '考勤异常单据与补录申请' }
]

// 级别映射 - 与V1.1 levelMap 一致
const levelMap = { 1: '高层', 2: '中层', 3: '基层' }

/**
 * 格式化职务级别
 */
const formatLevel = (level) => {
  if (!level) return '未知'
  return levelMap[level] || '未知'
}

// 状态
const currentPage = ref(1)
const pageSize = ref(10)
const showModal = ref(false)
const isEdit = ref(false)
const editItem = ref(null)
const saving = ref(false)

// 删除确认弹窗状态
const showDeleteDialog = ref(false)
const deletingItem = ref(null)

// 筛选状态
const filters = reactive({
  keyword: '',
  level: '',
  status: ''
})

// 表单数据
const formData = reactive({
  code: '',
  name: '',
  departmentName: '',
  level: null,
  description: '',
  status: 'active'
})

// 从store获取数据
const positions = computed(() => positionStore.positions)
const loading = computed(() => positionStore.loading)

// 启用数量
const activePositionsCount = computed(() => {
  return positions.value.filter(p => p.status === 'active' || p.status === '启用').length
})

// 在职人数总和（API数据中无此字段，显示为0）
const totalStaffCount = computed(() => {
  return positions.value.reduce((sum, p) => sum + (p.staffCount || 0), 0)
})

// 分页数据
const filteredPositions = computed(() => {
  return positions.value.filter(pos => {
    // 关键词搜索
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      const matchCode = pos.code?.toLowerCase().includes(kw)
      const matchName = pos.name?.toLowerCase().includes(kw)
      const matchDept = (pos.departmentName || pos.dept || '').toLowerCase().includes(kw)
      if (!matchCode && !matchName && !matchDept) {
        return false
      }
    }
    // 级别筛选
    if (filters.level && String(pos.level) !== filters.level) {
      return false
    }
    // 状态筛选
    if (filters.status) {
      const posStatus = pos.status === 'active' || pos.status === '启用' ? 'active' : 'inactive'
      if (posStatus !== filters.status) {
        return false
      }
    }
    return true
  })
})

const paginatedPositions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredPositions.value.slice(start, start + pageSize.value)
})

// 打开新增弹窗
const openAddModal = () => {
  editItem.value = null
  resetForm()
  isEdit.value = false
  showModal.value = true
}

// 打开编辑弹窗
const openEditModal = (pos) => {
  editItem.value = pos
  formData.code = pos.code || ''
  formData.name = pos.name || ''
  formData.departmentName = pos.departmentName || pos.dept || ''
  formData.level = pos.level || null
  formData.description = pos.description || ''
  formData.status = pos.status === 'active' || pos.status === '启用' ? 'active' : 'inactive'
  isEdit.value = true
  showModal.value = true
}

// 重置表单
const resetForm = () => {
  formData.code = ''
  formData.name = ''
  formData.departmentName = ''
  formData.level = null
  formData.description = ''
  formData.status = 'active'
}

// 弹窗关闭处理
const handleModalClose = () => {
  if (!isEdit.value) {
    resetForm()
  }
}

// 提交处理 - 新增
const handleAdd = async () => {
  if (!formData.name.trim()) return

  saving.value = true
  try {
    const payload = {
      ...formData,
      code: formData.code.trim() || `POS_${Date.now()}`
    }

    await positionStore.addPosition(payload)
    showModal.value = false
    resetForm()
  } catch (err) {
    console.error('新增职务失败:', err)
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
    await positionStore.editPosition(id, formData)
    showModal.value = false
    editItem.value = null
    resetForm()
  } catch (err) {
    console.error('编辑职务失败:', err)
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

// 页面加载时获取数据 - 与V1.1 useEffect 一致
onMounted(() => {
  if (positions.value.length === 0 && !loading.value) {
    positionStore.loadPositions()
  }
})

/**
 * 搜索处理
 */
const handleSearch = () => {
  currentPage.value = 1
}

/**
 * 重置筛选
 */
const handleResetFilters = () => {
  filters.keyword = ''
  filters.level = ''
  filters.status = ''
  currentPage.value = 1
}

/**
 * 分页大小切换
 */
const handlePageSizeChange = () => {
  currentPage.value = 1
}

/**
 * 删除职务
 */
const handleDelete = (pos) => {
  deletingItem.value = pos
  showDeleteDialog.value = true
}

/**
 * 确认删除
 */
const confirmDelete = async () => {
  if (!deletingItem.value) return
  try {
    const id = deletingItem.value.id || deletingItem.value.oid
    await positionStore.removePosition(id)
    showDeleteDialog.value = false
    deletingItem.value = null
  } catch (err) {
    console.error('删除职务失败:', err)
    ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.from-emerald-500 {
  --tw-gradient-from: #10b981;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to), rgb(5 150 105 / 0);
}

.to-green-600 {
  --tw-gradient-to: #059669;
}

.from-emerald-600 {
  --tw-gradient-from: #10b981;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to), rgb(5 150 105 / 0);
}
</style>

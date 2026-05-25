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
            <Briefcase />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">职务管理</h1>
          <p class="text-gray-500">组织架构与职务岗位设置</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- 职务总数卡片 -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" color="#2563EB">
              <Briefcase />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ positionList.length }}</p>
            <p class="text-xs text-gray-500">职务总数</p>
          </div>
        </div>
      </div>
      <!-- 启用中卡片 -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <el-icon :size="20" color="#059669">
              <CircleCheckFilled />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ activeCount }}</p>
            <p class="text-xs text-gray-500">启用中</p>
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
            class="pl-10"
            placeholder="搜索职务编号/名称..."
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
          新增职务
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">职务列表</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">职务编号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">职务名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">所属部门</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">职务级别</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">基本工资(元)</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">岗位人数</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">职责描述</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <!-- 加载中状态 -->
            <tr v-if="isLoading">
              <td colspan="9" class="px-4 py-12 text-center text-gray-400">
                加载中...
              </td>
            </tr>
            <!-- 空数据状态 -->
            <tr v-else-if="paginatedData.length === 0">
              <td colspan="9" class="px-4 py-12 text-center text-gray-400">
                {{ searchText ? '没有匹配的职务' : '暂无职务数据，点击"新增职务"按钮开始' }}
              </td>
            </tr>
            <!-- 数据列表 -->
            <tr
              v-else
              v-for="pos in paginatedData"
              :key="pos.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ pos.code }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ pos.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ pos.dept }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ pos.level || '—' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 text-left">{{ pos.salary }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ pos.staffCount }}人</td>
              <td class="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">{{ pos.description }}</td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                    pos.statusClass === 'normal'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ pos.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <el-button
                    size="small"
                    text
                    @click="openEditModal(pos)"
                    title="编辑"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    size="small"
                    text
                    @click="openViewModal(pos)"
                    title="查看"
                  >
                    <el-icon><View /></el-icon>
                  </el-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">
          共 {{ filteredData.length }} 条记录
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editItem ? '编辑职务' : '新增职务'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="form" label-width="100px" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="职务编号 *" required>
            <el-input
              v-model="form.code"
              placeholder="如: J001"
            />
          </el-form-item>
          <el-form-item label="职务名称 *" required>
            <el-input
              v-model="form.name"
              placeholder="如: 技术总监"
            />
          </el-form-item>
          <el-form-item label="所属部门">
            <el-select v-model="form.dept" placeholder="选择部门" clearable class="w-full">
              <el-option
                v-for="dept in departmentOptions"
                :key="dept.value"
                :label="dept.label"
                :value="dept.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="职务级别">
            <el-select v-model="form.level" placeholder="选择级别" clearable class="w-full">
              <el-option label="高层" value="高层" />
              <el-option label="中层" value="中层" />
              <el-option label="基层" value="基层" />
            </el-select>
          </el-form-item>
          <el-form-item label="基本工资(元)">
            <el-input-number
              v-model="form.salary"
              :min="0"
              :precision="0"
              :controls="false"
              class="w-full"
            />
          </el-form-item>
          <el-form-item label="岗位人数">
            <el-input-number
              v-model="form.staffCount"
              :min="0"
              :precision="0"
              :controls="false"
              class="w-full"
            />
          </el-form-item>
        </div>
        <el-form-item label="职责描述">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="职务职责描述..."
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.statusClass">
            <el-radio value="normal">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="saving">
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看弹窗 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="职务详情"
      width="500px"
    >
      <div class="space-y-4" v-if="viewItem">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">职务编号</p>
            <p class="font-medium text-gray-900">{{ viewItem.code }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">职务名称</p>
            <p class="font-medium text-gray-900">{{ viewItem.name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">所属部门</p>
            <p class="font-medium text-gray-900">{{ viewItem.dept }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">职务级别</p>
            <p class="font-medium text-gray-900">{{ viewItem.level }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">基本工资</p>
            <p class="font-medium text-gray-900">{{ viewItem.salary }}元</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">岗位人数</p>
            <p class="font-medium text-gray-900">{{ viewItem.staffCount }}人</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">状态</p>
            <span
              :class="[
                'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                viewItem.statusClass === 'normal'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              ]"
            >
              {{ viewItem.status }}
            </span>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-500">职责描述</p>
          <p class="mt-1 text-gray-900">{{ viewItem.description || '暂无描述' }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// Element Plus 图标 - 与V1.1 lucide-react图标对应
import {
  ArrowLeft,
  Briefcase,
  Search,
  Plus,
  Edit,
  View,
  CircleCheckFilled
} from '@element-plus/icons-vue'

// 每页显示数量
const pageSize = ref(5)

// 分页状态
const currentPage = ref(1)

// 搜索文本
const searchText = ref('')

// 弹窗状态
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)

// 编辑/查看状态
const editItem = ref(null)
const viewItem = ref(null)

// 保存状态
const saving = ref(false)

// 加载状态
const isLoading = ref(false)

// 表单数据
const form = ref({
  code: '',
  name: '',
  dept: '',
  level: '',
  salary: 0,
  staffCount: 0,
  description: '',
  statusClass: 'normal',
  status: '启用'
})

// 部门选项
const departmentOptions = [
  { value: '管理层', label: '管理层' },
  { value: '技术部', label: '技术部' },
  { value: '生产部', label: '生产部' },
  { value: '后勤部', label: '后勤部' },
  { value: '财务部', label: '财务部' },
  { value: '人力资源部', label: '人力资源部' },
  { value: '采购部', label: '采购部' },
  { value: '销售部', label: '销售部' }
]

// 职务数据列表 - 参照V1.1的mock数据
const positionList = ref([
  { id: 1, code: 'J001', name: '总经理', dept: '管理层', level: '高层', salary: 15000, staffCount: 1, description: '公司全面管理', status: '启用', statusClass: 'normal' },
  { id: 2, code: 'J002', name: '技术总监', dept: '技术部', level: '高层', salary: 12000, staffCount: 1, description: '技术研发管理', status: '启用', statusClass: 'normal' },
  { id: 3, code: 'J003', name: '技术员', dept: '技术部', level: '中层', salary: 8000, staffCount: 3, description: '农业生产技术指导', status: '启用', statusClass: 'normal' },
  { id: 4, code: 'J004', name: '生产主管', dept: '生产部', level: '中层', salary: 7000, staffCount: 2, description: '生产作业管理', status: '启用', statusClass: 'normal' },
  { id: 5, code: 'J005', name: '普工', dept: '生产部', level: '基层', salary: 4000, staffCount: 15, description: '日常农事操作', status: '启用', statusClass: 'normal' },
  { id: 6, code: 'J006', name: '仓库管理员', dept: '后勤部', level: '基层', salary: 4500, staffCount: 2, description: '物资出入库管理', status: '启用', statusClass: 'normal' }
])

// 启用中数量
const activeCount = computed(() => {
  return positionList.value.filter(p => p.status === '启用').length
})

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchText.value) {
    return positionList.value
  }
  const keyword = searchText.value.toLowerCase()
  return positionList.value.filter(p =>
    p.code?.toLowerCase().includes(keyword) ||
    p.name?.toLowerCase().includes(keyword)
  )
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 组件挂载时加载数据
onMounted(() => {
  // 模拟加载数据
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

// 搜索输入处理
function handleSearchInput() {
  currentPage.value = 1
}

// 搜索清除处理
function handleSearchClear() {
  currentPage.value = 1
}

// 打开新增弹窗
function openAddModal() {
  editItem.value = null
  form.value = {
    code: '',
    name: '',
    dept: '',
    level: '',
    salary: 0,
    staffCount: 0,
    description: '',
    statusClass: 'normal',
    status: '启用'
  }
  dialogVisible.value = true
}

// 打开编辑弹窗
function openEditModal(item) {
  editItem.value = item
  form.value = {
    code: item.code || '',
    name: item.name || '',
    dept: item.dept || '',
    level: item.level || '',
    salary: item.salary || 0,
    staffCount: item.staffCount || 0,
    description: item.description || '',
    statusClass: item.statusClass || 'normal',
    status: item.status || '启用'
  }
  dialogVisible.value = true
}

// 打开查看弹窗
function openViewModal(item) {
  viewItem.value = item
  viewDialogVisible.value = true
}

// 弹窗关闭处理
function handleDialogClose() {
  dialogVisible.value = false
  editItem.value = null
}

// 提交表单
function handleSubmit() {
  if (!form.value.code.trim() || !form.value.name.trim()) {
    return
  }

  // 更新状态显示
  form.value.status = form.value.statusClass === 'normal' ? '启用' : '停用'

  if (editItem.value) {
    // 编辑模式 - 更新数据
    const index = positionList.value.findIndex(p => p.id === editItem.value.id)
    if (index !== -1) {
      positionList.value[index] = {
        ...positionList.value[index],
        ...form.value
      }
    }
  } else {
    // 新增模式 - 添加数据
    const newId = Math.max(...positionList.value.map(p => p.id), 0) + 1
    positionList.value.push({
      id: newId,
      ...form.value
    })
    currentPage.value = 1
  }

  dialogVisible.value = false
}

// 页码改变
function handlePageChange(page) {
  currentPage.value = page
}

// 每页数量改变
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}
</script>

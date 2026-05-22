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
            <Document />
          </el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">工序管理</h1>
          <p class="text-gray-500">自定义生产工序及单价设置</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- 工序总数卡片 -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" color="#2563EB">
              <Document />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ items.length }}</p>
            <p class="text-xs text-gray-500">工序总数</p>
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
      <!-- 停用卡片 -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            <el-icon :size="20" color="#6B7280">
              <CloseBold />
            </el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ inactiveCount }}</p>
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
            class="pl-10"
            placeholder="搜索工序编码/名称/类型..."
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
          添加工序
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900">工序列表</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">工序编号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">工序名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">工序类型</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">计量单位</th>
              <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">默认单价(元)</th>
              <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">奖励比例(%)</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <!-- 加载中状态 -->
            <tr v-if="isLoading">
              <td colspan="8" class="px-4 py-12 text-center text-gray-400">
                加载中...
              </td>
            </tr>
            <!-- 空数据状态 -->
            <tr v-else-if="paginatedData.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-gray-400">
                {{ searchText ? '没有匹配的工序' : '暂无工序数据，点击"添加工序"按钮开始' }}
              </td>
            </tr>
            <!-- 数据列表 -->
            <tr
              v-else
              v-for="proc in paginatedData"
              :key="proc.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ proc.processCode }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ proc.processName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                  {{ proc.processType || '—' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ proc.unit }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ proc.defaultPrice }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ proc.defaultBonus }}%</td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                    proc.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ proc.status === 'active' ? '启用' : '停用' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <el-button
                    size="small"
                    text
                    @click="openEditModal(proc)"
                    title="编辑"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    size="small"
                    text
                    type="danger"
                    @click="openDeleteModal(proc)"
                    title="删除"
                  >
                    <el-icon><Delete /></el-icon>
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
          :page-sizes="[10, 20, 50]"
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
      :title="editItem ? '编辑工序' : '添加工序'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="form" label-width="100px" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="工序编码 *" required>
            <el-input
              v-model="form.processCode"
              placeholder="如: PD011"
            />
          </el-form-item>
          <el-form-item label="工序名称 *" required>
            <el-input
              v-model="form.processName"
              placeholder="如: 深耕翻土"
            />
          </el-form-item>
          <el-form-item label="工序类型">
            <el-select v-model="form.processType" placeholder="-- 选择类型 --" clearable class="w-full">
              <el-option label="-- 选择类型 --" value="" />
              <el-option
                v-for="t in FALLBACK_PROCESS_TYPES"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="计量单位">
            <el-select v-model="form.unit" placeholder="选择单位" class="w-full">
              <el-option
                v-for="u in UNIT_OPTIONS"
                :key="u.value"
                :label="u.label"
                :value="u.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="默认单价(元)">
            <el-input-number
              v-model="form.defaultPrice"
              :min="0"
              :precision="2"
              :controls="false"
              class="w-full"
            />
          </el-form-item>
          <el-form-item label="奖励比例(%)">
            <el-input-number
              v-model="form.defaultBonus"
              :min="0"
              :precision="2"
              :controls="false"
              class="w-full"
            />
          </el-form-item>
        </div>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="工序描述..."
            :rows="2"
          />
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

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
    >
      <div class="space-y-4">
        <p class="text-gray-600">
          确定要删除工序 <span class="font-semibold text-gray-900">{{ deleteTarget?.processCode }} {{ deleteTarget?.processName }}</span> 吗？此操作不可撤销。
        </p>
        <div class="flex justify-end gap-3">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDelete">确认删除</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProcessDefinitionStore } from '@/stores'
import { storeToRefs } from 'pinia'
// Element Plus 图标 - 与V1.1 lucide-react图标对应
import {
  ArrowLeft,
  Document,
  Search,
  Plus,
  Edit,
  Delete,
  CircleCheckFilled,
  CloseBold
} from '@element-plus/icons-vue'

// 每页显示数量
const pageSize = ref(10)

// 分页状态
const currentPage = ref(1)

// 搜索文本
const searchText = ref('')

// 弹窗状态
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)

// 编辑状态
const editItem = ref(null)
const deleteTarget = ref(null)

// 保存状态
const saving = ref(false)

// 表单数据
const form = ref({
  processCode: '',
  processName: '',
  processType: '',
  unit: '亩',
  defaultPrice: 0,
  defaultBonus: 0,
  description: ''
})

// 使用 Store
const store = useProcessDefinitionStore()
const { items, isLoading, FALLBACK_PROCESS_TYPES, UNIT_OPTIONS, activeCount, inactiveCount } = storeToRefs(store)

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchText.value) {
    return items.value
  }
  const keyword = searchText.value.toLowerCase()
  return items.value.filter(p =>
    p.processCode?.toLowerCase().includes(keyword) ||
    p.processName?.toLowerCase().includes(keyword) ||
    p.processType?.toLowerCase().includes(keyword)
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
  store.fetchItems()
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
    processCode: '',
    processName: '',
    processType: '',
    unit: '亩',
    defaultPrice: 0,
    defaultBonus: 0,
    description: ''
  }
  dialogVisible.value = true
}

// 打开编辑弹窗
function openEditModal(item) {
  editItem.value = item
  form.value = {
    processCode: item.processCode || '',
    processName: item.processName || '',
    processType: item.processType || '',
    unit: item.unit || '亩',
    defaultPrice: item.defaultPrice || 0,
    defaultBonus: item.defaultBonus || 0,
    description: item.description || ''
  }
  dialogVisible.value = true
}

// 打开删除弹窗
function openDeleteModal(item) {
  deleteTarget.value = item
  deleteDialogVisible.value = true
}

// 弹窗关闭处理
function handleDialogClose() {
  dialogVisible.value = false
  editItem.value = null
}

// 提交表单
async function handleSubmit() {
  if (!form.value.processCode.trim() || !form.value.processName.trim()) {
    return
  }
  saving.value = true
  try {
    if (editItem.value) {
      await store.updateItem(editItem.value.id, form.value)
    } else {
      await store.createItem(form.value)
      currentPage.value = 1
    }
    dialogVisible.value = false
  } finally {
    saving.value = false
  }
}

// 删除确认
async function handleDelete() {
  if (!deleteTarget.value) return
  await store.deleteItem(deleteTarget.value.id)
  deleteDialogVisible.value = false
  deleteTarget.value = null
  // 如果当前页为空，回退一页
  const newTotal = Math.ceil((filteredData.value.length - 1) / pageSize.value)
  if (currentPage.value > newTotal && newTotal > 0) {
    currentPage.value = newTotal
  }
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

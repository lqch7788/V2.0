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
              <Crop />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">种植设置</h1>
            <p class="text-gray-500">种植图标和品种种植参数配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-end gap-4">
        <div class="grid grid-cols-3 gap-4 flex-1">
          <div>
            <label class="block text-xs text-gray-500 mb-1">关键词搜索</label>
            <el-input
              v-model="keyword"
              placeholder="搜索设置键或值..."
              clearable
              @clear="handleSearchClear"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">状态</label>
            <el-select v-model="filterStatus" placeholder="全部" clearable>
              <el-option label="全部" value="" />
              <el-option label="使用中" value="active" />
              <el-option label="已停用" value="inactive" />
            </el-select>
          </div>
          <div class="flex items-end">
            <el-button @click="handleReset" class="h-9 px-3 text-sm text-gray-500 hover:text-gray-700">重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          设置列表
          <span v-if="filteredData.length > 0" class="text-sm text-gray-400 font-normal">({{ filteredData.length }})</span>
        </h3>
        <el-button type="primary" size="small" @click="openAddModal">
          <el-icon><Plus /></el-icon> 新增设置
        </el-button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <th class="py-3 px-4 text-left font-medium">设置键</th>
              <th class="py-3 px-4 text-left font-medium">设置值</th>
              <th class="py-3 px-4 text-left font-medium w-36">关联品种</th>
              <th class="py-3 px-4 text-left font-medium w-36">图标</th>
              <th class="py-3 px-4 text-left font-medium">描述</th>
              <th class="py-3 px-4 text-left font-medium w-24">状态</th>
              <th class="py-3 px-4 text-center font-medium w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr>
                <td colspan="7" class="py-12 text-center text-gray-400">加载中...</td>
              </tr>
            </template>
            <template v-else-if="filteredData.length === 0">
              <tr>
                <td colspan="7" class="py-12 text-center text-gray-400">
                  {{ items.length === 0 ? '暂无设置数据' : '无匹配结果' }}
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="item in paginatedData"
                :key="item.oid"
                class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td class="py-2.5 px-4">
                  <span class="inline-flex px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-100 text-blue-700">
                    {{ item.settingKey }}
                  </span>
                </td>
                <td class="py-2.5 px-4 font-medium text-gray-900 max-w-[200px] truncate">
                  {{ item.settingValue || '-' }}
                </td>
                <td class="py-2.5 px-4 text-gray-500 text-xs font-mono">
                  {{ item.cropVarietyOid || '-' }}
                </td>
                <td class="py-2.5 px-4">
                  <el-icon v-if="item.iconUrl" :size="20" color="#10b981">
                    <Picture />
                  </el-icon>
                  <span v-else class="text-gray-400 text-xs">-</span>
                </td>
                <td class="py-2.5 px-4 text-gray-500 text-xs max-w-[200px] truncate">
                  {{ item.description || '-' }}
                </td>
                <td class="py-2.5 px-4">
                  <span
                    :class="[
                      'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                      item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    ]"
                  >
                    {{ item.status === 'active' ? '使用中' : '已停用' }}
                  </span>
                </td>
                <td class="py-2.5 px-4">
                  <div class="flex items-center justify-center gap-1">
                    <el-button
                      link
                      :icon="Edit"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      @click="openEditModal(item)"
                      title="编辑"
                    />
                    <el-button
                      link
                      :icon="Delete"
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      @click="openDeleteConfirm(item)"
                      title="删除"
                    />
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <!-- 分页 -->
      <div v-if="filteredData.length > 0" class="flex items-center justify-between p-4 border-t border-gray-100">
        <div class="text-sm text-gray-500">
          共 {{ filteredData.length }} 条记录
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="filteredData.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="isEdit ? '编辑设置' : '新增设置'"
      width="560px"
      :close-on-click-modal="false"
      @close="handleModalClose"
    >
      <div class="p-6 overflow-y-auto max-h-[60vh] space-y-4">
        <!-- 基本配置区块 -->
        <div class="bg-emerald-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-emerald-700 mb-3">基本配置</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-emerald-700 mb-1">
                设置键 <span class="text-red-500">*</span>
              </label>
              <el-input
                v-model="form.settingKey"
                placeholder="如：plant_icon"
                :disabled="isEdit"
              />
            </div>
            <div>
              <label class="block text-xs text-emerald-700 mb-1">设置值</label>
              <el-input v-model="form.settingValue" placeholder="如：tomato" />
            </div>
          </div>
        </div>
        <!-- 其他配置区块 -->
        <div class="rounded-lg p-4 border border-gray-100 space-y-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">关联品种 OID</label>
            <el-input v-model="form.cropVarietyOid" placeholder="品种OID" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">图标 URL</label>
            <el-input v-model="form.iconUrl" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">描述</label>
            <el-input v-model="form.description" placeholder="备注" />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showModal = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :disabled="!form.settingKey.trim()"
          >
            提交
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
        <p class="text-sm text-gray-500">
          确定要删除设置 "<span class="font-medium text-gray-700">{{ selectedItem?.settingKey }}</span>" 吗？
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
 * 种植设置管理页面
 * 与V1.1 PlantSettingManagement.tsx 功能完全一致
 * Vue3 Composition API 版本
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { usePlantSettingStore } from '@/stores/modules/plantSetting'
import { ElMessage } from 'element-plus'
// 引入 Element Plus 图标
import {
  ArrowLeft,
  Crop,
  Search,
  Plus,
  Edit,
  Delete,
  Picture
} from '@element-plus/icons-vue'

// Store
const plantSettingStore = usePlantSettingStore()

// 状态 - 与V1.1一致的state定义
const keyword = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const showDeleteDialog = ref(false)
const isEdit = ref(false)
const selectedItem = ref(null)

// 表单数据
const form = reactive({
  settingKey: '',
  settingValue: '',
  cropVarietyOid: '',
  iconUrl: '',
  description: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 从store获取数据
const items = computed(() => plantSettingStore.items)
const isLoading = computed(() => plantSettingStore.isLoading)

// 筛选后的数据 - 与V1.1 filteredData 逻辑一致
const filteredData = computed(() => {
  let filtered = items.value

  // 关键词筛选
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    filtered = filtered.filter(i =>
      i.settingKey.toLowerCase().includes(kw) ||
      (i.settingValue || '').toLowerCase().includes(kw) ||
      (i.description || '').toLowerCase().includes(kw)
    )
  }

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(i => i.status === filterStatus.value)
  }

  return filtered
})

// 分页数据
const paginatedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

// 重置表单 - 与V1.1 resetForm 一致
const resetForm = () => {
  form.settingKey = ''
  form.settingValue = ''
  form.cropVarietyOid = ''
  form.iconUrl = ''
  form.description = ''
}

// 打开新增弹窗
const openAddModal = () => {
  resetForm()
  isEdit.value = false
  selectedItem.value = null
  showModal.value = true
}

// 打开编辑弹窗 - 与V1.1 openEditModal 一致
const openEditModal = (item) => {
  selectedItem.value = item
  form.settingKey = item.settingKey
  form.settingValue = item.settingValue || ''
  form.cropVarietyOid = item.cropVarietyOid || ''
  form.iconUrl = item.iconUrl || ''
  form.description = item.description || ''
  isEdit.value = true
  showModal.value = true
}

// 打开删除确认弹窗
const openDeleteConfirm = (item) => {
  selectedItem.value = item
  showDeleteDialog.value = true
}

// 弹窗关闭处理
const handleModalClose = () => {
  if (!isEdit.value) {
    resetForm()
  }
}

// 搜索清除
const handleSearchClear = () => {
  pagination.currentPage = 1
}

// 重置筛选 - 与V1.1一致
const handleReset = () => {
  keyword.value = ''
  filterStatus.value = ''
  pagination.currentPage = 1
}

// 提交处理 - 新增
const handleAdd = async () => {
  if (!form.settingKey.trim()) return

  const data = {
    settingKey: form.settingKey,
    settingValue: form.settingValue || undefined,
    cropVarietyOid: form.cropVarietyOid || undefined,
    iconUrl: form.iconUrl || undefined,
    description: form.description || undefined
  }

  const result = await plantSettingStore.createItem(data)
  if (result) {
    showModal.value = false
    resetForm()
  }
}

// 提交处理 - 编辑
const handleEdit = async () => {
  if (!selectedItem.value || !form.settingKey.trim()) return

  await plantSettingStore.updateItem(selectedItem.value.oid, {
    settingKey: form.settingKey,
    settingValue: form.settingValue || undefined,
    cropVarietyOid: form.cropVarietyOid || undefined,
    iconUrl: form.iconUrl || undefined,
    description: form.description || undefined
  })

  showModal.value = false
  selectedItem.value = null
  resetForm()
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
  if (!selectedItem.value) return

  const success = await plantSettingStore.deleteItem(selectedItem.value.oid)
  if (success) {
    showDeleteDialog.value = false
    selectedItem.value = null
  }
}

// 页面加载时获取数据 - 与V1.1 useEffect 一致
onMounted(() => {
  plantSettingStore.fetchItems()
})
</script>

<style scoped>
/* 与V1.1一致的样式 */
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

.from-emerald-600 {
  --tw-gradient-from: #059669;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(5 150 105 / 0));
}

.from-emerald-500\/20 {
  background: rgba(16, 185, 129, 0.2);
}
</style>

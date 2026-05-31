<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <a
          href="/settings"
          class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
          title="返回系统设置"
        >
          <el-icon :size="20" color="#4b5563"><ArrowLeft /></el-icon>
        </a>
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <el-icon :size="24" color="white"><Sugar /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">肥料库</h1>
          <p class="text-gray-500">管理肥料信息、规格参数和供应商信息</p>
        </div>
      </div>
    </div>

    <!-- Tabs: 有机肥 / 无机肥 / 水溶肥 / 复合肥 / 生物肥 / 缓释肥 / 微量元素肥 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="border-b border-gray-100">
        <div class="flex items-center gap-1 px-4 pt-4">
          <el-radio-group v-model="activeTab" @change="handleTabChange" class="fertilizer-tabs">
            <el-radio-button value="organic">有机肥</el-radio-button>
            <el-radio-button value="inorganic">无机肥</el-radio-button>
            <el-radio-button value="water_soluble">水溶肥</el-radio-button>
            <el-radio-button value="compound">复合肥</el-radio-button>
            <el-radio-button value="bio">生物肥</el-radio-button>
            <el-radio-button value="slow_release">缓释肥</el-radio-button>
            <el-radio-button value="trace">微量元素肥</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="relative flex-1 max-w-md">
            <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"><Search /></el-icon>
            <el-input
              type="text"
              placeholder="搜索肥料名称或编码..."
              v-model="searchKeyword"
              clearable
              class="w-full"
              @keyup.enter="handleSearch"
            />
          </div>
          <el-button @click="handleSearch" class="h-10 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:shadow-lg transition-shadow">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset" class="h-10 px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- 表头工具栏 -->
      <div class="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-semibold text-gray-900">肥料列表</h3>
          <span class="text-sm text-gray-500">共 {{ filteredItems.length }} 条记录</span>
        </div>
        <div class="flex items-center gap-2">
          <template v-if="!exportMode">
            <el-button @click="handleAdd" class="h-10 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:shadow-lg transition-shadow">
              <el-icon><Plus /></el-icon>
              新增肥料
            </el-button>
            <el-button @click="handleExportClick" class="h-10 px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </template>
          <template v-else>
            <el-button @click="handleExportConfirm" class="h-10 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1">
              <el-icon><Download /></el-icon>
              确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </el-button>
            <el-button @click="handleExportCancel" class="h-10 px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1">
              取消选择
            </el-button>
          </template>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="filteredItems"
        v-loading="loading"
        class="w-full"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="exportMode" type="selection" width="55" />
        <el-table-column width="50" align="center">
          <template #default="{ row }">
            <el-button text size="small" @click="toggleExpand(row.id)" class="p-1 text-gray-500 hover:text-amber-600" :title="expandedRows.has(row.id) ? '收起' : '展开'">
              <el-icon v-if="expandedRows.has(row.id)" color="#d97706"><ArrowDown /></el-icon>
              <el-icon v-else color="#6b7280"><ArrowRight /></el-icon>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="fertilizerCode" label="肥料编码" width="140">
          <template #default="{ row }">
            <el-button text size="small" @click="handleDetail(row)" class="p-0 h-auto font-mono text-blue-600" title="查看详情">
              {{ row.fertilizerCode || '-' }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="fertilizerName" label="肥料名称" min-width="160" />
        <el-table-column prop="fertilizerType" label="肥料类型" width="120">
          <template #default="{ row }">
            {{ getFertilizerTypeName(row.fertilizerType) }}
          </template>
        </el-table-column>
        <el-table-column prop="applicationTiming" label="施肥时期" width="150">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <el-tag v-for="timing in (row.applicationTiming || '').split(',').filter(t => t)" :key="timing" size="small" type="warning" class="mr-1">
                {{ getTimingName(timing.trim()) }}
              </el-tag>
              <span v-if="!row.applicationTiming">-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="functionDesc" label="功能说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="shelfLife" label="保质期" width="100" />
        <el-table-column label="规格数" width="80" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.specs?.length || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-1">
              <el-button text size="small" @click="handleDetail(row)" class="action-btn edit-btn" title="查看">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button text size="small" @click="handleEdit(row)" class="action-btn edit-btn" title="编辑">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button text size="small" @click="handleDelete(row)" class="action-btn delete-btn" title="删除">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
        <!-- 展开行：规格明细 -->
        <el-table-column type="expand" width="1" fixed="right">
          <template #default="{ row }">
            <div v-if="expandedRows.has(row.id)" class="p-4 bg-amber-50">
              <div class="text-sm font-semibold text-amber-800 mb-2">规格明细</div>
              <table v-if="row.specs && row.specs.length > 0" class="w-full border border-amber-200 rounded-lg overflow-hidden">
                <thead class="bg-amber-100">
                  <tr>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-amber-800">品牌名称</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-amber-800">成份与含量</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-amber-800">生产厂家</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-amber-800">建议用量</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-amber-800">单位</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-amber-800">稀释比例</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-amber-800">备注</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-amber-100">
                  <tr v-for="(spec, idx) in row.specs" :key="idx" class="hover:bg-amber-100/30">
                    <td class="px-3 py-2 text-sm text-amber-700">{{ spec.brandName || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-amber-700">{{ spec.specContent || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-amber-700">{{ spec.manufacturer || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-amber-700">{{ spec.suggestedDosage || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-amber-700">{{ spec.dosageUnit || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-amber-700">{{ spec.suggestedRatio || '-' }}</td>
                    <td class="px-3 py-2 text-sm text-amber-700">{{ spec.remark || '-' }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="text-amber-600 text-center py-4">暂无规格明细</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '新增肥料' : '编辑肥料'"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              肥料编码 <span class="text-red-500">*</span>
            </label>
            <el-input v-model="formData.fertilizerCode" placeholder="自动生成" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              肥料名称 <span class="text-red-500">*</span>
            </label>
            <el-input v-model="formData.fertilizerName" placeholder="请输入肥料名称" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              肥料类型 <span class="text-red-500">*</span>
            </label>
            <el-select v-model="formData.fertilizerType" placeholder="请选择" class="w-full">
              <el-option label="有机肥" value="organic" />
              <el-option label="无机肥" value="inorganic" />
              <el-option label="水溶肥" value="water_soluble" />
              <el-option label="复合肥" value="compound" />
              <el-option label="生物肥" value="bio" />
              <el-option label="缓释肥" value="slow_release" />
              <el-option label="微量元素肥" value="trace" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">施肥时期</label>
            <el-select v-model="formData.applicationTiming" multiple placeholder="请选择" class="w-full">
              <el-option label="底肥" value="base" />
              <el-option label="追肥" value="dressing" />
              <el-option label="叶面肥" value="foliar" />
            </el-select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">功能说明</label>
          <el-input v-model="formData.functionDesc" type="textarea" :rows="3" placeholder="请输入功能说明" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">使用禁忌</label>
          <el-input v-model="formData.tabooDesc" type="textarea" :rows="2" placeholder="请输入使用禁忌" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">保质期</label>
            <el-input v-model="formData.shelfLife" placeholder="如：24个月" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">存储条件</label>
            <el-input v-model="formData.storageCondition" placeholder="如：阴凉干燥" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商信息</label>
          <el-input v-model="formData.supplierInfo" type="textarea" :rows="2" placeholder="请输入供应商信息" />
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button @click="handleSave" :loading="dialogLoading" class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="肥料详情"
      width="600px"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">肥料编码</label>
            <p class="mt-1 text-gray-900">{{ currentRecord?.fertilizerCode || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">肥料名称</label>
            <p class="mt-1 text-gray-900">{{ currentRecord?.fertilizerName || '-' }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">肥料类型</label>
            <p class="mt-1 text-gray-900">{{ getFertilizerTypeName(currentRecord?.fertilizerType) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">施肥时期</label>
            <p class="mt-1 text-gray-900">
              <div class="flex flex-wrap gap-1">
                <el-tag v-for="timing in (currentRecord?.applicationTiming || '').split(',').filter(t => t)" :key="timing" size="small" type="warning" class="mr-1">
                  {{ getTimingName(timing.trim()) }}
                </el-tag>
                <span v-if="!currentRecord?.applicationTiming">-</span>
              </div>
            </p>
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">功能说明</label>
          <p class="mt-1 text-gray-900">{{ currentRecord?.functionDesc || '-' }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">使用禁忌</label>
          <p class="mt-1 text-gray-900">{{ currentRecord?.tabooDesc || '-' }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">保质期</label>
            <p class="mt-1 text-gray-900">{{ currentRecord?.shelfLife || '-' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">存储条件</label>
            <p class="mt-1 text-gray-900">{{ currentRecord?.storageCondition || '-' }}</p>
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">供应商信息</label>
          <p class="mt-1 text-gray-900">{{ currentRecord?.supplierInfo || '-' }}</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog
      v-model="exportFormatVisible"
      title="导出格式"
      width="400px"
    >
      <div class="space-y-4">
        <el-radio-group v-model="exportFormat" class="flex flex-col gap-2">
          <el-radio value="excel">Excel 格式 (.xlsx)</el-radio>
          <el-radio value="csv">CSV 格式 (.csv)</el-radio>
          <el-radio value="word">Word 格式 (.doc)</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="exportFormatVisible = false">取消</el-button>
        <el-button @click="handleDoExport" class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1">
          确认导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  View,
  Download,
  Search,
  Refresh,
  ArrowLeft,
  ArrowDown,
  ArrowRight,
  Sugar
} from '@element-plus/icons-vue'
import { useFertilizerLibraryStore } from '@/stores/modules/fertilizerLibrary'

// ========== 类型映射 ==========
const fertilizerTypeMap = {
  organic: '有机肥',
  inorganic: '无机肥',
  water_soluble: '水溶肥',
  compound: '复合肥',
  bio: '生物肥',
  slow_release: '缓释肥',
  trace: '微量元素肥'
}

const timingMap = {
  base: '底肥',
  dressing: '追肥',
  foliar: '叶面肥'
}

const getFertilizerTypeName = (type) => fertilizerTypeMap[type] || type || '-'
const getTimingName = (timing) => timingMap[timing] || timing || '-'

// ========== Store ==========
const fertilizerLibraryStore = useFertilizerLibraryStore()

// ========== 状态 ==========
const activeTab = ref('organic')
const searchKeyword = ref('')
const loading = ref(false)
const error = ref(null)
const expandedRows = ref(new Set())

// 导出相关
const exportMode = ref(false)
const selectedRows = ref([])
const exportFormat = ref('excel')
const exportFormatVisible = ref(false)

// 弹窗相关
const dialogVisible = ref(false)
const dialogMode = ref('add') // 'add' | 'edit'
const dialogLoading = ref(false)
const detailVisible = ref(false)
const currentRecord = ref(null)

// 表单数据
const formData = reactive({
  id: '',
  fertilizerCode: '',
  fertilizerName: '',
  fertilizerType: 'organic',
  applicationTiming: [],
  functionDesc: '',
  tabooDesc: '',
  shelfLife: '',
  storageCondition: '',
  supplierInfo: ''
})

// ========== 计算属性 ==========
const filteredItems = computed(() => {
  let result = fertilizerLibraryStore.items.filter(item => item.fertilizerType === activeTab.value)

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
      (item.fertilizerName || '').toLowerCase().includes(keyword) ||
      (item.fertilizerCode || '').toLowerCase().includes(keyword)
    )
  }

  return result
})

// ========== 方法 ==========
const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    await fertilizerLibraryStore.fetchItems()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载数据失败'
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  searchKeyword.value = ''
  selectedRows.value = []
}

const handleSearch = () => {
  // 搜索时会通过 computed 自动过滤
}

const handleReset = () => {
  searchKeyword.value = ''
}

// 切换展开/折叠规格明细
const toggleExpand = (id) => {
  const newSet = new Set(expandedRows.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  expandedRows.value = newSet
}

const handleAdd = async () => {
  dialogMode.value = 'add'
  // 生成编码
  try {
    const res = await fertilizerLibraryStore.generateCode()
    formData.fertilizerCode = res?.code || ''
  } catch (e) {
    formData.fertilizerCode = ''
  }
  Object.assign(formData, {
    id: '',
    fertilizerName: '',
    fertilizerType: activeTab.value,
    applicationTiming: [],
    functionDesc: '',
    tabooDesc: '',
    shelfLife: '',
    storageCondition: '',
    supplierInfo: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogMode.value = 'edit'
  // applicationTiming 可能是逗号分隔的字符串，需要转为数组
  const timings = row.applicationTiming ? row.applicationTiming.split(',').map(t => t.trim()).filter(Boolean) : []
  Object.assign(formData, {
    id: row.id,
    fertilizerCode: row.fertilizerCode,
    fertilizerName: row.fertilizerName,
    fertilizerType: row.fertilizerType,
    applicationTiming: timings,
    functionDesc: row.functionDesc || '',
    tabooDesc: row.tabooDesc || '',
    shelfLife: row.shelfLife || '',
    storageCondition: row.storageCondition || '',
    supplierInfo: row.supplierInfo || ''
  })
  dialogVisible.value = true
}

const handleDetail = (row) => {
  currentRecord.value = row
  detailVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除肥料"${row.fertilizerName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fertilizerLibraryStore.deleteItem(row.id)
    ElMessage.success('删除成功')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err instanceof Error ? err.message : '删除失败')
    }
  }
}

const handleSave = async () => {
  if (!formData.fertilizerName?.trim()) {
    ElMessage.error('请输入肥料名称')
    return
  }

  dialogLoading.value = true
  try {
    // 将 applicationTiming 数组转为逗号分隔的字符串
    const submitData = {
      ...formData,
      applicationTiming: formData.applicationTiming.join(',')
    }

    if (dialogMode.value === 'add') {
      await fertilizerLibraryStore.createItem(submitData)
      ElMessage.success('新增成功')
    } else {
      await fertilizerLibraryStore.updateItem(formData.id, submitData)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    dialogLoading.value = false
  }
}

const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleExportCancel = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map(row => row.id)
}

const handleExportConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  exportFormatVisible.value = true
}

const handleDoExport = () => {
  const selectedData = fertilizerLibraryStore.items.filter(item => selectedRows.value.includes(item.id))

  // 导出表头
  const headers = ['肥料编码', '肥料名称', '肥料类型', '施肥时期', '功能说明', '使用禁忌', '保质期', '存储条件', '供应商信息']

  // 生成导出数据
  const rows = selectedData.map(record => [
    record.fertilizerCode || '',
    record.fertilizerName || '',
    getFertilizerTypeName(record.fertilizerType) || '',
    record.applicationTiming || '',
    record.functionDesc || '',
    record.tabooDesc || '',
    record.shelfLife || '',
    record.storageCondition || '',
    record.supplierInfo || ''
  ])

  const fileName = `肥料知识库_${new Date().toISOString().slice(0, 10)}`

  if (exportFormat.value === 'csv') {
    const csvContent = [headers, ...rows].map(row =>
      row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${fileName}.csv`
    link.click()
  } else if (exportFormat.value === 'word') {
    const content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    const blob = new Blob([content], { type: 'application/msword' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${fileName}.doc`
    link.click()
  } else {
    // Excel 格式 - 使用简单的 HTML 表格方式
    const content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    const blob = new Blob([content], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${fileName}.xls`
    link.click()
  }

  exportFormatVisible.value = false
  exportMode.value = false
  selectedRows.value = []
  ElMessage.success(`已导出 ${selectedData.length} 条数据`)
}

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.fertilizer-tabs :deep(.el-radio-button__inner) {
  border-radius: 0;
  border: none;
  margin: 0;
}

.fertilizer-tabs :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.fertilizer-tabs :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.fertilizer-tabs :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient-to-r from #059669 to #10b981;
  border-color: #059669;
  box-shadow: none;
}

/* 操作按钮样式 - 蓝色编辑/红色删除无边框图标 */
.action-btn {
  background-color: transparent !important;
  border: none !important;
  width: 24px;
  height: 24px;
  padding: 0;
}
.edit-btn {
  color: #3b82f6;
}
.edit-btn:hover {
  background-color: #dbeafe !important;
  color: #1d4ed8 !important;
}
.delete-btn {
  color: #ef4444;
}
.delete-btn:hover {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}
</style>

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
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </a>
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="white"><Warning /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">药剂库</h1>
          <p class="text-gray-500">管理药剂信息、规格参数和生产厂家</p>
        </div>
      </div>
    </div>

    <!-- Tabs: 化学防治 / 生物防治 / 物理防治 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="pesticide-tabs">
      <el-tab-pane label="化学防治" name="chemical">
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><ChemicalGlass /></el-icon>
            化学防治
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="生物防治" name="bio">
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><CellPhone /></el-icon>
            生物防治
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="物理防治" name="physical">
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><MagicStick /></el-icon>
            物理防治
          </span>
        </template>
      </el-tab-pane>

      <!-- Tab内容 -->
      <div class="mt-4">
        <!-- 筛选工具栏 -->
        <div class="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 mb-4">
          <div class="flex items-center gap-4">
            <el-input
              v-model="searchKeyword"
              placeholder="药剂名称/编码搜索..."
              clearable
              class="w-64"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>

        <!-- 表头工具栏 -->
        <div class="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold text-gray-900">药剂列表</h3>
            <span class="text-sm text-gray-500">共 {{ filteredData.length }} 条记录</span>
          </div>
          <div class="flex items-center gap-2">
            <template v-if="!exportMode">
              <el-button type="primary" @click="openAddDialog">
                <el-icon><Plus /></el-icon>
                新增药剂
              </el-button>
              <el-button type="default" @click="handleExportClick">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" @click="handleExportConfirm" :disabled="selectedRows.length === 0">
                <el-icon><Download /></el-icon>
                确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </el-button>
              <el-button @click="handleExportCancel">
                取消选择
              </el-button>
            </template>
          </div>
        </div>

        <!-- 表格 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <el-table
            ref="tableRef"
            :data="paginatedData"
            v-loading="pesticideStore.isLoading"
            @selection-change="handleSelectionChange"
            empty-text="暂无数据"
            stripe
          >
            <el-table-column v-if="exportMode" type="selection" width="55" />
            <el-table-column prop="pesticideCode" label="药剂编码" width="140" />
            <el-table-column prop="pesticideName" label="药剂名称" min-width="150" />
            <el-table-column prop="ingredient" label="药剂成分" min-width="120" show-overflow-tooltip />
            <el-table-column prop="mechanism" label="作用机制" min-width="100" show-overflow-tooltip />
            <el-table-column prop="controlTypeName" label="防治类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getControlTypeTagType(row.controlType)" size="small">
                  {{ getControlTypeName(row.controlType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="functionDesc" label="功能说明" min-width="200" show-overflow-tooltip />
            <el-table-column prop="specs" label="规格数" width="80" align="center">
              <template #default="{ row }">
                <el-tag type="info" size="small">{{ row.specs?.length || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="tabooDesc" label="使用禁忌" min-width="150" show-overflow-tooltip />
            <el-table-column prop="targetPests" label="防治对象" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <div class="flex items-center gap-1">
                  <el-button text size="small" @click="handleDetail(row)" title="查看详情">
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-button text size="small" @click="handleEdit(row)" title="编辑">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button text size="small" @click="handleDelete(row)" title="删除" class="hover:text-red-600">
                    <el-icon color="#dc2626"><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              共 {{ filteredData.length }} 条记录
            </div>
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredData.length"
              layout="prev, pager, next"
              background
            />
          </div>
        </div>
      </div>
    </el-tabs>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑药剂' : '新增药剂'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="药剂编码" prop="pesticideCode">
          <el-input v-model="formData.pesticideCode" placeholder="请输入药剂编码" />
        </el-form-item>
        <el-form-item label="药剂名称" prop="pesticideName">
          <el-input v-model="formData.pesticideName" placeholder="请输入药剂名称" />
        </el-form-item>
        <el-form-item label="防治类型" prop="controlType">
          <el-select v-model="formData.controlType" placeholder="请选择防治类型" class="w-full">
            <el-option label="化学防治" value="chemical" />
            <el-option label="生物防治" value="bio" />
            <el-option label="物理防治" value="physical" />
          </el-select>
        </el-form-item>
        <el-form-item label="药剂成分" prop="ingredient">
          <el-input v-model="formData.ingredient" placeholder="请输入药剂成分" />
        </el-form-item>
        <el-form-item label="作用机制" prop="mechanism">
          <el-input v-model="formData.mechanism" placeholder="如 触杀、胃毒、熏蒸" />
        </el-form-item>
        <el-form-item label="功能说明" prop="functionDesc">
          <el-input v-model="formData.functionDesc" type="textarea" :rows="3" placeholder="请输入功能说明" />
        </el-form-item>
        <el-form-item label="使用禁忌" prop="tabooDesc">
          <el-input v-model="formData.tabooDesc" type="textarea" :rows="2" placeholder="请输入使用禁忌" />
        </el-form-item>
        <el-form-item label="防治对象" prop="targetPests">
          <el-input v-model="formData.targetPests" placeholder="请输入防治对象" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="药剂详情" width="700px">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-500">药剂编码</label>
            <p class="font-medium font-mono">{{ currentRow?.pesticideCode }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">药剂名称</label>
            <p class="font-medium">{{ currentRow?.pesticideName }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">防治类型</label>
            <p class="font-medium">
              <el-tag :type="getControlTypeTagType(currentRow?.controlType)" size="small">
                {{ getControlTypeName(currentRow?.controlType) }}
              </el-tag>
            </p>
          </div>
          <div>
            <label class="text-sm text-gray-500">防治对象</label>
            <p class="font-medium">{{ currentRow?.targetPests || '-' }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">药剂成分</label>
            <p class="font-medium">{{ currentRow?.ingredient || '-' }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">作用机制</label>
            <p class="font-medium">{{ currentRow?.mechanism || '-' }}</p>
          </div>
        </div>
        <div>
          <label class="text-sm text-gray-500">功能说明</label>
          <p class="mt-1 text-gray-900">{{ currentRow?.functionDesc || '-' }}</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">使用禁忌</label>
          <p class="mt-1 text-gray-900">{{ currentRow?.tabooDesc || '-' }}</p>
        </div>
        <!-- 规格明细 -->
        <div v-if="currentRow?.specs?.length > 0">
          <label class="text-sm text-gray-500 mb-2 block">规格明细</label>
          <el-table :data="currentRow?.specs" size="small" border>
            <el-table-column prop="brandName" label="品牌名称" width="100" />
            <el-table-column prop="specContent" label="含量" width="80" />
            <el-table-column prop="formulation" label="剂型" width="100" />
            <el-table-column prop="manufacturer" label="生产厂家" min-width="120" show-overflow-tooltip />
            <el-table-column prop="suggestedDosage" label="建议用量" width="90" />
            <el-table-column prop="dosageUnit" label="单位" width="60" />
            <el-table-column prop="suggestedRatio" label="稀释比例" width="90" />
            <el-table-column prop="remark" label="备注" min-width="80" show-overflow-tooltip />
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="deleteVisible" title="确认删除" width="400px">
      <div class="space-y-4">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700 font-medium mb-2">警告：删除操作不可逆！</p>
          <p class="text-red-600 text-sm">
            确定要删除药剂 <span class="font-bold">{{ currentRow?.pesticideName }}</span> 吗？
          </p>
        </div>
      </div>
      <template #footer>
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <ExportFormatModal
      v-model="exportDialogVisible"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @update:exportFileType="exportFormat = $event"
      @confirm="handleDoExport"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Search,
  Refresh,
  Plus,
  Download,
  View,
  Edit,
  Delete,
  Warning
} from '@element-plus/icons-vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import { usePesticideLibraryStore } from '@/stores/modules/pesticideLibrary'

// 药剂库 Store
const pesticideStore = usePesticideLibraryStore()

// 防治类型映射
const controlTypeMap = {
  chemical: { name: '化学防治', tagType: 'danger' },
  bio: { name: '生物防治', tagType: 'success' },
  physical: { name: '物理防治', tagType: 'warning' }
}

// 状态
const activeTab = ref('chemical')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 导出相关
const exportMode = ref(false)
const selectedRows = ref([])
const exportDialogVisible = ref(false)
const exportFormat = ref('excel')

// 弹窗相关
const dialogVisible = ref(false)
const detailVisible = ref(false)
const deleteVisible = ref(false)
const isEdit = ref(false)
const currentRow = ref(null)
const editingId = ref('')

// 表单相关
const formRef = ref(null)
const formData = reactive({
  pesticideCode: '',
  pesticideName: '',
  controlType: 'chemical',
  ingredient: '',
  mechanism: '',
  functionDesc: '',
  tabooDesc: '',
  targetPests: ''
})

const formRules = {
  pesticideName: [{ required: true, message: '请输入药剂名称', trigger: 'blur' }],
  controlType: [{ required: true, message: '请选择防治类型', trigger: 'change' }]
}

// 计算属性：根据Tab和搜索过滤数据
const filteredData = computed(() => {
  let result = pesticideStore.items.filter(item => item.controlType === activeTab.value)

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
      (item.pesticideName && item.pesticideName.toLowerCase().includes(keyword)) ||
      (item.pesticideCode && item.pesticideCode.toLowerCase().includes(keyword))
    )
  }

  return result
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 获取防治类型标签颜色
function getControlTypeTagType(controlType) {
  return controlTypeMap[controlType]?.tagType || 'info'
}

// 获取防治类型名称
function getControlTypeName(controlType) {
  return controlTypeMap[controlType]?.name || controlType || ''
}

// Tab切换
async function handleTabChange() {
  currentPage.value = 1
  searchKeyword.value = ''
  selectedRows.value = []
  exportMode.value = false
  await loadData()
}

// 加载数据
async function loadData() {
  await pesticideStore.fetchItems({ control_type: activeTab.value })
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  pesticideStore.fetchItems({
    control_type: activeTab.value,
    keyword: searchKeyword.value
  })
}

// 重置
function handleReset() {
  searchKeyword.value = ''
  currentPage.value = 1
  loadData()
}

// 导出相关
function handleExportClick() {
  exportMode.value = true
  selectedRows.value = []
}

function handleExportCancel() {
  exportMode.value = false
  selectedRows.value = []
}

function handleExportConfirm() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  exportDialogVisible.value = true
}

function handleSelectionChange(selection) {
  selectedRows.value = selection.map(item => item.id)
}

function handleDoExport() {
  const exportData = exportMode.value
    ? dataList.value.filter(item => selectedRows.value.includes(item.id))
    : filteredData.value

  const headers = ['药剂编码', '药剂名称', '防治类型', '药剂成分', '作用机制', '功能说明', '使用禁忌', '防治对象']
  const rows = exportData.map(record => [
    record.pesticideCode || '',
    record.pesticideName || '',
    record.controlTypeName || '',
    record.ingredient || '',
    record.mechanism || '',
    record.functionDesc || '',
    record.tabooDesc || '',
    record.targetPests || ''
  ])

  const fileName = `药剂知识库_${new Date().toISOString().slice(0, 10)}`

  if (exportFormat.value === 'csv') {
    const csvContent = [headers, ...rows].map(row =>
      row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${fileName}.csv`
    link.click()
    ElMessage.success('导出成功')
  } else if (exportFormat.value === 'word') {
    const content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    const blob = new Blob([content], { type: 'application/msword' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${fileName}.doc`
    link.click()
    ElMessage.success('导出成功')
  } else {
    // Excel格式 - 使用数组方式
    try {
      const worksheet = [headers, ...rows]
      const csvContent = worksheet.map(row =>
        row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
      ).join('\n')
      const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}.xls`
      link.click()
      ElMessage.success('导出成功')
    } catch (e) {
      ElMessage.error('导出失败')
    }
  }

  exportMode.value = false
  selectedRows.value = []
}

// 打开新增弹窗
function openAddDialog() {
  isEdit.value = false
  editingId.value = ''
  resetForm()
  // 设置当前Tab类型作为默认值
  formData.controlType = activeTab.value
  dialogVisible.value = true
}

// 打开编辑弹窗
function handleEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  formData.pesticideCode = row.pesticideCode || ''
  formData.pesticideName = row.pesticideName || ''
  formData.controlType = row.controlType || 'chemical'
  formData.ingredient = row.ingredient || ''
  formData.mechanism = row.mechanism || ''
  formData.functionDesc = row.functionDesc || ''
  formData.tabooDesc = row.tabooDesc || ''
  formData.targetPests = row.targetPests || ''
  dialogVisible.value = true
}

// 查看详情
function handleDetail(row) {
  currentRow.value = row
  detailVisible.value = true
}

// 删除
function handleDelete(row) {
  currentRow.value = row
  deleteVisible.value = true
}

// 确认删除
async function confirmDelete() {
  const result = await pesticideStore.deleteItem(currentRow.value.id)
  if (result.success) {
    ElMessage.success('删除成功')
    deleteVisible.value = false
    currentRow.value = null
  } else {
    ElMessage.error(result.error || '删除失败')
  }
}

// 保存
async function handleSave() {
  formRef.value.validate(async valid => {
    if (!valid) return

    if (isEdit.value) {
      // 编辑
      const result = await pesticideStore.updateItem(editingId.value, formData)
      if (result.success) {
        ElMessage.success('保存成功')
        dialogVisible.value = false
        resetForm()
        loadData()
      } else {
        ElMessage.error(result.error || '保存失败')
      }
    } else {
      // 新增
      const result = await pesticideStore.createItem(formData)
      if (result.success) {
        ElMessage.success('新增成功')
        dialogVisible.value = false
        resetForm()
        loadData()
      } else {
        ElMessage.error(result.error || '新增失败')
      }
    }
  })
}

// 重置表单
function resetForm() {
  formData.pesticideCode = ''
  formData.pesticideName = ''
  formData.controlType = activeTab.value === 'chemical' ? 'chemical' : activeTab.value === 'bio' ? 'bio' : 'physical'
  formData.ingredient = ''
  formData.mechanism = ''
  formData.functionDesc = ''
  formData.tabooDesc = ''
  formData.targetPests = ''
}

onMounted(() => {
  // 初始化加载数据
  loadData()
})
</script>

<style scoped>
.pesticide-tabs :deep(.el-tabs__header) {
  background: white;
  border-radius: 12px;
  padding: 8px 16px;
  margin-bottom: 0;
}

.pesticide-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.pesticide-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  height: 40px;
  line-height: 40px;
}

.pesticide-tabs :deep(.el-tabs__content) {
  padding: 0;
}
</style>

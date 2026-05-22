<template>
  <!-- 指标数据页面主组件 -->
  <div class="p-6 bg-[#F2F6FA] min-h-screen">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div class="flex items-center justify-between">
        <!-- 左侧图标+标题 -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <el-icon :size="24" class="text-white">
              <DataAnalysis />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">指标数据</h1>
            <p class="text-gray-500">管理各类生产管理指标</p>
          </div>
        </div>
        <!-- 右侧按钮组 -->
        <div class="flex items-center gap-3">
          <!-- 考核评价按钮 -->
          <el-button type="info" @click="handleEvaluate">
            <el-icon class="mr-1"><Medal /></el-icon>
            考核评价
          </el-button>

          <!-- 导出模式切换 -->
          <template v-if="!exportMode">
            <el-button type="primary" @click="handleExport">
              <el-icon class="mr-1"><Download /></el-icon>
              导出
            </el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="handleExportConfirm">
              <el-icon class="mr-1"><Download /></el-icon>
              确认导出{{ selectedIds.length > 0 ? ` (${selectedIds.length})` : '' }}
            </el-button>
            <el-button @click="handleCancelExport">取消</el-button>
          </template>

          <!-- 新增指标按钮 -->
          <el-button type="success" @click="handleAdd">
            <el-icon class="mr-1"><Plus /></el-icon>
            新增指标
          </el-button>
        </div>
      </div>
    </div>

    <!-- 标签页导航 - V1.1自定义样式 -->
    <div class="bg-white rounded-xl p-1 mb-6 shadow-sm">
      <!-- 自定义标签页导航 -->
      <div class="grid grid-cols-4 gap-1 p-1 bg-gray-100/80 rounded-xl">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="[
            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === tab.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          ]"
          @click="setActiveTab(tab.value)"
        >
          <el-icon :size="16">
            <component :is="tab.icon" />
          </el-icon>
          {{ tab.label }}
        </button>
      </div>

      <!-- 标签页内容 -->
      <div class="mt-4 px-1">
        <!-- 指标列表 -->
        <div v-show="activeTab === 'list'">
          <IndicatorsFilters
            :search-keyword="searchKeyword"
            :category-filter="categoryFilter"
            @update:searchKeyword="setSearchKeyword"
            @update:categoryFilter="setCategoryFilter"
          />

          <IndicatorsTable
            :indicators="paginatedIndicators"
            :selected-ids="selectedIds"
            :export-mode="exportMode"
            :current-page="currentPage"
            :page-size="pageSize"
            :total-pages="totalPages"
            :total-count="filteredIndicators.length"
            @update:current-page="handlePageChange"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
            @select-all="handleSelectAll"
            @toggle-select="handleToggleSelect"
            @view="handleView"
            @analyze="handleAnalyze"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>

        <!-- 分类管理 -->
        <div v-if="activeTab === 'category'">
          <IndicatorsPanels
            :category-summary="categorySummary"
            :indicators="paginatedIndicators"
          />
        </div>

        <!-- 达成分析 -->
        <div v-if="activeTab === 'analyze'">
          <IndicatorsAnalyzePanel :analyze-data="analyzeData" />
        </div>

        <!-- 考核评价 -->
        <div v-if="activeTab === 'evaluate'">
          <IndicatorsEvaluatePanel :evaluation-data="evaluationData" />
        </div>
      </div>
    </div>

    <!-- 创建/编辑弹窗 -->
    <CreateModal
      :is-open="showModal && (modalType === 'add' || modalType === 'edit')"
      :indicator="selectedIndicator"
      @close="handleCloseModal"
      @save="handleSave"
    />

    <!-- 详情/分析/评价弹窗 -->
    <DetailModal
      :is-open="showModal && (modalType === 'view' || modalType === 'analyze' || modalType === 'evaluate')"
      :indicator="selectedIndicator"
      :modal-type="modalType"
      @close="handleCloseModal"
    />

    <!-- 删除确认弹窗 -->
    <DeleteModal
      :is-open="showDeleteModal"
      :item="deleteItem"
      @close="handleCloseDeleteModal"
      @confirm="handleDeleteConfirm"
    />

    <!-- 导出弹窗 -->
    <ExportModal
      :is-open="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedIds.length"
      :total-count="filteredIndicators.length"
      @close="handleCloseExportModal"
      @format-change="setExportFormat"
      @confirm="handleDoExport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { DataAnalysis, Download, Plus, Medal, PieChart, Odometer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useIndicatorStore } from '@/stores/modules/indicators'

// 导入子组件
import IndicatorsFilters from './components/IndicatorsFilters.vue'
import IndicatorsTable from './components/IndicatorsTable.vue'
import IndicatorsPanels from './components/IndicatorsPanels.vue'
import IndicatorsAnalyzePanel from './components/IndicatorsAnalyzePanel.vue'
import IndicatorsEvaluatePanel from './components/IndicatorsEvaluatePanel.vue'
import CreateModal from './components/IndicatorsModals/CreateModal.vue'
import DetailModal from './components/IndicatorsModals/DetailModal.vue'
import DeleteModal from './components/IndicatorsModals/DeleteModal.vue'
import ExportModal from './components/IndicatorsModals/ExportModal.vue'

// 使用 Store
const indicatorStore = useIndicatorStore()

// ========== 标签页配置 ==========
const tabs = [
  { value: 'list', label: '指标列表', icon: 'DataAnalysis' },
  { value: 'category', label: '分类管理', icon: 'PieChart' },
  { value: 'analyze', label: '达成分析', icon: 'Odometer' },
  { value: 'evaluate', label: '考核评价', icon: 'Medal' }
]

// ========== 数据 ==========

// 从 Store 获取数据
const evaluationData = computed(() => indicatorStore.evaluationData)
const analyzeData = computed(() => indicatorStore.analyzeData)
const categorySummary = computed(() => indicatorStore.categorySummary)

// ========== 筛选状态 ==========

const searchKeyword = ref('')
const categoryFilter = ref('全部')

// 设置搜索关键词
const setSearchKeyword = (val) => {
  searchKeyword.value = val
  currentPage.value = 1
}

// 设置类别筛选
const setCategoryFilter = (val) => {
  categoryFilter.value = val
  currentPage.value = 1
}

// ========== 标签页状态 ==========

const activeTab = ref('list')

// 设置激活标签页
const setActiveTab = (tab) => {
  activeTab.value = tab
}

// ========== 弹窗状态 ==========

const showModal = ref(false)
const modalType = ref('view')
const selectedIndicator = ref(null)

// ========== 删除弹窗状态 ==========

const showDeleteModal = ref(false)
const deleteItem = ref(null)

// ========== 导出弹窗状态 ==========

const showExportModal = ref(false)
const exportFormat = ref('excel')
const exportMode = ref(false)

// 设置导出格式
const setExportFormat = (val) => {
  exportFormat.value = val
}

// ========== 选择状态 ==========

const selectedIds = ref([])

// ========== 分页状态 ==========

const currentPage = ref(1)
const pageSize = ref(10)

// ========== 筛选后的指标数据 ==========

const filteredIndicators = computed(() => {
  return indicatorStore.indicators.filter(ind => {
    const matchesCategory = categoryFilter.value === '全部' || ind.category === categoryFilter.value
    const matchesSearch = !searchKeyword.value ||
      ind.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      ind.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

// ========== 分页数据 ==========

const totalPages = computed(() => Math.ceil(filteredIndicators.value.length / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const paginatedIndicators = computed(() =>
  filteredIndicators.value.slice(startIndex.value, startIndex.value + pageSize.value)
)

// ========== 初始化加载数据 ==========

onMounted(() => {
  indicatorStore.fetchIndicators()
  indicatorStore.fetchEvaluations()
})

// ========== 弹窗操作 ==========

const handleView = (item) => {
  selectedIndicator.value = item
  modalType.value = 'view'
  showModal.value = true
}

const handleAnalyze = (item) => {
  selectedIndicator.value = item
  modalType.value = 'analyze'
  showModal.value = true
}

const handleEdit = (item) => {
  selectedIndicator.value = item
  modalType.value = 'edit'
  showModal.value = true
}

const handleAdd = () => {
  selectedIndicator.value = null
  modalType.value = 'add'
  showModal.value = true
}

const handleEvaluate = () => {
  modalType.value = 'evaluate'
  showModal.value = true
}

const handleCloseModal = () => {
  showModal.value = false
  selectedIndicator.value = null
}

// 保存操作（新增/编辑）
const handleSave = async (indicatorData) => {
  try {
    if (modalType.value === 'add') {
      await indicatorStore.createIndicator(indicatorData)
      ElMessage.success('创建成功')
    } else if (modalType.value === 'edit' && selectedIndicator.value) {
      await indicatorStore.updateIndicator(selectedIndicator.value.id, indicatorData)
      ElMessage.success('保存成功')
    }
    handleCloseModal()
  } catch (error) {
    console.error('保存指标失败:', error)
    ElMessage.error('保存失败')
  }
}

// ========== 删除操作 ==========

const handleDelete = (item) => {
  deleteItem.value = item
  showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
  if (!deleteItem.value) return
  try {
    await indicatorStore.deleteIndicator(deleteItem.value.id)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除指标失败:', error)
    ElMessage.error('删除失败')
  } finally {
    showDeleteModal.value = false
    deleteItem.value = null
  }
}

const handleCloseDeleteModal = () => {
  showDeleteModal.value = false
  deleteItem.value = null
}

// ========== 导出操作 ==========

const handleExport = () => {
  exportMode.value = true
  selectedIds.value = []
}

const handleExportConfirm = () => {
  showExportModal.value = true
}

const handleDoExport = async () => {
  const currentIndicators = indicatorStore.indicators
  const dataToExport = selectedIds.value.length > 0
    ? currentIndicators.filter(ind => selectedIds.value.includes(ind.id))
    : currentIndicators

  // 生成 Excel HTML 内容
  const headers = ['指标编码', '指标名称', '类别', '单位', '目标值', '实际值', '达成率', '趋势', '采集方式', '权重']
  const rows = dataToExport.map(ind => [
    ind.code,
    ind.name,
    ind.category,
    ind.unit,
    ind.target,
    ind.actual,
    ((ind.actual / ind.target) * 100).toFixed(1) + '%',
    ind.trend === 'up' ? '上升' : ind.trend === 'down' ? '下降' : '持平',
    ind.source,
    ind.weight
  ])

  let content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`
  rows.forEach(row => {
    content += `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`
  })
  content += '</table></body></html>'

  const mimeType = 'application/vnd.ms-excel;charset=utf-8'
  const extension = exportFormat.value === 'csv' ? 'csv' : exportFormat.value === 'word' ? 'doc' : 'xls'
  const fileName = `指标数据汇总_${new Date().toISOString().slice(0, 10)}.${extension}`

  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Export failed:', err)
  }

  showExportModal.value = false
  exportMode.value = false
  selectedIds.value = []
  ElMessage.success('导出成功')
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedIds.value = []
}

const handleCloseExportModal = () => {
  showExportModal.value = false
}

// ========== 选择操作 ==========

const handleSelectAll = () => {
  if (selectedIds.value.length === paginatedIndicators.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = paginatedIndicators.value.map(ind => ind.id)
  }
}

const handleToggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// ========== 分页操作 ==========

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}
</script>

<style scoped>
/* 标签页容器样式 */
</style>

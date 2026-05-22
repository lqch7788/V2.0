<template>
  <!-- 公告管理主页面 - V1.1样式 -->
  <div class="p-6 bg-[#F2F6FA] min-h-screen">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div class="flex items-center justify-between">
        <!-- 左侧图标+标题 -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <el-icon class="text-white text-xl"><Bell /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">公告管理</h1>
            <p class="text-gray-500">管理和发布各类生产与行政公告</p>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 导航 -->
    <div class="bg-white rounded-xl p-1 mb-6 shadow-sm">
      <!-- 自定义标签页导航 -->
      <div class="grid grid-cols-2 gap-1 p-1 bg-gray-100/80 rounded-xl">
        <button
          :class="[
            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === 'list'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          ]"
          @click="setActiveTab('list')"
        >
          <el-icon :size="16"><Bell /></el-icon>
          公告列表
        </button>
        <button
          :class="[
            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === 'template'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          ]"
          @click="setActiveTab('template')"
        >
          <el-icon :size="16"><Document /></el-icon>
          公告模板
        </button>
      </div>

      <!-- 标签页内容 -->
      <div class="mt-4 px-1">
        <!-- 公告列表 -->
        <div v-show="activeTab === 'list'">
          <!-- 统计卡片 -->
          <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">公告总数</p>
                  <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
                </div>
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow">
                  <el-icon class="text-white"><Bell /></el-icon>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">已发布</p>
                  <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.published }}</p>
                </div>
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow">
                  <el-icon class="text-white"><SuccessFilled /></el-icon>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">审批中</p>
                  <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.pending }}</p>
                </div>
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow">
                  <el-icon class="text-white"><Clock /></el-icon>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">草稿</p>
                  <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.draft }}</p>
                </div>
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow">
                  <el-icon class="text-white"><Document /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 筛选栏 + 表格 -->
          <AnnouncementFilters
            v-model:search-keyword="searchKeyword"
            v-model:type-filter="typeFilter"
            @search-change="handleSearchChange"
            @type-change="handleTypeChange"
          >
            <template v-if="exportMode" #default>
              <el-button type="primary" size="small" @click="handleExportConfirm">
                <el-icon><Download /></el-icon>
                确认导出{{ selectedIds.length > 0 ? ` (${selectedIds.length})` : '' }}
              </el-button>
              <el-button size="small" @click="handleExportCancel">取消</el-button>
            </template>
            <template v-else #default>
              <el-button size="small" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
              <el-button type="primary" size="small" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                发布公告
              </el-button>
            </template>
          </AnnouncementFilters>

          <AnnouncementTable
            :notices="paginatedNotices"
            :selected-ids="selectedIds"
            :export-mode="exportMode"
            :expanded-row="expandedRow"
            :current-page="currentPage"
            :page-size="pageSize"
            :total-pages="totalPages"
            :total-count="filteredNotices.length"
            @update:current-page="handlePageChange"
            @page-size-change="handlePageSizeChange"
            @select-all="handleSelectAll"
            @toggle-select="handleToggleSelect"
            @toggle-expand="handleToggleExpand"
            @view="handleView"
            @send="handleSend"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>

        <!-- 公告模板 -->
        <div v-show="activeTab === 'template'">
          <!-- 筛选栏 -->
          <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">类型：</span>
                <el-select v-model="templateTypeFilter" placeholder="类型筛选" class="w-36" @change="() => {}">
                  <el-option label="全部" value="全部" />
                  <el-option v-for="t in allTypes" :key="t" :label="t" :value="t" />
                </el-select>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">分类：</span>
                <el-select v-model="templateCatFilter" placeholder="分类筛选" class="w-36" @change="() => {}">
                  <el-option label="全部" value="全部" />
                  <el-option v-for="c in allCategories" :key="c" :label="c" :value="c" />
                </el-select>
              </div>
              <div class="w-56">
                <el-input v-model="templateSearch" placeholder="搜索模板名称..." clearable>
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="ml-auto">
                <el-button type="primary" size="small" @click="handleTemplateAdd">
                  <el-icon><Plus /></el-icon>
                  新增模板
                </el-button>
              </div>
            </div>
          </div>

          <!-- 模板卡片网格 -->
          <div v-if="templateLoading" class="flex items-center justify-center py-20">
            <el-icon class="is-loading text-3xl text-green-500"><Loading /></el-icon>
          </div>

          <div v-else-if="filteredTemplates.length === 0" class="bg-white rounded-xl p-12 text-center shadow-sm">
            <el-icon class="text-6xl text-gray-300 mb-4"><Document /></el-icon>
            <p class="text-gray-500 text-lg mb-2">暂无模板</p>
            <p class="text-gray-400 text-sm mb-6">创建模板后可以快速生成标准化公告</p>
            <el-button type="primary" size="small" @click="handleTemplateAdd">
              <el-icon><Plus /></el-icon>
              创建第一个模板
            </el-button>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="template in filteredTemplates"
              :key="template.id"
              class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all duration-200"
            >
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-gray-900 flex-1 mr-2">{{ template.name }}</h3>
                <span
                  :class="['px-2 py-0.5 text-xs rounded-full flex-shrink-0', template.status === '启用' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-500 border border-gray-200']"
                >
                  {{ template.status === '启用' ? '启用' : '停用' }}
                </span>
              </div>
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  {{ template.type }}
                </span>
                <span v-if="template.category" class="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                  {{ template.category }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <el-icon><Document /></el-icon>
                <span>使用次数：{{ template.usageCount || 0 }} 次</span>
              </div>
              <div class="flex items-center gap-2 pt-3 border-t border-gray-100">
                <el-button size="small" class="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50" @click="handleTemplateEdit(template)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button size="small" class="flex-1 text-red-600 border-red-200 hover:bg-red-50" @click="handleTemplateDelete(template)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <DetailModal
      :is-open="showModal && modalType === 'view'"
      :notice="selectedNotice"
      @close="handleCloseModal"
    />

    <FormModal
      :is-open="showModal && (modalType === 'add' || modalType === 'edit' || modalType === 'send')"
      :notice="selectedNotice"
      :mode="modalType"
      @close="handleCloseModal"
      @save="handleSave"
    />

    <DeleteModal
      :is-open="showDeleteModal"
      :item="deleteItem"
      @close="handleCloseDeleteModal"
      @confirm="handleDeleteConfirm"
    />

    <ExportModal
      :is-open="showExportModal"
      :export-format="exportFormat"
      :selected-count="selectedIds.length"
      :total-count="filteredNotices.length"
      @close="handleCloseExportModal"
      @format-change="setExportFormat"
      @confirm="handleDoExport"
    />

    <TemplateEditModal
      :is-open="showTemplateEdit"
      :template="selectedTemplate"
      :mode="templateEditMode"
      @close="handleCloseTemplateEdit"
      @save="handleTemplateSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Bell,
  Document,
  Plus,
  Edit,
  Delete,
  Download,
  Search,
  Clock,
  SuccessFilled,
  Loading
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAnnouncementStore } from '@/stores/modules/announcement'
import { announcementCategories } from '@/data/announcementData'
import AnnouncementFilters from './components/AnnouncementFilters.vue'
import AnnouncementTable from './components/AnnouncementTable.vue'
import DetailModal from './modals/DetailModal.vue'
import FormModal from './modals/FormModal.vue'
import DeleteModal from './modals/DeleteModal.vue'
import ExportModal from './modals/ExportModal.vue'
import TemplateEditModal from './modals/TemplateEditModal.vue'

// 使用 Store
const announcementStore = useAnnouncementStore()

// ========== 标签页状态 ==========
const activeTab = ref('list')

const setActiveTab = (tab) => {
  activeTab.value = tab
  if (tab === 'template') {
    announcementStore.fetchTemplates()
  }
}

// ========== 公告列表状态 ==========
const searchKeyword = ref('')
const typeFilter = ref('全部')
const showModal = ref(false)
const modalType = ref('view')
const selectedNotice = ref(null)
const showDeleteModal = ref(false)
const deleteItem = ref(null)
const showExportModal = ref(false)
const exportFormat = ref('excel')
const exportMode = ref(false)
const selectedIds = ref([])
const expandedRow = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

// ========== 模板状态 ==========
const templateSearch = ref('')
const templateTypeFilter = ref('全部')
const templateCatFilter = ref('全部')
const showTemplateEdit = ref(false)
const templateEditMode = ref('add')
const selectedTemplate = ref(null)
const templateLoading = ref(false)

// ========== 计算属性 ==========
const stats = computed(() => {
  const items = announcementStore.notices
  const total = items.length
  const published = items.filter(n => n.status === '已发布').length
  const pending = items.filter(n => n.status === '审批中').length
  const draft = items.filter(n => n.status === '草稿').length
  return { total, published, pending, draft }
})

const filteredNotices = computed(() => {
  return announcementStore.notices.filter(n => {
    const matchType = typeFilter.value === '全部' || n.type === typeFilter.value
    const matchSearch = !searchKeyword.value ||
      n.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      n.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return matchType && matchSearch
  })
})

const totalPages = computed(() => Math.ceil(filteredNotices.value.length / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const paginatedNotices = computed(() =>
  filteredNotices.value.slice(startIndex.value, startIndex.value + pageSize.value)
)

// 模板计算
const allTypes = computed(() => {
  const set = new Set(['全部'])
  announcementStore.notices.forEach(n => set.add(n.type))
  return Array.from(set)
})

const allCategories = computed(() => {
  const set = new Set(['全部'])
  announcementCategories.forEach(c => set.add(c))
  announcementStore.templates.forEach(t => {
    if (t.category) set.add(t.category)
  })
  return Array.from(set)
})

const filteredTemplates = computed(() => {
  return announcementStore.templates.filter(t => {
    const matchType = templateTypeFilter.value === '全部' || t.type === templateTypeFilter.value
    const matchCat = templateCatFilter.value === '全部' || t.category === templateCatFilter.value
    const matchSearch = !templateSearch.value || t.name.toLowerCase().includes(templateSearch.value.toLowerCase())
    return matchType && matchCat && matchSearch
  })
})

// ========== 初始化加载 ==========
onMounted(() => {
  announcementStore.fetchNotices()
})

// ========== 筛选处理 ==========
const handleSearchChange = (val) => {
  searchKeyword.value = val
  currentPage.value = 1
}

const handleTypeChange = (val) => {
  typeFilter.value = val
  currentPage.value = 1
}

// ========== 分页处理 ==========
const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// ========== 选择处理 ==========
const handleSelectAll = () => {
  if (selectedIds.value.length === paginatedNotices.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = paginatedNotices.value.map(n => n.id)
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

const handleToggleExpand = (id) => {
  expandedRow.value = expandedRow.value === id ? null : id
}

// ========== 公告操作 ==========
const handleView = (item) => {
  selectedNotice.value = item
  modalType.value = 'view'
  showModal.value = true
}

const handleSend = (item) => {
  selectedNotice.value = item
  modalType.value = 'send'
  showModal.value = true
}

const handleEdit = (item) => {
  selectedNotice.value = item
  modalType.value = 'edit'
  showModal.value = true
}

const handleAdd = () => {
  selectedNotice.value = null
  modalType.value = 'add'
  showModal.value = true
}

const handleDelete = (item) => {
  deleteItem.value = item
  showDeleteModal.value = true
}

const handleCloseModal = () => {
  showModal.value = false
  selectedNotice.value = null
}

const handleSave = async (data) => {
  try {
    if (modalType.value === 'add') {
      await announcementStore.createNotice(data)
      ElMessage.success('创建成功')
    } else if (modalType.value === 'edit' && selectedNotice.value) {
      await announcementStore.updateNotice(selectedNotice.value.id, data)
      ElMessage.success('保存成功')
    } else if (modalType.value === 'send' && selectedNotice.value) {
      await announcementStore.updateNotice(selectedNotice.value.id, { ...data, status: '已发布' })
      ElMessage.success('发布成功')
    }
    handleCloseModal()
  } catch (error) {
    console.error('保存公告失败:', error)
    ElMessage.error('保存失败')
  }
}

const handleCloseDeleteModal = () => {
  showDeleteModal.value = false
  deleteItem.value = null
}

const handleDeleteConfirm = async () => {
  if (!deleteItem.value) return
  try {
    await announcementStore.deleteNotice(deleteItem.value.id)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除公告失败:', error)
    ElMessage.error('删除失败')
  } finally {
    handleCloseDeleteModal()
  }
}

// ========== 导出操作 ==========
const handleExport = () => {
  exportMode.value = true
  selectedIds.value = []
}

const handleExportCancel = () => {
  exportMode.value = false
  selectedIds.value = []
}

const handleExportConfirm = () => {
  showExportModal.value = true
}

const handleCloseExportModal = () => {
  showExportModal.value = false
}

const setExportFormat = (format) => {
  exportFormat.value = format
}

const handleDoExport = () => {
  const dataToExport = selectedIds.value.length > 0
    ? announcementStore.notices.filter(n => selectedIds.value.includes(n.id))
    : announcementStore.notices

  const headers = ['公告编号', '公告标题', '类型', '分类', '优先级', '状态', '发布部门', '发布日期', '截止日期', '阅读数', '接收对象']
  const rows = dataToExport.map(n => [
    n.code, n.title, n.type, n.category, n.priority, n.status, n.sender, n.date, n.deadline, n.readCount, n.recipients
  ])

  let content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`
  rows.forEach(row => { content += `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>` })
  content += '</table></body></html>'

  const mimeType = 'application/vnd.ms-excel;charset=utf-8'
  const ext = exportFormat.value === 'csv' ? 'csv' : exportFormat.value === 'word' ? 'doc' : 'xls'
  const fileName = `公告汇总表_${new Date().toISOString().slice(0, 10)}.${ext}`

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)

  showExportModal.value = false
  exportMode.value = false
  selectedIds.value = []
  ElMessage.success('导出成功')
}

// ========== 模板操作 ==========
const handleTemplateAdd = () => {
  selectedTemplate.value = null
  templateEditMode.value = 'add'
  showTemplateEdit.value = true
}

const handleTemplateEdit = (template) => {
  selectedTemplate.value = template
  templateEditMode.value = 'edit'
  showTemplateEdit.value = true
}

const handleTemplateDelete = async (template) => {
  try {
    await announcementStore.deleteTemplate(template.id)
    ElMessage.success('模板删除成功')
  } catch (error) {
    console.error('删除模板失败:', error)
    ElMessage.error('删除失败')
  }
}

const handleCloseTemplateEdit = () => {
  showTemplateEdit.value = false
  selectedTemplate.value = null
}

const handleTemplateSave = async (data) => {
  try {
    if (templateEditMode.value === 'add') {
      await announcementStore.createTemplate(data)
      ElMessage.success('模板创建成功')
    } else if (selectedTemplate.value) {
      await announcementStore.updateTemplate(selectedTemplate.value.id, data)
      ElMessage.success('模板更新成功')
    }
    handleCloseTemplateEdit()
  } catch (error) {
    console.error('保存模板失败:', error)
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
/* V1.1样式保持 */
</style>

<template>
  <!-- 公告管理主页面 -->
  <div class="p-6 bg-[#F2F6FA] min-h-screen">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <el-icon class="text-white text-xl"><Bell /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">公告管理</h1>
          <p class="text-gray-500">管理和发布各类生产与行政公告</p>
        </div>
      </div>
    </div>

    <!-- TAB 导航 -->
    <el-tabs v-model="activeTab" class="bg-white rounded-xl p-1 mb-6 shadow-sm">
      <el-tab-pane label="公告列表" name="list">
        <template #label>
          <div class="flex items-center gap-2 px-2">
            <el-icon><Bell /></el-icon>
            <span>公告列表</span>
          </div>
        </template>

        <!-- 公告列表内容 -->
        <div class="mt-4">
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
            @update:selected-ids="handleSelectionChange"
            @update:expanded-row="handleToggleExpand"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
            @toggle-expand="handleToggleExpand"
            @view="handleView"
            @send="handleSend"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="公告模板" name="template">
        <template #label>
          <div class="flex items-center gap-2 px-2">
            <el-icon><Document /></el-icon>
            <span>公告模板</span>
          </div>
        </template>

        <!-- 公告模板内容 -->
        <div class="mt-4">
          <!-- 筛选栏 -->
          <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">类型：</span>
                <el-select v-model="templateTypeFilter" placeholder="类型筛选" class="w-36">
                  <el-option label="全部" value="全部" />
                  <el-option v-for="t in allTypes" :key="t" :label="t" :value="t" />
                </el-select>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">分类：</span>
                <el-select v-model="templateCatFilter" placeholder="分类筛选" class="w-36">
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
                <el-button size="small" class="flex-1" @click="handleTemplateEdit(template)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button size="small" type="danger" class="flex-1" @click="handleTemplateDelete(template)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 弹窗组件 -->
    <DetailModal v-model="showModal" :notice="selectedNotice" @close="handleCloseModal" />

    <FormModal
      v-model="showFormModal"
      :notice="selectedNotice"
      :mode="modalType"
      @save="handleSave"
      @close="handleCloseModal"
    />

    <DeleteModal v-model="showDeleteModal" :item="deleteItem" @confirm="handleDeleteConfirm" />

    <ExportModal
      v-model="showExportModal"
      v-model:export-format="exportFormat"
      :selected-count="selectedIds.length"
      :total-count="filteredNotices.length"
      @confirm="handleDoExport"
    />

    <TemplateEditModal
      v-model="showTemplateEdit"
      :template="selectedTemplate"
      :mode="templateEditMode"
      @save="handleTemplateSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
import {  Notice, AnnouncementTemplate, AnnouncementStats, AnnouncementModalType  } from '@/types/announcement'
import AnnouncementFilters from './components/AnnouncementFilters.vue'
import AnnouncementTable from './components/AnnouncementTable.vue'
import DetailModal from './modals/DetailModal.vue'
import FormModal from './modals/FormModal.vue'
import DeleteModal from './modals/DeleteModal.vue'
import ExportModal from './modals/ExportModal.vue'
import TemplateEditModal from './modals/TemplateEditModal.vue'

// Mock 数据
const mockNotices = [
  {
    id: 'ANN_001',
    code: 'GG20260501-001',
    title: '关于2026年度生产计划的通知',
    type: '生产公告',
    category: '生产计划',
    priority: '高',
    status: '已发布',
    sender: '生产部',
    date: '2026-05-01',
    deadline: '2026-05-31',
    readCount,
    recipients: '全体员工',
    content: '各生产部门请注意，2026年度生产计划已制定完成，请各部门按照计划执行...'
  },
  {
    id: 'ANN_002',
    code: 'GG20260505-001',
    title: '端午节放假安排通知',
    type: '行政公告',
    category: '行政通知',
    priority: '中',
    status: '已发布',
    sender: '行政部',
    date: '2026-05-05',
    deadline: '2026-05-15',
    readCount,
    recipients: '全体员工',
    content: '根据国家法定节假日规定，现将2026年端午节放假安排通知如下...'
  },
  {
    id: 'ANN_003',
    code: 'GG20260510-001',
    title: '关于设备维护保养的通知',
    type: '生产公告',
    category: '设备管理',
    priority: '高',
    status: '审批中',
    sender: '设备部',
    date: '2026-05-10',
    deadline: '2026-05-20',
    readCount,
    recipients: '生产车间',
    content: '为确保生产设备正常运行，计划于5月20日进行设备维护保养...'
  },
  {
    id: 'ANN_004',
    code: 'GG20260515-001',
    title: '安全生产培训通知',
    type: '行政公告',
    category: '培训通知',
    priority: '中',
    status: '草稿',
    sender: '安全部',
    date: '2026-05-15',
    deadline: '2026-05-25',
    readCount,
    recipients: '全体员工',
    content: '为提高安全生产意识，计划组织安全生产培训...'
  },
  {
    id: 'ANN_005',
    code: 'GG20260518-001',
    title: '新品种植技术交流邀请',
    type: '生产公告',
    category: '技术交流',
    priority: '低',
    status: '已发布',
    sender: '技术部',
    date: '2026-05-18',
    deadline: '2026-05-30',
    readCount,
    recipients: '种植技术员',
    content: '技术部将于5月25日举办新品种植技术交流活动...'
  }
]

const mockTemplates = [
  {
    id: 'TPL_001',
    code: 'TPL001',
    name: '生产计划通知模板',
    type: '生产公告',
    category: '生产计划',
    titleTemplate: '关于{申请人}的生产计划通知',
    contentTemplate: '{申请人}提交了一份关于...的生产计划，申请日期为{申请日期}',
    priority: '中',
    usageCount,
    status: '启用'
  },
  {
    id: 'TPL_002',
    code: 'TPL002',
    name: '行政通知模板',
    type: '行政公告',
    category: '行政通知',
    titleTemplate: '关于{申请人}的行政通知',
    contentTemplate: '{申请人}发布了一则行政通知，请各部门知悉。',
    priority: '低',
    usageCount,
    status: '启用'
  },
  {
    id: 'TPL_003',
    code: 'TPL003',
    name: '培训通知模板',
    type: '行政公告',
    category: '培训通知',
    titleTemplate: '培训通知 - {申请人}',
    contentTemplate: '兹定于{申请日期}进行培训，请相关人员准时参加。',
    priority: '中',
    usageCount,
    status: '启用'
  }
]

// 响应式数据
const activeTab = ref('list')

// 公告列表状态
const searchKeyword = ref('')
const typeFilter = ref('全部')
const showModal = ref(false)
const showFormModal = ref(false)
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

// 模板状态
const templateSearch = ref('')
const templateTypeFilter = ref('全部')
const templateCatFilter = ref('全部')
const showTemplateEdit = ref(false)
const templateEditMode = ref('add')
const selectedTemplate = ref(null)
const templateLoading = ref(false)

// 数据
const notices = ref([...mockNotices])
const templates = ref([...mockTemplates])

// 计算属性
const stats = computed(() => {
  const total = notices.value.length
  const published = notices.value.filter(n => n.status === '已发布').length
  const pending = notices.value.filter(n => n.status === '审批中').length
  const draft = notices.value.filter(n => n.status === '草稿').length
  return { total, published, pending, draft }
})

const filteredNotices = computed(() => {
  return notices.value.filter(n => {
    const matchType = typeFilter.value === '全部' || n.type === typeFilter.value
    const matchSearch = !searchKeyword.value ||
      n.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      n.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return matchType && matchSearch
  })
})

const totalPages = computed(() => Math.ceil(filteredNotices.value.length / pageSize.value))

const paginatedNotices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredNotices.value.slice(start, start + pageSize.value)
})

// 模板计算
const allTypes = computed(() => {
  const set = new Set<string>(['全部'])
  notices.value.forEach(n => set.add(n.type))
  return Array.from(set)
})

const allCategories = computed(() => {
  const set = new Set<string>(['全部'])
  notices.value.forEach(n => {
    if (n.category) set.add(n.category)
  })
  templates.value.forEach(t => {
    if (t.category) set.add(t.category)
  })
  return Array.from(set)
})

const filteredTemplates = computed(() => {
  return templates.value.filter(t => {
    const matchType = templateTypeFilter.value === '全部' || t.type === templateTypeFilter.value
    const matchCat = templateCatFilter.value === '全部' || t.category === templateCatFilter.value
    const matchSearch = !templateSearch.value || t.name.toLowerCase().includes(templateSearch.value.toLowerCase())
    return matchType && matchCat && matchSearch
  })
})

// 处理方法
const handleSearchChange = (val) => {
  searchKeyword.value = val
  currentPage.value = 1
}

const handleTypeChange = (val) => {
  typeFilter.value = val
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleSelectionChange = (ids) => {
  selectedIds.value = ids
}

const handleToggleExpand = (id) => {
  expandedRow.value = expandedRow.value === id ? null : id
}

const handleView = (item) => {
  selectedNotice.value = item
  modalType.value = 'view'
  showModal.value = true
}

const handleSend = (item) => {
  selectedNotice.value = item
  modalType.value = 'send'
  showFormModal.value = true
}

const handleEdit = (item) => {
  selectedNotice.value = item
  modalType.value = 'edit'
  showFormModal.value = true
}

const handleAdd = () => {
  selectedNotice.value = null
  modalType.value = 'add'
  showFormModal.value = true
}

const handleDelete = (item) => {
  deleteItem.value = item
  showDeleteModal.value = true
}

const handleCloseModal = () => {
  showModal.value = false
  showFormModal.value = false
  selectedNotice.value = null
}

const handleSave = (data) => {
  if (modalType.value === 'add') {
    const newNotice = {
      id: `ANN_${Date.now()}`,
      code: `GG${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(notices.value.length + 1).padStart(3, '0')}`,
      title: data.title || '',
      type: data.type || data.category || '',
      category: data.category || '',
      priority: data.priority || '中',
      status: data.status || '草稿',
      sender: data.sender || '',
      date: data.date || new Date().toISOString().slice(0, 10),
      deadline: data.deadline || '',
      readCount: data.readCount || 0,
      recipients: data.recipients || '',
      content: data.content || ''
    }
    notices.value.unshift(newNotice)
    ElMessage.success('创建成功')
  } else if (modalType.value === 'edit' && selectedNotice.value) {
    const index = notices.value.findIndex(n => n.id === selectedNotice.value.id)
    if (index !== -1) {
      notices.value[index] = { ...notices.value[index], ...data }
      ElMessage.success('保存成功')
    }
  } else if (modalType.value === 'send' && selectedNotice.value) {
    const index = notices.value.findIndex(n => n.id === selectedNotice.value.id)
    if (index !== -1) {
      notices.value[index] = { ...notices.value[index], ...data, status: '已发布' }
      ElMessage.success('发布成功')
    }
  }
}

const handleDeleteConfirm = () => {
  if (deleteItem.value) {
    notices.value = notices.value.filter(n => n.id !== deleteItem.value.id)
    ElMessage.success('删除成功')
  }
}

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

const handleDoExport = () => {
  const dataToExport = selectedIds.value.length > 0
    ? notices.value.filter(n => selectedIds.value.includes(n.id))
    : notices.value

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

  exportMode.value = false
  selectedIds.value = []
  ElMessage.success('导出成功')
}

// 模板处理
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

const handleTemplateDelete = (template) => {
  templates.value = templates.value.filter(t => t.id !== template.id)
  ElMessage.success('模板删除成功')
}

const handleTemplateSave = (data) => {
  if (templateEditMode.value === 'add') {
    const newTemplate = {
      id: `TPL_${Date.now()}`,
      code: `TPL${String(templates.value.length + 1).padStart(3, '0')}`,
      name: data.name || '',
      type: data.type || '',
      category: data.category || '',
      titleTemplate: data.titleTemplate || '',
      contentTemplate: data.contentTemplate || data.content || '',
      priority: data.priority || '中',
      status: '启用',
      usageCount: 0
    }
    templates.value.unshift(newTemplate)
    ElMessage.success('模板创建成功')
  } else if (selectedTemplate.value) {
    const index = templates.value.findIndex(t => t.id === selectedTemplate.value.id)
    if (index !== -1) {
      templates.value[index] = { ...templates.value[index], ...data }
      ElMessage.success('模板更新成功')
    }
  }
}
</script>

<style scoped>
/* V1.1 样式保持 */
</style>

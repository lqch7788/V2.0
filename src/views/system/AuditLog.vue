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
            <el-icon :size="20" color="#4b5563">
              <ArrowLeft />
            </el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <List />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">操作日志</h1>
            <p class="text-gray-500">记录用户操作行为，用于安全审计与问题追溯</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">日志总数</p>
        <p class="text-2xl font-bold mt-1 text-gray-900">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">今日</p>
        <p class="text-2xl font-bold mt-1 text-emerald-600">{{ stats.today }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">信息</p>
        <p class="text-2xl font-bold mt-1 text-blue-600">{{ stats.info }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">警告</p>
        <p class="text-2xl font-bold mt-1 text-yellow-600">{{ stats.warning }}</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">错误</p>
        <p class="text-2xl font-bold mt-1 text-red-600">{{ stats.error }}</p>
      </div>
    </div>

    <!-- 过滤栏 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[140px]">
          <el-input
            v-model="searchTerm"
            placeholder="搜索日志..."
            clearable
            @clear="handleSearchClear('search')"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="relative flex-1 min-w-[140px]">
          <el-input
            v-model="filterUser"
            placeholder="搜索用户..."
            clearable
            @clear="handleSearchClear('user')"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select
          v-model="filterModule"
          placeholder="全部模块"
          clearable
          @change="handleFilterChange"
          class="w-36"
        >
          <template #prefix><el-icon><Grid /></el-icon></template>
          <el-option label="全部模块" value="all" />
          <el-option
            v-for="m in modules"
            :key="m"
            :label="m"
            :value="m"
          />
        </el-select>
        <el-select
          v-model="filterLevel"
          placeholder="全部级别"
          clearable
          @change="handleFilterChange"
          class="w-32"
        >
          <template #prefix><el-icon><Filter /></el-icon></template>
          <el-option label="全部级别" value="all" />
          <el-option label="信息" value="info" />
          <el-option label="警告" value="warning" />
          <el-option label="错误" value="error" />
        </el-select>
        <el-date-picker
          v-model="filterDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleFilterChange"
          class="w-36"
        />
        <el-button type="primary" @click="fetchData">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
        <template v-if="exportMode">
          <el-button @click="cancelExportMode">
            取消
          </el-button>
          <el-button type="success" @click="exportLogs">
            <el-icon><Download /></el-icon> 确认导出{{ selectedIds.length > 0 ? ` (${selectedIds.length})` : '' }}
          </el-button>
        </template>
        <el-button v-else type="success" @click="enterExportMode">
          <el-icon><Download /></el-icon> 导出日志
        </el-button>
      </div>
    </div>

    <!-- 日志表格 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center p-12 text-gray-500 gap-2">
        <el-icon class="is-loading text-emerald-600" :size="20"><Loading /></el-icon>
        加载中...
      </div>
      <div v-else-if="filteredLogs.length === 0" class="p-12 text-center text-gray-400">
        <el-icon :size="48" class="mb-3 opacity-30"><Document /></el-icon>
        <p>暂无日志数据</p>
      </div>
      <table v-else class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th v-if="exportMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              <input
                type="checkbox"
                :checked="selectedIds.length > 0 && selectedIds.length === filteredLogs.length"
                @change="toggleAllSelection"
                class="w-4 h-4 text-emerald-600 border-gray-400 rounded focus:ring-emerald-500"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">时间</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">用户</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">模块</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">描述</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">级别</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300 bg-white">
          <tr
            v-for="log in filteredLogs"
            :key="log.id"
            class="hover:bg-gray-50"
          >
            <td v-if="exportMode" class="px-4 py-3">
              <input
                type="checkbox"
                :checked="selectedIds.includes(log.id)"
                @change="toggleSelection(log.id)"
                class="w-4 h-4 text-emerald-600 border-gray-400 rounded focus:ring-emerald-500"
              />
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ log.created_at ? new Date(log.created_at).toLocaleString('zh-CN') : '-' }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-medium">
                  {{ (log.username || 'S')[0].toUpperCase() }}
                </div>
                <span class="text-sm text-gray-900">{{ log.username || '系统' }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 text-xs rounded', getActionColor(log.action)]">
                {{ getActionLabel(log.action) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ log.module || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" :title="log.description">
              {{ log.description || '-' }}
            </td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 text-xs rounded-full', getLevelColor(log.level || log.status)]">
                {{ getLevelLabel(log.level || log.status) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end">
                <el-button
                  link
                  @click="openDetail(log)"
                  class="p-1.5 hover:bg-gray-100 rounded"
                >
                  <el-icon :size="16" color="#4b5563"><View /></el-icon>
                </el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <div class="text-sm text-gray-500">共 {{ filteredLogs.length }} 条</div>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="totalPages * pageSize"
        layout="total, sizes, prev, pager, next"
        background
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </div>

    <!-- 日志详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="600px"
    >
      <div v-if="selectedLog" class="space-y-4">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="时间">
            {{ selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString('zh-CN') : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            {{ selectedLog.username || '系统' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作">
            {{ selectedLog.action || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="模块">
            {{ selectedLog.module || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ selectedLog.ipAddress || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="级别">
            <span :class="['px-2 py-1 text-xs rounded-full', getLevelColor(selectedLog.level || selectedLog.status)]">
              {{ getLevelLabel(selectedLog.level || selectedLog.status) }}
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <div>
          <p class="text-xs text-gray-500 mb-1">描述</p>
          <div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
            {{ selectedLog.description || '-' }}
          </div>
        </div>

        <div v-if="selectedLog.oldValue">
          <p class="text-xs text-gray-500 mb-1">原值</p>
          <pre class="p-3 bg-gray-50 rounded-lg text-xs whitespace-pre-wrap">{{ selectedLog.oldValue }}</pre>
        </div>

        <div v-if="selectedLog.newValue">
          <p class="text-xs text-gray-500 mb-1">新值</p>
          <pre class="p-3 bg-gray-50 rounded-lg text-xs whitespace-pre-wrap">{{ selectedLog.newValue }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 - V1.1 L543-550 -->
    <ExportFormatModal
      :visible="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedIds.length > 0 ? selectedIds.length : filteredLogs.length"
      @update:visible="(val) => showExportModal = val"
      @update:export-file-type="(val) => exportFormat = val"
      @confirm="handleDoExport"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  List,
  Search,
  Download,
  View,
  Refresh,
  Loading,
  Grid,
  Filter
} from '@element-plus/icons-vue'
import { get } from '@/api/request'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'

// 空白统计数据
const EMPTY_STATS = { total: 0, today: 0, info: 0, warning: 0, error: 0 }

// 响应式数据
const logs = ref([])
const stats = ref({ ...EMPTY_STATS })
const searchTerm = ref('')
const filterUser = ref('')
const filterModule = ref('all')
const filterLevel = ref('all')
const filterDate = ref('')
const detailDialogVisible = ref(false)
const selectedLog = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(true)
const pageSize = ref(10)
let searchDebounceTimer = null

// 导出模式状态 - V1.1 L67-69
const exportMode = ref(false)
const selectedIds = ref([])
const showExportModal = ref(false)
const exportFormat = ref('excel')

// 进入导出模式
const enterExportMode = () => {
  exportMode.value = true
  selectedIds.value = []
}

// 取消导出模式
const cancelExportMode = () => {
  exportMode.value = false
  selectedIds.value = []
}

// 切换全选
const toggleAllSelection = (e) => {
  if (e.target.checked) {
    selectedIds.value = filteredLogs.value.map(log => log.id)
  } else {
    selectedIds.value = []
  }
}

// 切换单选
const toggleSelection = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

// 获取模块列表（去重）
const modules = computed(() => {
  return [...new Set(logs.value.map((l) => l.module).filter(Boolean))]
})

// 前端二次筛选
const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    const matchSearch =
      !searchTerm.value ||
      (log.username && log.username.includes(searchTerm.value)) ||
      (log.description && log.description.includes(searchTerm.value)) ||
      (log.action && log.action.includes(searchTerm.value))
    const matchUser =
      !filterUser.value ||
      (log.username && log.username.includes(filterUser.value))
    return matchSearch && matchUser
  })
})

// 获取级别颜色
const getLevelColor = (status) => {
  const level = status || 'info'
  switch (level) {
    case 'info':
    case 'success':
      return 'bg-blue-100 text-blue-700'
    case 'warning':
      return 'bg-yellow-100 text-yellow-700'
    case 'error':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// 获取级别标签
const getLevelLabel = (s) => {
  const map = { info: '信息', success: '信息', warning: '警告', error: '错误' }
  return map[s || 'info'] || s || '信息'
}

// 获取操作颜色
const getActionColor = (action) => {
  if (!action) return 'bg-gray-100 text-gray-700'
  if (action.includes('LOGIN') || action.includes('登录')) return 'bg-emerald-100 text-emerald-700'
  if (action.includes('CREATE') || action.includes('新建')) return 'bg-blue-100 text-blue-700'
  if (action.includes('UPDATE') || action.includes('编辑')) return 'bg-amber-100 text-amber-700'
  if (action.includes('DELETE') || action.includes('删除')) return 'bg-red-100 text-red-700'
  if (action.includes('APPROVE') || action.includes('审批')) return 'bg-purple-100 text-purple-700'
  if (action.includes('EXPORT') || action.includes('导出')) return 'bg-cyan-100 text-cyan-700'
  return 'bg-gray-100 text-gray-700'
}

// 操作类型中文映射 - V1.1 L177-214
const getActionLabel = (action) => {
  if (!action) return '-'
  const actionMap = {
    'create': '创建',
    'update': '更新',
    'delete': '删除',
    'login': '登录',
    'logout': '登出',
    'export': '导出',
    'import': '导入',
    'approval': '审批',
    'approval_approved': '审批通过',
    'approval_rejected': '审批拒绝',
    'approval_cancelled': '审批取消',
    'submit': '提交',
    'approve': '批准',
    'reject': '驳回',
    'publish': '发布',
    'assign': '分派',
    'accept': '接受',
    'start': '开始',
    'complete': '完成',
    'submit_acceptance': '提交验收',
    'withdraw': '撤回',
    'reassign': '重新分派',
    'extend_deadline': '延期',
    'cancel': '取消',
    'abandon': '放弃',
    'overtime_continue': '超时继续',
    'overtime_abandon': '超时放弃',
    'remind': '催办',
  }
  return actionMap[action] || action
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = new URLSearchParams()
    params.set('page', String(currentPage.value))
    params.set('limit', String(pageSize.value))
    if (searchTerm.value) params.set('search', searchTerm.value)
    if (filterUser.value) params.set('username', filterUser.value)
    if (filterModule.value !== 'all') params.set('module', filterModule.value)
    if (filterLevel.value !== 'all') params.set('level', filterLevel.value)
    if (filterDate.value) params.set('start_date', filterDate.value)

    // 并行获取日志列表和统计数据
    const [logsResult, statsResult] = await Promise.allSettled([
      get(`/operation-logs?${params.toString()}`),
      get('/operation-logs/stats/summary')
    ])

    // 处理日志列表
    if (logsResult.status === 'fulfilled') {
      const data = logsResult.value
      if (Array.isArray(data)) {
        logs.value = data
      } else if (data && Array.isArray(data.data)) {
        logs.value = data.data
        totalPages.value = data.meta?.totalPages || data.totalPages || 1
      } else {
        logs.value = []
      }
    } else {
      console.error('获取日志失败:', logsResult.reason)
      logs.value = []
    }

    // 处理统计数据
    if (statsResult.status === 'fulfilled') {
      const data = statsResult.value
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        stats.value = {
          total: data.total ?? 0,
          today: data.today ?? 0,
          info: data.info ?? 0,
          warning: data.warning ?? 0,
          error: data.error ?? 0
        }
      }
    } else {
      console.error('获取统计失败:', statsResult.reason)
    }
  } catch (err) {
    console.error('AuditLog fetch error:', err)
  } finally {
    loading.value = false
  }
}

// 搜索（300ms防抖）
const handleSearch = () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    currentPage.value = 1
    fetchData()
  }, 300)
}

// 清除搜索
const handleSearchClear = (type) => {
  if (type === 'search') {
    searchTerm.value = ''
  } else if (type === 'user') {
    filterUser.value = ''
  }
  currentPage.value = 1
  fetchData()
}

// 筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  fetchData()
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

// 页码大小变化
const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchData()
}

// 打开详情
const openDetail = (log) => {
  selectedLog.value = log
  detailDialogVisible.value = true
}

// 导出日志 - V1.1 L230-274
const exportLogs = () => {
  showExportModal.value = true
}

// 执行导出 - V1.1 L230-274
const handleDoExport = () => {
  const dataToExport = selectedIds.value.length > 0
    ? filteredLogs.value.filter(log => selectedIds.value.includes(log.id))
    : filteredLogs.value

  if (dataToExport.length === 0) {
    alert('没有可导出的数据')
    return
  }

  if (exportFormat.value === 'csv') {
    const headers = ['时间', '用户', '操作', '模块', '描述', 'IP', '级别']
    const rows = dataToExport.map((log) => [
      log.created_at ? new Date(log.created_at).toLocaleString('zh-CN') : '-',
      log.username || '系统',
      getActionLabel(log.action),
      log.module || '-',
      log.description || '',
      log.ipAddress || '-',
      getLevelLabel(log.level || log.status)
    ])
    const BOM = '﻿'
    const csvContent = BOM + [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `操作日志_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  } else {
    // Excel格式 - 需要XLSX库
    const excelHeaders = ['时间', '用户', '操作', '模块', '描述', 'IP', '级别']
    const excelData = [excelHeaders, ...dataToExport.map((log) => [
      log.created_at ? new Date(log.created_at).toLocaleString('zh-CN') : '-',
      log.username || '系统',
      getActionLabel(log.action),
      log.module || '-',
      log.description || '',
      log.ipAddress || '-',
      getLevelLabel(log.level || log.status)
    ])]
    // 使用简单方式导出Excel
    const csv = excelData.map(row => row.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `操作日志_${new Date().toISOString().slice(0, 10)}.xls`
    link.click()
  }

  showExportModal.value = false
  exportMode.value = false
  selectedIds.value = []
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<template>
  <!-- 操作记录面板 - 全屏遮罩弹窗，与V1.1逻辑完全一致 -->
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="onClose" />

    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
      <!-- 头部 - 绿色渐变 -->
      <div class="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl">
        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
          操作记录
        </h2>
        <div class="flex items-center gap-2 relative">
          <el-button size="small" @click="exportMenuOpen = !exportMenuOpen">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <!-- 导出格式子菜单：与V1.1 OperationRecordPanel.tsx line 203-218 一致 -->
          <div v-if="exportMenuOpen" class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
            <button class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100" @click="handleExport('xlsx')">导出为 Excel</button>
            <button class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100" @click="handleExport('csv')">导出为 CSV</button>
          </div>
          <el-button circle :icon="Close" size="small" @click="onClose" />
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="px-6 py-3 border-b border-gray-200 flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">操作类型:</span>
          <el-select v-model="filterType" size="small" style="width: 140px" @change="handleFilter">
            <el-option v-for="opt in actionTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <!-- 时间段筛选：与V1.1 OperationRecordPanel.tsx line 243-260 一致（开始+结束日期） -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">时间段:</span>
          <input
            type="date"
            v-model="filterStartDate"
            class="px-3 py-1.5 text-sm border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="开始日期"
            @change="handleFilter"
          />
          <span class="text-gray-400">至</span>
          <input
            type="date"
            v-model="filterEndDate"
            class="px-3 py-1.5 text-sm border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="结束日期"
            @change="handleFilter"
          />
        </div>
        <el-button v-if="filterType !== 'all' || filterStartDate || filterEndDate" size="small" @click="handleReset">
          重置
        </el-button>
      </div>

      <!-- 记录列表 -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <div v-if="paginatedRecords.length === 0" class="text-center py-12 text-gray-500">
          <el-icon :size="48" class="text-gray-300 mb-4"><Document /></el-icon>
          <p>暂无操作记录</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="record in paginatedRecords"
            :key="record.id"
            class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span class="text-xs text-gray-400 whitespace-nowrap min-w-[60px]">
              {{ formatTime(record.timestamp) }}
            </span>
            <span
              :class="[
                'px-2 py-0.5 text-xs rounded',
                record.operatorType === 'system' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700',
              ]"
            >
              {{ record.operatorType === 'system' ? '系统' : record.operatorName }}
            </span>
            <span
              :class="[
                'px-2 py-0.5 text-xs rounded',
                (actionConfig[record.actionType] || defaultActionConfig).color,
              ]"
            >
              {{ (actionConfig[record.actionType] || defaultActionConfig).label }}
            </span>
            <span class="text-sm text-gray-600 flex-1">{{ record.content }}</span>
          </div>
        </div>
      </div>

      <!-- 底部 - 动态分页：与V1.1 OperationRecordPanel.tsx line 313-324 一致 -->
      <div class="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-500">共 {{ filteredRecords.length }} 条记录</p>
        <div class="flex items-center gap-2">
          <el-button size="small" :disabled="currentPage === 1" @click="goToPrevPage">上一页</el-button>
          <span class="px-3 py-1 text-sm">第 {{ currentPage }}/{{ totalPages }} 页</span>
          <el-button size="small" :disabled="currentPage >= totalPages" @click="goToNextPage">下一页</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/** 操作记录面板 - 从V1.1 OperationRecordPanel.tsx 1:1迁移 */
import { ref, computed } from 'vue'
import { Close, Download, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  /** 操作记录列表 */
  records: { type: Array, default: () => [] },
})

const emit = defineEmits(['close'])

// 操作类型配置（与V1.1 OperationRecordPanel.tsx line 19-29 完全一致）
const actionConfig = {
  create: { label: '创建', color: 'bg-blue-100 text-blue-700' },
  assign: { label: '分派', color: 'bg-purple-100 text-purple-700' },
  accept: { label: '接受', color: 'bg-green-100 text-green-700' },
  reject: { label: '拒绝', color: 'bg-red-100 text-red-700' },
  progress: { label: '进度', color: 'bg-orange-100 text-orange-700' },
  submit: { label: '提交', color: 'bg-cyan-100 text-cyan-700' },
  verify: { label: '验收', color: 'bg-teal-100 text-teal-700' },
  report: { label: '上报', color: 'bg-yellow-100 text-yellow-700' },
  inspect: { label: '巡查', color: 'bg-indigo-100 text-indigo-700' },
}

// 操作类型中文映射（用于导出）：与V1.1 line 32-49 一致（17种类型）
const ACTION_TYPE_LABELS = {
  create: '创建', assign: '分派', accept: '接受', reject: '拒绝',
  progress: '进度更新', submit: '提交', verify: '验收', report: '上报',
  inspect: '巡查', withdraw: '撤回', overtime_continue: '超时继续',
  overtime_abandon: '超时放弃', extend_deadline: '延期', reassign: '重新分派',
  cancel: '取消', abandon: '放弃', start: '开始',
}

// 状态中文映射（用于导出）：与V1.1 line 52-65 一致（14种状态）
const STATUS_LABELS = {
  draft: '草稿', pending: '待接受', in_progress: '进行中',
  waiting_acceptance: '待验收', completed: '已完成', cancelled: '已取消',
  rejected: '已驳回', pending_reassign: '待重新派发', published: '已发布',
  withdrawn: '已撤回', accepted: '已接受', overtime: '超时', approved: '已通过',
  rejected_acceptance: '已驳回',
}

const defaultActionConfig = { label: '未知', color: 'bg-gray-100 text-gray-700' }

// 操作类型选项
const actionTypeOptions = [
  { value: 'all', label: '全部操作' },
  ...Object.entries(actionConfig).map(([key, config]) => ({
    value: key,
    label: config.label,
  })),
]

// 筛选状态：与V1.1 line 132-137 一致（时间段+分页+导出菜单）
const filterType = ref('all')
const filterStartDate = ref('')
const filterEndDate = ref('')
const exportMenuOpen = ref(false)
const currentPage = ref(1)
const pageSize = 20

// 过滤后的记录：与V1.1 line 140-149 一致
const filteredRecords = computed(() => {
  let list = props.records
  if (filterType.value !== 'all') {
    list = list.filter((r) => r.actionType === filterType.value)
  }
  // 时间段筛选：与V1.1 line 142-147 一致
  if (filterStartDate.value) {
    list = list.filter((r) => {
      const t = r.timestamp
      if (!t) return false
      const ts = typeof t === 'string' ? t : new Date(t).toISOString()
      return ts >= filterStartDate.value
    })
  }
  if (filterEndDate.value) {
    const endTs = filterEndDate.value + 'T23:59:59'
    list = list.filter((r) => {
      const t = r.timestamp
      if (!t) return false
      const ts = typeof t === 'string' ? t : new Date(t).toISOString()
      return ts <= endTs
    })
  }
  return list
})

// 分页计算：与V1.1 line 152-153 一致
const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize) || 1)
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRecords.value.slice(start, start + pageSize)
})

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function handleFilter() {
  // 筛选由computed自动响应
  currentPage.value = 1 // 筛选变化时重置页码：与V1.1 line 156-158 一致
}

function handleReset() {
  filterType.value = 'all'
  filterStartDate.value = ''
  filterEndDate.value = ''
  currentPage.value = 1
}

function goToPrevPage() {
  if (currentPage.value > 1) currentPage.value -= 1
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

function onClose() {
  emit('close')
}

/**
 * 导出操作记录：与V1.1 OperationRecordPanel.tsx line 75-129 一致
 * 支持 Excel (xlsx/xls) 和 CSV 两种格式
 */
function handleExport(format) {
  if (filteredRecords.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  exportMenuOpen.value = false

  const headers = ['时间', '操作人', '操作类型', '状态', '内容', '备注', '原因']
  const rows = filteredRecords.value.map((r) => [
    formatTime(r.timestamp),
    r.operatorType === 'system' ? '系统' : r.operatorName,
    ACTION_TYPE_LABELS[r.actionType] || (actionConfig[r.actionType] || defaultActionConfig).label,
    STATUS_LABELS[r.status] || r.status || '',
    r.content || '',
    r.comment || '',
    r.reason || '',
  ])

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  let content, mimeType
  let extension = format

  if (format === 'csv') {
    content = headers.join(',') + '\n' + rows.map((row) => row.map((v) => `"${v || ''}"`).join(',')).join('\n')
    mimeType = 'text/csv;charset=utf-8'
  } else {
    // Excel 格式（HTML table 兼容 xls/xlsx）
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((row) => `<tr>${row.map((v) => `<td>${v || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  }

  const fileName = `操作记录_${today}.${extension}`
  const blob = new Blob(['﻿' + content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}
</script>

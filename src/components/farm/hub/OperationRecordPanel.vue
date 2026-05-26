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
        <div class="flex items-center gap-2">
          <el-button size="small" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
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
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">日期:</span>
          <el-date-picker
            v-model="filterDate"
            type="date"
            placeholder="选择日期"
            size="small"
            value-format="YYYY-MM-DD"
            style="width: 150px"
            @change="handleFilter"
          />
        </div>
        <el-button v-if="filterType !== 'all' || filterDate" size="small" @click="handleReset">
          重置
        </el-button>
      </div>

      <!-- 记录列表 -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <div v-if="filteredRecords.length === 0" class="text-center py-12 text-gray-500">
          <el-icon :size="48" class="text-gray-300 mb-4"><Document /></el-icon>
          <p>暂无操作记录</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="record in filteredRecords"
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

      <!-- 底部 - 分页 -->
      <div class="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-500">共 {{ filteredRecords.length }} 条记录</p>
        <div class="flex items-center gap-2">
          <el-button size="small" disabled>上一页</el-button>
          <span class="px-3 py-1 text-sm">第 1/1 页</span>
          <el-button size="small" disabled>下一页</el-button>
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

// 操作类型配置（与V1.1完全一致）
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

const defaultActionConfig = { label: '未知', color: 'bg-gray-100 text-gray-700' }

// 操作类型选项
const actionTypeOptions = [
  { value: 'all', label: '全部操作' },
  ...Object.entries(actionConfig).map(([key, config]) => ({
    value: key,
    label: config.label,
  })),
]

// 筛选状态
const filterType = ref('all')
const filterDate = ref('')

// 过滤后的记录
const filteredRecords = computed(() => {
  let list = props.records
  if (filterType.value !== 'all') {
    list = list.filter((r) => r.actionType === filterType.value)
  }
  if (filterDate.value) {
    list = list.filter((r) => r.timestamp && r.timestamp.startsWith(filterDate.value))
  }
  return list
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
}

function handleReset() {
  filterType.value = 'all'
  filterDate.value = ''
}

function onClose() {
  emit('close')
}

function handleExport() {
  if (filteredRecords.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  const headers = ['时间', '操作人', '操作类型', '内容']
  const rows = filteredRecords.value.map((r) => [
    formatTime(r.timestamp),
    r.operatorType === 'system' ? '系统' : r.operatorName,
    (actionConfig[r.actionType] || defaultActionConfig).label,
    r.content,
  ])
  const csvContent =
    headers.join(',') +
    '\n' +
    rows.map((row) => row.map((v) => `"${v || ''}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `操作记录_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}
</script>

<template>
  <!-- 标签打印弹窗 - 与V1.1 PrintLabelModal.tsx完全一致 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" @click.self="onClose">
    <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><Printer /></el-icon>
          标签打印与导出
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 打印模式选择 -->
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
          <div class="flex gap-4 mb-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <el-radio v-model="printMode" value="single" @change="handleModeChange">
                <span class="text-sm font-medium">单标签打印</span>
              </el-radio>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <el-radio v-model="printMode" value="multi" @change="handleModeChange">
                <span class="text-sm font-medium">多标签打印</span>
              </el-radio>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <el-radio v-model="printMode" value="batch" @change="handleModeChange">
                <span class="text-sm font-medium">批量生成</span>
              </el-radio>
            </label>
          </div>

          <!-- 单标签模式 -->
          <div v-if="printMode === 'single'" class="flex items-center gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">选择标签编号</label>
              <el-select v-model="previewLabel" placeholder="选择标签" class="w-48">
                <el-option v-for="label in allLabelNumbers" :key="label" :label="label" :value="label" />
              </el-select>
            </div>
            <div class="text-xs text-gray-500">共 {{ allLabelNumbers.length }} 个标签</div>
          </div>

          <!-- 多标签模式 -->
          <div v-if="printMode === 'multi'">
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs text-gray-600">选择标签（已选 {{ selectedLabels.length }} 个）</label>
              <el-button link type="primary" size="small" @click="toggleSelectAll">
                {{ selectedLabels.length === allLabelNumbers.length ? '取消全选' : '全选' }}
              </el-button>
            </div>
            <div class="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
              <el-checkbox-group v-model="selectedLabels">
                <el-checkbox v-for="label in allLabelNumbers.slice(0, 100)" :key="label" :value="label" class="block">
                  {{ label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <div v-if="allLabelNumbers.length > 100" class="text-xs text-gray-500 mt-2">
              共 {{ allLabelNumbers.length }} 个标签，已显示前100个
            </div>
          </div>

          <!-- 批量生成模式 -->
          <div v-if="printMode === 'batch'" class="flex items-center gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">生成数量</label>
              <el-input-number v-model="batchCount" :min="1" :max="remainingCount" />
            </div>
            <div class="text-xs text-gray-500">
              将生成 {{ batchCount }} 个标签（可用库存：{{ remainingCount }}，已生成：{{ allLabelNumbers.length }}）
            </div>
          </div>
        </div>

        <!-- 操作人员和模板选择 -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-gray-700 text-sm mb-1">操作人员</label>
            <div class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">{{ currentOperator }}</div>
          </div>
          <div>
            <label class="block text-gray-700 text-sm mb-1">模板选择</label>
            <el-select v-model="template" class="w-full">
              <el-option label="小标签" value="small" />
              <el-option label="大标签" value="large" />
              <el-option label="详情标签" value="detail" />
            </el-select>
          </div>
        </div>

        <!-- 标签预览 -->
        <div class="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-gray-50">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">标签预览 {{ previewLabel && `- ${previewLabel}` }}</span>
          </div>
          <div class="flex justify-center">
            <!-- 小标签模板 -->
            <div v-if="template === 'small'" class="flex flex-col items-center print-label">
              <div class="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                <!-- 二维码占位 - V2.0使用SVG图标代替 -->
                <div class="w-20 h-20 flex items-center justify-center bg-gray-100 rounded">
                  <el-icon size="48" color="#999"><Coin /></el-icon>
                </div>
              </div>
              <div class="mt-2 text-center">
                <div class="text-sm font-bold text-gray-900">{{ previewLabel || record?.plantCode }}</div>
                <div class="text-xs text-gray-600">{{ record?.cropName }}</div>
              </div>
            </div>

            <!-- 大标签模板 -->
            <div v-else-if="template === 'large'" class="flex flex-col items-center print-label">
              <div class="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                <div class="w-24 h-24 flex items-center justify-center bg-gray-100 rounded">
                  <el-icon size="64" color="#999"><Coin /></el-icon>
                </div>
              </div>
              <div class="mt-3 text-center">
                <div class="text-lg font-bold text-gray-900">{{ previewLabel || record?.plantCode }}</div>
                <div class="text-sm text-gray-600 mt-1">{{ record?.cropName }} - {{ record?.cropVariety }}</div>
              </div>
            </div>

            <!-- 详情标签模板 -->
            <div v-else class="flex print-label bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
              <div class="flex-shrink-0">
                <div class="w-24 h-24 flex items-center justify-center bg-gray-100 rounded">
                  <el-icon size="64" color="#999"><Coin /></el-icon>
                </div>
              </div>
              <div class="ml-4 flex flex-col justify-center">
                <div class="text-lg font-bold text-gray-900 mb-2">{{ previewLabel || record?.plantCode }}</div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div class="text-gray-500">作物名称：</div>
                  <div class="text-gray-900 font-medium">{{ record?.cropName }}</div>
                  <div class="text-gray-500">作物品种：</div>
                  <div class="text-gray-900">{{ record?.cropVariety }}</div>
                  <div class="text-gray-500">种植区域：</div>
                  <div class="text-gray-900">{{ record?.areaName }}</div>
                  <div class="text-gray-500">种植批号：</div>
                  <div class="text-gray-900 font-mono text-xs">{{ record?.plantCode }}</div>
                </div>
              </div>
              <div class="ml-4 flex flex-col justify-center border-l border-gray-200 pl-4">
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div class="text-gray-500">种植数量：</div>
                  <div class="text-emerald-600 font-bold">{{ record?.plantingCount?.toLocaleString() }}</div>
                  <div class="text-gray-500">种植日期：</div>
                  <div class="text-gray-900">{{ record?.plantingDate }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button @click="handleExportExcel">导出Excel</el-button>
        <el-button type="primary" @click="handlePrint">打印</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Printer, Close, Money } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})

const emit = defineEmits(['close', 'print', 'export'])

const printMode = ref('single')
const template = ref('detail')
const previewLabel = ref('')
const selectedLabels = ref([])
const batchCount = ref(1)
const loading = ref(false)

// 生成所有标签编号
const allLabelNumbers = computed(() => {
  if (!props.record?.plantCode || !props.record?.plantingCount) return []
  const nums = []
  const maxLabels = Math.min(props.record.plantingCount, 200)
  for (let i = 0; i < maxLabels; i++) {
    nums.push(`${props.record.plantCode}-${String(i + 1).padStart(4, '0')}`)
  }
  return nums
})

// 剩余可用数量
const remainingCount = computed(() => {
  if (!props.record) return 0
  return props.record.plantingCount || 0
})

// 当前操作员
const currentOperator = computed(() => {
  return localStorage.getItem('username') || '系统管理员'
})

watch(() => props.isOpen, (val) => {
  if (val && props.record) {
    printMode.value = 'single'
    template.value = 'detail'
    previewLabel.value = allLabelNumbers.value[0] || ''
    selectedLabels.value = []
    batchCount.value = 1
  }
})

const handleModeChange = () => {
  selectedLabels.value = []
}

const toggleSelectAll = () => {
  if (selectedLabels.value.length === allLabelNumbers.value.length) {
    selectedLabels.value = []
  } else {
    selectedLabels.value = [...allLabelNumbers.value]
  }
}

const onClose = () => {
  emit('close')
}

const handlePrint = () => {
  if (printMode.value === 'single' && !previewLabel.value) {
    ElMessage.warning('请选择要打印的标签')
    return
  }
  if (printMode.value === 'multi' && selectedLabels.value.length === 0) {
    ElMessage.warning('请选择要打印的标签')
    return
  }
  emit('print', {
    mode: printMode.value,
    labels: printMode.value === 'single' ? [previewLabel.value] : selectedLabels.value,
    count: batchCount.value
  })
}

const handleExportExcel = () => {
  loading.value = true
  try {
    let labelsToExport = []

    if (printMode.value === 'single' && previewLabel.value) {
      labelsToExport = [previewLabel.value]
    } else if (printMode.value === 'multi' && selectedLabels.value.length > 0) {
      labelsToExport = selectedLabels.value
    } else {
      const startIdx = allLabelNumbers.value.length
      for (let i = 0; i < batchCount.value; i++) {
        labelsToExport.push(`${props.record.plantCode}-${String(startIdx + i + 1).padStart(4, '0')}`)
      }
    }

    if (labelsToExport.length === 0) {
      ElMessage.warning('没有可导出的标签')
      return
    }

    const baseUrl = 'https://tm-crop.com/ResumeTimeline'
    const rows = labelsToExport.map((label, i) => ({
      index: i + 1,
      label,
      url: `${baseUrl}?labelID=${encodeURIComponent(label)}`,
    }))

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>种植标签打印</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  body { font-family: 'Microsoft YaHei', sans-serif; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #999; padding: 8px 10px; text-align: center; vertical-align: middle; }
  th { background-color: #059669; color: #fff; font-weight: bold; }
  td a { color: #2563eb; text-decoration: underline; }
  tr:nth-child(even) { background-color: #f9fafb; }
  .print-btn { display: inline-block; margin: 10px; padding: 8px 16px; background: #059669; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
  @media print { .no-print { display: none; } }
</style></head><body>
  <div class="no-print" style="text-align:center;padding:10px;">
    <button class="print-btn" onclick="window.print()">打印此页</button>
    <span style="color:#666;font-size:12px;">共 ${rows.length} 个标签 | 扫描功能码为URL链接，可用在线工具生成QR码</span>
  </div>
  <table>
    <thead><tr>
      <th>序号</th>
      <th>作物名称</th>
      <th>种植区域</th>
      <th>扫描功能码</th>
      <th>种植批号</th>
      <th>种植日期</th>
    </tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td>${r.index}</td>
      <td>${props.record?.cropName}</td>
      <td>${props.record?.areaName || '-'}</td>
      <td><a href="${r.url}" target="_blank">${r.url}</a></td>
      <td style="font-family:monospace;font-size:11px;">${r.label}</td>
      <td>${props.record?.plantingDate || '-'}</td>
    </tr>`).join('')}</tbody>
  </table>
</body></html>`

    const blob = new Blob(['﻿' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `种植标签_${props.record?.cropName}_${new Date().toISOString().slice(0, 10)}.xls`
    a.click()
    URL.revokeObjectURL(url)

    emit('export', {
      mode: printMode.value,
      labels: labelsToExport,
      count: batchCount.value
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.print-label {
  width: 160px;
}
</style>

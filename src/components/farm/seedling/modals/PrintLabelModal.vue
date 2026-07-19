<template>
  <!-- 2026-07-19 修复：用原生 el-dialog 关闭按钮（避免 v-dialog-draggable 拦截 mousedown） -->
  <el-dialog
    :model-value="visible"
    title="标签打印与导出"
    width="1170px"
    top="5vh"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="true"
    close-icon="Close"
    class="print-label-modal"
    style="max-width: calc(100vw - 40px)"
    v-dialog-draggable
    v-dialog-resizable
    v-dialog-maximizable
    @update:model-value="onModelValueChange"
    @close="handleClose"
  >
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <el-icon :size="20" style="color: white;"><Printer /></el-icon>
          <h3 class="text-lg font-semibold text-white">标签打印与导出</h3>
        </div>
      </div>
    </template>

    <!-- 内容区域 -->
    <div class="overflow-y-auto p-2">
        <div class="space-y-4" v-if="record">
          <!-- 打印模式选择（对齐 V1.1 L381-410 PRINT_MODE_MAP 卡片按钮风格，emerald 主题色 + gap-2） -->
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div
                v-for="mode in PRINT_MODES"
                :key="mode.value"
                @click="setPrintMode(mode.value)"
                :class="[
                  'px-3 py-2 rounded-lg border-2 text-left cursor-pointer transition-all',
                  printMode === mode.value
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                ]"
                :title="mode.desc"
              >
                <div class="flex items-center gap-1.5">
                  <span class="text-base">{{ mode.icon }}</span>
                  <span :class="['text-sm', printMode === mode.value ? 'font-semibold text-emerald-800' : 'font-medium text-gray-700']">
                    {{ mode.label }}
                  </span>
                </div>
                <div :class="['text-xs mt-0.5', printMode === mode.value ? 'text-emerald-700' : 'text-gray-500']">
                  {{ mode.sublabel }}
                </div>
              </div>
            </div>

            <!-- 单标签模式 -->
            <div v-if="printMode === 'single'" class="flex items-center gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">选择标签编号</label>
                <el-select v-model="previewLabel" placeholder="选择标签" class="w-48" @change="generatePreviewQrCode">
                  <el-option
                    v-for="label in allLabelNumbers"
                    :key="label"
                    :label="label"
                    :value="label"
                  />
                </el-select>
              </div>
              <div class="text-xs text-gray-500">共 {{ allLabelNumbers.length }} 个标签</div>
            </div>

            <!-- 多标签模式（对齐 V1.1 grid grid-cols-4 gap-1） -->
            <div v-if="printMode === 'multi'">
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs text-gray-600">选择标签（已选 {{ selectedLabels.length }} 个）</label>
                <el-button link type="primary" size="small" @click="toggleSelectAll">
                  {{ selectedLabels.length === allLabelNumbers.length ? '取消全选' : '全选' }}
                </el-button>
              </div>
              <div class="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
                <div class="grid grid-cols-4 gap-1">
                  <label
                    v-for="label in allLabelNumbers.slice(0, 100)"
                    :key="label"
                    :class="['flex items-center gap-1 p-1 rounded cursor-pointer text-xs', selectedLabels.includes(label) ? 'bg-blue-100' : 'hover:bg-gray-50']"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedLabels.includes(label)"
                      @change="toggleLabel(label)"
                      class="w-3 h-3"
                    />
                    <span class="truncate">{{ label }}</span>
                  </label>
                </div>
                <div v-if="allLabelNumbers.length > 100" class="text-xs text-gray-500 mt-2">
                  共 {{ allLabelNumbers.length }} 个标签，已显示前100个
                </div>
              </div>
            </div>

            <!-- 批量生成模式 -->
            <div v-if="printMode === 'batch'" class="space-y-2">
              <!-- 2026-07-18 P0-DIFF-004：标签类型（批量/逐株，V1.1 L59 labelType 1:1） -->
              <div>
                <label class="block text-xs text-gray-600 mb-1">标签类型</label>
                <el-radio-group v-model="labelType">
                  <el-radio value="batch">批量（统一数量）</el-radio>
                  <el-radio value="per_plant">逐株（每行单独指定）</el-radio>
                </el-radio-group>
              </div>
              <!-- 批量模式：统一数量 -->
              <div v-if="labelType === 'batch'" class="flex items-center gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">生成数量</label>
                  <el-input-number
                    v-model="printCount"
                    :min="1"
                    :max="remainingCount"
                    class="w-24"
                  />
                </div>
                <div class="text-xs text-gray-500">
                  将生成 {{ printCount }} 个标签（剩余：{{ remainingCount }}，已打印：{{ allLabelNumbers.length }}）
                </div>
                <!-- 2026-07-18 P0-DIFF-004：每标签株数（V1.1 L61 labelQuantity） -->
                <div>
                  <label class="block text-xs text-gray-600 mb-1">每标签株数</label>
                  <el-input-number v-model="labelQuantity" :min="1" class="w-20" />
                </div>
              </div>
              <!-- 逐株模式：每行单独指定数量（V1.1 L63 mixedQuantities 1:1） -->
              <div v-else class="space-y-2">
                <label class="block text-xs text-gray-600">逐株数量配置</label>
                <div
                  v-for="(num, idx) in perPlantRows"
                  :key="idx"
                  class="flex items-center gap-2"
                >
                  <span class="text-xs text-gray-500 w-16">第 {{ idx + 1 }} 株</span>
                  <el-input-number v-model="perPlantRows[idx]" :min="1" class="w-20" />
                  <span class="text-xs text-gray-500">株</span>
                </div>
                <el-button size="small" @click="perPlantRows.push(1)">+ 添加一行</el-button>
              </div>
            </div>
          </div>

          <!-- 模板选择 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">操作人员</label>
              <div class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">{{ currentOperator }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">模板选择</label>
              <el-select v-model="selectedTemplate" class="w-full" @change="onTemplateChange">
                <el-option label="小标签" value="small" />
                <el-option label="大标签" value="large" />
                <el-option label="详情标签" value="detail" />
              </el-select>
            </div>
          </div>

          <!-- 标签预览（对齐 V1.1 border-dashed border-gray-400） -->
          <div class="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-gray-50">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">标签预览 {{ previewLabel && `- ${previewLabel}` }}</span>
            </div>
            <div class="flex justify-center">
              <!-- 小标签 -->
              <div v-if="selectedTemplate === 'small'" class="flex flex-col items-center print-label">
                <div class="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                  <img v-if="previewQrCodeUrl" :src="previewQrCodeUrl" class="w-20 h-20" alt="QR Code" />
                  <div v-else class="w-20 h-20 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    加载中...
                  </div>
                </div>
                <div class="mt-2 text-center">
                  <div class="text-sm font-bold text-gray-900">{{ previewLabel || record.seedlingCode }}</div>
                  <div class="text-xs text-gray-600">{{ record.cropName }}</div>
                </div>
              </div>

              <!-- 大标签 -->
              <div v-else-if="selectedTemplate === 'large'" class="flex flex-col items-center print-label">
                <div class="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                  <img v-if="previewQrCodeUrl" :src="previewQrCodeUrl" class="w-24 h-24" alt="QR Code" />
                  <div v-else class="w-24 h-24 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    加载中...
                  </div>
                </div>
                <div class="mt-3 text-center">
                  <div class="text-lg font-bold text-gray-900">{{ previewLabel || record.seedlingCode }}</div>
                  <div class="text-sm text-gray-600 mt-1">{{ record.cropName }} - {{ record.cropVariety }}</div>
                </div>
              </div>

              <!-- 详情标签 -->
              <div v-else class="flex print-label bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                <div class="flex-shrink-0">
                  <img v-if="previewQrCodeUrl" :src="previewQrCodeUrl" class="w-24 h-24" alt="QR Code" />
                  <div v-else class="w-24 h-24 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    加载中...
                  </div>
                </div>
                <div class="ml-4 flex flex-col justify-center">
                  <div class="text-lg font-bold text-gray-900 mb-2">{{ previewLabel || record.seedlingCode }}</div>
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div class="text-gray-500">作物名称：</div>
                    <div class="text-gray-900 font-medium">{{ record.cropName }}</div>
                    <div class="text-gray-500">作物品种：</div>
                    <div class="text-gray-900">{{ record.cropVariety }}</div>
                    <div class="text-gray-500">场地：</div>
                    <div class="text-gray-900">{{ record.siteName }}</div>
                    <div class="text-gray-500">种源批号：</div>
                    <div class="text-gray-900 font-mono text-xs">{{ record.sourceCode }}</div>
                  </div>
                </div>
                <div class="ml-4 flex flex-col justify-center border-l border-gray-200 pl-4">
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div class="text-gray-500">初始数量：</div>
                    <div class="text-gray-900">{{ record.initialCount?.toLocaleString() }}</div>
                    <div class="text-gray-500">剩余数量：</div>
                    <div class="text-emerald-600 font-bold">{{ remainingCount.toLocaleString() }}</div>
                    <div class="text-gray-500">成活率：</div>
                    <div class="text-emerald-600">{{ record.survivalRate }}%</div>
                    <div class="text-gray-500">育苗日期：</div>
                    <div class="text-gray-900">{{ record.startDate }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <template #footer>
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div></div>
        <div class="flex gap-2">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" plain @click="handleExportExcel" :loading="loading">
            <el-icon style="color: inherit;"><Download /></el-icon>
            导出Excel
          </el-button>
          <el-button type="primary" @click="handlePrint" :loading="loading">
            <el-icon style="color: inherit;"><Printer /></el-icon>
            {{ loading ? '处理中...' : '打印' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 打印容器（隐藏，仅用于打印） -->
  <div v-if="showPrintContainer" class="print-container">
    <div v-for="item in printItems" :key="item.label" class="print-label-card">
      <div class="bg-white p-3 border border-gray-400 rounded-lg">
        <img :src="item.qrCodeUrl" alt="QR Code" />
      </div>
      <div style="text-align: center; margin-top: 4px;">
        <div style="font-size: 11px; font-weight: bold; font-family: monospace;">{{ item.label }}</div>
        <div style="font-size: 9px; color: #666;">{{ record?.cropName }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Printer, Close, Download } from '@element-plus/icons-vue'
import QRCode from 'qrcode'

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'close'])

// el-dialog modelValue 变化处理（v-model="visible" 改为 :model-value + @update:model-value）
const onModelValueChange = (val) => {
  if (!val) {
    emit('update:visible', false)
  }
}

const loading = ref(false)
const printMode = ref('single')
const printCount = ref(1)
// 2026-07-18 P0-DIFF-004：逐株模式字段（V1.1 labelType / labelQuantity / mixedQuantities 1:1）
const labelType = ref('batch')
const labelQuantity = ref(1)
const perPlantRows = ref([1, 1, 1])
const selectedLabels = ref([])
const previewLabel = ref('')
const allLabelNumbers = ref([])
// 2026-07-19 修复：变量名 template 与 Vue 3 reserved word 冲突，改名为 selectedTemplate
const selectedTemplate = ref('detail')
const currentOperator = ref(localStorage.getItem('username') || '系统管理员')
const previewQrCodeUrl = ref('')
const showPrintContainer = ref(false)
const printItems = ref([])

const QR_CODE_OPTIONS = {
  width: 100,
  margin: 1,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
}

// 打印模式字典（对齐 V1.1 PRINT_MODE_MAP）
const PRINT_MODES = [
  { value: 'single', label: '单标签打印', sublabel: '重打 1 个已存在', desc: '从已有标签中选择 1 个重新打印（适合标签褪色/丢失后补打）', icon: '🏷️' },
  { value: 'multi',  label: '多标签打印', sublabel: '批量勾选已存在', desc: '从已有标签列表中勾选多个一并打印（适合整批补打）', icon: '📋' },
  { value: 'batch',  label: '批量生成',   sublabel: '生成新标签',      desc: '系统生成新的标签编号 + 同步入库 + 打印（适合首次打标签）', icon: '✨' }
]

// 切换打印模式（同时清空已选标签，对齐 V1.1）
const setPrintMode = (mode) => {
  printMode.value = mode
  selectedLabels.value = []
}

// 剩余数量
const remainingCount = computed(() => {
  if (!props.record) return 0
  return (props.record.initialCount || 0) - (props.record.lossCount || 0)
})

// 生成二维码内容
const getQrCodeValue = (label) => {
  if (!props.record) return ''
  return JSON.stringify({
    type: 'seedling',
    code: label,
    cropName: props.record.cropName,
    cropVariety: props.record.cropVariety,
    siteName: props.record.siteName,
    startDate: props.record.startDate
  })
}

// 模板切换（@change 事件）
const onTemplateChange = () => {
  generatePreviewQrCode()
}

// 生成预览二维码
const generatePreviewQrCode = async () => {
  if (!previewLabel.value) {
    previewQrCodeUrl.value = ''
    return
  }
  try {
    const value = getQrCodeValue(previewLabel.value)
    const size = selectedTemplate.value === 'small' ? 80 : selectedTemplate.value === 'large' ? 100 : 100
    const url = await QRCode.toDataURL(value, { ...QR_CODE_OPTIONS, width: size })
    previewQrCodeUrl.value = url
  } catch (error) {
    console.error('生成二维码失败:', error)
    previewQrCodeUrl.value = ''
  }
}

// 初始化标签编号
watch(() => props.visible, async (val) => {
  if (val && props.record) {
    // 生成标签编号列表
    const labels = []
    const count = Math.min(props.record.survivalCount || 0, 100)
    for (let i = 0; i < count; i++) {
      labels.push(`${props.record.seedlingCode}-${String(i + 1).padStart(4, '0')}`)
    }
    allLabelNumbers.value = labels
    // 2026-07-19 修复：即使 survivalCount=0 也要显示预览二维码（用 seedlingCode 兜底）
    previewLabel.value = labels[0] || `${props.record.seedlingCode}-0001`
    selectedLabels.value = []
    printMode.value = 'single'
    printCount.value = 1

    // 生成预览二维码
    await nextTick()
    generatePreviewQrCode()
  }
}, { immediate: true })

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedLabels.value.length === allLabelNumbers.value.length) {
    selectedLabels.value = []
  } else {
    selectedLabels.value = [...allLabelNumbers.value]
  }
}

// 单个标签切换（对齐 V1.1 toggleLabel）
const toggleLabel = (label) => {
  selectedLabels.value = selectedLabels.value.includes(label)
    ? selectedLabels.value.filter(l => l !== label)
    : [...selectedLabels.value, label]
}

// 关闭弹窗（统一入口：右上角 X / footer 取消 / ESC / 遮罩 都走这里）
const handleClose = () => {
  emit('update:visible', false)
}

// 打印处理
const handlePrint = async () => {
  loading.value = true
  try {
    let labelsToPrint = []

    if (printMode.value === 'single') {
      if (!previewLabel.value) {
        ElMessage.warning('请选择要打印的标签')
        return
      }
      labelsToPrint = [previewLabel.value]
    } else if (printMode.value === 'multi') {
      if (selectedLabels.value.length === 0) {
        ElMessage.warning('请选择要打印的标签')
        return
      }
      labelsToPrint = [...selectedLabels.value]
    } else {
      // 批量生成模式
      const startIdx = allLabelNumbers.value.length
      for (let i = 0; i < printCount.value; i++) {
        labelsToPrint.push(`${props.record.seedlingCode}-${String(startIdx + i + 1).padStart(4, '0')}`)
      }
      // 刷新标签列表
      const totalCount = allLabelNumbers.value.length + printCount.value
      const refreshed = []
      const maxShow = Math.min(totalCount, 100)
      for (let i = 0; i < maxShow; i++) {
        refreshed.push(`${props.record.seedlingCode}-${String(i + 1).padStart(4, '0')}`)
      }
      allLabelNumbers.value = refreshed
    }

    if (labelsToPrint.length === 0) {
      ElMessage.warning('没有可打印的标签')
      return
    }

    // 生成所有标签的二维码
    const items = []
    for (const label of labelsToPrint) {
      const value = getQrCodeValue(label)
      const qrCodeUrl = await QRCode.toDataURL(value, QR_CODE_OPTIONS)
      items.push({ label, qrCodeUrl })
    }
    printItems.value = items
    showPrintContainer.value = true

    // 等待 DOM 更新后触发打印
    await nextTick()
    setTimeout(() => {
      window.print()
      showPrintContainer.value = false
      printItems.value = []
      ElMessage.success('打印任务已发送')
      handleClose()
    }, 200)
  } catch (error) {
    console.error('打印失败:', error)
    ElMessage.error('打印失败')
  } finally {
    loading.value = false
  }
}

// 导出Excel
const handleExportExcel = async () => {
  loading.value = true
  try {
    let labelsToExport = []

    if (printMode.value === 'single' && previewLabel.value) {
      labelsToExport = [previewLabel.value]
    } else if (printMode.value === 'multi' && selectedLabels.value.length > 0) {
      labelsToExport = selectedLabels.value
    } else {
      // 批量模式：生成本地编号
      for (let i = 0; i < printCount.value; i++) {
        labelsToExport.push(`${props.record.seedlingCode}-${String(i + 1).padStart(4, '0')}`)
      }
    }

    if (labelsToExport.length === 0) {
      ElMessage.warning('没有可导出的标签')
      return
    }

    // 构建HTML表格导出
    const baseUrl = 'https://tm-crop.com/ResumeTimeline'
    const rows = labelsToExport.map((label, i) => ({
      index: i + 1,
      label,
      url: `${baseUrl}?labelID=${encodeURIComponent(label)}`,
    }))

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>育苗标签打印</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    body { font-family: 'Microsoft YaHei', sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #999; padding: 8px 10px; text-align: center; vertical-align: middle; }
    th { background-color: #059669; color: #fff; font-weight: bold; }
    td a { color: #2563eb; text-decoration: underline; }
    tr:nth-child(even) { background-color: #f9fafb; }
  </style>
</head>
<body>
  <table>
    <thead>
      <tr>
        <th>序号</th>
        <th>作物名称</th>
        <th>大棚位置</th>
        <th>扫描功能码</th>
        <th>种植序号</th>
        <th>种植日期</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td>${r.index}</td>
          <td>${props.record.cropName}</td>
          <td>${props.record.siteName}</td>
          <td><a href="${r.url}" target="_blank">${r.url}</a></td>
          <td style="font-family:monospace;font-size:11px;">${r.label}</td>
          <td>${props.record.startDate}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`

    const blob = new Blob(['﻿' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `育苗标签_${props.record.cropName}_${new Date().toISOString().slice(0, 10)}.xls`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* 2026-07-19 修复：Footer 固定在弹窗底部（对齐 V1.1 Modal.tsx 的 flex-shrink-0 行为）
   注意：必须用非 scoped，因为 el-dialog Teleport 到 body 后脱离了组件作用域 */
.print-label-modal.el-dialog {
  display: flex !important;
  flex-direction: column !important;
  max-height: 90vh !important;
}
.print-label-modal .el-dialog__body {
  flex: 1 1 auto !important;
  overflow-y: auto !important;
  min-height: 0 !important;  /* 关键：让 flex 子项能被压缩 */
  padding: 16px 24px !important;
}
.print-label-modal .el-dialog__footer {
  flex-shrink: 0 !important;
  border-top: 1px solid #e5e7eb !important;
  background: #f9fafb !important;
  padding: 12px 24px !important;
  margin: 0 !important;
}
.print-label-modal .el-dialog__header {
  flex-shrink: 0 !important;
  padding: 0 !important;
}

/* 打印样式 */
@media print {
  @page {
    margin: 10mm;
  }

  /* 隐藏非打印内容 */
  body * {
    visibility: hidden;
  }

  /* 只显示打印容器 */
  .print-container,
  .print-container * {
    visibility: visible;
  }

  .print-container {
    display: flex !important;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    align-content: flex-start;
    gap: 16px;
    padding: 20px;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .print-label-card {
    break-inside: avoid;
    page-break-inside: avoid;
    text-align: center;
  }
}
</style>

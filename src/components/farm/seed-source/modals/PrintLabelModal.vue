<template>
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">标签打印与导出</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- 打印模式选择 -->
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex gap-4 mb-4">
            <el-radio-group v-model="printMode" @change="handleModeChange">
              <el-radio value="single">单标签打印</el-radio>
              <el-radio value="multi">多标签打印</el-radio>
              <el-radio value="batch">批量生成</el-radio>
            </el-radio-group>
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
              <div class="grid grid-cols-4 gap-1">
                <label
                  v-for="label in allLabelNumbers.slice(0, 100)"
                  :key="label"
                  :class="['flex items-center gap-1 p-1 rounded cursor-pointer text-xs', selectedLabels.includes(label) ? 'bg-blue-100' : 'hover:bg-gray-50']"
                >
                  <el-checkbox v-model="selectedLabels" :value="label" size="small" />
                  <span class="truncate">{{ label }}</span>
                </label>
              </div>
              <div v-if="allLabelNumbers.length > 100" class="text-xs text-gray-500 mt-2">
                共 {{ allLabelNumbers.length }} 个标签，已显示前100个
              </div>
            </div>
          </div>

          <!-- 批量生成模式 -->
          <div v-if="printMode === 'batch'" class="flex items-center gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">生成数量</label>
              <el-input-number v-model="printCount" :min="1" :max="remainingCount" size="default" />
            </div>
            <div class="text-xs text-gray-500">
              将生成 {{ printCount }} 个标签（可用库存：{{ remainingCount }}，已打印：{{ allLabelNumbers.length }}）
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
            <el-select v-model="template" class="w-full">
              <el-option label="小标签" value="small" />
              <el-option label="大标签" value="large" />
              <el-option label="详情标签" value="detail" />
            </el-select>
          </div>
        </div>

        <!-- 标签预览 -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">标签预览 {{ previewLabel && `- ${previewLabel}` }}</span>
          </div>
          <div class="flex justify-center">
            <!-- 小标签 -->
            <div v-if="template === 'small'" class="flex flex-col items-center print-label">
              <div class="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                <canvas ref="qrcodeSmallRef" class="qrcode-canvas"></canvas>
              </div>
              <div class="mt-2 text-center">
                <div class="text-sm font-bold text-gray-900">{{ previewLabel || record?.seedCode }}</div>
                <div class="text-xs text-gray-600">{{ record?.cropName }}</div>
              </div>
            </div>

            <!-- 大标签 -->
            <div v-else-if="template === 'large'" class="flex flex-col items-center print-label">
              <div class="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                <canvas ref="qrcodeLargeRef" class="qrcode-canvas"></canvas>
              </div>
              <div class="mt-3 text-center">
                <div class="text-lg font-bold text-gray-900">{{ previewLabel || record?.seedCode }}</div>
                <div class="text-sm text-gray-600 mt-1">{{ record?.cropName }} - {{ record?.cropVariety }}</div>
              </div>
            </div>

            <!-- 详情标签 -->
            <div v-else class="flex bg-white p-4 border border-gray-200 rounded-lg shadow-sm print-label">
              <div class="flex-shrink-0">
                <canvas ref="qrcodeDetailRef" class="qrcode-canvas"></canvas>
              </div>
              <div class="ml-4 flex flex-col justify-center">
                <div class="text-lg font-bold text-gray-900 mb-2">{{ previewLabel || record?.seedCode }}</div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div class="text-gray-500">作物名称：</div>
                  <div class="text-gray-900 font-medium">{{ record?.cropName }}</div>
                  <div class="text-gray-500">作物品种：</div>
                  <div class="text-gray-900">{{ record?.cropVariety }}</div>
                  <div class="text-gray-500">供应商：</div>
                  <div class="text-gray-900">{{ record?.supplierName }}</div>
                  <div class="text-gray-500">种源批号：</div>
                  <div class="text-gray-900 font-mono text-xs">{{ record?.seedCode }}</div>
                </div>
              </div>
              <div class="ml-4 flex flex-col justify-center border-l border-gray-200 pl-4">
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div class="text-gray-500">可用数量：</div>
                  <div class="text-emerald-600 font-bold">{{ record?.availableCount?.toLocaleString() }}</div>
                  <div class="text-gray-500">采购日期：</div>
                  <div class="text-gray-900">{{ record?.purchaseDate }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="handleExportExcel">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
        <el-button type="primary" @click="handlePrint" :loading="loading">
          {{ loading ? '处理中...' : '打印' }}
        </el-button>
      </div>

      <!-- 打印容器 -->
      <div id="print-container" style="display: none;">
        <div v-for="(label, index) in printLabels" :key="index" class="print-label-card">
          <div class="print-qr-wrapper">
            <canvas :ref="el => setPrintQrRef(el, index)" class="qrcode-canvas"></canvas>
          </div>
          <div class="print-label-text">
            <div class="print-label-code">{{ label }}</div>
            <div class="print-label-name">{{ record?.cropName }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Download } from '@element-plus/icons-vue'
import QRCode from 'qrcode'

const props = defineProps({
  visible: Boolean,
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

const loading = ref(false)
const template = ref('detail')
const printMode = ref('single')
const printCount = ref(1)
const previewLabel = ref('')
const selectedLabels = ref([])
const printLabels = ref([])

// 二维码Canvas引用
const qrcodeSmallRef = ref(null)
const qrcodeLargeRef = ref(null)
const qrcodeDetailRef = ref(null)
const printQrRefs = ref([])

// 当前操作员
const currentOperator = ref('系统管理员')

// 剩余可用数量
const remainingCount = computed(() => props.record?.availableCount || 0)

// 所有标签编号列表
const allLabelNumbers = computed(() => {
  if (!props.record?.seedCode || !props.record?.availableCount) return []
  const seedCode = props.record.seedCode
  const count = Math.min(props.record.availableCount, 200)
  const nums = []
  for (let i = 0; i < count; i++) {
    nums.push(`${seedCode}-${String(i + 1).padStart(4, '0')}`)
  }
  return nums
})

// 生成二维码内容
const getQrCodeValue = (label) => {
  if (!props.record) return ''
  return JSON.stringify({
    type: 'seed-source',
    code: label,
    seedCode: props.record.seedCode,
    cropCode: props.record.cropCode,
    cropName: props.record.cropName,
    variety: props.record.cropVariety,
    quantity: props.record.availableCount,
    supplier: props.record.supplierName,
    date: props.record.purchaseDate
  })
}

// 渲染二维码到canvas
const renderQRCode = async (canvas, value, size) => {
  if (!canvas || !value) return
  try {
    await QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (err) {
    console.error('QRCode render error:', err)
  }
}

// 渲染预览二维码
const renderPreviewQR = async () => {
  await nextTick()
  const value = previewLabel.value ? getQrCodeValue(previewLabel.value) : ''
  if (!value) return

  if (template.value === 'small' && qrcodeSmallRef.value) {
    await renderQRCode(qrcodeSmallRef.value, value, 80)
  } else if (template.value === 'large' && qrcodeLargeRef.value) {
    await renderQRCode(qrcodeLargeRef.value, value, 100)
  } else if (template.value === 'detail' && qrcodeDetailRef.value) {
    await renderQRCode(qrcodeDetailRef.value, value, 100)
  }
}

// 设置打印二维码引用
const setPrintQrRef = (el, index) => {
  if (el) {
    printQrRefs.value[index] = el
  }
}

// 监听 visible 变化 - 初始化
watch(() => props.visible, async (val) => {
  if (val && props.record) {
    // 重置状态
    previewLabel.value = allLabelNumbers.value[0] || ''
    selectedLabels.value = []
    printCount.value = 1
    printLabels.value = []
    printQrRefs.value = []

    // 延迟渲染预览二维码
    setTimeout(() => {
      renderPreviewQR()
    }, 100)
  }
}, { immediate: true })

// 监听 previewLabel 变化
watch(previewLabel, () => {
  if (props.visible) {
    renderPreviewQR()
  }
})

// 监听 template 变化
watch(template, () => {
  if (props.visible && previewLabel.value) {
    renderPreviewQR()
  }
})

// 模式变化处理
const handleModeChange = () => {
  selectedLabels.value = []
  printCount.value = 1
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedLabels.value.length === allLabelNumbers.value.length) {
    selectedLabels.value = []
  } else {
    selectedLabels.value = [...allLabelNumbers.value]
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
}

// 导出Excel
const handleExportExcel = () => {
  let labelsToExport = []

  if (printMode.value === 'single' && previewLabel.value) {
    labelsToExport = [previewLabel.value]
  } else if (printMode.value === 'multi' && selectedLabels.value.length > 0) {
    labelsToExport = selectedLabels.value
  } else {
    const startIdx = allLabelNumbers.value.length
    for (let i = 0; i < printCount.value; i++) {
      labelsToExport.push(`${props.record.seedCode}-${String(startIdx + i + 1).padStart(4, '0')}`)
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

  const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>种源标签打印</title>
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
    <span style="color:#666;font-size:12px;">共 ${rows.length} 个标签</span>
  </div>
  <table>
    <thead><tr>
      <th>序号</th><th>作物名称</th><th>供应商</th><th>扫描功能码</th><th>种源批号</th><th>采购日期</th>
    </tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td>${r.index}</td>
      <td>${props.record?.cropName || '-'}</td>
      <td>${props.record?.supplierName || '-'}</td>
      <td><a href="${r.url}" target="_blank">${r.url}</a></td>
      <td style="font-family:monospace;font-size:11px;">${r.label}</td>
      <td>${props.record?.purchaseDate || '-'}</td>
    </tr>`).join('')}</tbody>
  </table>
</body></html>`

  const blob = new Blob(['﻿' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `种源标签_${props.record?.cropName}_${new Date().toISOString().slice(0, 10)}.xls`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 打印
const handlePrint = async () => {
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
    const startIdx = allLabelNumbers.value.length
    for (let i = 0; i < printCount.value; i++) {
      labelsToPrint.push(`${props.record.seedCode}-${String(startIdx + i + 1).padStart(4, '0')}`)
    }
  }

  loading.value = true
  printLabels.value = labelsToPrint
  printQrRefs.value = []

  // 等待DOM更新
  await nextTick()
  // 额外等待canvas渲染
  await new Promise(resolve => setTimeout(resolve, 200))

  // 绘制所有二维码
  for (let i = 0; i < printLabels.value.length; i++) {
    const canvas = printQrRefs.value[i]
    if (canvas) {
      const value = getQrCodeValue(printLabels.value[i])
      await renderQRCode(canvas, value, 80)
    }
  }

  // 显示打印容器并打印
  const printContainer = document.getElementById('print-container')
  if (printContainer) {
    printContainer.style.display = 'flex'
    printContainer.style.flexWrap = 'wrap'
    printContainer.style.justifyContent = 'center'
    printContainer.style.alignItems = 'flex-start'
    printContainer.style.alignContent = 'flex-start'
    printContainer.style.gap = '16px'
    printContainer.style.padding = '20px'
    printContainer.style.position = 'absolute'
    printContainer.style.left = '0'
    printContainer.style.top = '0'
    printContainer.style.width = '100%'
    printContainer.style.background = 'white'
    printContainer.style.zIndex = '9999'

    // 打印
    window.print()

    // 隐藏打印容器
    setTimeout(() => {
      printContainer.style.display = 'none'
      printLabels.value = []
    }, 100)
  }

  loading.value = false
}
</script>

<style>
/* 打印样式 */
@media print {
  @page {
    margin: 10mm;
  }

  body * {
    visibility: hidden;
  }

  #print-container,
  #print-container * {
    visibility: visible;
  }

  #print-container {
    display: flex !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .print-label-card {
    break-inside: avoid;
    page-break-inside: avoid;
    text-align: center;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 8px;
    background: white;
  }

  .print-qr-wrapper {
    background: white;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
  }

  .print-label-text {
    margin-top: 4px;
  }

  .print-label-code {
    font-size: 11px;
    font-weight: bold;
    font-family: monospace;
  }

  .print-label-name {
    font-size: 9px;
    color: #666;
  }

  .qrcode-canvas {
    display: block;
  }
}
</style>

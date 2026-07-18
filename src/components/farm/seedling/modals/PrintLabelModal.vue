<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="fixed inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- 头部 - 使用渐变色 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <el-icon :size="20" style="color: white;"><Printer /></el-icon>
          <h3 class="text-lg font-semibold text-white">标签打印与导出</h3>
        </div>
        <el-button circle text @click="handleClose" class="!text-white hover:!bg-white/20">
          <el-icon :size="20" style="color: white;"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区域 -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
        <div class="space-y-4" v-if="record">
          <!-- 打印模式选择（对齐 V1.1 L26-46 PRINT_MODE_MAP 卡片按钮风格） -->
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="grid grid-cols-3 gap-3 mb-4">
              <button
                v-for="mode in [{value:'single',icon:'🏷️',label:'单标签打印',sublabel:'重打 1 个已存在',desc:'从已有标签中选择 1 个重新打印'},{value:'multi',icon:'📋',label:'多标签打印',sublabel:'批量勾选已存在',desc:'从已有标签列表中勾选多个一并打印'},{value:'batch',icon:'✨',label:'批量生成',sublabel:'生成新标签',desc:'系统生成新的标签编号 + 同步入库 + 打印'}]"
                :key="mode.value"
                type="button"
                class="p-3 border-2 rounded-lg text-left cursor-pointer transition-all"
                :class="printMode === mode.value ? 'border-blue-500 bg-blue-100 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300'"
                @click="printMode = mode.value"
              >
                <div class="text-lg mb-1">{{ mode.icon }}</div>
                <div class="text-sm font-semibold text-gray-900">{{ mode.label }}</div>
                <div class="text-xs text-gray-500">{{ mode.sublabel }}</div>
                <div class="text-[10px] text-gray-400 mt-1 leading-tight">{{ mode.desc }}</div>
              </button>
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
                  <el-checkbox
                    v-for="label in allLabelNumbers.slice(0, 100)"
                    :key="label"
                    :label="label"
                    class="block w-full"
                  >
                    {{ label }}
                  </el-checkbox>
                </el-checkbox-group>
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
              <el-select v-model="template" class="w-full" @change="generatePreviewQrCode">
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
              <div v-else-if="template === 'large'" class="flex flex-col items-center print-label">
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

      <!-- 底部按钮 -->
      <div class="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="handleExportExcel" :loading="loading">
          <el-icon style="color: inherit;"><Download /></el-icon>
          导出Excel
        </el-button>
        <el-button type="primary" @click="handlePrint" :loading="loading">
          <el-icon style="color: inherit;"><Printer /></el-icon>
          打印
        </el-button>
      </div>
    </div>
  </div>

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
  visible: Boolean,
  record: Object
})

const emit = defineEmits(['update:visible'])

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
const template = ref('detail')
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

// 生成预览二维码
const generatePreviewQrCode = async () => {
  if (!previewLabel.value) {
    previewQrCodeUrl.value = ''
    return
  }
  try {
    const value = getQrCodeValue(previewLabel.value)
    const size = template.value === 'small' ? 80 : template.value === 'large' ? 100 : 100
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
    previewLabel.value = labels[0] || ''
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

// 关闭弹窗
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

<style scoped>
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

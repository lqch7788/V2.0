<!--
  种源标签打印弹窗（V1.1 1:1 对齐版）
  V1.1 源文件：src/components/farm/seed-source/modals/PrintLabelModal.tsx
  支持：单标签/多标签/批量生成 3 种模式 + 标签预览 + Excel导出 + 打印
  使用 el-dialog 包装（参考 V2.0 订单管理 pattern）
-->
<template>
  <el-dialog
    v-model="visible"
    title="标签打印与导出"
    width="1170px"
    height="650px"
    top="5vh"
    :close-on-click-modal="true"
    v-dialog-draggable
    v-dialog-resizable
    v-dialog-maximizable
    @close="handleClose"
  >
    <!-- 2026-07-15: 自定义 header 绿色渐变 1:1 对齐 V1.1 Modal 默认 header（#10b981 → #059669） -->
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">标签打印与导出</h3>
        <button
          type="button"
          class="text-white hover:bg-emerald-700 rounded p-1 transition-colors"
          aria-label="关闭"
          @click="handleClose"
        >
          <X :size="20" />
        </button>
      </div>
    </template>

    <div v-if="record" class="space-y-4">
      <!-- 打印模式选择 — 卡片按钮风格 -->
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
            <label class="text-gray-600 text-xs">选择标签编号</label>
            <el-select v-model="previewLabel" placeholder="选择标签" class="w-48" filterable>
              <el-option v-for="l in allLabelNumbers" :key="l" :label="l" :value="l" />
            </el-select>
          </div>
          <div class="text-xs text-gray-500">共 {{ allLabelNumbers.length }} 个标签</div>
        </div>

        <!-- 多标签模式 -->
        <div v-else-if="printMode === 'multi'">
          <div class="flex items-center justify-between mb-2">
            <label class="text-gray-600 text-xs">选择标签（已选 {{ selectedLabels.length }} 个）</label>
            <el-button link size="small" @click="toggleSelectAll">
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
                <input type="checkbox" :checked="selectedLabels.includes(label)" @change="toggleLabel(label)" class="w-3 h-3" />
                <span class="truncate">{{ label }}</span>
              </label>
            </div>
            <div v-if="allLabelNumbers.length > 100" class="text-xs text-gray-500 mt-2">
              共 {{ allLabelNumbers.length }} 个标签，已显示前100个
            </div>
          </div>
        </div>

        <!-- 批量生成模式 -->
        <div v-else class="flex items-center gap-4 p-3 bg-emerald-50 rounded border border-emerald-200">
          <div>
            <label class="text-gray-700 text-xs font-semibold">生成数量</label>
            <el-input-number v-model="printCount" :min="1" :max="remainingCount" :step="1" size="small" class="w-24" />
          </div>
          <div class="text-xs text-emerald-800">
            → <span class="font-semibold">生成 {{ printCount }} 个标签</span>，每个标签代表 1 {{ labelUnit }}
            （可用库存：{{ remainingCount }} {{ labelUnit }}，已生成：{{ allLabelNumbers.length }}）
          </div>
        </div>
      </div>

      <!-- 操作人员 + 模板选择 -->
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作人员">
          <div class="px-3 py-1 border border-gray-200 rounded text-sm bg-gray-50 inline-block">{{ currentOperator }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="模板选择">
          <el-select v-model="template" class="w-full">
            <el-option label="小标签" value="small" />
            <el-option label="大标签" value="large" />
            <el-option label="详情标签" value="detail" />
          </el-select>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 标签预览 -->
      <div class="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-gray-50">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">标签预览 {{ previewLabel && `- ${previewLabel}` }}</span>
        </div>
        <div class="flex justify-center">
          <div v-if="template === 'small'" class="flex flex-col items-center">
            <div class="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
              <QrCode :value="currentQrCodeValue" :size="80" />
            </div>
            <div class="mt-2 text-center">
              <div class="text-sm font-bold text-gray-900">{{ previewLabel || record.seedCode }}</div>
              <div class="text-xs text-gray-600">{{ record.cropName }}</div>
            </div>
          </div>
          <div v-else-if="template === 'large'" class="flex flex-col items-center">
            <div class="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
              <QrCode :value="currentQrCodeValue" :size="100" />
            </div>
            <div class="mt-3 text-center">
              <div class="text-lg font-bold text-gray-900">{{ previewLabel || record.seedCode }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ record.cropName }} - {{ record.cropVariety }}</div>
            </div>
          </div>
          <div v-else class="flex bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <div class="flex-shrink-0">
              <QrCode :value="currentQrCodeValue" :size="100" />
            </div>
            <div class="ml-4 flex flex-col justify-center">
              <div class="text-lg font-bold text-gray-900 mb-2">{{ previewLabel || record.seedCode }}</div>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div class="text-gray-500">作物名称：</div><div class="text-gray-900 font-medium">{{ record.cropName }}</div>
                <div class="text-gray-500">作物品种：</div><div class="text-gray-900">{{ record.cropVariety }}</div>
                <div class="text-gray-500">供应商：</div><div class="text-gray-900">{{ record.supplierName }}</div>
                <div class="text-gray-500">种源批号：</div><div class="text-gray-900 font-mono text-xs">{{ record.seedCode }}</div>
              </div>
            </div>
            <div class="ml-4 flex flex-col justify-center border-l border-gray-200 pl-4">
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div class="text-gray-500">可用数量：</div><div class="text-emerald-600 font-bold">{{ record.availableCount.toLocaleString() }} {{ labelUnit }}</div>
                <div class="text-gray-500">入库数量：</div><div class="text-gray-900">{{ (record.quantity ?? record.initialCount)?.toLocaleString() }} {{ labelUnit }}</div>
                <div class="text-gray-500">采购日期：</div><div class="text-gray-900">{{ record.purchaseDate }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 打印容器（隐藏） -->
      <div v-show="false" class="print-container">
        <div v-for="label in printLabels" :key="label" class="print-label-card">
          <div class="bg-white p-3 border border-gray-400 rounded-lg">
            <QrCode :value="getQrCodeValue(label)" :size="80" />
          </div>
          <div style="text-align: center; margin-top: 4px">
            <div style="font-size: 11px; font-weight: bold; font-family: monospace">{{ label }}</div>
            <div style="font-size: 9px; color: #666">{{ record.cropName }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div></div>
        <div class="flex gap-2">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleExportExcel">
            <el-icon><Download /></el-icon>导出 Excel
          </el-button>
          <el-button :loading="loading" @click="handlePrint">
            <el-icon><Printer /></el-icon>{{ loading ? '处理中...' : '打印' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 种源标签打印弹窗 — V1.1 PrintLabelModal.tsx 1:1 对齐
 * 使用 el-dialog 包装（参考 V2.0 订单管理 pattern）
 */
import { ref, computed, watch, onMounted } from 'vue'
import { Download, Printer } from '@element-plus/icons-vue'
import { X } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import QrCode from '@/components/common/QrCode.vue'
import { enhancedApiClient } from '@/lib/apiClient'
import { useUserStore } from '@/stores/modules/user'

// 本地日期（避免 UTC 时区 bug）
const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object, default: null }
})
const emit = defineEmits(['update:visible', 'close'])

// v-model 兼容
const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const userStore = useUserStore()

const MAX_LABEL_DISPLAY = 200
const PRINT_MODES = [
  { value: 'single', label: '单标签打印', sublabel: '重打 1 个已存在', desc: '从已有标签中选择 1 个重新打印', icon: '🏷️' },
  { value: 'multi',  label: '多标签打印', sublabel: '批量勾选已存在', desc: '从已有标签列表中勾选多个一并打印', icon: '📋' },
  { value: 'batch',  label: '批量生成',   sublabel: '生成新标签',      desc: '系统生成新的标签编号 + 同步入库 + 打印', icon: '✨' }
]

const template = ref('detail')
const printMode = ref('single')
const printCount = ref(1)
const selectedLabels = ref([])
const previewLabel = ref('')
const allLabelNumbers = ref([])
const loading = ref(false)
const printLabels = ref([])

// 当前操作员
const currentOperator = computed(() => {
  const u = userStore.currentUser
  return u?.realName || u?.username || '系统管理员'
})

const remainingCount = computed(() => props.record?.availableCount || 0)
const labelUnit = computed(() => props.record?.unit || '粒')

// 二维码内容（扫码跳转种源页 + 自动开标签管理弹窗）
const getQrCodeValue = (label) => {
  const baseUrl = window.location.origin
  return JSON.stringify({
    type: 'seed-source', code: label, seedCode: props.record?.seedCode,
    cropCode: props.record?.cropCode, cropName: props.record?.cropName,
    variety: props.record?.cropVariety, quantity: `${props.record?.availableCount} ${labelUnit.value}`,
    supplier: props.record?.supplierName, date: props.record?.purchaseDate,
    url: `${baseUrl}/crop/seed-sources?labelNumber=${encodeURIComponent(label)}`
  })
}

const currentQrCodeValue = computed(() => previewLabel.value ? getQrCodeValue(previewLabel.value) : '')

// 加载已入库标签
const loadLabels = async () => {
  if (!props.record?.id) return
  try {
    // V1.1 一致：走 usePlantLabelStore.loadLabels({seedSourceId})
    const { usePlantLabelStore } = await import('@/stores/modules/plantLabel')
    const plantLabelStore = usePlantLabelStore()
    const res = await plantLabelStore.loadLabels({ seedSourceId: props.record.id })
    const labels = res?.data || res || []
    const numbers = (Array.isArray(labels) ? labels : []).map(l => l.labelCode || l.labelNumber || l.label_number)
    if (numbers.length > 0) {
      allLabelNumbers.value = numbers.slice(0, MAX_LABEL_DISPLAY)
      previewLabel.value = numbers[0]
    } else {
      // 兜底：前端拼接
      const seedCode = props.record.seedCode
      const count = props.record.availableCount
      if (seedCode && count > 0) {
        const maxLabels = Math.min(count, MAX_LABEL_DISPLAY)
        const nums = []
        for (let i = 0; i < maxLabels; i++) nums.push(`${seedCode}-${String(i + 1).padStart(4, '0')}`)
        allLabelNumbers.value = nums
        previewLabel.value = nums[0]
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    ElMessage.error(`加载标签失败：${msg}`)
  }
}

const setPrintMode = (mode) => {
  printMode.value = mode
  selectedLabels.value = []
}

const toggleLabel = (label) => {
  selectedLabels.value = selectedLabels.value.includes(label)
    ? selectedLabels.value.filter(l => l !== label)
    : [...selectedLabels.value, label]
}

const toggleSelectAll = () => {
  selectedLabels.value = selectedLabels.value.length === allLabelNumbers.value.length
    ? []
    : [...allLabelNumbers.value]
}

const handleClose = () => emit('update:visible', false)

const handlePrint = async () => {
  let labelsToPrint = []
  if (printMode.value === 'single') {
    if (!previewLabel.value) { ElMessage.warning('请选择要打印的标签'); return }
    labelsToPrint = [previewLabel.value]
  } else if (printMode.value === 'multi') {
    if (selectedLabels.value.length === 0) { ElMessage.warning('请选择要打印的标签'); return }
    labelsToPrint = [...selectedLabels.value]
  } else {
    const startIdx = allLabelNumbers.value.length
    for (let i = 0; i < printCount.value; i++) {
      labelsToPrint.push(`${props.record.seedCode}-${String(startIdx + i + 1).padStart(4, '0')}`)
    }
  }
  printLabels.value = labelsToPrint
  setTimeout(() => {
    window.print()
    printLabels.value = []
  }, 150)
}

const escapeHtml = (str) => {
  if (str == null) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

const handleExportExcel = () => {
  let labelsToExport = []
  if (printMode.value === 'single' && previewLabel.value) labelsToExport = [previewLabel.value]
  else if (printMode.value === 'multi' && selectedLabels.value.length > 0) labelsToExport = [...selectedLabels.value]
  else {
    const startIdx = allLabelNumbers.value.length
    for (let i = 0; i < printCount.value; i++) labelsToExport.push(`${props.record.seedCode}-${String(startIdx + i + 1).padStart(4, '0')}`)
  }
  if (labelsToExport.length === 0) { ElMessage.warning('没有可导出的标签'); return }

  const baseUrl = `${window.location.origin}/crop/seed-sources`
  const rows = labelsToExport.map((label, i) => ({
    index: i + 1, label,
    url: `${baseUrl}?labelNumber=${encodeURIComponent(label)}`
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
      <td>${escapeHtml(props.record.cropName)}</td>
      <td>${escapeHtml(props.record.supplierName || '-')}</td>
      <td><a href="${escapeHtml(r.url)}" target="_blank">${escapeHtml(r.url)}</a></td>
      <td style="font-family:monospace;font-size:11px;">${escapeHtml(r.label)}</td>
      <td>${escapeHtml(props.record.purchaseDate || '-')}</td>
    </tr>`).join('')}</tbody>
  </table>
</body></html>`

  const blob = new Blob(['﻿' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `种源标签_${props.record.cropName}_${todayLocal()}.xls`
  a.click()
  URL.revokeObjectURL(url)
}

watch(() => [props.visible, props.record?.id], ([visible, id]) => {
  if (visible && id) loadLabels()
})

onMounted(() => {
  if (props.visible && props.record?.id) loadLabels()
})
</script>

<style>
@media print {
  @page { margin: 10mm; }
  body * { visibility: hidden; }
  .print-container, .print-container * { visibility: visible; }
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
  .print-label-card { break-inside: avoid; page-break-inside: avoid; text-align: center; }
}
</style>
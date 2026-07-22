<!--
  种源标签打印弹窗（V1.1 1:1 对齐版）
  V1.1 源文件：src/components/farm/seed-source/modals/PrintLabelModal.tsx（558 行）
  功能：单标签/多标签/批量生成 3 种模式 + 标签预览（QRCode）+ Excel 导出 + 打印
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
      <!-- 打印模式选择 — 卡片按钮风格（对标育苗） -->
      <div class="bg-blue-50 rounded-lg p-4">
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div
            v-for="mode in PRINT_MODE_LIST"
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

        <!-- 批量生成模式 — 种源简化版（不需要标签粒度选择器） -->
        <div v-else class="flex items-center gap-4 p-3 bg-emerald-50 rounded border border-emerald-200">
          <div>
            <label class="text-gray-700 text-xs font-semibold">生成数量</label>
            <el-input-number
              v-model="printCount"
              :min="1"
              :max="remainingCount"
              :step="1"
              size="small"
              class="w-24"
            />
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
          <!-- 小标签 -->
          <div v-if="template === 'small'" class="flex flex-col items-center print-label">
            <div class="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
              <QrCode :value="currentQrCodeValue" :size="80" />
            </div>
            <div class="mt-2 text-center">
              <div class="text-sm font-bold text-gray-900">{{ previewLabel || record.seedCode }}</div>
              <div class="text-xs text-gray-600">{{ record.cropName }}</div>
            </div>
          </div>
          <!-- 大标签 -->
          <div v-else-if="template === 'large'" class="flex flex-col items-center print-label">
            <div class="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
              <QrCode :value="currentQrCodeValue" :size="100" />
            </div>
            <div class="mt-3 text-center">
              <div class="text-lg font-bold text-gray-900">{{ previewLabel || record.seedCode }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ record.cropName }} - {{ record.cropVariety }}</div>
            </div>
          </div>
          <!-- 详情标签（默认） -->
          <div v-else class="flex print-label bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <div class="flex-shrink-0">
              <QrCode :value="currentQrCodeValue" :size="100" />
            </div>
            <div class="ml-4 flex flex-col justify-center">
              <div class="text-lg font-bold text-gray-900 mb-2">{{ previewLabel || record.seedCode }}</div>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div class="text-gray-500">作物名称：</div>
                <div class="text-gray-900 font-medium">{{ record.cropName }}</div>
                <div class="text-gray-500">作物品种：</div>
                <div class="text-gray-900">{{ record.cropVariety }}</div>
                <div class="text-gray-500">供应商：</div>
                <div class="text-gray-900">{{ record.supplierName }}</div>
                <div class="text-gray-500">种源批号：</div>
                <div class="text-gray-900 font-mono text-xs">{{ record.seedCode }}</div>
              </div>
            </div>
            <div class="ml-4 flex flex-col justify-center border-l border-gray-200 pl-4">
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div class="text-gray-500">可用数量：</div>
                <div class="text-emerald-600 font-bold">{{ record.availableCount.toLocaleString() }} {{ labelUnit }}</div>
                <div class="text-gray-500">入库数量：</div>
                <div class="text-gray-900">{{ (record.quantity ?? record.initialCount)?.toLocaleString() }} {{ labelUnit }}</div>
                <div class="text-gray-500">采购日期：</div>
                <div class="text-gray-900">{{ record.purchaseDate }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 打印容器：正常隐藏，打印时显示所有选中标签 -->
      <div class="hidden print-container">
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
          <el-button @click="handleClose">
            <el-icon><Close /></el-icon>取消
          </el-button>
          <el-button type="primary" :loading="loading" @click="handleExportExcel">
            <el-icon><Download /></el-icon>导出Excel
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
 * 种源标签打印弹窗 — V1.1 PrintLabelModal.tsx 1:1 对齐（558 行级别）
 * V1.1 源文件：src/components/farm/seed-source/modals/PrintLabelModal.tsx
 * 核心功能：单标签/多标签/批量生成 3 种模式 + 标签预览（QRCode）+ 打印 + Excel 导出
 * 数据流：useAuthStore/useUserStore 获取操作员 → usePlantLabelStore.loadLabels/batchCreateLabels → 打印
 */
import { ref, computed, watch, onMounted } from 'vue'
import { Download, Printer, Close, X } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import QrCode from '@/components/common/QrCode.vue'
import { useUserStore } from '@/stores/modules/user'
import { useSeedSourceStore } from '@/stores/modules/seedSource'
import { usePlantLabelStore } from '@/stores/modules/plantLabel'
import { generateBatchLabels, printLabel } from '@/api/crop'
import { exportCsv, exportXlsx } from '@/services/exporters'
import { todayLocal } from '@/lib/dateUtils'

// ========== Props & Emits ==========
const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object, default: null }
})
const emit = defineEmits(['update:visible', 'close'])

// v-model 兼容（Element Plus el-dialog 通过 v-model:visible 控制显隐）
const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

// ========== Store ==========
const userStore = useUserStore()
const seedSourceStore = useSeedSourceStore()
const plantLabelStore = usePlantLabelStore()

// ========== 常量定义（V1.1 1:1 对齐） ==========
// 2026-07-01 P2-9：标签列表最大显示数（超过时只显示前 N 个 + 提示）
const MAX_LABEL_DISPLAY = 200

// 打印模式字典（卡片按钮显示）— V1.1 PRINT_MODE_MAP 1:1 对齐
const PRINT_MODE_MAP = {
  single: {
    label: '单标签打印',
    sublabel: '重打 1 个已存在',
    desc: '从已有标签中选择 1 个重新打印（适合标签褪色/丢失后补打）',
    icon: '🏷️'
  },
  multi: {
    label: '多标签打印',
    sublabel: '批量勾选已存在',
    desc: '从已有标签列表中勾选多个一并打印（适合整批补打）',
    icon: '📋'
  },
  batch: {
    label: '批量生成',
    sublabel: '生成新标签',
    desc: '系统生成新的标签编号 + 同步入库 + 打印（适合首次打标签）',
    icon: '✨'
  }
}
const PRINT_MODE_LIST = [
  { value: 'single', ...PRINT_MODE_MAP.single },
  { value: 'multi',  ...PRINT_MODE_MAP.multi },
  { value: 'batch',  ...PRINT_MODE_MAP.batch }
]

// ========== 状态（V1.1 useState 1:1 对齐） ==========
const template = ref('detail')                 // 模板选择：small / large / detail
const printMode = ref('single')                // 打印模式：single / multi / batch
const printCount = ref(1)                      // 批量生成数量
const selectedLabels = ref([])                 // 多标签模式勾选项
const previewLabel = ref('')                   // 单标签模式预览
const allLabelNumbers = ref([])                // 已入库的标签编号列表
const loading = ref(false)                     // 处理中
const printLabels = ref([])                    // 待打印的标签（触发 window.print 效果）

// ========== 计算属性 ==========
// 当前操作员：V1.1 一致（authCurrentUser.name > authCurrentUser.username > storeUsers[0].name > '系统管理员'）
const currentOperator = computed(() => {
  const authUser = seedSourceStore.currentUser
  const u = userStore.currentUser
  if (authUser?.name) return authUser.name
  if (authUser?.username) return authUser.username
  if (u?.realName) return u.realName
  if (u?.username) return u.username
  if (userStore.users.length > 0) return userStore.users[0]?.name || '系统管理员'
  return '系统管理员'
})

// 剩余可用数量 / 标签单位（V1.1 1:1 对齐）
const remainingCount = computed(() => props.record?.availableCount || 0)
const labelUnit = computed(() => props.record?.unit || '粒')

// 当前二维码内容（V1.1 getQrCodeValue 1:1 对齐，扫码跳转种源页 + 自动开标签管理弹窗）
const getQrCodeValue = (label) => {
  const baseUrl = window.location.origin
  return JSON.stringify({
    type: 'seed-source',
    code: label,
    seedCode: props.record?.seedCode,
    cropCode: props.record?.cropCode,
    cropName: props.record?.cropName,
    variety: props.record?.cropVariety,
    quantity: `${props.record?.availableCount} ${labelUnit.value}`,
    supplier: props.record?.supplierName,
    date: props.record?.purchaseDate,
    url: `${baseUrl}/crop/seed-sources?labelNumber=${encodeURIComponent(label)}`
  })
}
const currentQrCodeValue = computed(() =>
  previewLabel.value ? getQrCodeValue(previewLabel.value) : ''
)

// ========== 数据加载（V1.1 useEffect 1:1 对齐） ==========
/**
 * 打开弹窗时从后端加载已入库标签
 * V1.1 一致：先 loadLabels，再过滤取本 record 的 labelNumber
 * 兜底：无已入库标签时前端拼接种子批号 + 4 位序号
 */
const loadLabels = async () => {
  if (!props.record?.id) return
  try {
    await plantLabelStore.loadLabels({ seedSourceId: props.record.id })
    const storeLabels = plantLabelStore.labels || []
    const labelNumbers = storeLabels
      .filter((l) => String(l.seedSourceId) === String(props.record.id))
      .map((l) => l.labelCode || l.labelNumber || l.label_number)

    if (labelNumbers.length > 0) {
      // 2026-07-01 P2-9：硬编码 200 抽常量 + 截断提示
      allLabelNumbers.value = labelNumbers.slice(0, MAX_LABEL_DISPLAY)
      previewLabel.value = labelNumbers[0]
    } else {
      // 兜底：无已入库标签时前端拼接
      const seedCode = props.record.seedCode || ''
      const count = props.record.availableCount || 0
      if (seedCode && count > 0) {
        const nums = []
        const maxLabels = Math.min(count, MAX_LABEL_DISPLAY)
        for (let i = 0; i < maxLabels; i++) {
          nums.push(`${seedCode}-${String(i + 1).padStart(4, '0')}`)
        }
        allLabelNumbers.value = nums
        previewLabel.value = nums[0]
      } else {
        allLabelNumbers.value = []
        previewLabel.value = ''
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    ElMessage.error(`加载标签失败：${msg}`)
  }
}

// ========== 操作函数（V1.1 1:1 对齐） ==========
// 切换打印模式时清空多选
const setPrintMode = (mode) => {
  printMode.value = mode
  selectedLabels.value = []
}

// 切换勾选单个标签
const toggleLabel = (label) => {
  selectedLabels.value = selectedLabels.value.includes(label)
    ? selectedLabels.value.filter((l) => l !== label)
    : [...selectedLabels.value, label]
}

// 全选/取消全选
const toggleSelectAll = () => {
  selectedLabels.value = selectedLabels.value.length === allLabelNumbers.value.length
    ? []
    : [...allLabelNumbers.value]
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

/**
 * 处理打印（V1.1 handlePrint 1:1 对齐）
 * 三种模式：
 *   - single：单标签打印，重打 1 个已存在
 *   - multi：多标签打印，批量勾选已存在
 *   - batch：批量生成，生成新标签并同步入库到 plant_labels 表
 */
const handlePrint = async () => {
  loading.value = true
  let labelsToPrint = []
  try {
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
      // batch：批量生成 — 入库到 plant_labels 表
      const newLabels = []
      // 2026-07-01 P1-3 修复：先 await loadLabels 确保 store 是最新状态
      // 避免多用户/快速点击时序号跳号
      await plantLabelStore.loadLabels({ seedSourceId: props.record.id })
      const existingLabels = (plantLabelStore.labels || []).filter(
        (l) => String(l.seedSourceId) === String(props.record.id)
      )
      const startIdx = existingLabels.length

      for (let i = 0; i < printCount.value; i++) {
        const labelNumber = `${props.record.seedCode}-${String(startIdx + i + 1).padStart(4, '0')}`
        labelsToPrint.push(labelNumber)
        newLabels.push({
          labelNumber,
          seedSourceId: props.record.id,
          moveInAreaName: props.record.supplierName || null,
          moveInDate: props.record.purchaseDate || null,
          quantity: 1
        })
      }

      // 同步入库
      if (newLabels.length > 0) {
        const result = await plantLabelStore.batchCreateLabels(newLabels)
        if (!result) {
          ElMessage.error('标签入库失败，打印已中止')
          return
        }
        // 若有跳过的已存在标签，提示用户
        if (result.skipped > 0 && result.skippedLabelNumbers?.length > 0) {
          ElMessage.warning(
            `已跳过 ${result.skipped} 个已存在标签：` +
            `${result.skippedLabelNumbers.slice(0, 5).join('、')}` +
            (result.skipped > 5 ? ' 等' : '')
          )
        }
      }

      // 刷新标签列表
      const refreshedStoreLabels = plantLabelStore.labels || []
      const refreshedNumbers = refreshedStoreLabels
        .filter((l) => String(l.seedSourceId) === String(props.record.id))
        .map((l) => l.labelCode || l.labelNumber || l.label_number)
        .filter(Boolean)
      if (refreshedNumbers.length > 0) {
        allLabelNumbers.value = refreshedNumbers.slice(0, MAX_LABEL_DISPLAY)
      }
    }

    // 触发打印（V1.1 一致：setTimeout 150ms 后 window.print）
    printLabels.value = labelsToPrint
  } finally {
    loading.value = false
  }
}

/**
 * 2026-07-01 P1-4 修复：HTML 转义防止 XSS + 表格结构破坏
 * 复用 services/exporters 的等价实现，保持函数纯度
 */
const escapeHtml = (str) => {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 导出 Excel（V1.1 handleExportExcel 1:1 对齐）
 * 实际是生成 HTML 假装 xls，Excel 可直接打开（含 QR 链接 + 打印按钮）
 */
const handleExportExcel = () => {
  loading.value = true
  try {
    let labelsToExport = []
    if (printMode.value === 'single' && previewLabel.value) {
      labelsToExport = [previewLabel.value]
    } else if (printMode.value === 'multi' && selectedLabels.value.length > 0) {
      labelsToExport = [...selectedLabels.value]
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

    const baseUrl = `${window.location.origin}/crop/seed-sources`
    const rows = labelsToExport.map((label, i) => ({
      index: i + 1,
      label,
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
    <span style="color:#666;font-size:12px;">共 ${rows.length} 个标签 | 扫描功能码为URL链接，可用在线工具生成QR码</span>
  </div>
  <table>
    <thead><tr>
      <th>序号</th>
      <th>作物名称</th>
      <th>供应商</th>
      <th>扫描功能码</th>
      <th>种源批号</th>
      <th>采购日期</th>
    </tr></thead>
    <tbody>${rows.map((r) => `<tr>
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
  } finally {
    loading.value = false
  }
}

// ========== 生命周期（V1.1 useEffect 1:1 对齐） ==========
// 打开时加载；切 record 时重新加载；关闭时清空已选
watch(
  () => [props.visible, props.record?.id],
  ([vis, id]) => {
    if (vis && id) {
      loadLabels()
    } else if (!vis) {
      // 重置状态（避免下次打开残留）
      selectedLabels.value = []
      printLabels.value = []
      previewLabel.value = ''
    }
  },
  { immediate: false }
)

onMounted(() => {
  if (props.visible && props.record?.id) loadLabels()
})

// 触发打印（V1.1 useEffect 1:1 对齐）：printLabels 更新后触发 window.print
watch(printLabels, (list) => {
  if (list && list.length > 0) {
    const timer = setTimeout(() => {
      window.print()
      printLabels.value = []
    }, 150)
    return () => clearTimeout(timer)
  }
})
</script>

<style>
@media print {
  @page { margin: 10mm; }
  body * { visibility: hidden; }
  .print-container,
  .print-container * { visibility: visible; }
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

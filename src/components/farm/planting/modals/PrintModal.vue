<!--
  种植标签打印弹窗（V1.1 PrintLabelModal.tsx 1:1 对齐版）
  V1.1 源文件：src/components/farm/planting/modals/PrintLabelModal.tsx（703 行）
  功能：单标签/多标签/批量生成 3 种模式 + 标签预览（QRCode）+ Excel 导出 + 打印
  本次 2026-07-24 R-strict: 完全按 V1.1 实现 - 卡片按钮模式 + QrCode 真实二维码 + plantLabelStore 同步入库 + window.print 实际触发
  参考实现：src/components/farm/seed-source/modals/PrintLabelModal.vue（已对齐 V1.1 的 645 行版本）
-->
<template>
  <el-dialog
    :model-value="isOpen"
    title="标签打印与导出"
    width="1100px"
    top="5vh"
    :close-on-click-modal="true"
    @update:model-value="onClose"
    @close="onClose"
  >
    <!-- 自定义 header 绿色渐变 1:1 对齐 V1.1 Modal 默认 header -->
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <Printer :size="20" />
          标签打印与导出
        </h3>
        <button
          type="button"
          class="text-white hover:bg-emerald-700 rounded p-1 transition-colors"
          aria-label="关闭"
          @click="onClose"
        >
          <X :size="20" />
        </button>
      </div>
    </template>

    <div v-if="record" class="space-y-4">
      <!-- 打印模式选择 — 卡片按钮风格（对齐 V1.1） -->
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
          </div>
          <div v-if="allLabelNumbers.length > 100" class="text-xs text-gray-500 mt-2">
            共 {{ allLabelNumbers.length }} 个标签，已显示前100个
          </div>
        </div>

        <!-- 批量生成模式（对齐 V1.1 L460-579：标签粒度三态 + 同步入库） -->
        <div v-else class="space-y-3">
          <!-- 2026-07-24：标签粒度三态（参考 V1.1） — 当前 V2.0 简化：batch/single 两态 -->
          <div>
            <label class="text-gray-600 text-xs mb-1 block">标签类型</label>
            <div class="flex gap-2">
              <label class="flex items-center gap-1 px-3 py-1 border rounded cursor-pointer" :class="labelType === 'batch' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'">
                <input type="radio" v-model="labelType" value="batch" /> 整批共享
              </label>
              <label class="flex items-center gap-1 px-3 py-1 border rounded cursor-pointer" :class="labelType === 'single' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'">
                <input type="radio" v-model="labelType" value="single" /> 每株独立
              </label>
            </div>
          </div>

          <!-- 整批共享模式：1 个标签承载 N 株 -->
          <div v-if="labelType === 'batch'" class="p-3 bg-emerald-50 rounded border border-emerald-200 space-y-2">
            <div class="flex items-center gap-3 flex-wrap">
              <div>
                <label class="text-gray-700 text-xs font-semibold">每标签承载株数</label>
                <el-input-number v-model="labelQuantity" :min="1" :max="remainingCount || 1" size="small" class="w-24" />
              </div>
              <!-- 快捷口径按钮（对齐 V1.1 L482-496） -->
              <div class="flex items-center gap-1">
                <span class="text-xs text-gray-600">快捷口径：</span>
                <el-button size="small" @click="setLabelQuantity(initialQuantity)">初始 {{ initialQuantity }}</el-button>
                <el-button size="small" @click="setLabelQuantity(currentSurviving)">剩余 {{ currentSurviving }}</el-button>
                <el-button size="small" @click="setLabelQuantity(recentNew)">新增 {{ recentNew }}</el-button>
              </div>
            </div>
            <div class="text-xs text-emerald-800">
              → <span class="font-semibold">生成 1 个标签</span>，该标签代表 <span class="font-semibold">{{ labelQuantity }} 株苗</span>（共用一个二维码）
            </div>
          </div>

          <!-- 每株独立模式：N 个标签，每标签 1 株 -->
          <div v-else class="flex items-center gap-4 p-3 bg-cyan-50 rounded border border-cyan-200">
            <div>
              <label class="text-gray-700 text-xs font-semibold">生成标签数（= 株数）</label>
              <el-input-number v-model="printCount" :min="1" :max="remainingCount || 1" size="small" class="w-24" />
            </div>
            <div class="text-xs text-cyan-800">
              → <span class="font-semibold">生成 {{ printCount }} 个标签</span>，每株苗 1 个独立二维码（可用库存：{{ remainingCount }}，已生成：{{ allLabelNumbers.length }}）
            </div>
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

      <!-- 标签预览（真实 QrCode 组件） -->
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
              <div class="text-sm font-bold text-gray-900">{{ previewLabel || record.plantCode }}</div>
              <div class="text-xs text-gray-600">{{ record.cropName }}</div>
            </div>
          </div>
          <!-- 大标签 -->
          <div v-else-if="template === 'large'" class="flex flex-col items-center print-label">
            <div class="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
              <QrCode :value="currentQrCodeValue" :size="100" />
            </div>
            <div class="mt-3 text-center">
              <div class="text-lg font-bold text-gray-900">{{ previewLabel || record.plantCode }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ record.cropName }} - {{ record.cropVariety }}</div>
            </div>
          </div>
          <!-- 详情标签（默认） -->
          <div v-else class="flex print-label bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <div class="flex-shrink-0">
              <QrCode :value="currentQrCodeValue" :size="100" />
            </div>
            <div class="ml-4 flex flex-col justify-center">
              <div class="text-lg font-bold text-gray-900 mb-2">{{ previewLabel || record.plantCode }}</div>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div class="text-gray-500">作物名称：</div>
                <div class="text-gray-900 font-medium">{{ record.cropName }}</div>
                <div class="text-gray-500">作物品种：</div>
                <div class="text-gray-900">{{ record.cropVariety }}</div>
                <div class="text-gray-500">种植区域：</div>
                <div class="text-gray-900">{{ record.areaName }}</div>
                <div class="text-gray-500">种植批号：</div>
                <div class="text-gray-900 font-mono text-xs">{{ record.plantCode }}</div>
              </div>
            </div>
            <div class="ml-4 flex flex-col justify-center border-l border-gray-200 pl-4">
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div class="text-gray-500">种植数量：</div>
                <div class="text-emerald-600 font-bold">{{ record.plantingCount?.toLocaleString() }}</div>
                <div class="text-gray-500">剩余数量：</div>
                <div class="text-emerald-600 font-bold">{{ currentSurviving.toLocaleString() }}</div>
                <div class="text-gray-500">种植日期：</div>
                <div class="text-gray-900">{{ record.plantingDate }}</div>
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
          <el-button @click="onClose">
            <X :size="16" class="mr-1" />取消
          </el-button>
          <el-button type="primary" :loading="loading" @click="handleExportExcel">
            <Download :size="16" class="mr-1" />导出Excel
          </el-button>
          <el-button :loading="loading" @click="handlePrint">
            <Printer :size="16" class="mr-1" />{{ loading ? '处理中...' : '打印' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 种植标签打印弹窗 — V1.1 PrintLabelModal.tsx 1:1 对齐（703 行级别）
 * 参考实现：src/components/farm/seed-source/modals/PrintLabelModal.vue（已对齐 V1.1 的 645 行）
 * 核心功能：单标签/多标签/批量生成 3 种模式 + 标签预览（QRCode）+ 打印 + Excel 导出
 * 数据流：useUserStore 获取操作员 → usePlantLabelStore.loadLabels/batchCreateLabels → window.print
 */
import { ref, computed, watch, onMounted } from 'vue'
import { Printer, X, Download } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import QrCode from '@/components/common/QrCode.vue'
import { useUserStore } from '@/stores/modules/user'
import { usePlantLabelStore } from '@/stores/modules/plantLabel'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})
const emit = defineEmits(['close'])

// ========== Store ==========
const userStore = useUserStore()
const plantLabelStore = usePlantLabelStore()

// ========== 常量 ==========
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

// ========== 状态 ==========
const template = ref('detail')                 // 模板选择：small / large / detail
const printMode = ref('single')                // 打印模式：single / multi / batch
const printCount = ref(1)                      // 批量生成数量（每株独立模式）
const labelType = ref('batch')                 // 标签类型（整批共享/每株独立）
const labelQuantity = ref(1)                   // 整批共享模式：每标签承载株数
const selectedLabels = ref([])                 // 多标签模式勾选项
const previewLabel = ref('')                   // 单标签模式预览
const allLabelNumbers = ref([])                // 已入库标签编号列表
const loading = ref(false)
const printLabels = ref([])                    // 触发 window.print

// ========== 计算属性 ==========
// 当前操作员（对齐 V1.1 L106-107）
const currentOperator = computed(() => {
  const u = userStore.currentUser
  if (u?.realName) return u.realName
  if (u?.username) return u.username
  if (userStore.users.length > 0) return userStore.users[0]?.name || '系统管理员'
  return localStorage.getItem('username') || '系统管理员'
})

// 种植版快捷口径（对齐 V1.1 L94-98）
const initialQuantity = computed(() => props.record?.plantingCount || 0)  // 建档定植株数
const currentSurviving = computed(() => Math.max(0,
  (props.record?.plantingCount || 0) + (props.record?.supplementCount || 0) - (props.record?.lossCount || 0)
))  // 剩余数量
const recentNew = computed(() => props.record?.supplementCount || 0)  // 补栽累计
const labelUnit = computed(() => props.record?.unit || '株')

// 剩余可用数量（对齐 V1.1 L161）
const remainingCount = computed(() => currentSurviving.value)

// 当前二维码内容（对齐 V1.1 L327-336 + url 字段）
const getQrCodeValue = (label) => {
  const baseUrl = window.location.origin
  return JSON.stringify({
    type: 'planting',
    code: label,
    plantCode: props.record?.plantCode,
    sourceCode: props.record?.sourceCode,
    cropCode: props.record?.cropCode,
    cropName: props.record?.cropName,
    variety: props.record?.cropVariety,
    quantity: `${currentSurviving.value} ${labelUnit.value}`,
    site: props.record?.areaName,
    date: props.record?.plantingDate,
    // 扫码跳转种植页 + 自动开标签管理弹窗
    url: `${baseUrl}/crop/planting?labelNumber=${encodeURIComponent(label)}`
  })
}
const currentQrCodeValue = computed(() =>
  previewLabel.value ? getQrCodeValue(previewLabel.value) : ''
)

// ========== 数据加载（对齐 V1.1 L110-147） ==========
/**
 * 打开弹窗时从后端加载已入库标签
 * V1.1 一致：先 loadLabels，再过滤取本 record 的 labelNumber
 * 兜底：无已入库标签时前端拼接种苗批号 + 4 位序号
 */
const loadLabels = async () => {
  if (!props.record?.id) return
  try {
    await plantLabelStore.loadLabels({ plantingId: props.record.id })
    const storeLabels = plantLabelStore.labels || []
    const labelNumbers = storeLabels
      .filter((l) => String(l.plantingId) === String(props.record.id))
      .map((l) => l.labelCode || l.labelNumber || l.label_number || '')

    // 过滤空值
    const validNumbers = labelNumbers.filter(Boolean)
    if (validNumbers.length > 0) {
      allLabelNumbers.value = validNumbers.slice(0, MAX_LABEL_DISPLAY)
      previewLabel.value = validNumbers[0]
    } else {
      // 兜底：无已入库标签时前端拼接
      const plantCode = props.record.plantCode || ''
      const count = currentSurviving.value || initialQuantity.value || 0
      if (plantCode && count > 0) {
        const nums = []
        const maxLabels = Math.min(count, MAX_LABEL_DISPLAY)
        for (let i = 0; i < maxLabels; i++) {
          nums.push(`${plantCode}-${String(i + 1).padStart(4, '0')}`)
        }
        allLabelNumbers.value = nums
        previewLabel.value = nums[0]
      } else {
        allLabelNumbers.value = []
        previewLabel.value = ''
      }
    }
    // 初始化 labelQuantity = 剩余数量（对齐 V1.1 L82-88 useEffect）
    setLabelQuantity(currentSurviving.value)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    ElMessage.error(`加载标签失败：${msg}`)
  }
}

// ========== 操作函数 ==========
const setPrintMode = (mode) => {
  printMode.value = mode
  selectedLabels.value = []
}

const setLabelQuantity = (n) => {
  labelQuantity.value = Math.max(1, Number(n) || 1)
}

const toggleLabel = (label) => {
  selectedLabels.value = selectedLabels.value.includes(label)
    ? selectedLabels.value.filter((l) => l !== label)
    : [...selectedLabels.value, label]
}

const toggleSelectAll = () => {
  selectedLabels.value = selectedLabels.value.length === allLabelNumbers.value.length
    ? []
    : [...allLabelNumbers.value]
}

const onClose = () => {
  emit('close')
}

/**
 * 处理打印（对齐 V1.1 L164-239）
 * 三种模式：single / multi / batch
 * - batch：批量生成新标签 + 同步入库到 plant_labels 表（plantLabelStore.batchCreateLabels）
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
      // 先 await loadLabels 确保 store 是最新状态（避免序号跳号）
      await plantLabelStore.loadLabels({ plantingId: props.record.id })
      const existingLabels = (plantLabelStore.labels || []).filter(
        (l) => String(l.plantingId) === String(props.record.id)
      )
      const startIdx = existingLabels.length
      const genCount = labelType.value === 'batch' ? 1 : printCount.value

      for (let i = 0; i < genCount; i++) {
        const labelNumber = `${props.record.plantCode}-${String(startIdx + i + 1).padStart(4, '0')}`
        labelsToPrint.push(labelNumber)
        // 整批共享：每个标签数量 = labelQuantity，每株独立：每个标签数量 = 1
        const qty = labelType.value === 'batch' ? labelQuantity.value : 1
        newLabels.push({
          labelNumber,
          plantingId: props.record.id,
          moveInAreaName: props.record.areaName || null,
          moveInDate: props.record.plantingDate || null,
          quantity: qty
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
        .filter((l) => String(l.plantingId) === String(props.record.id))
        .map((l) => l.labelCode || l.labelNumber || l.label_number)
        .filter(Boolean)
      if (refreshedNumbers.length > 0) {
        allLabelNumbers.value = refreshedNumbers.slice(0, MAX_LABEL_DISPLAY)
      }
    }

    // 触发打印（对齐 V1.1 L150-158 setTimeout 150ms 后 window.print）
    printLabels.value = labelsToPrint
  } finally {
    loading.value = false
  }
}

// XSS 防护
function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 导出 Excel（对齐 V1.1 L242-313）
 * 实际是生成 HTML 假装 xls，包含 QR 链接 + 打印按钮
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
      const exportCount = labelType.value === 'batch' ? 1 : printCount.value
      for (let i = 0; i < exportCount; i++) {
        labelsToExport.push(`${props.record.plantCode}-${String(startIdx + i + 1).padStart(4, '0')}`)
      }
    }

    if (labelsToExport.length === 0) {
      ElMessage.warning('没有可导出的标签')
      return
    }

    const baseUrl = `${window.location.origin}/crop/planting`
    const rows = labelsToExport.map((label, i) => ({
      index: i + 1,
      label,
      url: `${baseUrl}?labelNumber=${encodeURIComponent(label)}`
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
    <span style="color:#666;font-size:12px;">共 ${rows.length} 个标签 | 扫描功能码为URL链接</span>
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
      <td>${escapeHtml(props.record?.cropName)}</td>
      <td>${escapeHtml(props.record?.areaName || '-')}</td>
      <td><a href="${escapeHtml(r.url)}" target="_blank">${escapeHtml(r.url)}</a></td>
      <td style="font-family:monospace;font-size:11px;">${escapeHtml(r.label)}</td>
      <td>${escapeHtml(props.record?.plantingDate || '-')}</td>
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
  } finally {
    loading.value = false
  }
}

// ========== 生命周期 ==========
watch(
  () => [props.isOpen, props.record?.id],
  ([vis, id]) => {
    if (vis && id) {
      // 重置状态
      printMode.value = 'single'
      template.value = 'detail'
      labelType.value = 'batch'
      printCount.value = 1
      selectedLabels.value = []
      printLabels.value = []
      loadLabels()
    }
  },
  { immediate: false }
)

onMounted(() => {
  if (props.isOpen && props.record?.id) loadLabels()
})

// 触发打印：printLabels 更新后 150ms 调 window.print
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

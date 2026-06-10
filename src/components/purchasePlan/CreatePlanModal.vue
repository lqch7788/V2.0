<!--
  @file 采购计划创建弹窗 - 1:1 翻译自 V1.1 CreatePlanModal.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\CreatePlanModal.tsx
  @description 新增采购申请单弹窗：基本信息表单 + 物料明细可编辑表格
  统一使用 ElModal（V1.1 width=1080 → 统一800）
-->
<template>
  <ElModal
    :model-value="isOpen"
    title="新增采购申请单"
    :width="784"
    :height="630"
    
    @update:model-value="(v) => emit('update:isOpen', v)"
    @close="handleClose"
  >
    <!-- 弹窗内容区 -->
    <div class="space-y-4 modal-form-inputs">
      <!-- 采购申请批次号 单独一行 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">采购申请批次号</label>
          <div class="flex gap-2">
            <el-input
              :model-value="createForm.purchaseApplicationCode"
              placeholder="PA2026060001"
              class="flex-1"
              @update:model-value="(v) => emitFormChange('purchaseApplicationCode', v)"
            />
            <button
              class="h-9 px-4 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center justify-center whitespace-nowrap"
              @click="handleGenerateCode"
            >
              <el-icon><Refresh /></el-icon>
              生成
            </button>
          </div>
        </div>
      </div>

      <!-- 采购类型 + 关联生产批次 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">采购类型</label>
          <el-select
            :model-value="createForm.purchaseType"
            placeholder="请选择"
            class="w-full"
            :teleported="true"
            @update:model-value="handlePurchaseTypeChange"
          >
            <el-option label="生产物资采购" value="production" />
            <el-option label="紧急采购" value="urgent" />
            <el-option label="常规采购" value="routine" />
            <el-option label="通用物资" value="material" />
            <el-option label="劳保用品" value="safety" />
            <el-option label="设备采购" value="equipment" />
            <el-option label="其他" value="other" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">关联生产批次号</label>
          <el-select
            :model-value="createForm.relatedBatchCode || ''"
            placeholder="请选择"
            class="w-full"
            :teleported="true"
            clearable
            @update:model-value="(v) => emitFormChange('relatedBatchCode', v || undefined)"
          >
            <el-option
              v-for="opt in batchOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <div v-if="createForm.relatedBatchCode === 'other'">
          <label class="block text-sm font-medium text-gray-700 mb-1">其他说明</label>
          <el-input
            :model-value="createForm.otherBatchReason || ''"
            placeholder="请说明采购原因，如：日常用具、劳保用品等"
            @update:model-value="(v) => emitFormChange('otherBatchReason', v)"
          />
        </div>
      </div>

      <!-- 申请人 + 申请部门 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">申请人</label>
          <el-input
            :model-value="createForm.applicant"
            @update:model-value="(v) => emitFormChange('applicant', v)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">申请部门</label>
          <el-select
            :model-value="createForm.applicantDepartment"
            placeholder="请选择部门"
            class="w-full"
            :teleported="true"
            :disabled="departmentOptions.length === 0"
            @update:model-value="(v) => emitFormChange('applicantDepartment', v)"
          >
            <el-option
              v-for="opt in departmentOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 申请日期 + 需求日期 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">申请日期</label>
          <el-date-picker
            :model-value="createForm.applyDate"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            class="w-full"
            :teleported="true"
            @update:model-value="(v) => emitFormChange('applyDate', v || '')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">需求日期</label>
          <el-date-picker
            :model-value="createForm.requiredDate"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            class="w-full"
            :teleported="true"
            @update:model-value="(v) => emitFormChange('requiredDate', v || '')"
          />
        </div>
      </div>

      <!-- 优先级 + 备注（同行布局，对齐 V1.1 L422-445） -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
          <el-select
            :model-value="createForm.priority"
            placeholder="请选择"
            class="w-full"
            :teleported="true"
            @update:model-value="(v) => emitFormChange('priority', v)"
          >
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="normal" />
            <el-option label="低" value="low" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <el-input
            :model-value="createForm.remark || ''"
            placeholder="请输入备注"
            @update:model-value="(v) => emitFormChange('remark', v)"
          />
        </div>
      </div>

      <!-- 物料明细 -->
      <div class="border-t border-gray-300 pt-4 mt-4">
        <!-- 审批规则提示：金额阈值说明（数据源：基础数据→字典→amount_threshold，动态读取） -->
        <div class="mb-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 leading-relaxed overflow-hidden">
          <button
            type="button"
            @click="showApprovalRules = !showApprovalRules"
            class="w-full px-3 py-2 flex items-center justify-between hover:bg-blue-100/50 transition-colors"
          >
            <span class="flex items-center gap-1 font-medium">
              <span>📋</span>
              <span>采购金额审批规则</span>
            </span>
            <el-icon v-if="showApprovalRules"><ArrowUp /></el-icon>
            <el-icon v-else><ArrowDown /></el-icon>
          </button>
          <div v-if="showApprovalRules" class="px-3 pb-3 border-t border-blue-200/60">
            <div class="pt-2">总金额 = 物料明细「数量 × 单价」之和。规则如下：</div>
            <ul v-if="thresholdDisplay.length > 0" class="mt-1 ml-3 space-y-0.5">
              <li v-for="(t, i) in thresholdDisplay" :key="i">• {{ t.max }} → <span :class="`font-semibold ${t.color}`">{{ t.label }}</span></li>
            </ul>
            <div v-else class="mt-1 text-blue-600">阈值未配置，请联系管理员</div>
            <div class="mt-1 text-blue-600">阈值可在「基础数据 → 字典管理 → amount_threshold」分类下调整</div>
          </div>
        </div>
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-gray-800">
            物料明细（{{ createItems.length }}种物料）
          </h4>
          <div class="flex items-center gap-2">
            <button
              class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              @click="handleImportClick"
            >
              <el-icon><Upload /></el-icon>
              导入物料
            </button>
            <button
              class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              @click="handleAddItem"
            >
              <el-icon><Plus /></el-icon>
              添加物料
            </button>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept=".xlsx,.xls,.csv"
            class="hidden"
            style="display: none"
            @change="handleFileChange"
          />
        </div>

        <!-- 空状态 -->
        <div
          v-if="createItems.length === 0"
          class="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-400 rounded-lg"
        >
          暂无物料，请点击"添加物料"按钮添加
        </div>

        <!-- 表格 -->
        <div
          v-else
          class="overflow-x-auto rounded-lg border border-gray-300 bg-white"
        >
          <table class="min-w-full text-xs">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">操作</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">物料编码</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">物料名称</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">分类</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">规格型号</th>
                <th class="px-2 py-2 text-center font-semibold text-gray-600 whitespace-nowrap">单位</th>
                <th class="px-2 py-2 text-right font-semibold text-gray-600 whitespace-nowrap">数量</th>
                <th class="px-2 py-2 text-right font-semibold text-gray-600 whitespace-nowrap">预估单价</th>
                <th class="px-2 py-2 text-right font-semibold text-gray-600 whitespace-nowrap">预估总价</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">供应商</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">用途说明</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">备注</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in createItems" :key="item.id" class="hover:bg-gray-50">
                <td class="px-2 py-1.5 whitespace-nowrap">
                  <el-button
                    text
                    @click="handleDeleteItem(item.id)"
                  >
                    <el-icon color="#ef4444" :size="14"><Delete /></el-icon>
                  </el-button>
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <el-input
                    :model-value="item.materialCode"
                    placeholder="编码"
                    @update:model-value="(v) => handleUpdateItem(item.id, 'materialCode', v)"
                  />
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <!-- ✅ 修复 P0-7: 物料名称改用 MaterialAutocomplete 组件（V1.1 CreatePlanModal.tsx L551-565 1:1 翻译） -->
                  <MaterialAutocomplete
                    :model-value="item.materialName"
                    placeholder="输入名称搜索物料库"
                    not-found-mode="hide"
                    style="min-width: 160px"
                    @update:model-value="(v) => handleUpdateItem(item.id, 'materialName', v)"
                    @select="(m) => handleMaterialSelect(item.id, m)"
                  />
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <el-input
                    :model-value="item.category"
                    placeholder="分类"
                    @update:model-value="(v) => handleUpdateItem(item.id, 'category', v)"
                  />
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <el-input
                    :model-value="item.specification"
                    placeholder="规格"
                    @update:model-value="(v) => handleUpdateItem(item.id, 'specification', v)"
                  />
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap text-center">
                  <el-input
                    :model-value="item.unit"
                    placeholder="单位"
                    @update:model-value="(v) => handleUpdateItem(item.id, 'unit', v)"
                  />
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap text-right">
                  <el-input
                    :model-value="String(item.quantity || '')"
                    type="number"
                    :min="0"
                    :step="0.01"
                    placeholder="0"
                    @update:model-value="(v) => handleUpdateItem(item.id, 'quantity', Number(v) || 0)"
                  />
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap text-right">
                  <el-input
                    :model-value="String(item.estimatedPrice || '')"
                    type="number"
                    :min="0"
                    :step="0.01"
                    placeholder="0"
                    @update:model-value="(v) => handleUpdateItem(item.id, 'estimatedPrice', Number(v) || 0)"
                  />
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap text-right">
                  <span class="text-xs text-gray-900 font-medium">
                    ¥{{ (item.estimatedTotalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </span>
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <el-input
                    :model-value="item.supplier"
                    placeholder="供应商"
                    @update:model-value="(v) => handleUpdateItem(item.id, 'supplier', v)"
                  />
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <el-input
                    :model-value="item.purpose"
                    placeholder="用途"
                    @update:model-value="(v) => handleUpdateItem(item.id, 'purpose', v)"
                  />
                </td>
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <!-- V1.1 L640: 备注列特殊样式 h-6 w-14 p-1 text-xs rounded border-gray-300 -->
                  <el-input
                    :model-value="item.remark"
                    placeholder="备注"
                    style="width: 56px"
                    @update:model-value="(v) => handleUpdateItem(item.id, 'remark', v)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 底部按钮（V1.1 Modal 默认 footer：size=default h-10 px-4 py-2，1:1 对齐 V1.1 Modal.tsx L356-375） -->
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          class="h-10 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 inline-flex items-center justify-center"
          @click="handleClose"
        >
          取消
        </button>
        <button
          class="h-10 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center justify-center"
          @click="handleSubmit"
        >
          提交
        </button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
/**
 * @file CreatePlanModal.vue
 * @description 采购计划创建弹窗 - 1:1 翻译自 V1.1 CreatePlanModal.tsx
 *              新增采购申请单：基本信息表单 + 物料明细可编辑表格
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\CreatePlanModal.tsx
 */
import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import { Refresh, Upload, Plus, Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElModal } from '@/components/ui'
import { usePlantingStore } from '@/stores/modules/planting'
import { getNextPurchaseApplicationCode } from '@/services/apiPurchasePlanService'
import { getDictionaries } from '@/services/dictionaryService'
import { showAlert } from '@/lib/dialogService'
// ✅ 修复 P0-7: 引入物料自动补全组件
import MaterialAutocomplete from '@/components/common/MaterialAutocomplete.vue'

// ✅ 修复 P0-18: 审批规则折叠状态（V1.1 L450-479 1:1 翻译）
const showApprovalRules = ref(false)

// ==================== JSDoc 类型定义 ====================

/**
 * 采购计划物料明细项（1:1 翻译 V1.1 PurchasePlanItem）
 * @typedef {Object} PurchasePlanItem
 * @property {string} id
 * @property {string} [materialId]
 * @property {string} materialCode
 * @property {string} materialName
 * @property {string} [barcode]
 * @property {string} category
 * @property {string} specification
 * @property {string} unit
 * @property {number} quantity
 * @property {number} estimatedPrice
 * @property {number} estimatedTotalPrice
 * @property {string} supplier
 * @property {string} [location]
 * @property {string} [batchNo]
 * @property {string} [productionDate]
 * @property {string} [expiryDate]
 * @property {string} purpose
 * @property {string} remark
 */

/**
 * 创建采购计划表单状态（1:1 翻译 V1.1 createForm）
 * @typedef {Object} CreateFormState
 * @property {string} purchaseApplicationCode
 * @property {string} relatedBatchCode
 * @property {string} purchaseType
 * @property {string} applicant
 * @property {string} applicantDepartment
 * @property {string} applyDate
 * @property {string} requiredDate
 * @property {string} priority
 * @property {string} remark
 * @property {string} otherBatchReason
 * @property {string} approvalPerson
 */

// ==================== Props (完整定义，匹配 V1.1) ====================

const props = defineProps({
  /** 弹窗显示状态 */
  isOpen: {
    type: Boolean,
    default: false,
  },
  /** 创建表单数据 - 1:1 V1.1 createForm */
  createForm: {
    type: Object,
    required: true,
    default: () => ({
      purchaseApplicationCode: '',
      relatedBatchCode: '',
      purchaseType: 'production',
      applicant: '',
      applicantDepartment: '',
      applyDate: '',
      requiredDate: '',
      priority: 'normal',
      remark: '',
      otherBatchReason: '',
      approvalPerson: '',
    }),
  },
  /** 物料明细数组 */
  createItems: {
    type: Array,
    default: () => [],
  },
  /** 采购计划数据列表（用于检查编号重复） */
  purchasePlansData: {
    type: Array,
    default: () => [],
  },
})

// ==================== Emits (1:1 翻译 V1.1 回调) ====================

/**
 * @event update:isOpen 双向绑定弹窗状态
 * @event close 关闭弹窗
 * @event form-change 单字段更新 (field, value)
 * @event items-change 物料明细整体更新 (items)
 * @event submit 提交表单
 */
const emit = defineEmits([
  'update:isOpen',
  'close',
  'form-change',
  'items-change',
  'submit',
])

// ==================== Store（用于关联批次选项） ====================

const plantingStore = usePlantingStore()

/** 1:1 翻译 V1.1 safeArray + usePlantingStore.items */
const plantingItems = computed(() => {
  const list = plantingStore.plantings
  return Array.isArray(list) ? list : []
})

// V1.1: useEffect 加载种植列表
onMounted(() => {
  if (plantingItems.value.length === 0 && typeof plantingStore.fetchPlantings === 'function') {
    plantingStore.fetchPlantings()
  }
  // 1:1 翻译 V1.1：弹窗打开时动态读取金额阈值字典
  loadAmountThresholds()
})

/** 1:1 翻译 V1.1 - 弹窗打开时从字典服务读取 amount_threshold 阈值 */
const amountThresholdsRaw = ref(/** @type {any[]} */ ([]))
const thresholdsLoading = ref(false)

async function loadAmountThresholds() {
  thresholdsLoading.value = true
  try {
    const all = await getDictionaries('amount_threshold')
    amountThresholdsRaw.value = Array.isArray(all) ? all : []
  } catch (err) {
    console.error('[CreatePlanModal] 读取金额阈值字典失败:', err)
    amountThresholdsRaw.value = []
  } finally {
    thresholdsLoading.value = false
  }
}

/** 1:1 翻译 V1.1 - 按 sortOrder 升序排列阈值 */
const amountThresholds = computed(() => {
  const items = amountThresholdsRaw.value
    .filter((d) => (d.status === 'active' || !d.status))
    .sort((a, b) => (a.sortNumber || 0) - (b.sortNumber || 0))
  return items.map((d, idx) => {
    const maxAmount = Number(d.name) || 0
    const displayName = d.displayName || d.name || ''
    return { maxAmount, displayName, sortOrder: idx }
  })
})

/** 1:1 翻译 V1.1 L273-299 - 阈值列表（最后一档显示为"≥最大值"） */
const thresholdDisplay = computed(() => {
  const list = /** @type {{ max: string; label: string; color: string }[]} */ ([])
  const colorMap = ['green', 'amber', 'orange', 'red'] // exempt/quick/standard/strict
  if (amountThresholds.value.length === 0) return list
  amountThresholds.value.forEach((t, i) => {
    // 1:1 翻译 V1.1 L277-283: 最后一档用 ≥ 表示，前一档用 ~ 表示
    const isLast = i === amountThresholds.value.length - 1
    const range = isLast
      ? `金额 ≥ ${t.maxAmount.toLocaleString()} 元`
      : i === 0
        ? `金额 < ${t.maxAmount.toLocaleString()} 元`
        : `金额 ${amountThresholds.value[i - 1].maxAmount.toLocaleString()} ~ ${t.maxAmount.toLocaleString()} 元`
    const color = colorMap[i] || 'gray'
    const colorClass = {
      green: 'text-green-700',
      amber: 'text-amber-700',
      orange: 'text-orange-700',
      red: 'text-red-700',
      gray: 'text-gray-700',
    }[color]
    // 1:1 翻译 V1.1 L292-295: 优先使用 displayName，否则兜底为"需相应审批"
    const label = t.displayName && t.displayName.trim() && t.displayName !== String(t.maxAmount)
      ? t.displayName
      : '需相应审批'
    list.push({ max: range, label, color: colorClass })
  })
  return list
})

/** 1:1 翻译 V1.1 - 弹窗 isOpen 变化时刷新阈值（绕过缓存每次拉最新） */
watch(() => props.isOpen, (open) => {
  if (open) {
    loadAmountThresholds()
  }
})

/** 关联批次选项（1:1 翻译 V1.1 batchOptions） */
const batchOptions = computed(() => {
  const opts = plantingItems.value.map((b) => ({
    value: String(b.plantCode || b.id),
    label: `${b.plantCode || b.id} - ${b.cropName || ''}`,
  }))
  opts.push({ value: 'other', label: '其他' })
  return opts
})

/** 部门选项（1:1 翻译 V1.1 departmentOptions） */
const departmentOptions = [
  { value: '生产部', label: '生产部' },
  { value: '后勤部', label: '后勤部' },
  { value: '办公室', label: '办公室' },
  { value: '技术部', label: '技术部' },
]

// ==================== 文件导入 ====================

const fileInputRef = ref(/** @type {HTMLInputElement | null} */ (null))

/** 1:1 翻译 V1.1 handleImportClick */
function handleImportClick() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

/** 1:1 翻译 V1.1 handleFileChange */
function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target?.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // 1:1 V1.1 数据解析
      const importedItems = jsonData.map((row, index) => ({
        id: `IMPORT-${Date.now()}-${index}`,
        materialCode: row['物料编码'] || row['materialCode'] || '',
        materialName: row['物料名称'] || row['materialName'] || '',
        category: row['分类'] || row['category'] || '',
        specification: row['规格型号'] || row['specification'] || '',
        unit: row['单位'] || row['unit'] || '袋',
        quantity: Number(row['数量'] || row['quantity'] || 0),
        estimatedPrice: Number(row['预估单价'] || row['estimatedPrice'] || 0),
        estimatedTotalPrice:
          Number(row['数量'] || row['quantity'] || 0) *
          Number(row['预估单价'] || row['estimatedPrice'] || 0),
        supplier: row['供应商'] || row['supplier'] || '',
        purpose: row['用途说明'] || row['purpose'] || '',
        remark: row['备注'] || row['remark'] || '',
      })).filter((item) => item.materialCode || item.materialName)

      if (importedItems.length > 0) {
        emit('items-change', [...props.createItems, ...importedItems])
        showAlert(`成功导入 ${importedItems.length} 条物料明细`)
      } else {
        showAlert('导入失败：未找到有效的物料数据')
      }
    } catch (error) {
      showAlert('导入失败：请确保文件格式正确')
    }
  }
  reader.readAsArrayBuffer(file)
  // 清空 input 值，允许重复选择同一文件
  e.target.value = ''
}

// ==================== 物料明细操作 ====================

/** 1:1 翻译 V1.1 handleAddItem */
function handleAddItem() {
  const newItem = {
    id: `NEW-${Date.now()}`,
    materialId: '',
    materialCode: '',
    materialName: '',
    barcode: '',
    category: '',
    specification: '',
    unit: '袋',
    quantity: 0,
    estimatedPrice: 0,
    estimatedTotalPrice: 0,
    supplier: '',
    location: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
    purpose: '',
    remark: '',
  }
  emit('items-change', [...props.createItems, newItem])
}

/** 1:1 翻译 V1.1 handleDeleteItem */
function handleDeleteItem(id) {
  emit('items-change', props.createItems.filter((item) => item.id !== id))
}

/** 1:1 翻译 V1.1 handleUpdateItem (含自动计算预估总价) */
function handleUpdateItem(id, field, value) {
  const next = props.createItems.map((item) => {
    if (item.id !== id) return item
    const updated = { ...item, [field]: value }
    // 1:1 翻译 V1.1 L212-213: 数量/单价变化时自动计算总价，保留 2 位小数（避免浮点精度问题）
    if (field === 'quantity' || field === 'estimatedPrice') {
      updated.estimatedTotalPrice = Math.round(Number(updated.quantity) * Number(updated.estimatedPrice) * 100) / 100
    }
    return updated
  })
  emit('items-change', next)
}

/** ✅ 修复 P0-7: 选中物料后自动填充主数据字段（V1.1 L159-175 1:1 翻译） */
function handleMaterialSelect(id, m) {
  const next = props.createItems.map((item) => {
    if (item.id !== id) return item
    return {
      ...item,
      materialId: String(m.id),
      materialCode: m.code,
      materialName: m.name,
      category: m.category || '',
      specification: m.specification || '',
      unit: m.unit || '',
      barcode: m.barcode || '',
      supplier: m.supplier || '',
    }
  })
  emit('items-change', next)
}

// ==================== 表单字段更新 ====================

function emitFormChange(field, value) {
  emit('form-change', field, value)
}

/** 1:1 翻译 V1.1 onValueChange 中的 purchaseType 联动逻辑 */
function handlePurchaseTypeChange(v) {
  emit('form-change', 'purchaseType', v)
  // 生产物资采购必须关联批次，其他类型不关联
  if (v !== 'production') {
    emit('form-change', 'relatedBatchCode', '')
  }
}

// ==================== 生成编号 ====================

/**
 * 1:1 翻译 V1.1 generateCode + handleGenerateCode
 * 调用后端 /api/purchase-plans/next-code 端点
 * 规则：PA + YYYYMM + 4位流水号
 * @returns {Promise<string>}
 */
async function generateCode() {
  try {
    return await getNextPurchaseApplicationCode()
  } catch (err) {
    // 兜底：PA + 年月 + 4位随机
    const now = new Date()
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    return `PA${ym}${random}`
  }
}

async function handleGenerateCode() {
  const newCode = await generateCode()
  if (newCode) {
    emit('form-change', 'purchaseApplicationCode', newCode)
  } else {
    const now = new Date()
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    emit('form-change', 'purchaseApplicationCode', `PA${ym}${random}`)
  }
}

// ==================== 关闭/提交 ====================

// 关闭
function handleClose() {
  emit('update:isOpen', false)
  emit('close')
}

function handleSubmit() {
  emit('submit')
}
</script>

<style scoped>
/* 1:1 对齐 V2.0 订单管理 AddModal 弹窗输入框样式：
   V1.1 AddModal L199 inputDeepClass = px-4 py-3 border border-gray-400 rounded-lg text-sm
   focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner
   Element Plus 主题覆盖 */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  padding: 0 11px !important;
  box-shadow: 0 0 0 1px #9ca3af inset !important;
  border-radius: 0.5rem !important;
  transition: box-shadow 0.15s ease-in-out;
  min-height: 38px;
}
:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #10b981 inset !important;
}
:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 2px rgba(16, 185, 129, 0.2) inset !important;
  outline: none;
}
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  font-size: 14px !important;
}
:deep(.el-select__wrapper) {
  padding: 0 11px !important;
  box-shadow: 0 0 0 1px #9ca3af inset !important;
  border-radius: 0.5rem !important;
  min-height: 38px;
  background: #fff;
}
:deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #10b981 inset !important;
}
:deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #10b981 inset, 0 0 0 2px rgba(16, 185, 129, 0.2) inset !important;
}
:deep(.el-select__placeholder) {
  font-size: 14px;
  color: #9ca3af;
}
/* 错误状态（V1.1 errors.orderCode 触发 border-red-500） */
:deep(.el-input__wrapper.is-error) {
  box-shadow: 0 0 0 1px #ef4444 inset !important;
}
</style>

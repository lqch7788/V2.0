<!--
  采购计划批量编辑弹窗
  1:1 翻译自 V1.1 src/components/purchasePlan/BatchEditModal.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\BatchEditModal.tsx
  @description 9 字段编辑表单 + 物料明细展开（MaterialItemsTable edit 模式）
-->
<template>
  <ElModal
    :model-value="visible"
    title="编辑采购申请单"
    width="1280px"
    height="700px"
    size="xxl"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    :show-footer="false"
    :show-maximize="true"
    @update:model-value="(v) => !v && handleClose()"
    @close="handleClose"
  >
    <!-- Info Banner - 1:1 对齐 V1.1 L257-259 -->
    <div class="bg-blue-50 rounded-lg p-4 mb-4">
      <p class="text-sm text-blue-800">已选择 <strong>{{ selectedRows.length }}</strong> 个采购计划进行编辑</p>
    </div>

    <div class="space-y-4">
      <!-- 采购申请批次号下拉（V1.1 L238-250 BatchSelectDropdown） -->
    <div class="relative" ref="batchSelectRef">
        <label class="text-gray-700">选择采购申请批次号</label>
        <div
          class="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between cursor-pointer hover:border-blue-400"
          @click="handleBatchSelectOpen(!batchSelectOpen)"
        >
          <span :class="selectedPlanCode ? 'text-sm text-gray-900' : 'text-sm text-gray-400'">
            {{ selectedPlanCode || '-- 请选择 --' }}
          </span>
          <el-icon :class="['w-4 h-4 text-gray-400 transition-transform', batchSelectOpen ? 'rotate-180' : '']">
            <ArrowDown />
          </el-icon>
        </div>
        <div
          v-if="batchSelectOpen"
          class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <template v-if="selectedRows.length > 0">
            <div
              v-for="plan in selectablePlans"
              :key="plan.purchaseApplicationCode"
              :class="[
                'px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center gap-2',
                selectedPlanCode === plan.purchaseApplicationCode ? 'bg-blue-100' : ''
              ]"
              @click="handlePlanSelect(plan)"
            >
              <span class="text-sm flex items-center gap-1">
                {{ plan.purchaseApplicationCode }}
                <span v-if="isPlanEdited(plan.purchaseApplicationCode)" class="text-blue-600 font-bold">✓已编辑</span>
              </span>
            </div>
          </template>
          <div v-else class="px-3 py-2 text-sm text-gray-400">-- 请先选择要编辑的数据 --</div>
        </div>
      </div>

      <!-- 编辑表单（V1.1 L253 紧凑布局 grid-cols-2 md:grid-cols-3） -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <!-- 第1行：采购申请批次号（只读）+ 采购类型 + 关联生产批次号 -->
        <div class="bg-gray-50 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-1">采购申请批次号</div>
          <div class="text-sm font-medium text-gray-900">
            {{ currentEditingPlan?.purchaseApplicationCode || '-' }}
          </div>
        </div>
        <div>
          <label class="text-xs text-gray-700">采购类型</label>
          <el-select v-model="batchEditData.purchaseType" placeholder="请选择" style="width: 100%" size="small">
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
          <label class="text-xs text-gray-700">关联生产批次号</label>
          <el-select
            :model-value="currentEditingPlan?.relatedBatchCode || ''"
            placeholder="不关联批次"
            style="width: 100%"
            size="small"
            clearable
            @update:model-value="(v) => handleCurrentEditingChange('relatedBatchCode', v || '')"
          >
            <el-option value="" label="不关联批次" />
            <el-option
              v-for="opt in batchOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
            <!-- ✅ 修复 P0-11: 补 "其他" option（V1.1 L309-316 1:1 翻译） -->
            <el-option value="other" label="其他" />
          </el-select>
        </div>

        <!-- ✅ 修复 P0-12: 关联批次=其他时显示"其他说明"字段（V1.1 L320-330 1:1 翻译） -->
        <div v-if="(currentEditingPlan?.relatedBatchCode || '') === 'other'" class="md:col-span-3">
          <label class="text-xs text-gray-700">其他说明</label>
          <el-input
            :model-value="currentEditingPlan?.otherBatchReason || ''"
            placeholder="请说明采购原因，如：日常用具、劳保用品等"
            size="small"
            style="width: 100%"
            @update:model-value="(v) => handleCurrentEditingChange('otherBatchReason', v)"
          />
        </div>

        <!-- 第2行：申请人 + 申请部门 + 申请日期（1:1 翻译 V1.1 L332-374） -->
        <div>
          <label class="text-xs text-gray-700">申请人</label>
          <el-select
            :model-value="currentEditingPlan?.applicantId || ''"
            placeholder="请选择"
            style="width: 100%"
            size="small"
            clearable
            filterable
            @update:model-value="(v) => handleApplicantChange(v)"
          >
            <el-option
              v-for="u in users"
              :key="u.id"
              :label="u.realName || u.name || u.username"
              :value="u.id"
            />
          </el-select>
        </div>
        <div>
          <label class="text-xs text-gray-700">申请部门</label>
          <el-select
            :model-value="currentEditingPlan?.applicantDepartment || ''"
            placeholder="请选择"
            style="width: 100%"
            size="small"
            @update:model-value="(v) => handleCurrentEditingChange('applicantDepartment', v)"
          >
            <el-option
              v-for="opt in departmentOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <div>
          <label class="text-xs text-gray-700">申请日期</label>
          <el-date-picker
            v-model="batchEditData.applyDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            size="small"
          />
        </div>

        <!-- 第3行：需求日期（独占一行，1:1 V1.1 L376-385） -->
        <div>
          <label class="text-xs text-gray-700">需求日期</label>
          <el-date-picker
            v-model="batchEditData.requiredDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            size="small"
          />
        </div>

        <!-- 第3行：优先级 + 状态（只读不可编辑）+ 备注 -->
        <div>
          <label class="text-xs text-gray-700">优先级</label>
          <el-select v-model="batchEditData.priority" placeholder="请选择" style="width: 100%" size="small">
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="normal" />
            <el-option label="低" value="low" />
          </el-select>
        </div>
        <!-- ✅ 修复 P0-14: 执行状态字段（V1.1 L404-416 1:1 翻译） -->
        <div>
          <label class="text-xs text-gray-700">执行状态</label>
          <el-select v-model="batchEditData.executionStatus" placeholder="请选择" style="width: 100%" size="small">
            <el-option
              v-for="o in PURCHASE_EXECUTION_STATUS_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-1">状态</div>
          <div
            :class="[
              'text-sm font-medium',
              currentEditingPlan?.status === 'rejected' ? 'text-red-600' :
              currentEditingPlan?.status === 'pending' ? 'text-amber-600' :
              currentEditingPlan?.status === 'approved' ? 'text-blue-600' :
              'text-gray-600'
            ]"
          >
            {{ currentEditingPlan?.statusText || '-' }}
          </div>
        </div>
        <div>
          <label class="text-xs text-gray-700">备注</label>
          <el-input
            v-model="batchEditData.remark"
            placeholder="输入备注"
            style="width: 100%"
            size="small"
          />
        </div>

        <!-- 第4行：物料明细（展开显示） -->
        <div class="md:col-span-3 border-t border-gray-300 pt-3 mt-2">
          <div class="flex items-center justify-between">
            <button
              class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              @click="handleToggleItemsExpanded"
            >
              <el-icon :class="['w-4 h-4 transition-transform', showEditItemsExpanded ? 'rotate-180' : '']">
                <ArrowDown />
              </el-icon>
              物料明细（{{ batchEditItems.length || 0 }}种物料）
            </button>
            <button
              v-if="showEditItemsExpanded"
              class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              @click="handleAddBatchItem"
            >
              <el-icon><Plus /></el-icon>
              新增物料
            </button>
          </div>

          <div
            v-if="showEditItemsExpanded && batchEditItems.length > 0"
            class="mt-3 overflow-auto rounded-lg border border-gray-300 bg-white"
          >
            <table class="w-full text-xs">
              <thead class="bg-gray-50 text-gray-700">
                <tr>
                  <th class="px-2 py-2 text-center font-semibold w-10">操作</th>
                  <th
                    v-for="col in editColumns"
                    :key="col.key"
                    class="px-2 py-2 text-left font-semibold whitespace-nowrap"
                  >{{ col.label }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="item in batchEditItems"
                  :key="item.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-2 py-2 text-center">
                    <button
                      class="h-7 w-7 inline-flex items-center justify-center rounded text-red-500 hover:bg-red-50 hover:text-red-600"
                      title="删除"
                      @click="handleRemoveBatchItem(item.id)"
                    >
                      <el-icon><Delete /></el-icon>
                    </button>
                  </td>
                  <td
                    v-for="col in editColumns"
                    :key="col.key"
                    class="px-2 py-2 whitespace-nowrap"
                  >
                    <el-input
                      :model-value="String(getItemField(item, col.key) ?? '')"
                      :type="col.isNumeric ? 'number' : 'text'"
                      :placeholder="col.label"
                      size="small"
                      @update:model-value="(v) => handleUpdateBatchItem(item.id, col.key, v, col.isNumeric)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="showEditItemsExpanded && batchEditItems.length === 0"
            class="mt-3 text-center py-4 text-gray-500 text-sm border border-dashed border-gray-400 rounded-lg"
          >
            暂无物料明细，请点击"新增物料"按钮添加
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          @click="handleNext"
        >
          确认（下一个）
        </button>
        <button
          class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          @click="handleSubmit"
        >
          保存
        </button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
/**
 * @file BatchEditModal.vue
 * @description 采购计划批量编辑弹窗 - 1:1 翻译 V1.1 BatchEditModal.tsx
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\BatchEditModal.tsx
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ArrowDown, Plus, Delete } from '@element-plus/icons-vue'
import { ElModal } from '@/components/ui'
import { useUserStore } from '@/stores/modules/user'
import { useDictionaryStore } from '@/stores/modules/dictionary'
import { usePlantingStore } from '@/stores/modules/planting'
// ✅ 修复 P0-14: 引入执行状态下拉选项
import { PURCHASE_EXECUTION_STATUS_OPTIONS } from '@/types/purchase'

// ==================== JSDoc 类型 ====================

/**
 * @typedef {import('@/types/purchase').PurchasePlan} PurchasePlan
 * @typedef {import('@/types/purchase').PurchasePlanItem} PurchasePlanItem
 */

// ==================== Props ====================

const props = defineProps({
  visible: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  selectedPlanCode: { type: String, default: '' },
  currentEditingPlan: { type: Object, default: null },
  batchEditData: {
    type: Object,
    // ✅ 修复 P0-15: 10 字段默认值（V1.1 1:1 翻译）
    default: () => ({
      purchaseType: '',
      relatedBatchCode: '',
      otherBatchReason: '',
      applicant: '',
      applicantDepartment: '',
      applyDate: '',
      requiredDate: '',
      priority: '',
      remark: '',
      executionStatus: '',
    }),
  },
  batchEditItems: { type: Array, default: () => [] },
  batchSelectOpen: { type: Boolean, default: false },
  editedPlans: { type: Object, default: () => ({}) },
  purchasePlansData: { type: Array, default: () => [] },
  showEditItemsExpanded: { type: Boolean, default: false },
})

const emit = defineEmits([
  'close',
  'batchSelectOpenChange',
  'selectedPlanCodeChange',
  'batchEditDataChange',
  'batchEditItemsChange',
  'showEditItemsExpandedChange',
  'currentEditingPlanChange',
  'editedPlansChange',
  'submit',
  'next',
])

// ==================== Store ====================

const userStore = useUserStore()
const dictionaryStore = useDictionaryStore()
const plantingStore = usePlantingStore()

/** 1:1 翻译 V1.1 useUserStore.users */
const users = computed(() => (Array.isArray(userStore.users) ? userStore.users : []))
/** 1:1 翻译 V1.1 useDictionaryStore.dictionaries */
const dictionaries = computed(() => (Array.isArray(dictionaryStore.dictionaries) ? dictionaryStore.dictionaries : []))
/** 1:1 翻译 V1.1 usePlantingStore.items */
const plantingItems = computed(() => {
  const list = plantingStore.plantings
  return Array.isArray(list) ? list : []
})

onMounted(() => {
  if (users.value.length === 0 && typeof userStore.loadUsers === 'function') {
    userStore.loadUsers()
  }
  if (dictionaries.value.length === 0 && typeof dictionaryStore.loadDictionaries === 'function') {
    dictionaryStore.loadDictionaries()
  }
  if (plantingItems.value.length === 0 && typeof plantingStore.fetchPlantings === 'function') {
    plantingStore.fetchPlantings()
  }
})

/** ✅ 修复 P0-18: 部门选项改回 V1.1 硬编码 4 项（V1.1 L188-196 1:1 翻译）
 *  原 V2.0 用字典查询会导致：1) 与 CreatePlanModal 不一致 2) 与 V1.1 行为不一致
 *  V1.1 注释：部门选项与 CreatePlanModal 保持一致（硬编码 4 项，DB 字典无 department 分类） */
const departmentOptions = [
  { value: '生产部', label: '生产部' },
  { value: '后勤部', label: '后勤部' },
  { value: '办公室', label: '办公室' },
  { value: '技术部', label: '技术部' },
]

/** 1:1 翻译 V1.1 batchOptions */
const batchOptions = computed(() =>
  plantingItems.value.map((b) => ({
    value: String(b.plantCode || b.id),
    label: `${b.plantCode || b.id} - ${b.cropName || ''}`,
  }))
)

/** 当前可选的采购计划（来自 selectedRows） */
const selectablePlans = computed(() => {
  if (!Array.isArray(props.purchasePlansData) || props.selectedRows.length === 0) return []
  return props.purchasePlansData.filter((p) => props.selectedRows.includes(p.purchaseApplicationCode))
})

/** 1:1 翻译 V1.1 MaterialItemsTable edit mode EDIT_COLUMNS */
const editColumns = [
  { key: 'materialCode', label: '物料编码', isNumeric: false },
  { key: 'materialName', label: '物料名称', isNumeric: false },
  { key: 'category', label: '分类', isNumeric: false },
  { key: 'specification', label: '规格型号', isNumeric: false },
  { key: 'unit', label: '单位', isNumeric: false },
  { key: 'quantity', label: '数量', isNumeric: true },
  { key: 'estimatedPrice', label: '预估单价', isNumeric: true },
  { key: 'supplier', label: '供应商', isNumeric: false },
  { key: 'purpose', label: '用途说明', isNumeric: false },
]

// ==================== 批次号下拉（V1.1 BatchSelectDropdown） ====================

const batchSelectRef = ref(/** @type {HTMLElement | null} */(null))

/** 1:1 翻译 V1.1 外部点击关闭 */
function handleClickOutside(event) {
  if (batchSelectRef.value && !batchSelectRef.value.contains(event.target)) {
    emit('batchSelectOpenChange', false)
  }
}

watch(() => props.batchSelectOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', handleClickOutside)
  } else {
    document.removeEventListener('mousedown', handleClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

function handleBatchSelectOpen(open) {
  emit('batchSelectOpenChange', open)
}

function isPlanEdited(code) {
  return props.editedPlans[code] !== undefined
}

/** ✅ 修复 P0-15 衍生: 切换批次号时同步 10 字段（V1.1 L213-229 1:1 翻译） */
function handlePlanSelect(plan) {
  emit('selectedPlanCodeChange', plan.purchaseApplicationCode)
  emit('currentEditingPlanChange', plan)
  emit('batchEditDataChange', 'purchaseType', plan.purchaseType)
  emit('batchEditDataChange', 'relatedBatchCode', plan.relatedBatchCode || '')
  emit('batchEditDataChange', 'otherBatchReason', plan.otherBatchReason || '')
  emit('batchEditDataChange', 'applicant', plan.applicant || '')
  emit('batchEditDataChange', 'applicantDepartment', plan.applicantDepartment || '')
  emit('batchEditDataChange', 'applyDate', plan.applyDate || '')
  emit('batchEditDataChange', 'requiredDate', plan.requiredDate || '')
  emit('batchEditDataChange', 'priority', plan.priority)
  emit('batchEditDataChange', 'remark', plan.remark || '')
  emit('batchEditDataChange', 'executionStatus', plan.executionStatus || 'pending_execution')
  emit('batchEditItemsChange', plan.items || [])
  emit('batchSelectOpenChange', false)
}

// ==================== 表单字段更新 ====================

/** 申请人变更：根据用户 id 反查姓名 */
function handleApplicantChange(value) {
  if (!props.currentEditingPlan) return
  const selectedUser = users.value.find((u) => u.id === value)
  const applicantName = selectedUser?.realName || selectedUser?.name || ''
  emit('currentEditingPlanChange', {
    ...props.currentEditingPlan,
    applicantId: value,
    applicant: applicantName,
  })
}

/** 关联生产批次号/申请部门 等直接字段变更 */
function handleCurrentEditingChange(field, value) {
  if (!props.currentEditingPlan) return
  emit('currentEditingPlanChange', {
    ...props.currentEditingPlan,
    [field]: value,
  })
}

// ==================== 物料明细操作 ====================

function getItemField(item, key) {
  return item?.[key]
}

function handleToggleItemsExpanded() {
  emit('showEditItemsExpandedChange', !props.showEditItemsExpanded)
}

/** 1:1 翻译 V1.1 新增物料逻辑 */
function handleAddBatchItem() {
  const newItem = {
    id: `new_${Date.now()}`,
    materialId: '',
    materialCode: '',
    materialName: '',
    category: '',
    specification: '',
    unit: '',
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
  emit('batchEditItemsChange', [...props.batchEditItems, newItem])
}

function handleRemoveBatchItem(id) {
  emit('batchEditItemsChange', props.batchEditItems.filter((it) => it.id !== id))
}

/** 1:1 翻译 V1.1 MaterialItemsTable updateItem（数量/单价自动算总价） */
function handleUpdateBatchItem(id, field, value, isNumeric) {
  const next = props.batchEditItems.map((item) => {
    if (item.id !== id) return item
    const updated = { ...item, [field]: isNumeric ? Number(value) || 0 : value }
    if (field === 'quantity' || field === 'estimatedPrice') {
      // 1:1 翻译 V1.1: 保留 2 位小数（避免浮点精度问题）
      updated.estimatedTotalPrice = Math.round(Number(updated.quantity) * Number(updated.estimatedPrice) * 100) / 100
    }
    return updated
  })
  emit('batchEditItemsChange', next)
}

// ==================== 弹窗控制 ====================

function handleClose() {
  emit('close')
}

function handleSubmit() {
  emit('submit')
}

function handleNext() {
  emit('next')
}
</script>

<style scoped>
/* 对齐 V2.0 生产计划页面弹窗输入框样式：border-gray-500 + rounded-lg + focus border-emerald-500 */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select__wrapper) {
  border-radius: 0.5rem !important;
  box-shadow: 0 0 0 1px #6b7280 inset !important;
}
:deep(.el-input__wrapper:hover),
:deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #374151 inset !important;
}
:deep(.el-input.is-focus .el-input__wrapper),
:deep(.el-select.is-focused .el-select__wrapper),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #059669 inset !important;
}
</style>

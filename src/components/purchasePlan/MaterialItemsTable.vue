<!--
  @file 物料明细表格 - 共享组件
  @description 1:1 翻译自 V1.1 src/components/purchasePlan/MaterialItemsTable.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\purchasePlan\MaterialItemsTable.tsx
  支持两种模式：
  - 'view'：只读展示（详情页、列表展开行）
  - 'edit'：可编辑（批量编辑弹窗）
-->
<template>
  <!-- view 模式（默认） -->
  <table v-if="mode === 'view'" class="w-full bg-white rounded-lg overflow-hidden text-xs">
    <thead :class="headerClass">
      <tr>
        <th
          v-for="col in VIEW_COLUMNS"
          :key="col.key"
          :class="['px-2 py-2 text-xs font-semibold whitespace-nowrap', `text-${col.align || 'left'}`]"
        >
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      <tr
        v-for="item in items"
        :key="item.id"
        class="hover:bg-gray-50"
      >
        <td
          v-for="col in VIEW_COLUMNS"
          :key="col.key"
          :class="['px-2 py-2 text-xs whitespace-nowrap', `text-${col.align || 'left'}`, col.key === 'materialName' ? 'text-gray-900 font-medium' : 'text-gray-600']"
        >
          {{ formatCell(item, col) }}
        </td>
      </tr>
    </tbody>
  </table>

  <!-- edit 模式 -->
  <table v-else class="w-full text-xs">
    <thead :class="headerClass">
      <tr>
        <th class="px-2 py-2 text-center font-semibold w-10">操作</th>
        <th
          v-for="col in EDIT_COLUMNS"
          :key="col.key"
          class="px-2 py-2 text-left font-semibold"
        >
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      <tr
        v-for="item in items"
        :key="item.id"
        class="hover:bg-gray-50"
      >
        <td class="px-2 py-2 text-center">
          <button
            type="button"
            :class="btnGhost + ' text-red-500 hover:bg-red-50 hover:text-red-600 p-1'"
            title="删除此行"
            @click="removeItem(item.id)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </td>
        <td
          v-for="col in EDIT_COLUMNS"
          :key="col.key"
          class="px-2 py-2"
        >
          <!-- 物料名称列：使用 MaterialAutocomplete -->
          <MaterialAutocomplete
            v-if="col.key === 'materialName'"
            :model-value="item.materialName ?? ''"
            placeholder="输入名称搜索物料库"
            @update:model-value="(v) => updateItem(item.id, 'materialName', v)"
            @select="(m) => handleMaterialSelect(item.id, m)"
          />
          <!-- 其他列：普通 el-input -->
          <el-input
            v-else
            :model-value="formatInputValue(item, col)"
            :type="isNumeric(col) ? 'number' : 'text'"
            :placeholder="col.label"
            size="small"
            @update:model-value="(v) => updateItem(item.id, col.key, isNumeric(col) ? Number(v) || 0 : v)"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
/**
 * 物料明细表格 - 共享组件
 * 1:1 翻译自 V1.1 src/components/purchasePlan/MaterialItemsTable.tsx
 * - view 模式：只读（详情弹窗 + 表格展开行）
 * - edit 模式：可编辑（批量编辑弹窗）
 * - 支持 emerald / blue 两种表头主题
 */
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import MaterialAutocomplete from '@/components/common/MaterialAutocomplete.vue'
import { btnGhost } from '@/views/production/constants/buttonStyles'

// ==================== Props ====================

const props = defineProps({
  /** 物料明细数组 */
  items: { type: Array, required: true },
  /** 模式：view 只读 / edit 可编辑 */
  mode: {
    type: String,
    default: 'view',
    validator: (v) => ['view', 'edit'].includes(v),
  },
  /** view 模式下的表头主题色（V1.1 L19）*/
  headerTheme: {
    type: String,
    default: 'blue',
    validator: (v) => ['emerald', 'blue'].includes(v),
  },
})

/**
 * @event update:items items 整体更新（V1.1 onItemsChange 1:1 翻译）
 * 支持值或 updater 函数（避免连续调用互相覆盖）
 */
const emit = defineEmits(['update:items', 'items-change'])

// ==================== 列定义（1:1 V1.1）====================

/** view 模式 11 列（V1.1 L22-34）*/
const VIEW_COLUMNS = [
  { key: 'materialCode', label: '物料编码' },
  { key: 'materialName', label: '物料名称' },
  { key: 'category', label: '分类' },
  { key: 'specification', label: '规格型号' },
  { key: 'unit', label: '单位', align: 'center' },
  { key: 'quantity', label: '数量', align: 'right' },
  { key: 'estimatedPrice', label: '预估单价', align: 'right' },
  { key: 'estimatedTotalPrice', label: '小计', align: 'right' },
  { key: 'supplier', label: '供应商' },
  { key: 'purpose', label: '用途说明' },
  { key: 'remark', label: '备注' },
]

/** edit 模式 9 列（V1.1 L36-46）*/
const EDIT_COLUMNS = [
  { key: 'materialCode', label: '物料编码' },
  { key: 'materialName', label: '物料名称' },
  { key: 'category', label: '分类' },
  { key: 'specification', label: '规格型号' },
  { key: 'unit', label: '单位' },
  { key: 'quantity', label: '数量' },
  { key: 'estimatedPrice', label: '预估单价' },
  { key: 'supplier', label: '供应商' },
  { key: 'purpose', label: '用途说明' },
]

// ==================== 表头主题（1:1 V1.1 L54-56）====================

const headerClass = computed(() =>
  props.headerTheme === 'emerald'
    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
)

// ==================== 单元格格式化（1:1 V1.1 L96-114）====================

/**
 * 格式化 view 模式单元格
 * @param {object} item
 * @param {{key: string, label: string, align?: string}} col
 */
function formatCell(item, col) {
  const v = item[col.key]
  // 数量/单价/小计 特殊格式化
  if (col.key === 'quantity') return String(item.quantity ?? '')
  if (col.key === 'estimatedPrice') return `¥${(item.estimatedPrice || 0).toFixed(2)}`
  if (col.key === 'estimatedTotalPrice') {
    return `¥${(item.estimatedTotalPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  // 其他字段：空值兜底为 '-'
  if (v === undefined || v === null || v === '') return '-'
  return String(v)
}

/**
 * edit 模式 input 值：避免 number=0 被空字符串覆盖
 */
function formatInputValue(item, col) {
  const v = item[col.key]
  if (v === undefined || v === null) return ''
  return String(v)
}

function isNumeric(col) {
  return col.key === 'quantity' || col.key === 'estimatedPrice'
}

// ==================== 数据更新（1:1 V1.1 L58-74）====================

/**
 * 通用字段更新：用函数式更新避免 onSelect 一次性写多字段时互相覆盖
 */
function updateItem(id, field, value) {
  emit('items-change', (prev) =>
    prev.map((item) => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      // 数量/单价变化时自动算总价（V1.1 L64-66 1:1 翻译，保留 2 位小数）
      if (field === 'quantity' || field === 'estimatedPrice') {
        updated.estimatedTotalPrice =
          Math.round(Number(updated.quantity) * Number(updated.estimatedPrice) * 100) / 100
      }
      return updated
    })
  )
}

/** 选中物料后自动填充主数据字段（V1.1 L159-175 1:1 翻译） */
function handleMaterialSelect(id, m) {
  emit('items-change', (prev) =>
    prev.map((item) => {
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
  )
}

function removeItem(id) {
  emit('items-change', (prev) => prev.filter((item) => item.id !== id))
}
</script>

<template>
  <!--
    批量编辑物料弹窗 - 严格 1:1 对齐 V1.1 MaterialBatchEditModal.tsx
    V1.1: <UnifiedModal title="批量编辑物料" size="xxl" (1080×650) showFooter={false}>
    V1.1 showFooter=false 意味着 footer 完全由组件内部自定义（确认/保存全部两个按钮）
  -->
  <UnifiedModal
    :model-value="isOpen"
    title="批量编辑物料"
    size="xxl"
    :show-footer="false"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <!-- 1. 顶部提示信息 - 对应V1.1: bg-blue-50 + 蓝字 -->
    <div class="bg-blue-50 rounded-lg p-4 mb-4">
      <p class="text-sm text-blue-800">
        已选择 <strong>{{ selectedRows.length }}</strong> 个物料进行批量编辑，已编辑 <strong>{{ editedCount }}</strong> 个
      </p>
    </div>

    <!-- 2. 选择物料 - 对应V1.1: deepInputClass 风格 Select -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">选择物料</label>
      <select
        :value="currentMaterialId ?? ''"
        @change="handleMaterialSelect($event.target.value)"
        class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
      >
        <option value="">请选择物料</option>
        <option
          v-for="material in selectedMaterialsList"
          :key="material.id"
          :value="material.id"
        >{{ material.name }} ({{ material.code }}){{ batchEditedMaterials[material.id] ? ' ✅ 已编辑' : '' }}</option>
      </select>
    </div>

    <!-- 3. 编辑表单 - 对应V1.1: key={currentMaterialId} 切换物料时强制 remount -->
    <div v-if="currentMaterial" class="space-y-3" :key="currentMaterialId">
      <!-- 3.1 第1行: 物料编号 + 分类 + 数据状态(3列卡片) -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">物料编号</div>
          <div class="text-sm font-medium text-gray-900">{{ currentEditedData.code }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">分类</div>
          <div class="text-sm font-medium text-gray-900 truncate">{{ currentEditedData.category }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">数据状态</div>
          <select
            :value="currentEditedData.dataStatus || '启用'"
            class="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @change="handleFieldChange('dataStatus', $event.target.value)"
          >
            <option value="启用">启用</option>
            <option value="停用">停用</option>
          </select>
        </div>
      </div>

      <!-- 3.2 第2行: 库存数量 + 最低库存 + 最高库存 (3列 NumberInput h-8 px-3) -->
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">库存数量</label>
          <input
            :value="currentEditedData.quantity ?? ''"
            type="number"
            step="0.01"
            min="0"
            class="w-full h-8 px-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @change="handleFieldChange('quantity', parseFloat($event.target.value) || 0)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">最低库存</label>
          <input
            :value="currentEditedData.minStock ?? ''"
            type="number"
            step="0.01"
            min="0"
            class="w-full h-8 px-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @change="handleFieldChange('minStock', parseFloat($event.target.value) || 0)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">最高库存</label>
          <input
            :value="currentEditedData.maxStock ?? ''"
            type="number"
            step="0.01"
            min="0"
            class="w-full h-8 px-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @change="handleFieldChange('maxStock', parseFloat($event.target.value) || 0)"
          />
        </div>
      </div>

      <!-- 3.3 第3行: 单价（元）+ 单位 + 存放位置 (3列 Input py-1.5) -->
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">单价（元）</label>
          <input
            :value="(currentEditedData.price || '').toString().replace('元', '')"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @input="handleFieldChange('price', $event.target.value)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">单位</label>
          <input
            :value="currentEditedData.unit || ''"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @input="handleFieldChange('unit', $event.target.value)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">存放位置</label>
          <input
            :value="currentEditedData.location || ''"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @input="handleFieldChange('location', $event.target.value)"
          />
        </div>
      </div>

      <!-- 3.4 供应商(单行) -->
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">供应商</label>
        <input
          :value="currentEditedData.supplier || ''"
          type="text"
          class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
          @input="handleFieldChange('supplier', $event.target.value)"
        />
      </div>

      <!-- 3.5 第5行: 规格型号 + 条形码 + 批次号 (3列) -->
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">规格型号</label>
          <input
            :value="currentEditedData.specification || ''"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @input="handleFieldChange('specification', $event.target.value)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">条形码</label>
          <input
            :value="currentEditedData.barcode || ''"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @input="handleFieldChange('barcode', $event.target.value)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">批次号</label>
          <input
            :value="currentEditedData.batchNo || ''"
            type="text"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @input="handleFieldChange('batchNo', $event.target.value)"
          />
        </div>
      </div>

      <!-- 3.6 第6行: 生产日期 + 有效期至 (2列 DatePicker) -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">生产日期</label>
          <input
            :value="currentEditedData.productionDate || ''"
            type="date"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @change="handleFieldChange('productionDate', $event.target.value)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">有效期至</label>
          <input
            :value="currentEditedData.expiryDate || ''"
            type="date"
            class="w-full px-4 py-1.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @change="handleFieldChange('expiryDate', $event.target.value)"
          />
        </div>
      </div>
    </div>

    <!-- 4. 底部操作按钮 - 对应V1.1: 确认(下一个) + 保存全部(blue),flex-1 等宽 -->
    <div class="flex gap-3 mt-6">
      <button
        class="flex-1 h-8 px-4 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center gap-1"
        @click="handleNext"
      >
        <Check class="w-4 h-4" />
        确认 {{ currentBatchEditIndex + 1 < selectedRows.length ? '(下一个)' : '(已最后一个)' }}
      </button>
      <button
        class="flex-1 h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center justify-center gap-1"
        @click="handleSaveAll"
      >
        <Save class="w-4 h-4" /> 保存全部 ({{ editedCount }} 个)
      </button>
    </div>
  </UnifiedModal>
</template>

<script setup>
/**
 * 批量编辑物料弹窗 - 严格 1:1 对齐 V1.1 MaterialBatchEditModal.tsx
 * - 容器: UnifiedModal size=xxl (1080×650) showFooter=false
 * - 头部: 蓝字提示(已选N个/已编辑N个)
 * - 物料选择器: deepInputClass 风格
 * - 字段: 物料编号+分类+数据状态(3) / 库存3个(3) / 单价+单位+位置(3) / 供应商(1) / 规格+条码+批次(3) / 生产+有效(2)
 * - 底部: 确认(下一个) + 保存全部(blue),flex-1 等宽
 *
 * 数据流（V1.1 useState + props 同步模式）：
 * - 父组件传入 batchEditedMaterials/currentBatchEditIndex/selectedRows/filteredMaterials
 * - 子组件维护本地状态副本，编辑后 emit onFieldChange/onMaterialSelect/onNext/onSaveAll
 * - 使用 key={currentMaterialId} 强制 remount 避免闭包残留
 */
import { computed, watch } from 'vue'
import { Check, Save } from 'lucide-vue-next'
import { UnifiedModal } from '@/components/ui'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  filteredMaterials: { type: Array, default: () => [] },
  batchEditedMaterials: { type: Object, default: () => ({}) },
  currentBatchEditIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'materialSelect', 'fieldChange', 'saveAll', 'next'])

// V1.1: filteredMaterials.filter(m => selectedRows.includes(m.id))
const selectedMaterialsList = computed(() => {
  return props.filteredMaterials.filter(m => props.selectedRows.includes(m.id))
})

// V1.1: const currentMaterialId = selectedRows[currentBatchEditIndex]
const currentMaterialId = computed(() => {
  return props.selectedRows[props.currentBatchEditIndex]
})

// V1.1: const currentMaterial = selectedMaterialsList.find(m => m.id === currentMaterialId)
const currentMaterial = computed(() => {
  return selectedMaterialsList.value.find(m => m.id === currentMaterialId.value)
})

// V1.1: const currentEditedData = batchEditedMaterials[currentMaterialId] || currentMaterial || {}
const currentEditedData = computed(() => {
  const materialId = currentMaterialId.value
  if (!materialId) return {}
  return props.batchEditedMaterials[materialId] || currentMaterial.value || {}
})

// V1.1: editedCount = Object.keys(batchEditedMaterials).length
// 注: V1.1 简化版本用 length,V2.0 应保持与 V1.1 一致,不再做深度对比
const editedCount = computed(() => Object.keys(props.batchEditedMaterials).length)

// V1.1 onValueChange: const idx = selectedRows.indexOf(Number(val)); onMaterialSelect(idx >= 0 ? idx : 0)
const handleMaterialSelect = (val) => {
  const idx = props.selectedRows.indexOf(Number(val))
  emit('materialSelect', idx >= 0 ? idx : 0)
}

// V1.1 onFieldChange: 直接 emit 给父组件
const handleFieldChange = (field, value) => {
  const materialId = currentMaterialId.value
  if (!materialId) return
  emit('fieldChange', materialId, field, value)
}

// V1.1 onNext: 不做循环处理,父组件负责
const handleNext = () => {
  emit('next')
}

// V1.1 onSaveAll
const handleSaveAll = () => {
  emit('saveAll')
}
</script>

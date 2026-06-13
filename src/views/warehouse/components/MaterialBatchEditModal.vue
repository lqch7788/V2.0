<template>
  <!-- 批量编辑物料弹窗 - 对应V1.1 MaterialBatchEditModal.tsx -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="$emit('close')">
    <div class="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
      <!-- 弹窗头部 -->
      <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between">
        <h3 class="text-lg font-semibold">批量编辑物料</h3>
        <button @click="$emit('close')" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <!-- 弹窗内容 -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <!-- 提示信息 -->
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
          <p class="text-sm text-blue-800">
            已选择 <strong>{{ selectedRows.length }}</strong> 个物料进行批量编辑，已编辑 <strong>{{ editedCount }}</strong> 个
          </p>
        </div>

        <!-- 选择物料 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">选择物料</label>
          <select
            v-model="localSelectedMaterialId"
            class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
            @change="handleMaterialSelect(localSelectedMaterialId)"
          >
            <option value="">请选择物料</option>
            <option
              v-for="material in selectedMaterialsList"
              :key="material.id"
              :value="material.id"
            >{{ material.name }} ({{ material.code }}){{ batchEditedMaterials[material.id] ? ' ✅ 已编辑' : '' }}</option>
          </select>
        </div>

        <!-- 编辑表单 -->
        <div v-if="currentMaterial" class="space-y-3">
          <!-- 物料信息展示 -->
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">物料编号</div>
              <div class="text-sm font-medium text-gray-900">{{ currentEditedData.code || currentMaterial.code }}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">分类</div>
              <div class="text-sm font-medium text-gray-900 truncate">{{ currentEditedData.category || currentMaterial.category }}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-2">
              <div class="text-xs text-gray-500 mb-1">数据状态</div>
              <select
                v-model="currentEditedData.dataStatus"
                class="w-full px-2 py-1.5 border border-gray-400 rounded text-sm bg-white"
                @change="handleFieldChange('dataStatus', currentEditedData.dataStatus)"
              >
                <option value="启用">启用</option>
                <option value="停用">停用</option>
              </select>
            </div>
          </div>

          <!-- 库存相关 -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">库存数量</label>
              <input
                v-model.number="currentEditedData.quantity"
                type="number"
                step="0.01"
                min="0"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @change="handleFieldChange('quantity', currentEditedData.quantity)"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">最低库存</label>
              <input
                v-model.number="currentEditedData.minStock"
                type="number"
                step="0.01"
                min="0"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @change="handleFieldChange('minStock', currentEditedData.minStock)"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">最高库存</label>
              <input
                v-model.number="currentEditedData.maxStock"
                type="number"
                step="0.01"
                min="0"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @change="handleFieldChange('maxStock', currentEditedData.maxStock)"
              />
            </div>
          </div>

          <!-- 价格和位置 -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">单价（元）</label>
              <input
                v-model="currentEditedData.price"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @input="handleFieldChange('price', currentEditedData.price)"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">单位</label>
              <input
                v-model="currentEditedData.unit"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @input="handleFieldChange('unit', currentEditedData.unit)"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">存放位置</label>
              <input
                v-model="currentEditedData.location"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @input="handleFieldChange('location', currentEditedData.location)"
              />
            </div>
          </div>

          <!-- 供应商 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">供应商</label>
            <input
              v-model="currentEditedData.supplier"
              class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
              @input="handleFieldChange('supplier', currentEditedData.supplier)"
            />
          </div>

          <!-- 规格和条码 -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">规格型号</label>
              <input
                v-model="currentEditedData.specification"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @input="handleFieldChange('specification', currentEditedData.specification)"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">条形码</label>
              <input
                v-model="currentEditedData.barcode"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @input="handleFieldChange('barcode', currentEditedData.barcode)"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">批次号</label>
              <input
                v-model="currentEditedData.batchNo"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @input="handleFieldChange('batchNo', currentEditedData.batchNo)"
              />
            </div>
          </div>

          <!-- 日期 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">生产日期</label>
              <input
                v-model="currentEditedData.productionDate"
                type="date"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @change="handleFieldChange('productionDate', currentEditedData.productionDate)"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">有效期至</label>
              <input
                v-model="currentEditedData.expiryDate"
                type="date"
                class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm"
                @change="handleFieldChange('expiryDate', currentEditedData.expiryDate)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底部 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleNext">
          确认 {{ currentBatchEditIndex + 1 < selectedRows.length ? '(下一个)' : '(已最后一个)' }}
        </button>
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleSaveAll">
          保存全部 ({{ editedCount }} 个)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref } from 'vue'

/**
 * 批量编辑物料弹窗组件
 * 提供批量编辑多个物料的功能
 */

const props = defineProps({
  // 是否显示
  isOpen: {
    type: Boolean,
    default: false
  },
  // 已选择的行ID列表
  selectedRows: {
    type: Array,
    default: () => []
  },
  // 筛选后的物料列表（用于根据ID找到对应物料）
  filteredMaterials: {
    type: Array,
    default: () => []
  },
  // 批量编辑的物料数据
  batchEditedMaterials: {
    type: Object,
    default: () => ({})
  },
  // 当前编辑的索引
  currentBatchEditIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'close',
  'materialSelect',
  'fieldChange',
  'saveAll',
  'next'
])

// 本地状态
const localSelectedMaterialId = ref(null)
const localBatchEditedMaterials = reactive({ ...props.batchEditedMaterials })
const localCurrentIndex = ref(props.currentBatchEditIndex)

// 监听 props 变化
watch(() => props.batchEditedMaterials, (val) => {
  Object.keys(val).forEach(key => {
    localBatchEditedMaterials[key] = val[key]
  })
}, { deep: true })

watch(() => props.currentBatchEditIndex, (val) => {
  localCurrentIndex.value = val
})

// 计算属性
const selectedMaterialsList = computed(() => {
  return props.filteredMaterials.filter(m => props.selectedRows.includes(m.id))
})

const currentMaterialId = computed(() => {
  return props.selectedRows[localCurrentIndex.value]
})

const currentMaterial = computed(() => {
  return selectedMaterialsList.value.find(m => m.id === currentMaterialId.value)
})

const currentEditedData = computed(() => {
  const materialId = currentMaterialId.value
  if (!materialId) return {}
  return localBatchEditedMaterials[materialId] || currentMaterial.value || {}
})

const editedCount = computed(() => {
  return Object.keys(localBatchEditedMaterials).filter(key => {
    const original = props.filteredMaterials.find(m => m.id === Number(key))
    const edited = localBatchEditedMaterials[key]
    if (!original || !edited) return false
    // 检查是否有实际编辑
    return JSON.stringify(original) !== JSON.stringify(edited)
  }).length
})

// 方法
const handleMaterialSelect = (materialId) => {
  const idx = props.selectedRows.indexOf(Number(materialId))
  localCurrentIndex.value = idx >= 0 ? idx : 0
  localSelectedMaterialId.value = materialId
  emit('materialSelect', localCurrentIndex.value)
}

const handleFieldChange = (field, value) => {
  const materialId = currentMaterialId.value
  if (!materialId) return
  const currentData = localBatchEditedMaterials[materialId] || currentMaterial.value || {}
  localBatchEditedMaterials[materialId] = { ...currentData, [field]: value }
  emit('fieldChange', materialId, field, value)
}

const handleNext = () => {
  const nextIndex = localCurrentIndex.value + 1
  if (nextIndex < props.selectedRows.length) {
    localCurrentIndex.value = nextIndex
    localSelectedMaterialId.value = props.selectedRows[nextIndex]
  } else {
    localCurrentIndex.value = 0
    localSelectedMaterialId.value = props.selectedRows[0]
  }
  emit('next')
}

const handleSaveAll = () => {
  emit('saveAll')
  // 重置本地状态
  Object.keys(localBatchEditedMaterials).forEach(key => {
    delete localBatchEditedMaterials[key]
  })
}
</script>

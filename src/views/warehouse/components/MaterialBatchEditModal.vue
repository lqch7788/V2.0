<template>
  <!-- 批量编辑物料弹窗 - 对应V1.1 MaterialBatchEditModal.tsx -->
  <el-dialog
    v-model="dialogVisible"
    title="批量编辑物料"
    width="1000px"
    :close-on-click-modal="false"
  >
    <!-- 提示信息 -->
    <div class="bg-blue-50 rounded-lg p-4 mb-4">
      <p class="text-sm text-blue-800">
        已选择 <strong>{{ selectedRows.length }}</strong> 个物料进行批量编辑，已编辑 <strong>{{ editedCount }}</strong> 个
      </p>
    </div>

    <!-- 选择物料 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">选择物料</label>
      <el-select
        v-model="localSelectedMaterialId"
        placeholder="请选择物料"
        class="w-full"
        @change="handleMaterialSelect"
      >
        <el-option
          v-for="material in selectedMaterialsList"
          :key="material.id"
          :label="`${material.name} (${material.code})${batchEditedMaterials[material.id] ? ' ✅ 已编辑' : ''}`"
          :value="material.id"
        />
      </el-select>
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
          <el-select v-model="currentEditedData.dataStatus" placeholder="启用" @change="handleFieldChange('dataStatus', currentEditedData.dataStatus)">
            <el-option value="启用" label="启用" />
            <el-option value="停用" label="停用" />
          </el-select>
        </div>
      </div>

      <!-- 库存相关 -->
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">库存数量</label>
          <el-input-number
            v-model="currentEditedData.quantity"
            :precision="2"
            :step="1"
            :min="0"
            controls-position="right"
            @change="(val) => handleFieldChange('quantity', val)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">最低库存</label>
          <el-input-number
            v-model="currentEditedData.minStock"
            :precision="2"
            :step="1"
            :min="0"
            controls-position="right"
            @change="(val) => handleFieldChange('minStock', val)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">最高库存</label>
          <el-input-number
            v-model="currentEditedData.maxStock"
            :precision="2"
            :step="1"
            :min="0"
            controls-position="right"
            @change="(val) => handleFieldChange('maxStock', val)"
          />
        </div>
      </div>

      <!-- 价格和位置 -->
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">单价（元）</label>
          <el-input v-model="currentEditedData.price" @input="(val) => handleFieldChange('price', val)" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">单位</label>
          <el-input v-model="currentEditedData.unit" @input="(val) => handleFieldChange('unit', val)" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">存放位置</label>
          <el-input v-model="currentEditedData.location" @input="(val) => handleFieldChange('location', val)" />
        </div>
      </div>

      <!-- 供应商 -->
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">供应商</label>
        <el-input v-model="currentEditedData.supplier" @input="(val) => handleFieldChange('supplier', val)" />
      </div>

      <!-- 规格和条码 -->
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">规格型号</label>
          <el-input v-model="currentEditedData.specification" @input="(val) => handleFieldChange('specification', val)" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">条形码</label>
          <el-input v-model="currentEditedData.barcode" @input="(val) => handleFieldChange('barcode', val)" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">批次号</label>
          <el-input v-model="currentEditedData.batchNo" @input="(val) => handleFieldChange('batchNo', val)" />
        </div>
      </div>

      <!-- 日期 -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">生产日期</label>
          <el-date-picker
            v-model="currentEditedData.productionDate"
            type="date"
            placeholder="选择生产日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            @change="(val) => handleFieldChange('productionDate', val)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">有效期至</label>
          <el-date-picker
            v-model="currentEditedData.expiryDate"
            type="date"
            placeholder="选择有效期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            @change="(val) => handleFieldChange('expiryDate', val)"
          />
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex gap-3">
        <el-button class="flex-1" variant="outline" @click="handleNext">
          确认 {{ currentBatchEditIndex + 1 < selectedRows.length ? '(下一个)' : '(已最后一个)' }}
        </el-button>
        <el-button class="flex-1" type="primary" @click="handleSaveAll">
          保存全部 ({{ editedCount }} 个)
        </el-button>
      </div>
    </template>
  </el-dialog>
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
const dialogVisible = computed({
  get: () => props.isOpen,
  set: (val) => {
    if (!val) emit('close')
  }
})

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

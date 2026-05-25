<template>
  <el-dialog
    v-model="visible"
    title="批量编辑产品库存"
    width="1000px"
    @close="handleClose"
  >
    <!-- 提示信息 -->
    <div class="bg-emerald-50 rounded-lg p-4 mb-4">
      <p class="text-sm text-emerald-800">
        已选择 <strong>{{ selectedRows.length }}</strong> 个产品进行批量编辑，已编辑 <strong>{{ editedCount }}</strong> 个
      </p>
    </div>

    <!-- 选择产品下拉框 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">选择产品</label>
      <el-select
        v-model="currentItemId"
        placeholder="选择产品"
        class="w-full"
        @change="handleItemSelect"
      >
        <el-option
          v-for="(item, idx) in selectedItems"
          :key="item.id"
          :label="`${generateCropCode(item.cropName, item.variety)} - ${item.cropName} ${batchEditedItems[item.id] ? '✅ 已编辑' : ''}`"
          :value="item.id"
        />
      </el-select>
    </div>

    <!-- 产品基本信息（只读） -->
    <div class="bg-gray-50 rounded-lg p-4 mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-3">产品基本信息（不可编辑）</h4>
      <div class="grid grid-cols-4 gap-3">
        <div class="bg-white rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">产品编码</div>
          <div class="text-sm font-medium text-gray-900">{{ generatedCode || '-' }}</div>
        </div>
        <div class="bg-white rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">产品名称</div>
          <div class="text-sm font-medium text-gray-900">{{ currentEditedData.cropName || '-' }}</div>
        </div>
        <div class="bg-white rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">品种</div>
          <div class="text-sm font-medium text-gray-900">{{ currentEditedData.variety || '-' }}</div>
        </div>
        <div class="bg-white rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">品质等级</div>
          <div class="text-sm font-medium text-gray-900">{{ currentEditedData.grade || '-' }}</div>
        </div>
        <div class="bg-white rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">批次号</div>
          <div class="text-sm font-medium text-gray-900">{{ currentEditedData.batchCode || '-' }}</div>
        </div>
        <div class="bg-white rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">仓库</div>
          <div class="text-sm font-medium text-gray-900">{{ currentEditedData.warehouseName || '-' }}</div>
        </div>
        <div class="bg-white rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">采收日期</div>
          <div class="text-sm font-medium text-gray-900">{{ currentEditedData.harvestDate || '-' }}</div>
        </div>
        <div class="bg-white rounded-lg p-2">
          <div class="text-xs text-gray-500 mb-1">入库日期</div>
          <div class="text-sm font-medium text-gray-900">{{ currentEditedData.storageDate || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- 可编辑字段 -->
    <div class="space-y-4">
      <h4 class="text-sm font-medium text-gray-700">可编辑字段</h4>

      <!-- 库存信息 -->
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs text-gray-700 mb-1">库存数量</label>
          <el-input-number
            v-model="currentEditedData.quantity"
            :min="0"
            controls-position="right"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1">最低库存预警</label>
          <el-input-number
            v-model="currentAlertSettings.minStock"
            :min="0"
            controls-position="right"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1">最高库存预警</label>
          <el-input-number
            v-model="currentAlertSettings.maxStock"
            :min="0"
            controls-position="right"
            class="w-full"
          />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs text-gray-700 mb-1">存放位置</label>
          <el-input
            v-model="currentEditedData.storageLocation"
            placeholder="例如：A区-01-03"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-700 mb-1">保质期天数</label>
          <el-input-number
            v-model="currentAlertSettings.expirationDays"
            :min="0"
            controls-position="right"
            class="w-full"
          />
        </div>
        <div class="bg-gray-100 rounded-lg p-2">
          <div class="text-xs font-medium text-gray-700 mb-1">过期日期（自动计算）</div>
          <div class="text-sm font-medium text-gray-900">{{ calculatedExpirationDate }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleNext">
          确认 {{ currentEditIndex + 1 < selectedRows.length ? '(下一个)' : '(已最后一个)' }}
        </el-button>
        <el-button type="primary" @click="handleSaveAll">
          保存全部 ({{ editedCount }} 个)
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getAllVarieties } from '@/services/cropVarietyService'

const props = defineProps({
  show: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  inventoryData: { type: Array, default: () => [] },
  batchEditedItems: { type: Object, default: () => ({}) },
  currentEditIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'item-select', 'field-change', 'save-all', 'next'])

const visible = computed({
  get: () => props.show,
  set: () => handleClose()
})

// 当前选中的ID
const currentItemId = ref('')

// 监听显示状态和选中项
watch(() => props.show, (isOpen) => {
  if (isOpen && props.selectedRows.length > 0) {
    currentItemId.value = props.selectedRows[props.currentEditIndex] || props.selectedRows[0]
  }
})

watch(() => props.currentEditIndex, (idx) => {
  if (props.selectedRows.length > 0) {
    currentItemId.value = props.selectedRows[idx] || props.selectedRows[0]
  }
})

// 获取选中的库存项
const selectedItems = computed(() => {
  return props.inventoryData.filter(item => props.selectedRows.includes(item.id))
})

// 当前编辑项
const currentItem = computed(() => {
  return selectedItems.value.find(item => item.id === currentItemId.value)
})

// 合并原始数据和编辑数据
const currentEditedData = computed(() => {
  if (!currentItemId.value) return {}
  const item = currentItem.value
  const edited = props.batchEditedItems[currentItemId.value] || {}
  return {
    ...item,
    ...edited
  }
})

// 预警设置
const currentAlertSettings = computed({
  get: () => {
    return currentEditedData.value.alertSettings || { minStock: 0, maxStock: 0, expirationDays: 0 }
  },
  set: (val) => {
    handleAlertFieldChange('alertSettings', val)
  }
})

// 已编辑数量
const editedCount = computed(() => {
  return Object.keys(props.batchEditedItems).length
})

// 生成作物编码
const generateCropCode = (cropName, variety) => {
  const allVarieties = getAllVarieties()

  // 精确匹配
  const exactMatch = allVarieties.find(v => {
    const varietyMatch = v.subVariety1Name === variety || v.varietyName === variety
    const cropMatch = v.varietyName === cropName || v.typeName === cropName || v.categoryName === cropName
    return varietyMatch && cropMatch
  })
  if (exactMatch?.cropCode?.length >= 9) {
    return exactMatch.cropCode.padEnd(11, '0').substring(0, 11)
  }

  // 子品种匹配
  const subMatch = allVarieties.find(v => v.subVariety1Name === variety)
  if (subMatch?.cropCode?.length >= 9) {
    return subMatch.cropCode.padEnd(11, '0').substring(0, 11)
  }

  // 品种名匹配
  const varietyMatch2 = allVarieties.find(v => v.varietyName === variety)
  if (varietyMatch2?.cropCode?.length >= 9) {
    return varietyMatch2.cropCode.padEnd(11, '0').substring(0, 11)
  }

  // 作物名匹配
  const cropMatch = allVarieties.find(v => v.varietyName === cropName)
  if (cropMatch?.cropCode?.length >= 9) {
    return cropMatch.cropCode.padEnd(11, '0').substring(0, 11)
  }

  // 类型匹配
  const typeMatch = allVarieties.find(v => v.typeName === cropName)
  if (typeMatch?.cropCode?.length >= 9) {
    return typeMatch.cropCode.padEnd(11, '0').substring(0, 11)
  }

  return 'OT0000000000'
}

// 当前产品的编码
const generatedCode = computed(() => {
  return generateCropCode(
    currentEditedData.value.cropName || '',
    currentEditedData.value.variety || ''
  )
})

// 计算过期日期
const calculateExpirationDate = (storageDate, days) => {
  if (!storageDate || !days) return '-'
  const date = new Date(storageDate)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

// 计算得出的过期日期
const calculatedExpirationDate = computed(() => {
  const expirationDays = currentAlertSettings.value.expirationDays ||
    currentEditedData.value.alertSettings?.expirationDays || 0
  return calculateExpirationDate(
    currentEditedData.value.storageDate || currentItem.value?.storageDate || '',
    expirationDays
  )
})

// 处理预警设置字段变化
const handleAlertFieldChange = (field, value) => {
  if (!currentItemId.value) return

  const currentAlertSettings = currentEditedData.value.alertSettings || { minStock: 0, maxStock: 0, expirationDays: 0 }

  if (field === 'alertSettings') {
    emit('field-change', currentItemId.value, 'alertSettings', value)
  } else {
    emit('field-change', currentItemId.value, 'alertSettings', { ...currentAlertSettings, [field]: value })
  }
}

// 字段变化处理
const handleFieldChange = (field, value) => {
  if (!currentItemId.value) return
  emit('field-change', currentItemId.value, field, value)
}

// 选择产品
const handleItemSelect = (id) => {
  const idx = props.selectedRows.indexOf(id)
  emit('item-select', idx >= 0 ? idx : 0)
}

// 下一个
const handleNext = () => {
  emit('next')
}

// 保存全部
const handleSaveAll = () => {
  emit('save-all')
}

// 关闭
const handleClose = () => {
  emit('close')
}

// 监听输入变化，同步到编辑数据
watch(() => currentEditedData.value.quantity, (val) => {
  if (currentItemId.value && val !== undefined) {
    emit('field-change', currentItemId.value, 'quantity', val)
  }
})

watch(() => currentEditedData.value.storageLocation, (val) => {
  if (currentItemId.value && val !== undefined) {
    emit('field-change', currentItemId.value, 'storageLocation', val)
  }
})
</script>

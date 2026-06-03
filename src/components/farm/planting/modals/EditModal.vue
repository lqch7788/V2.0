<template>
  <!-- 编辑种植记录弹窗 - 与V1.1 EditModal.tsx完全一致 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" tabindex="-1" @click.self="onClose" @keydown.esc="onClose">
    <div class="bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><Edit /></el-icon>
          编辑种植记录
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 表单内容 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="grid grid-cols-2 gap-6">
          <!-- 作物品种选择 -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">作物品种 *</label>
            <el-select
              v-model="formData.selectedCropCode"
              placeholder="搜索或选择作物品种..."
              filterable
              clearable
              class="w-full"
              @change="handleCropCodeChange"
            >
              <el-option
                v-for="crop in cropVarietyOptions"
                :key="crop.value"
                :label="`${crop.category || ''} > ${crop.typeName || ''} > ${crop.label}`"
                :value="crop.value"
              >
                <div class="flex items-center gap-2">
                  <span>{{ crop.category }}</span>
                  <span class="text-gray-400">></span>
                  <span>{{ crop.typeName }}</span>
                  <span class="text-gray-400">></span>
                  <span>{{ crop.label }}</span>
                  <span class="text-xs text-gray-400 font-mono">{{ crop.value }}</span>
                </div>
              </el-option>
            </el-select>
          </div>

          <!-- 作物名称（自动填充） -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">作物名称</label>
            <el-input v-model="formData.cropName" disabled placeholder="选择品种后自动填充" />
          </div>

          <!-- 品种（自动填充） -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">品种</label>
            <el-input v-model="formData.cropVariety" disabled placeholder="选择品种后自动填充" />
          </div>

          <!-- 种植区域 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植区域 *</label>
            <el-select v-model="formData.areaId" placeholder="请选择" class="w-full">
              <el-option v-for="a in areaOptions" :key="a.value" :label="a.label" :value="a.value" />
            </el-select>
          </div>

          <!-- 种植数量 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植数量 *</label>
            <el-input-number v-model="formData.plantingCount" :min="1" class="w-full" />
          </div>

          <!-- 种植日期 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植日期</label>
            <el-date-picker
              v-model="formData.plantingDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="w-full"
              disabled
            />
          </div>

          <!-- 损耗率 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">损耗率(%)</label>
            <el-input-number v-model="formData.attritionRate" :min="0" :max="100" :precision="1" class="w-full" />
          </div>

          <!-- 土壤PH -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">土壤PH</label>
            <el-input-number v-model="formData.soilPH" :min="0" :max="14" :precision="1" class="w-full" />
          </div>

          <!-- 土壤EC -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">土壤EC</label>
            <el-input-number v-model="formData.soilEC" :min="0" :precision="2" class="w-full" />
          </div>

          <!-- 备注 - 跨两列 -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">备注</label>
            <el-input v-model="formData.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Edit, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isOpen: Boolean,
  record: Object,
  cropVarietyOptions: {
    type: Array,
    default: () => []
  },
  areaOptions: {
    type: Array,
    default: () => [
      { value: '1号棚', label: '1号棚' },
      { value: '2号棚', label: '2号棚' },
      { value: '3号棚', label: '3号棚' },
      { value: '4号棚', label: '4号棚' }
    ]
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  plantCode: '',
  selectedCropCode: '',
  cropName: '',
  cropVariety: '',
  areaId: '',
  areaName: '',
  plantingCount: 0,
  plantingDate: '',
  attritionRate: 0,
  soilPH: null,
  soilEC: null,
  remarks: ''
})

// 处理作物品种选择变化
const handleCropCodeChange = (cropCode) => {
  if (cropCode) {
    const crop = props.cropVarietyOptions.find(c => c.value === cropCode)
    if (crop) {
      // cropName 使用 category，cropVariety 使用 label (即 varietyName)
      formData.value.cropName = crop.category || ''
      formData.value.cropVariety = crop.label || ''
    }
  } else {
    formData.value.cropName = ''
    formData.value.cropVariety = ''
  }
}

// 监听打开状态和记录数据
watch(() => [props.isOpen, props.record], ([val, record]) => {
  if (val && record) {
    formData.value = {
      plantCode: record.plantCode || '',
      selectedCropCode: record.cropCode || '',
      cropName: record.cropName || '',
      cropVariety: record.cropVariety || '',
      areaId: record.areaId || '',
      areaName: record.areaName || '',
      plantingCount: record.plantingCount || 0,
      plantingDate: record.plantingDate || '',
      attritionRate: record.attritionRate ?? 0,
      soilPH: record.soilPH || null,
      soilEC: record.soilEC || null,
      remarks: record.remarks || ''
    }
  }
}, { immediate: true })

const onClose = () => {
  emit('close')
}

const handleSubmit = () => {
  if (!formData.value.selectedCropCode) {
    ElMessage.warning('请选择作物品种')
    return
  }
  if (!formData.value.areaId) {
    ElMessage.warning('请选择种植区域')
    return
  }
  if (!formData.value.plantingCount || formData.value.plantingCount <= 0) {
    ElMessage.warning('请输入正确的种植数量')
    return
  }

  // 构建提交数据 - V1.1一致的结构
  const submitData = {
    cropCode: formData.value.selectedCropCode,
    cropName: formData.value.cropName,
    cropVariety: formData.value.cropVariety,
    areaId: formData.value.areaId,
    areaName: formData.value.areaName,
    plantingCount: formData.value.plantingCount,
    plantingDate: formData.value.plantingDate,
    soilPH: formData.value.soilPH,
    soilEC: formData.value.soilEC,
    attritionRate: formData.value.attritionRate,
    remarks: formData.value.remarks
  }

  emit('submit', submitData)
}
</script>

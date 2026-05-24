<template>
  <!-- 编辑种植记录弹窗 - 纯div结构 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" @click.self="onClose">
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
          <!-- 种植批号 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植批号</label>
            <el-input v-model="formData.plantCode" disabled />
          </div>

          <!-- 作物品种 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">作物品种</label>
            <el-input v-model="formData.cropName" disabled />
          </div>

          <!-- 种植区域 - V1.1新增 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植区域</label>
            <el-input v-model="formData.areaName" disabled />
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

          <!-- 损耗率 - V1.1新增 -->
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
  record: Object
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  plantCode: '',
  cropName: '',
  areaName: '',
  plantingCount: 0,
  plantingDate: '',
  attritionRate: 0,  // V1.1新增
  soilPH: null,
  soilEC: null,
  remarks: ''
})

// 监听打开状态和记录数据
watch(() => [props.isOpen, props.record], ([val, record]) => {
  if (val && record) {
    formData.value = {
      plantCode: record.plantCode || '',
      cropName: record.cropName || '',
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
  if (!formData.value.plantingCount || formData.value.plantingCount <= 0) {
    ElMessage.warning('请输入正确的种植数量')
    return
  }
  emit('submit', { ...formData.value })
}
</script>

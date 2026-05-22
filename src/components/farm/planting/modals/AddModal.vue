<template>
  <!-- 新增种植记录弹窗 - 纯div结构 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" @click.self="onClose">
    <div class="bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><Plus /></el-icon>
          新增种植记录
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 表单内容 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="grid grid-cols-2 gap-6">
          <!-- 作物品种 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">作物品种 *</label>
            <el-select v-model="formData.cropName" placeholder="请选择" class="w-full" @change="handleCropChange">
              <el-option v-for="c in cropOptions" :key="c.value" :label="c.label" :value="c.value" />
            </el-select>
          </div>

          <!-- 品种 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">品种</label>
            <el-input v-model="formData.cropVariety" placeholder="选择作物后自动填充" disabled />
          </div>

          <!-- 种植区域 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植区域 *</label>
            <el-select v-model="formData.areaName" placeholder="请选择" class="w-full">
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
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植日期 *</label>
            <el-date-picker
              v-model="formData.plantingDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              class="w-full"
            />
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
import { Plus, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isOpen: Boolean,
  cropOptions: {
    type: Array,
    default: () => [
      { value: '番茄', label: '番茄' },
      { value: '黄瓜', label: '黄瓜' },
      { value: '辣椒', label: '辣椒' },
      { value: '茄子', label: '茄子' },
      { value: '草莓', label: '草莓' }
    ]
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

// 表单数据
const formData = ref({
  cropName: '',
  cropVariety: '',
  areaName: '',
  plantingCount: 0,
  plantingDate: new Date().toISOString().slice(0, 10),
  soilPH: null,
  soilEC: null,
  remarks: ''
})

// 作物品种映射
const varietyMap = {
  '番茄': '大红番茄',
  '黄瓜': '水果黄瓜',
  '辣椒': '螺丝椒',
  '茄子': '圆茄子',
  '草莓': '红颜草莓'
}

// 监听作物品种变化，自动填充品种
const handleCropChange = (cropName) => {
  formData.value.cropVariety = varietyMap[cropName] || ''
}

// 监听打开状态，重置表单
watch(() => props.isOpen, (val) => {
  if (val) {
    formData.value = {
      cropName: '',
      cropVariety: '',
      areaName: '',
      plantingCount: 0,
      plantingDate: new Date().toISOString().slice(0, 10),
      soilPH: null,
      soilEC: null,
      remarks: ''
    }
  }
})

const onClose = () => {
  emit('close')
}

const handleSubmit = () => {
  if (!formData.value.cropName) {
    ElMessage.warning('请选择作物品种')
    return
  }
  if (!formData.value.areaName) {
    ElMessage.warning('请选择种植区域')
    return
  }
  if (!formData.value.plantingCount || formData.value.plantingCount <= 0) {
    ElMessage.warning('请输入种植数量')
    return
  }
  if (!formData.value.plantingDate) {
    ElMessage.warning('请选择种植日期')
    return
  }

  emit('submit', { ...formData.value })
}
</script>

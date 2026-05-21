<template>
  <el-dialog
    :model-value="visible"
    title="打印标签"
    width="500px"
    @close="handleClose"
  >
    <div v-if="record" class="space-y-4">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="育苗批号">{{ record.seedlingCode }}</el-descriptions-item>
        <el-descriptions-item label="作物名称">{{ record.cropName }}</el-descriptions-item>
        <el-descriptions-item label="作物品种">{{ record.cropVariety || '-' }}</el-descriptions-item>
        <el-descriptions-item label="场地">{{ record.siteName }}</el-descriptions-item>
        <el-descriptions-item label="开始日期">{{ record.startDate }}</el-descriptions-item>
      </el-descriptions>

      <el-form label-width="80px">
        <el-form-item label="打印份数">
          <el-input-number v-model="printCount" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="标签尺寸">
          <el-radio-group v-model="labelSize">
            <el-radio label="small">小标签</el-radio>
            <el-radio label="large">大标签</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- 标签预览 -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">标签预览</h4>
        <div :class="labelSize === 'small' ? 'w-32' : 'w-48'" class="border border-dashed border-gray-300 rounded p-2 text-xs">
          <div class="font-bold">{{ record.seedlingCode }}</div>
          <div>{{ record.cropName }}</div>
          <div class="text-gray-500">{{ record.cropVariety }}</div>
          <div class="text-gray-400 text-[10px]">{{ record.siteName }}</div>
          <div class="text-gray-300 text-[8px]">{{ record.startDate }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handlePrint">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {  Seedling  } from '@/types/crop'

defineProps({})

const emit = defineEmits(['(e', 'value'])

const printCount = ref(1)
const labelSize = ref('small')

const handleClose = () => {
  emit('update:visible', false)
}

const handlePrint = () => {
  // 模拟打印
  ElMessage.success(`已发送 ${printCount.value} 份打印任务`)
  handleClose()
}
</script>

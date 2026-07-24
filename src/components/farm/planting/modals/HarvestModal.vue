<template>
  <!-- 采收登记弹窗 - 与V1.1 HarvestModal.tsx完全一致 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" @click.self="onClose">
    <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><Check /></el-icon>
          采收登记
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 当前种植信息 -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 class="text-sm font-semibold text-gray-900 mb-3">种植信息</h4>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <span class="text-xs text-gray-500">种植批号</span>
              <p class="text-sm font-mono text-blue-600">{{ record?.plantCode }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">作物品种</span>
              <p class="text-sm text-gray-900">{{ record?.cropName }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">品种</span>
              <p class="text-sm text-gray-900">{{ record?.cropVariety }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">种植区域</span>
              <p class="text-sm text-gray-900">{{ record?.areaName }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">种植数量</span>
              <p class="text-sm text-emerald-600 font-medium">{{ record?.plantingCount?.toLocaleString() }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">损耗率</span>
              <p class="text-sm text-red-600">{{ record?.attritionRate }}%</p>
            </div>
          </div>
        </div>

        <!-- 采收信息表单 - V1.1包含"是否采收"选择 -->
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-900 mb-3">采收信息</h4>
          <div class="grid grid-cols-2 gap-4">
            <!-- 是否采收 - V1.1新增 -->
            <div class="col-span-2">
              <label class="block text-gray-700 text-sm mb-2 font-medium">是否采收 *</label>
              <el-select v-model="isHarvest" placeholder="请选择" class="w-full" @change="handleIsHarvestChange">
                <el-option label="是 - 确认采收此批次" value="yes" />
                <el-option label="否 - 暂时不采收" value="no" />
              </el-select>
              <p v-if="isHarvest === 'yes'" class="mt-1 text-xs text-amber-600">⚠ 选择"已采收"后，该记录将不可修改</p>
              <p v-else class="mt-1 text-xs text-gray-400">选择"是"后将自动填充当天日期</p>
            </div>

            <!-- 采收日期 -->
            <div>
              <label class="block text-gray-700 text-sm mb-2 font-medium">采收日期</label>
              <el-date-picker
                v-model="formData.harvestDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                class="w-full"
                :disabled="isHarvest === 'no'"
              />
            </div>

            <!-- 采收产量 -->
            <div>
              <label class="block text-gray-700 text-sm mb-2 font-medium">采收产量 *</label>
              <el-input-number v-model="formData.harvestQuantity" :min="0" class="w-full" :disabled="isHarvest === 'no'" />
            </div>

            <!-- 备注 -->
            <div class="col-span-2">
              <label class="block text-gray-700 text-sm mb-2 font-medium">备注</label>
              <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" :disabled="isHarvest === 'no'" />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :disabled="isHarvest === 'no'">确认采收</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isOpen: Boolean,
  record: Object
})

const emit = defineEmits(['close', 'submit'])

// 是否采收 - V1.1新增
const isHarvest = ref('yes')

const formData = ref({
  harvestDate: new Date().toISOString().slice(0, 10),
  harvestQuantity: 0,
  remarks: ''
})

// 是否采收变化处理 - V1.1逻辑
const handleIsHarvestChange = (value) => {
  if (value === 'yes') {
    // 选择"是"自动填充当天日期
    if (!formData.value.harvestDate) {
      formData.value.harvestDate = new Date().toISOString().slice(0, 10)
    }
  } else {
    // 选择"否"清空日期
    formData.value.harvestDate = ''
  }
}

// 监听打开状态和记录数据
watch(() => [props.isOpen, props.record], ([val, record]) => {
  if (val && record) {
    isHarvest.value = 'yes'
    formData.value = {
      harvestDate: new Date().toISOString().slice(0, 10),
      harvestQuantity: record.plantingCount || 0,
      remarks: ''
    }
  }
}, { immediate: true })

const onClose = () => {
  emit('close')
}

const handleSubmit = () => {
  if (isHarvest.value !== 'yes') {
    ElMessage.warning('请选择是否采收')
    return
  }
  if (!formData.value.harvestQuantity || formData.value.harvestQuantity <= 0) {
    ElMessage.warning('请输入正确的采收产量')
    return
  }
  if (!formData.value.harvestDate) {
    ElMessage.warning('请选择采收日期')
    return
  }
  // 2026-07-24: 真正提交给父组件，让 PlantPage 调 store
  emit('submit', {
    harvestDate: formData.value.harvestDate,
    harvestQuantity: formData.value.harvestQuantity,
    remarks: formData.value.remarks
  })
  emit('close')
}
</script>

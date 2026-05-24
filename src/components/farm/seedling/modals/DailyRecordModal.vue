<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="fixed inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
      <!-- 头部 - 使用渐变色 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <el-icon :size="20" style="color: white;"><Calendar /></el-icon>
          <h3 class="text-lg font-semibold text-white">每日记录 - {{ record?.seedlingCode }}</h3>
        </div>
        <el-button circle text @click="handleClose" class="!text-white hover:!bg-white/20">
          <el-icon :size="20" style="color: white;"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区域 -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
        <div class="space-y-6">
          <!-- 添加新记录 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">添加新记录</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">记录日期</label>
                <el-date-picker
                  v-model="formData.recordDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">温度（℃）</label>
                <el-input-number v-model="formData.temperature" :min="0" :step="0.1" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">湿度（%）</label>
                <el-input-number v-model="formData.humidity" :min="0" :step="0.1" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">是否浇水</label>
                <el-checkbox v-model="formData.watering" class="h-full flex items-center">
                  {{ formData.watering ? '是' : '否' }}
                </el-checkbox>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">pH值</label>
                <el-input-number v-model="formData.phValue" :min="0" :step="0.1" :precision="1" class="w-full" placeholder="如：6.5" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">EC值（mS/cm）</label>
                <el-input-number v-model="formData.ecValue" :min="0" :step="0.1" :precision="1" class="w-full" placeholder="如：2.0" />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">异常情况</label>
                <el-input v-model="formData.abnormality" placeholder="请输入异常情况，无异常请留空" />
              </div>

              <!-- 数量变化输入 -->
              <div class="col-span-2">
                <h5 class="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">数量变化（选填）</h5>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">成活变化</label>
                    <el-input-number v-model="formData.survivalCountChange" :min="0" class="w-full" placeholder="正数增加，负数减少" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">定植变化</label>
                    <el-input-number v-model="formData.plantedCountChange" :min="0" class="w-full" placeholder="正数增加，负数减少" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">损耗数量</label>
                    <el-input-number v-model="formData.lossCountChange" :min="0" class="w-full" placeholder="正数增加" />
                  </div>
                </div>
              </div>

              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
              </div>

              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">操作人员</label>
                <el-select v-model="formData.operator" placeholder="请选择操作人员" clearable class="w-full">
                  <el-option label="张三" value="zhangsan" />
                  <el-option label="李四" value="lisi" />
                  <el-option label="王五" value="wangwu" />
                </el-select>
              </div>
            </div>
          </div>

          <!-- 历史记录列表 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              历史记录 ({{ record?.dailyRecords?.length || 0 }} 条)
            </h4>
            <div v-if="!record?.dailyRecords || record.dailyRecords.length === 0" class="text-center py-8 text-gray-500">
              暂无记录
            </div>
            <div v-else class="max-h-64 overflow-y-auto space-y-2">
              <div
                v-for="(r, index) in record.dailyRecords"
                :key="index"
                class="bg-white border border-gray-200 rounded-lg p-3"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-900">{{ r.recordDate }}</span>
                  <span v-if="r.watering" class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">已浇水</span>
                </div>
                <div class="grid grid-cols-4 gap-2 text-xs text-gray-600">
                  <span v-if="r.temperature">温度: {{ r.temperature }}℃</span>
                  <span v-if="r.humidity">湿度: {{ r.humidity }}%</span>
                  <span v-if="r.phValue">pH: {{ r.phValue }}</span>
                  <span v-if="r.ecValue">EC: {{ r.ecValue }}</span>
                  <span v-if="r.abnormality" class="text-red-600 col-span-2">异常: {{ r.abnormality }}</span>
                  <span v-if="r.operator" class="text-blue-600">操作员: {{ r.operator }}</span>
                </div>
                <!-- 数量变化显示 -->
                <div v-if="r.survivalCountChange !== undefined || r.plantedCountChange !== undefined || r.lossCountChange !== undefined"
                  class="grid grid-cols-3 gap-2 text-xs mt-2 pt-2 border-t border-gray-100">
                  <span v-if="r.survivalCountChange !== undefined" :class="r.survivalCountChange > 0 ? 'text-green-600' : r.survivalCountChange < 0 ? 'text-red-600' : 'text-gray-500'">
                    成活: {{ r.survivalCountChange > 0 ? '+' : '' }}{{ r.survivalCountChange }}
                  </span>
                  <span v-if="r.plantedCountChange !== undefined" :class="r.plantedCountChange > 0 ? 'text-green-600' : r.plantedCountChange < 0 ? 'text-red-600' : 'text-gray-500'">
                    定植: {{ r.plantedCountChange > 0 ? '+' : '' }}{{ r.plantedCountChange }}
                  </span>
                  <span v-if="r.lossCountChange !== undefined" class="text-red-600">
                    损耗: +{{ r.lossCountChange }}
                  </span>
                </div>
                <div v-if="r.remarks" class="mt-2 text-xs text-gray-500">{{ r.remarks }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">添加记录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar, Close } from '@element-plus/icons-vue'
import { useSeedlingStore } from '@/stores'

const props = defineProps({
  visible: Boolean,
  record: Object
})

const emit = defineEmits(['update:visible', 'success'])

const seedlingStore = useSeedlingStore()
const submitting = ref(false)

const formData = ref({
  recordDate: new Date().toISOString().split('T')[0],
  temperature: undefined,
  humidity: undefined,
  watering: false,
  abnormality: '',
  survivalCountChange: undefined,
  plantedCountChange: undefined,
  lossCountChange: undefined,
  remarks: '',
  phValue: undefined,
  ecValue: undefined,
  operator: ''
})

watch(() => props.visible, (val) => {
  if (val) {
    // 重置表单
    formData.value = {
      recordDate: new Date().toISOString().split('T')[0],
      temperature: undefined,
      humidity: undefined,
      watering: false,
      abnormality: '',
      survivalCountChange: undefined,
      plantedCountChange: undefined,
      lossCountChange: undefined,
      remarks: '',
      phValue: undefined,
      ecValue: undefined,
      operator: ''
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formData.value.recordDate) {
    ElMessage.warning('请选择记录日期')
    return
  }

  submitting.value = true
  try {
    // 后端期望 snake_case 格式
    await seedlingStore.addDailyRecord(props.record.id, {
      record_date: formData.value.recordDate,
      crop_name: props.record?.cropName,
      crop_variety: props.record?.cropVariety,
      greenhouse_name: props.record?.siteName,
      quantity: formData.value.survivalCountChange || 0,
      unit: '株',
      data: JSON.stringify({
        temperature: formData.value.temperature,
        humidity: formData.value.humidity,
        watering: formData.value.watering,
        ph_value: formData.value.phValue,
        ec_value: formData.value.ecValue,
        survival_count_change: formData.value.survivalCountChange,
        planted_count_change: formData.value.plantedCountChange,
        loss_count_change: formData.value.lossCountChange
      }),
      remarks: formData.value.remarks || undefined,
      create_by: formData.value.operator || localStorage.getItem('username') || '管理员'
    })

    ElMessage.success('添加记录成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('添加每日记录失败:', error)
    ElMessage.error('添加记录失败')
  } finally {
    submitting.value = false
  }
}
</script>

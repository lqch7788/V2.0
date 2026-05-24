<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="fixed inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- 头部 - 使用渐变色 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <el-icon :size="20" style="color: white;"><RefreshRight /></el-icon>
          <h3 class="text-lg font-semibold text-white">定植操作</h3>
        </div>
        <el-button circle text @click="handleClose" class="!text-white hover:!bg-white/20">
          <el-icon :size="20" style="color: white;"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区域 -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
        <div class="space-y-6" v-if="record">
          <!-- 当前育苗信息 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">育苗信息</h4>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <span class="text-xs text-gray-500">育苗批号</span>
                <p class="text-sm font-mono text-blue-600">{{ record.seedlingCode }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500">作物品种</span>
                <p class="text-sm text-gray-900">{{ record.cropName }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500">成活数量</span>
                <p class="text-sm text-emerald-600 font-medium">{{ record.survivalCount?.toLocaleString() }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500">品种</span>
                <p class="text-sm text-gray-900">{{ record.cropVariety }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500">场地</span>
                <p class="text-sm text-gray-900">{{ record.siteName }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500">成苗率</span>
                <p class="text-sm text-emerald-600 font-bold">{{ record.survivalRate }}%</p>
              </div>
            </div>
          </div>

          <!-- 定植信息 -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">定植信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">定植数量</label>
                <el-input-number
                  v-model="formData.transplantCount"
                  :min="1"
                  :max="availableCount"
                  class="w-full"
                />
                <p class="text-xs text-gray-500 mt-1">最多可定植 {{ availableCount.toLocaleString() }} 株</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">定植区域</label>
                <el-select v-model="formData.areaId" placeholder="请选择" class="w-full" @change="handleAreaChange">
                  <el-option v-for="area in areas" :key="area.value" :label="area.label" :value="area.value" />
                </el-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">土壤PH值</label>
                <el-input-number v-model="formData.soilPH" :min="0" :max="14" :step="0.1" :precision="1" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">土壤EC值</label>
                <el-input-number v-model="formData.soilEC" :min="0" :step="0.1" :precision="1" class="w-full" />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">定植日期</label>
                <el-date-picker
                  v-model="formData.transplantDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确认定植</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshRight, Close } from '@element-plus/icons-vue'
import { useSeedlingStore, usePlantingStore } from '@/stores'
import { SourceType, PlantingStatus } from '@/types/crop'

const props = defineProps({
  visible: Boolean,
  record: Object
})

const emit = defineEmits(['update:visible', 'success'])

const seedlingStore = useSeedlingStore()
const plantingStore = usePlantingStore()
const submitting = ref(false)

// 定植区域选项
const areas = [
  { value: '1号大棚-A区', label: '1号大棚-A区', parent: '1号大棚' },
  { value: '1号大棚-B区', label: '1号大棚-B区', parent: '1号大棚' },
  { value: '2号大棚-A区', label: '2号大棚-A区', parent: '2号大棚' },
  { value: '2号大棚-B区', label: '2号大棚-B区', parent: '2号大棚' },
  { value: '3号大棚', label: '3号大棚', parent: '3号大棚' },
  { value: '露天地块1', label: '露天地块1', parent: '露天' },
  { value: '露天地块2', label: '露天地块2', parent: '露天' }
]

// 表单数据
const formData = ref({
  transplantCount: 0,
  areaId: '',
  areaName: '',
  transplantDate: new Date().toISOString().split('T')[0],
  soilPH: 6.5,
  soilEC: 1.0,
  remarks: ''
})

// 计算可定植数量
const availableCount = computed(() => {
  if (!props.record) return 0
  return (props.record.survivalCount || 0) - (props.record.plantedCount || 0)
})

watch(() => props.visible, (val) => {
  if (val) {
    formData.value = {
      transplantCount: 0,
      areaId: '',
      areaName: '',
      transplantDate: new Date().toISOString().split('T')[0],
      soilPH: 6.5,
      soilEC: 1.0,
      remarks: ''
    }
  }
})

const handleAreaChange = (areaId) => {
  const area = areas.find(a => a.value === areaId)
  formData.value.areaName = area?.label || ''
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formData.value.transplantCount || formData.value.transplantCount <= 0) {
    ElMessage.warning('请输入有效的定植数量')
    return
  }
  if (formData.value.transplantCount > availableCount.value) {
    ElMessage.warning(`定植数量不能超过可定植数量 (${availableCount.value})`)
    return
  }
  if (!formData.value.areaId) {
    ElMessage.warning('请选择定植区域')
    return
  }

  submitting.value = true
  try {
    // 生成种植批号
    const plantCode = `ZZ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

    // 溯源码
    const traceabilityCode = 'TR' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + (props.record?.cropName?.substring(0, 2) || 'XX')

    // 获取区域信息
    const area = areas.find(a => a.value === formData.value.areaId)
    const areaName = area?.label || ''
    const rootName = area?.parent || ''

    // 创建种植记录 - 后端期望 snake_case 格式
    await plantingStore.addItem({
      plant_code: plantCode,
      source_type: 'seedling',
      source_id: props.record.id,
      source_name: props.record.seedlingCode,
      crop_name: props.record.cropName,
      crop_variety: props.record.cropVariety,
      greenhouse_name: props.record.siteName,
      area_name: areaName,
      from_location: '育苗棚',
      to_location: areaName,
      transplant_date: formData.value.transplantDate,
      transplant_quantity: formData.value.transplantCount,
      survival_quantity: formData.value.transplantCount,
      survival_rate: 100,
      operator_name: localStorage.getItem('username') || '管理员',
      status: 'completed',
      remarks: formData.value.remarks
    })

    // 更新育苗的已定植数量
    await seedlingStore.increasePlantedCount(props.record.id, formData.value.transplantCount)

    ElMessage.success('定植成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('定植操作失败:', error)
    ElMessage.error('定植操作失败')
  } finally {
    submitting.value = false
  }
}
</script>

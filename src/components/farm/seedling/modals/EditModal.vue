<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="fixed inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- 头部 - 使用渐变色 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <el-icon :size="20" style="color: white;"><Edit /></el-icon>
          <h3 class="text-lg font-semibold text-white">编辑育苗</h3>
        </div>
        <el-button circle text @click="handleClose" class="!text-white hover:!bg-white/20">
          <el-icon :size="20" style="color: white;"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区域 -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
        <div class="grid grid-cols-2 gap-4">
          <!-- 关联种源 -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-1">关联种源</label>
            <el-select
              v-model="formData.sourceId"
              placeholder="请选择"
              filterable
              class="w-full"
              @change="handleSourceChange"
            >
              <el-option
                v-for="source in seedSources"
                :key="source.id"
                :label="`${source.seedCode} - ${source.cropName}`"
                :value="source.id"
              />
            </el-select>
          </div>

          <!-- 作物品种 -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-1">作物品种</label>
            <el-input v-model="formData.cropName" placeholder="请选择作物品种" class="w-full" />
          </div>

          <!-- 育苗方式 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">育苗方式</label>
            <el-select v-model="formData.seedlingType" placeholder="请选择" class="w-full">
              <el-option v-for="type in seedlingTypes" :key="type.value" :label="type.label" :value="type.value" />
            </el-select>
          </div>

          <!-- 温室场地 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">温室场地</label>
            <el-select v-model="formData.siteId" placeholder="请选择" class="w-full" @change="handleSiteChange">
              <el-option v-for="site in sites" :key="site.value" :label="site.label" :value="site.value" />
            </el-select>
          </div>

          <!-- 开始日期 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">开始日期</label>
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </div>

          <!-- 预计结束日期 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">预计结束日期</label>
            <el-date-picker
              v-model="formData.expectedEndDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </div>

          <!-- 初始数量 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">初始数量</label>
            <el-input-number v-model="formData.initialCount" :min="0" class="w-full" />
          </div>

          <!-- 成活数量 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">成活数量</label>
            <el-input-number v-model="formData.survivalCount" :min="0" class="w-full" />
          </div>

          <!-- 已定植数量 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">已定植数量</label>
            <el-input-number v-model="formData.plantedCount" :min="0" class="w-full" />
          </div>

          <!-- 负责人 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">负责人</label>
            <el-input v-model="formData.chargePerson" placeholder="请输入" class="w-full" />
          </div>

          <!-- 工时 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">工时（小时）</label>
            <el-input-number v-model="formData.workHours" :min="0" :step="0.5" class="w-full" />
          </div>

          <!-- 目标成活数量 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">目标成活数量</label>
            <el-input-number v-model="formData.targetSurvivalCount" :min="0" class="w-full" />
          </div>

          <!-- 品质等级 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">品质等级</label>
            <el-input v-model="formData.qualityGrade" placeholder="请输入" class="w-full" />
          </div>

          <!-- 是否结束 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">是否结束</label>
            <el-select v-model="formData.isFinished" placeholder="选择是否结束" class="w-full">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </div>

          <!-- 备注 -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-1">备注</label>
            <el-input v-model="formData.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Close } from '@element-plus/icons-vue'
import { useSeedlingStore, useSeedSourceStore } from '@/stores'

const props = defineProps({
  visible: Boolean,
  record: Object
})

const emit = defineEmits(['update:visible', 'success'])

const seedlingStore = useSeedlingStore()
const seedSourceStore = useSeedSourceStore()

const submitting = ref(false)
const seedSources = ref([])

const seedlingTypes = [
  { value: '穴盘育苗', label: '穴盘育苗' },
  { value: '嫁接育苗', label: '嫁接育苗' },
  { value: '组培育苗', label: '组培育苗' },
  { value: '直播育苗', label: '直播育苗' }
]

const sites = [
  { value: '1号大棚', label: '1号大棚' },
  { value: '2号大棚', label: '2号大棚' },
  { value: '3号大棚', label: '3号大棚' },
  { value: '露天场地', label: '露天场地' }
]

// 表单数据
const formData = ref({
  sourceId: '',
  sourceCode: '',
  cropName: '',
  cropVariety: '',
  cropCode: '',
  seedlingType: '',
  siteId: '',
  siteName: '',
  startDate: '',
  expectedEndDate: '',
  initialCount: 0,
  survivalCount: 0,
  plantedCount: 0,
  remarks: '',
  qualityGrade: '',
  isFinished: false,
  chargePerson: '',
  targetSurvivalCount: 0,
  workHours: 0
})

// 加载种源数据
const loadSeedSources = async () => {
  await seedSourceStore.loadItems()
  seedSources.value = seedSourceStore.items
}

// 监听弹窗打开和记录变化
watch(() => props.visible, (val) => {
  if (val) {
    loadSeedSources()
  }
})

watch(() => props.record, (record) => {
  if (record) {
    formData.value = {
      sourceId: record.sourceId || '',
      sourceCode: record.sourceCode || '',
      cropName: record.cropName || '',
      cropVariety: record.cropVariety || '',
      cropCode: record.cropCode || '',
      seedlingType: record.seedlingType || '',
      siteId: record.siteId || '',
      siteName: record.siteName || '',
      startDate: record.startDate || '',
      expectedEndDate: record.expectedEndDate || '',
      initialCount: record.initialCount || 0,
      survivalCount: record.survivalCount || 0,
      plantedCount: record.plantedCount || 0,
      remarks: record.remarks || '',
      qualityGrade: record.qualityGrade || '',
      isFinished: record.isFinished || false,
      chargePerson: record.chargePerson || '',
      targetSurvivalCount: record.targetSurvivalCount || 0,
      workHours: record.workHours || 0
    }
  }
}, { immediate: true, deep: true })

// 选择种源
const handleSourceChange = (sourceId) => {
  const source = seedSources.value.find(s => s.id === sourceId)
  if (source) {
    formData.value.sourceCode = source.seedCode
    formData.value.cropName = source.cropName
    formData.value.cropVariety = source.cropVariety
    formData.value.cropCode = source.cropCode
  }
}

// 选择场地
const handleSiteChange = (siteId) => {
  const site = sites.find(s => s.value === siteId)
  formData.value.siteName = site?.label || ''
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
}

// 提交表单
const handleSubmit = async () => {
  submitting.value = true
  try {
    // 计算成苗率和损耗
    const initialCount = formData.value.initialCount
    const survivalCount = formData.value.survivalCount
    const survivalRate = initialCount > 0 ? Math.round((survivalCount / initialCount) * 100) : 0
    const lossCount = initialCount - survivalCount
    const lossRate = initialCount > 0 ? Math.round((lossCount / initialCount) * 100) : 0

    await seedlingStore.updateItem(props.record.id, {
      // 后端期望 snake_case 格式
      source_id: formData.value.sourceId,
      source_name: formData.value.sourceCode,
      crop_name: formData.value.cropName,
      crop_variety: formData.value.cropVariety,
      crop_code: formData.value.cropCode,
      seedling_type: formData.value.seedlingType,
      greenhouse_name: formData.value.siteName,
      area_name: formData.value.siteId,
      seedling_date: formData.value.startDate,
      expected_finish_date: formData.value.expectedEndDate,
      seedling_quantity: formData.value.initialCount,
      survival_quantity: formData.value.survivalCount,
      planted_quantity: formData.value.plantedCount,
      survival_rate: survivalRate,
      loss_quantity: lossCount,
      loss_rate: lossRate,
      remarks: formData.value.remarks,
      quality_grade: formData.value.qualityGrade,
      is_finished: formData.value.isFinished,
      work_hours: formData.value.workHours || undefined
    })

    ElMessage.success('更新成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('更新育苗记录失败:', error)
    ElMessage.error('更新失败')
  } finally {
    submitting.value = false
  }
}
</script>

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
          <!-- 关联种源 - 可搜索下拉表格 -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-1">关联种源</label>
            <div class="relative">
              <el-select
                v-model="formData.sourceId"
                placeholder="搜索种源批号或作物名称..."
                filterable
                :filter-method="filterSeedSources"
                class="w-full"
                @change="handleSourceChange"
                ref="sourceSelectRef"
                @focus="sourceSearch = ''"
              >
                <template #empty>
                  <div class="p-2">
                    <!-- 表头 -->
                    <div class="grid grid-cols-4 gap-2 px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b">
                      <div>作物名称</div>
                      <div>种源批号</div>
                      <div>采购数量</div>
                      <div>可用数量</div>
                    </div>
                    <!-- 选项列表 -->
                    <div class="max-h-48 overflow-y-auto">
                      <div v-if="filteredSeedSources.length === 0" class="px-3 py-4 text-sm text-gray-400 text-center">
                        无匹配种源
                      </div>
                      <div
                        v-for="source in filteredSeedSources"
                        :key="source.id"
                        @click="handleSourceSelect(source)"
                        class="grid grid-cols-4 gap-2 px-3 py-2 text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors"
                        :class="{ 'bg-emerald-100': formData.sourceId === source.id }"
                      >
                        <div class="truncate font-medium text-gray-800">{{ source.cropName }}</div>
                        <div class="truncate text-emerald-700">{{ source.seedCode }}</div>
                        <div class="text-gray-600">{{ source.quantity }} {{ source.unit }}</div>
                        <div class="font-medium" :class="getAvailableCountClass(source.availableCount)">
                          {{ source.availableCount }} {{ source.unit }}
                        </div>
                      </div>
                    </div>
                    <div class="px-3 py-1.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
                      共 {{ filteredSeedSources.length }} 条 | 点击行选择
                    </div>
                  </div>
                </template>
              </el-select>
            </div>
          </div>

          <!-- 作物品种 - 使用CropCodeSelector组件 -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-1">作物品种</label>
            <CropCodeSelector
              v-model="formData.selectedCropCode"
              size="md"
              @change="handleCropCodeChange"
            />
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
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'

const props = defineProps({
  visible: Boolean,
  record: Object
})

const emit = defineEmits(['update:visible', 'success'])

const seedlingStore = useSeedlingStore()
const seedSourceStore = useSeedSourceStore()

const submitting = ref(false)
const seedSources = ref([])
const filteredSeedSources = ref([])
const sourceSearch = ref('')
const sourceSelectRef = ref(null)

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

// 表单数据 - 与V1.1保持一致
const formData = ref({
  sourceId: '',
  sourceCode: '',
  selectedCropCode: '', // 作物编码
  cropName: '',
  cropVariety: '',
  cropCode: '',
  seedlingType: '',
  siteId: '',
  siteName: '',
  startDate: '',
  expectedEndDate: '',
  endDate: '', // V1.1有此字段
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
  filteredSeedSources.value = seedSourceStore.items
}

// 过滤种源搜索（el-select filterable回调）
const filterSeedSources = (val) => {
  sourceSearch.value = val
  if (!val) {
    filteredSeedSources.value = seedSources.value
    return
  }
  const q = val.toLowerCase()
  filteredSeedSources.value = seedSources.value.filter(s =>
    s.seedCode?.toLowerCase().includes(q) ||
    s.cropName?.toLowerCase().includes(q) ||
    s.cropVariety?.toLowerCase().includes(q)
  )
}

// 获取可用数量样式类
const getAvailableCountClass = (count) => {
  if (count <= 0) return 'text-red-500'
  if (count < 10) return 'text-amber-500'
  return 'text-gray-700'
}

// 选择种源
const handleSourceSelect = (source) => {
  formData.value.sourceId = source.id
  formData.value.sourceCode = source.seedCode
  formData.value.cropName = source.cropName
  formData.value.cropVariety = source.cropVariety
  formData.value.cropCode = source.cropCode
  // 关闭下拉
  sourceSelectRef.value?.blur()
}

// 兼容原来的handleSourceChange
const handleSourceChange = (sourceId) => {
  const source = seedSources.value.find(s => s.id === sourceId)
  if (source) {
    formData.value.sourceCode = source.seedCode
    formData.value.cropName = source.cropName
    formData.value.cropVariety = source.cropVariety
    formData.value.cropCode = source.cropCode
  }
}

// 选择作物品种 - 适配CropCodeSelector的change事件(cropCode, varietyInfo)
const handleCropCodeChange = (cropCode, varietyInfo) => {
  formData.value.selectedCropCode = cropCode
  formData.value.cropCode = cropCode
  if (varietyInfo) {
    formData.value.cropName = varietyInfo.varietyName || ''
    formData.value.cropVariety = varietyInfo.subVariety1Name || varietyInfo.varietyName || ''
  }
}

// 选择场地
const handleSiteChange = (siteId) => {
  const site = sites.find(s => s.value === siteId)
  formData.value.siteName = site?.label || ''
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
      selectedCropCode: record.cropCode || '',
      cropName: record.cropName || '',
      cropVariety: record.cropVariety || '',
      cropCode: record.cropCode || '',
      seedlingType: record.seedlingType || '',
      siteId: record.siteId || '',
      siteName: record.siteName || '',
      startDate: record.startDate || '',
      expectedEndDate: record.expectedEndDate || '',
      endDate: record.endDate || '', // V1.1有此字段
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
      end_date: formData.value.endDate || undefined,
      seedling_quantity: formData.value.initialCount,
      survival_quantity: formData.value.survivalCount,
      planted_quantity: formData.value.plantedCount,
      survival_rate: survivalRate,
      loss_quantity: lossCount,
      loss_rate: lossRate,
      remarks: formData.value.remarks,
      quality_grade: formData.value.qualityGrade,
      is_finished: formData.value.isFinished,
      charge_person: formData.value.chargePerson || undefined,
      target_survival_count: formData.value.targetSurvivalCount || undefined,
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

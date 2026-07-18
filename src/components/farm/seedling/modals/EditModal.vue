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
          <!-- 繁殖模式 banner（对齐 V1.1 L267-288）-->
          <div class="col-span-2 mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <el-icon :size="16" class="text-blue-600"><InfoFilled /></el-icon>
            <span class="text-sm text-blue-700">
              繁殖模式：<strong>{{ formData.propagationMode === 'one_to_many' ? '1:多' : '1:1' }}</strong>（建档后锁定，不可修改）
            </span>
          </div>

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
          <!-- 2026-07-18 P0-DIFF-002：实际结束日期（V1.1 有此字段）-->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">实际结束日期</label>
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </div>

          <!-- 2026-07-18 P0-DIFF-002：计算模式 -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-1">计算模式</label>
            <el-radio-group v-model="formData.calculateMode">
              <el-radio value="single">穴盘育苗（单株）</el-radio>
              <el-radio value="propagation">扩繁育苗（母株 × 倍数）</el-radio>
            </el-radio-group>
          </div>

          <!-- 2026-07-18 P0-DIFF-002：计划类型 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">计划类型</label>
            <el-select v-model="formData.planType" placeholder="请选择" class="w-full">
              <el-option label="常规" value="routine" />
              <el-option label="加急" value="urgent" />
              <el-option label="实验" value="experiment" />
            </el-select>
          </div>

          <!-- 2026-07-18 P0-DIFF-002：关联生产计划 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">关联生产计划</label>
            <el-select v-model="formData.productionPlanId" placeholder="不关联（独立批次）" clearable class="w-full">
              <el-option
                v-for="plan in productionPlans"
                :key="plan.batchCode"
                :label="`${plan.batchCode} - ${plan.cropName}`"
                :value="plan.batchCode"
              />
            </el-select>
          </div>

          <!-- 扩繁模式专属字段：母株数量 / 倍数 -->
          <template v-if="formData.calculateMode === 'propagation'">
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-1">母株数量 <span class="text-red-500">*</span></label>
              <el-input-number v-model="formData.motherPlantCount" :min="0" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-1">扩繁倍数 <span class="text-red-500">*</span></label>
              <el-select v-model="formData.propagationMultiple" class="w-full">
                <el-option v-for="m in PROPAGATION_MULTIPLES" :key="m.value" :label="m.label" :value="m.value" />
              </el-select>
            </div>
            <div v-if="formData.propagationMultiple === 0">
              <label class="block text-sm font-medium text-gray-900 mb-1">自定义倍数 <span class="text-red-500">*</span></label>
              <el-input-number v-model="formData.customMultiple" :min="1" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">理论产量（株）</label>
              <el-input
                :model-value="theoreticalYield > 0 ? theoreticalYield.toLocaleString() : '-'"
                readonly
                class="w-full !bg-gray-100"
              />
            </div>
          </template>

          <!-- 初始数量 -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">初始数量</label>
            <el-input-number v-model="formData.initialCount" :min="0" class="w-full" />
          </div>

          <!-- 成活数量（只读，对齐 V1.1 L470 bg-gray-100）-->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">成活数量</label>
            <el-input :value="(formData.survivalCount || 0).toLocaleString()" disabled class="w-full" />
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

          <!-- 品质等级（字典选择 A/B/C/D，对齐 V1.1 QUALITY_GRADE_MAP）-->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">品质等级</label>
            <el-select v-model="formData.qualityGrade" placeholder="请选择" class="w-full" clearable>
              <el-option label="A级" value="A" />
              <el-option label="B级" value="B" />
              <el-option label="C级" value="C" />
              <el-option label="D级（次品）" value="D" />
            </el-select>
          </div>

          <!-- 数量统计只读面板（对齐 V1.1 L479-525）-->
          <div class="col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h4 class="text-sm font-semibold text-amber-900 mb-3">数量统计（只读，自动累加）</h4>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">母株累计损耗：</span><span class="text-red-600">{{ (formData.motherLossCount || 0).toLocaleString() }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">小苗累计产出：</span><span class="text-emerald-600">{{ (formData.expandedPlantCount || 0).toLocaleString() }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">小苗累计损耗：</span><span class="text-red-600">{{ (formData.seedlingLossCount || 0).toLocaleString() }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">采收入库累计：</span><span class="text-blue-600">{{ (formData.harvestStockedCount || 0).toLocaleString() }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">补苗累计：</span><span class="text-emerald-600">{{ (formData.replantCount || 0).toLocaleString() }}</span></div>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              累计损耗 = 母株累计损耗 + 小苗累计损耗 = {{ ((formData.motherLossCount || 0) + (formData.seedlingLossCount || 0)).toLocaleString() }} 株
            </p>
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
import { Edit, Close, InfoFilled } from '@element-plus/icons-vue'
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
  // 2026-07-18 P0-DIFF-002：补 V1.1 育苗方式其他字段
  seedlingTypeOther: '',
  siteId: '',
  siteName: '',
  startDate: '',
  expectedEndDate: '',
  endDate: '',
  initialCount: 0,
  survivalCount: 0,
  plantedCount: 0,
  // 2026-07-18 P0-DIFF-002：补 V1.1 育苗计算模式
  calculateMode: 'single',
  motherPlantCount: 0,
  propagationMultiple: 1,
  customMultiple: 0,
  theoreticalYield: 0,
  targetSurvivalRate: 90,
  targetSurvivalCount: 0,
  remarks: '',
  qualityGrade: '',
  isFinished: false,
  chargePerson: '',
  // 2026-07-18 P0-DIFF-002：补计划类型 / 生产计划
  planType: 'routine',
  productionPlanId: '',
  workHours: 0,
  // 繁殖模式（建档后锁定）
  propagationMode: 'one_to_one',
  // 单位（从字典获取）
  unit: '株',
  // 数量统计只读字段（对齐 V1.1 数量体系）
  motherLossCount: 0,
  expandedPlantCount: 0,
  seedlingLossCount: 0,
  harvestStockedCount: 0,
  replantCount: 0
})

// 扩繁倍数预设选项（V1.1 seedFormDict / propagationConstants 对齐）
const PROPAGATION_MULTIPLES = [
  { value: 1, label: '1 倍' },
  { value: 2, label: '2 倍' },
  { value: 3, label: '3 倍' },
  { value: 5, label: '5 倍' },
  { value: 10, label: '10 倍' },
  { value: 0, label: '自定义' }
]

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
      workHours: record.workHours || 0,
      propagationMode: record.propagationMode || 'one_to_one',
      unit: record.unit || '株',
      motherLossCount: record.motherLossCount || 0,
      expandedPlantCount: record.expandedPlantCount || 0,
      seedlingLossCount: record.seedlingLossCount || 0,
      harvestStockedCount: record.harvestStockedCount || 0,
      replantCount: record.replantCount || 0
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

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
          <el-icon :size="20" style="color: white;"><Plus /></el-icon>
          <h3 class="text-lg font-semibold text-white">新增育苗</h3>
        </div>
        <el-button circle text @click="handleClose" class="!text-white hover:!bg-white/20">
          <el-icon :size="20" style="color: white;"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区域 -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
        <div class="space-y-6">
          <!-- ========== 育苗批次号 ========== -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <el-icon :size="16" style="color: #7c3aed;"><Refresh /></el-icon>
              <h3 class="text-sm font-semibold text-purple-900">育苗批次号</h3>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  育苗批次号 <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-2">
                  <el-input
                    v-model="formData.seedlingCode"
                    placeholder="点击生成获取批次号"
                    class="flex-1"
                  />
                  <el-button type="primary" @click="handleGenerateCode">
                    <el-icon style="color: inherit;"><Refresh /></el-icon>
                    生成
                  </el-button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">关联生产计划</label>
                <el-select v-model="formData.productionPlanId" placeholder="不关联（独立批次）" clearable class="w-full">
                  <el-option
                    v-for="plan in productionPlans"
                    :key="plan.id"
                    :label="`[${plan.planTypeName || '育苗计划'}] ${plan.batchCode} - ${plan.cropName}`"
                    :value="plan.batchCode"
                  />
                </el-select>
              </div>
            </div>
          </div>

          <!-- ========== 关联种源信息区 ========== -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <el-icon :size="16" style="color: #2563eb;"><Link /></el-icon>
              <h3 class="text-sm font-semibold text-blue-900">关联种源信息</h3>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  关联种源 <span class="text-red-500">*</span>
                </label>
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
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">来源类型</label>
                <el-input v-model="formData.sourceType" readonly class="w-full !bg-gray-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
                <el-input v-model="formData.supplierName" readonly class="w-full !bg-gray-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  作物品种 <span class="text-red-500">*</span>
                </label>
                <!-- TODO: 使用CropCodeSelector组件 -->
                <el-input v-model="formData.cropName" placeholder="请选择作物品种" class="w-full" />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">作物名称</label>
                <el-input
                  :model-value="formData.cropName ? `${formData.cropName} - ${formData.cropVariety}` : '请选择作物品种'"
                  readonly
                  class="w-full !bg-gray-100"
                />
              </div>
            </div>
          </div>

          <!-- ========== 场地与计划区 ========== -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <el-icon :size="16" style="color: #059669;"><Location /></el-icon>
              <h3 class="text-sm font-semibold text-emerald-900">场地与计划</h3>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  育苗区域 <span class="text-red-500">*</span>
                </label>
                <el-select v-model="formData.siteId" placeholder="请选择" class="w-full" @change="handleSiteChange">
                  <el-option v-for="site in sites" :key="site.value" :label="site.label" :value="site.value" />
                </el-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  育苗方式 <span class="text-red-500">*</span>
                </label>
                <el-select v-model="formData.seedlingType" placeholder="请选择" class="w-full">
                  <el-option v-for="type in seedlingTypes" :key="type.value" :label="type.label" :value="type.value" />
                </el-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">计划类型</label>
                <el-select v-model="formData.planType" placeholder="请选择" class="w-full">
                  <el-option label="常规" value="routine" />
                  <el-option label="加急" value="urgent" />
                </el-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  开始日期 <span class="text-red-500">*</span>
                </label>
                <el-date-picker
                  v-model="formData.startDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </div>
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
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">工时（小时）</label>
                <el-input-number v-model="formData.workHours" :min="0" :step="0.5" class="w-full" />
              </div>
            </div>
          </div>

          <!-- ========== 数量与品质区 ========== -->
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <el-icon :size="16" style="color: #d97706;"><DataAnalysis /></el-icon>
              <h3 class="text-sm font-semibold text-amber-900">数量与品质</h3>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  初始数量 <span class="text-red-500">*</span>
                </label>
                <el-input-number v-model="formData.initialCount" :min="0" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">
                  目标成苗率(%) <span class="text-red-500">*</span>
                </label>
                <el-input-number v-model="formData.targetSurvivalRate" :min="0" :max="100" :precision="1" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">目标成苗数</label>
                <el-input :model-value="targetSurvivalCount > 0 ? targetSurvivalCount.toLocaleString() : '-'" readonly class="w-full !bg-gray-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">负责人</label>
                <el-input v-model="formData.chargePerson" placeholder="请输入" class="w-full" />
              </div>
            </div>
          </div>

          <!-- ========== 备注与附件区 ========== -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <el-icon :size="16" style="color: #6b7280;"><Document /></el-icon>
              <h3 class="text-sm font-semibold text-gray-900">备注与附件</h3>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">备注</label>
                <el-input v-model="formData.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">图片上传</label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <el-upload
                    action="#"
                    :auto-upload="false"
                    :show-file-list="true"
                    multiple
                    accept="image/*"
                    list-type="picture-card"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                </div>
              </div>
            </div>
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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus, Close, Refresh, Link, Location, DataAnalysis, Document
} from '@element-plus/icons-vue'
import { useSeedlingStore, useSeedSourceStore, useProductionPlanStore } from '@/stores'
import { SeedlingStatus } from '@/types/crop'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'success'])

const seedlingStore = useSeedlingStore()
const seedSourceStore = useSeedSourceStore()
const productionPlanStore = useProductionPlanStore()

const submitting = ref(false)
const seedSources = ref([])
const productionPlans = ref([])

// 静态选项数据
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
  seedlingCode: '',
  productionPlanId: '',
  sourceId: '',
  sourceCode: '',
  sourceType: '',
  supplierName: '',
  cropCode: '',
  cropName: '',
  cropVariety: '',
  seedlingType: '',
  siteId: '',
  siteName: '',
  startDate: '',
  expectedEndDate: '',
  initialCount: 0,
  targetSurvivalRate: 90,
  chargePerson: '',
  remarks: '',
  workHours: 0,
  planType: 'routine'
})

// 计算目标成苗数
const targetSurvivalCount = computed(() => {
  if (formData.value.initialCount && formData.value.targetSurvivalRate) {
    return Math.round(formData.value.initialCount * (formData.value.targetSurvivalRate / 100))
  }
  return 0
})

// 加载数据
const loadData = async () => {
  await seedSourceStore.loadItems()
  seedSources.value = seedSourceStore.items
  await productionPlanStore.fetchPlans()
  productionPlans.value = productionPlanStore.plans.filter(p =>
    (p.batchStatus === 'published' || p.batchStatus === 'in_progress') &&
    p.planType === 'seedling'
  )
}

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val) {
    loadData()
  }
})

// 生成批次号
const handleGenerateCode = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  formData.value.seedlingCode = `YM${year}${month}${day}-${random}`
}

// 选择种源
const handleSourceChange = (sourceId) => {
  const source = seedSources.value.find(s => s.id === sourceId)
  if (source) {
    formData.value.sourceCode = source.seedCode
    formData.value.sourceType = source.sourceType || ''
    formData.value.supplierName = source.supplierName || '无'
    formData.value.cropCode = source.cropCode || ''
    formData.value.cropName = source.cropName || ''
    formData.value.cropVariety = source.cropVariety || ''
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
  if (!formData.value.sourceId || !formData.value.cropName || !formData.value.siteId) {
    ElMessage.warning('请填写完整信息：关联种源、作物品种、育苗区域为必填项')
    return
  }

  if (!formData.value.seedlingCode) {
    ElMessage.warning('请先生成育苗批次号')
    return
  }

  if (!formData.value.initialCount || formData.value.initialCount <= 0) {
    ElMessage.warning('请输入初始数量')
    return
  }

  submitting.value = true
  try {
    const site = sites.find(s => s.value === formData.value.siteId)
    const siteName = site?.label || ''

    const source = seedSources.value.find(s => s.id === formData.value.sourceId)
    const sourceCode = source?.seedCode || ''

    const submitData = {
      seedlingCode: formData.value.seedlingCode,
      sourceCode,
      cropName: formData.value.cropName,
      cropVariety: formData.value.cropVariety,
      cropCode: formData.value.cropCode,
      seedlingType: formData.value.seedlingType,
      siteId: formData.value.siteId,
      siteName,
      startDate: formData.value.startDate,
      expectedEndDate: formData.value.expectedEndDate || undefined,
      initialCount: formData.value.initialCount,
      survivalCount: 0,
      plantedCount: 0,
      survivalRate: 0,
      lossCount: 0,
      lossRate: 0,
      isFinished: false,
      status: SeedlingStatus.IN_PROGRESS,
      dailyRecords: [],
      pictures: [],
      printCount: 0,
      remarks: formData.value.remarks,
      createBy: localStorage.getItem('username') || '管理员',
      planType: formData.value.planType,
      targetSurvivalRate: formData.value.targetSurvivalRate,
      targetSurvivalCount: targetSurvivalCount.value,
      chargePerson: formData.value.chargePerson || undefined,
      productionPlanCode: formData.value.productionPlanId || undefined,
      workHours: formData.value.workHours || undefined
    }

    await seedlingStore.addItem(submitData)
    ElMessage.success('创建成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('创建育苗记录失败:', error)
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}
</script>

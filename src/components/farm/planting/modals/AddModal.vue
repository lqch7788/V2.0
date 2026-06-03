<template>
  <!-- 新增种植弹窗 - 1:1 翻译 V1.1 AddModal.tsx 标题文案 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" tabindex="-1" @click.self="onClose" @keydown.esc="onClose">
    <div class="bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><Plus /></el-icon>
          新增种植
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 表单内容 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="grid grid-cols-2 gap-6">
          <!-- 来源类型 -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">来源类型 *</label>
            <el-select v-model="formData.sourceType" placeholder="选择来源类型" class="w-full" @change="handleSourceTypeChange">
              <el-option label="种源" value="seed" />
              <el-option label="种苗" value="seedling" />
            </el-select>
          </div>

          <!-- 关联生产计划 - V1.1新增 -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">关联生产计划</label>
            <el-select v-model="formData.productionPlanId" placeholder="不关联" clearable class="w-full" @change="handleProductionPlanChange">
              <el-option
                v-for="plan in availableProductionPlans"
                :key="plan.id"
                :label="`[${getPlanTypeName(plan.planType)}] ${plan.batchCode} - ${plan.cropName}`"
                :value="plan.id"
              />
            </el-select>
            <p class="mt-1 text-xs text-gray-400">只显示种植计划类型的生产批次</p>
          </div>

          <!-- 来源选择（种源或育苗） -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">
              {{ formData.sourceType === 'seed' ? '选择种源' : '选择育苗批次' }} *
            </label>
            <el-select v-model="formData.sourceId" placeholder="请选择" class="w-full" @change="handleSourceChange">
              <el-option
                v-for="source in sourceOptions"
                :key="source.id"
                :label="getSourceLabel(source)"
                :value="source.id"
              />
            </el-select>
          </div>

          <!-- 作物品种 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">作物品种</label>
            <el-input v-model="formData.cropName" placeholder="选择来源后自动填充" disabled />
          </div>

          <!-- 品种 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">品种</label>
            <el-input v-model="formData.cropVariety" placeholder="选择来源后自动填充" disabled />
          </div>

          <!-- 种植区域 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植区域 *</label>
            <el-select v-model="formData.areaId" placeholder="请选择" class="w-full" @change="handleAreaChange">
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

          <!-- 土壤PH值 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">土壤PH值</label>
            <el-input-number v-model="formData.soilPH" :min="0" :max="14" :precision="1" class="w-full" />
          </div>

          <!-- 土壤EC值 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">土壤EC值</label>
            <el-input-number v-model="formData.soilEC" :min="0" :precision="2" class="w-full" />
          </div>

          <!-- 备注 - 跨两列 -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">备注</label>
            <el-input v-model="formData.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </div>

          <!-- 图片上传 - V1.1新增 - 跨两列 -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">图片上传</label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <!-- 已上传的图片预览 -->
              <div v-if="pictures.length > 0" class="flex flex-wrap gap-2 mb-3">
                <div v-for="(pic, index) in pictures" :key="index" class="relative group">
                  <img
                    :src="pic"
                    :alt="`预览${index + 1}`"
                    class="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <el-icon
                    class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="removePicture(index)"
                  >
                    <Close />
                  </el-icon>
                </div>
              </div>
              <!-- 上传按钮 -->
              <label class="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 rounded-lg py-4">
                <el-icon class="w-8 h-8 text-gray-400 mb-2"><Upload /></el-icon>
                <span class="text-sm text-gray-500">点击上传图片</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handlePictureUpload"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Close, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useProductionPlanStore } from '@/stores'
import { usePlantingStore, PlantingStatus } from '@/stores/modules/planting'
import { getSeedSources } from '@/services/apiSeedSourceService'
import { getSeedlings } from '@/services/apiSeedlingService'
import { updateQuantity as updateCropInstanceQuantity } from '@/services/apiCropInstanceService'
import { getStandardCropCode } from '@/services/apiCropVarietyService'
import { SourceType } from '@/types/crop'

// props 命名 1:1 对齐 V1.1 (cropNames / areas / sourceTypeOptions)
// 父组件 PlantingPage.vue 用 :crop-names / :areas / :source-type-options 传入
const props = defineProps({
  isOpen: Boolean,
  cropNames: {
    type: Array,
    default: () => []
  },
  areas: {
    type: Array,
    default: () => []
  },
  sourceTypeOptions: {
    type: Array,
    default: () => [
      { value: 'seed', label: '种源' },
      { value: 'seedling', label: '种苗' }
    ]
  }
})

const emit = defineEmits(['close', 'submit', 'success'])

// 生产计划 Store
const productionPlanStore = useProductionPlanStore()

// 种植 Store - 1:1 翻译 V1.1 usePlantingStore.getState().addItem
const plantingStore = usePlantingStore()

// 表单数据 - 与V1.1 AddModal完全一致
const formData = ref({
  sourceType: 'seedling',  // 来源类型：seed-种源, seedling-种苗
  sourceId: '',            // 来源ID
  sourceCode: '',          // 来源批号
  cropName: '',
  cropVariety: '',
  areaId: '',              // 种植区域ID（字典编码）
  areaName: '',            // 种植区域显示名
  rootName: '',            // 大棚/父级区域名
  plantingCount: 0,
  plantingDate: new Date().toISOString().slice(0, 10),
  soilPH: 6.5,            // V1.1默认值
  soilEC: 1.0,            // V1.1默认值
  remarks: '',
  productionPlanId: '',    // 关联生产计划ID
  productionPlanCode: ''   // 关联生产计划批次号
})

// 图片上传状态
const pictures = ref([])

// 提交状态
const submitting = ref(false)

// 种源列表和育苗列表
const seedSources = ref([])
const seedlings = ref([])

// 加载种源列表和育苗列表
const loadSourceData = async () => {
  try {
    const [sources, seedlingsData] = await Promise.all([
      getSeedSources(),
      getSeedlings()
    ])
    // 筛选可用的种源（availableCount > 0）
    seedSources.value = sources.filter(s => s.availableCount > 0)
    // 筛选可用的育苗（状态为transplant_ready或in_progress）
    seedlings.value = seedlingsData.filter(s =>
      s.status === 'transplant_ready' || s.status === 'in_progress'
    )
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 获取计划类型显示名称
const getPlanTypeName = (planType) => {
  const typeMap = {
    'planting': '种植计划',
    'seedling': '育苗计划',
    'harvest': '采收计划'
  }
  return typeMap[planType] || planType || '种植计划'
}

// 可用的生产计划列表（已发布和执行中的种植计划）
const availableProductionPlans = computed(() => {
  return productionPlanStore.plans.filter(plan =>
    (plan.batchStatus === 'published' || plan.batchStatus === 'in_progress' ||
     plan.status === 'published' || plan.status === 'in_progress') &&
    plan.planType === 'planting'
  )
})

// 根据来源类型获取来源选项
const sourceOptions = computed(() => {
  return formData.value.sourceType === 'seed' ? seedSources.value : seedlings.value
})

// 获取来源显示标签
const getSourceLabel = (source) => {
  if (formData.value.sourceType === 'seed') {
    return `${source.seedCode} - ${source.cropName} (${source.cropVariety}) - 可用: ${source.availableCount}`
  } else {
    const availableCount = (source.survivalCount || 0) - (source.plantedCount || 0)
    return `${source.seedlingCode} - ${source.cropName} (${source.cropVariety}) - 可定植: ${availableCount}`
  }
}

// 监听来源类型变化，重置相关字段
const handleSourceTypeChange = (sourceType) => {
  formData.value.sourceType = sourceType
  formData.value.sourceId = ''
  formData.value.sourceCode = ''
  formData.value.cropName = ''
  formData.value.cropVariety = ''
}

// 处理来源选择变化
const handleSourceChange = (sourceId) => {
  if (formData.value.sourceType === 'seed') {
    // 种源
    const source = seedSources.value.find(s => s.id === sourceId)
    if (source) {
      formData.value.sourceId = sourceId
      formData.value.sourceCode = source.seedCode
      formData.value.cropName = source.cropName
      formData.value.cropVariety = source.cropVariety
    }
  } else {
    // 育苗
    const seedling = seedlings.value.find(s => s.id === sourceId)
    if (seedling) {
      formData.value.sourceId = sourceId
      formData.value.sourceCode = seedling.seedlingCode
      formData.value.cropName = seedling.cropName
      formData.value.cropVariety = seedling.cropVariety
    }
  }
}

// 处理区域选择变化 - V1.1逻辑
const handleAreaChange = (areaId) => {
  const area = props.areas.find(a => a.value === areaId)
  if (area) {
    formData.value.areaId = areaId
    formData.value.areaName = area.label || ''
    formData.value.rootName = area.parent || ''
  }
}

// 处理生产计划选择变化
const handleProductionPlanChange = (planId) => {
  if (planId) {
    const plan = productionPlanStore.plans.find(p => p.id === planId)
    if (plan) {
      formData.value.productionPlanId = planId
      formData.value.productionPlanCode = plan.batchCode || ''
    }
  } else {
    formData.value.productionPlanId = ''
    formData.value.productionPlanCode = ''
  }
}

// 处理图片上传
const handlePictureUpload = (event) => {
  const files = event.target.files
  if (files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (result) {
          pictures.value.push(result)
        }
      }
      reader.readAsDataURL(file)
    })
  }
  // 清空input值以便重复选择同一文件
  event.target.value = ''
}

// 移除图片
const removePicture = (index) => {
  pictures.value.splice(index, 1)
}

// 监听打开状态，重置表单
watch(() => props.isOpen, async (val) => {
  if (val) {
    // 重置表单 - V1.1完全一致
    formData.value = {
      sourceType: 'seedling',
      sourceId: '',
      sourceCode: '',
      cropName: '',
      cropVariety: '',
      areaId: '',
      areaName: '',
      rootName: '',
      plantingCount: 0,
      plantingDate: new Date().toISOString().slice(0, 10),
      soilPH: 6.5,
      soilEC: 1.0,
      remarks: '',
      productionPlanId: '',
      productionPlanCode: ''
    }
    pictures.value = []

    // 加载生产计划和来源数据
    if (productionPlanStore.plans.length === 0) {
      await productionPlanStore.fetchPlans()
    }
    await loadSourceData()
  }
})

const onClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!formData.value.sourceId) {
    ElMessage.warning('请选择来源批次')
    return
  }
  if (!formData.value.cropName) {
    ElMessage.warning('请选择作物品种')
    return
  }
  if (!formData.value.areaId) {
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

  submitting.value = true
  try {
    // 生成种植批号
    const plantCode = `ZZ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

    // 溯源码
    const traceabilityCode = 'TR' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + formData.value.cropName.substring(0, 2)

    // 生成作物编码 - 1:1 翻译 V1.1 cropVarietyService.getCropCodeInfo
    // V1.1: cropInfo = cropVarietyService.getCropCodeInfo(formData.cropName); cropCode = `${cropInfo.categoryCode}${cropInfo.typeCode}${cropInfo.subCode}${seq}`
    // V2.0: apiCropVarietyService 不提供 getCropCodeInfo，使用 getStandardCropCode(cropName) 代替
    let cropCode = ''
    try {
      cropCode = await getStandardCropCode(formData.value.cropVariety || formData.value.cropName)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[AddModal] getStandardCropCode 失败:', err)
    }
    if (!cropCode) {
      // 降级：与 V1.1 一致使用 categoryCode+typeCode+subCode+seq 模式
      cropCode = `${formData.value.cropName.substring(0, 2)}${Date.now().toString().slice(-6)}`
    }

    // 获取区域信息
    const area = props.areas.find(a => a.value === formData.value.areaId)
    const areaName = area?.label || ''
    const rootName = area?.parent || ''

    const submitData = {
      plantCode,
      sourceType: formData.value.sourceType,
      sourceId: formData.value.sourceId,
      sourceCode: formData.value.sourceCode,
      cropName: formData.value.cropName,
      cropVariety: formData.value.cropVariety,
      cropCode,
      areaId: formData.value.areaId,
      areaName: areaName,
      rootName: rootName,
      plantingCount: formData.value.plantingCount,
      plantingDate: formData.value.plantingDate,
      soilPH: formData.value.soilPH,
      soilEC: formData.value.soilEC,
      transplantCount: 0,
      transplantDate: '',
      isHarvest: false,
      attritionRate: 0,
      printCount: 0,
      traceabilityCode,
      pictures: pictures.value,
      remarks: formData.value.remarks,
      status: PlantingStatus.PLANTED,
      createBy: localStorage.getItem('username') || '陆启闯',
      productionPlanId: formData.value.productionPlanId || undefined,
      productionPlanCode: formData.value.productionPlanCode || undefined
    }

    // ============== 1:1 翻译 V1.1 usePlantingStore.getState().addItem() ==============
    // V1.1 (AddModal.tsx L130-157): 直接调用 store 的 addItem 把数据写入 store
    // V2.0 之前版本只 emit('submit') 但父组件未监听 submit，导致数据丢失（"列表数据缺失" 根因）
    // 修复：内部直接调用 plantingStore.addPlanting 写入 store
    try {
      await plantingStore.addPlanting(submitData)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[AddModal] plantingStore.addPlanting 失败:', err)
      ElMessage.error('添加失败，请重试')
      return
    }

    // 更新作物实例的定植数量
    let instanceId
    if (formData.value.sourceType === 'seed') {
      // 来自种源
      const source = seedSources.value.find(s => s.id === formData.value.sourceId)
      instanceId = source?.instanceId
    } else {
      // 来自育苗
      const seedling = seedlings.value.find(s => s.id === formData.value.sourceId)
      if (seedling) {
        const source = seedSources.value.find(s => s.id === seedling.sourceId)
        instanceId = source?.instanceId
      }
    }

    // 同时保留 emit('submit') 以兼容任何可能监听该事件的父组件代码
    emit('submit', submitData)
    // 通知父组件刷新列表（V1.1 onSuccess?.() 等价）
    emit('success')
    // 弹窗自动关闭（V1.1 L183-184: onClose(); onSuccess?.()）
    onClose()

    // 更新作物实例的定植数量（异步，不阻塞提交）
    if (instanceId) {
      updateCropInstanceQuantity(instanceId, 'plant', formData.value.plantingCount).catch(err => {
        // eslint-disable-next-line no-console
        console.error('更新作物实例数量失败:', err)
      })
    }
  } finally {
    submitting.value = false
  }
}
</script>

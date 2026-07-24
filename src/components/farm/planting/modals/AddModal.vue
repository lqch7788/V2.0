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

          <!-- 种植批号（对齐 V1.1 AddModal.tsx L148 生成逻辑） -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植批号 <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <el-input v-model="formData.plantCode" placeholder="点击生成获取批号" class="flex-1" />
              <el-button @click="handleGeneratePlantCode">生成</el-button>
            </div>
          </div>

          <!-- 2026-06-18 目标产量（完成比例 = harvestToInventoryQty / target_yield） -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">目标产量</label>
            <el-input-number v-model="formData.targetYield" :min="0" :precision="2" class="w-full" />
          </div>
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">目标产量单位</label>
            <el-select v-model="formData.targetYieldUnit" placeholder="选择单位" class="w-full">
              <el-option label="克" value="克" />
              <el-option label="千克" value="千克" />
              <el-option label="吨" value="吨" />
              <el-option label="株" value="株" />
              <el-option label="个" value="个" />
              <el-option label="颗" value="颗" />
            </el-select>
          </div>

          <!-- 2026-06-25 育种模式（与生产计划"育种计划"对齐） -->
          <div class="col-span-2">
            <el-checkbox v-model="formData.isBreeding">育种模式（勾选后填写下方育种信息）</el-checkbox>
          </div>
          <template v-if="formData.isBreeding">
            <div>
              <label class="block text-gray-700 text-sm mb-2 font-medium">父本批号</label>
              <el-input v-model="formData.parentMaleCode" placeholder="父本（雄）种源批号" />
            </div>
            <div>
              <label class="block text-gray-700 text-sm mb-2 font-medium">母本批号</label>
              <el-input v-model="formData.parentFemaleCode" placeholder="母本（雌）种源批号" />
            </div>
            <div>
              <label class="block text-gray-700 text-sm mb-2 font-medium">世代</label>
              <el-input v-model="formData.generation" placeholder="如 F1/F2/BC1/G1" />
            </div>
            <div>
              <label class="block text-gray-700 text-sm mb-2 font-medium">育种方法</label>
              <el-input v-model="formData.breedingMethod" placeholder="杂交/选育/回交..." />
            </div>
            <div>
              <label class="block text-gray-700 text-sm mb-2 font-medium">育种位置</label>
              <el-input v-model="formData.breedingLocation" placeholder="育种场地" />
            </div>
            <div>
              <label class="block text-gray-700 text-sm mb-2 font-medium">目标性状</label>
              <el-input v-model="formData.targetTraits" placeholder="高产/抗病/耐寒..." />
            </div>
          </template>

          <!-- 2026-06-24 种植留种（种源管理"种植留种"吸收） -->
          <div class="col-span-2">
            <el-checkbox v-model="formData.isSeedSaving">种植留种（勾选后填写种子标识）</el-checkbox>
          </div>
          <div v-if="formData.isSeedSaving" class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">种子植株标识</label>
            <el-input v-model="formData.seedPlantMarker" placeholder="留种植株的标记/编号" />
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

// 表单数据 - 1:1 对齐 V1.1 AddModal.tsx L45-82（包含育种/留种/目标产量/品种路径）
const formData = ref({
  // 来源
  sourceType: 'seedling',
  originPath: 'direct_from_seedling',
  sourceId: '',
  sourceCode: '',
  // 作物
  selectedCropCode: '',
  cropName: '',
  cropVariety: '',
  categoryName: '',
  typeName: '',
  varietyName: '',
  subVarietyName: '',
  // 种植批号
  plantCode: '',
  // 种植区域
  areaId: '',
  areaName: '',
  rootName: '',
  // 数量与日期
  plantingCount: 0,
  unit: '株',
  plantingDate: new Date().toISOString().slice(0, 10),
  soilPH: 6.5,
  soilEC: 1.0,
  // 2026-06-18: 目标产量（完成比例 = harvestToInventoryQty / target_yield）
  targetYield: 0,
  targetYieldUnit: '克',
  remarks: '',
  // 关联生产计划
  productionPlanId: '',
  productionPlanCode: '',
  // 2026-06-25: 育种模式
  isBreeding: false,
  parentMaleCode: '',
  parentFemaleCode: '',
  generation: '',
  breedingMethod: '',
  breedingLocation: '',
  targetTraits: '',
  // 2026-06-24: 种植留种
  isSeedSaving: false,
  seedPlantMarker: ''
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

// 2026-07-24: 种植批号生成（对齐 V1.1 AddModal.tsx L148 generatePlantCode）
const handleGeneratePlantCode = () => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  formData.value.plantCode = `ZZ${today}-${seq}`
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
  // 2026-07-24: 校验种植批号（对齐 V1.1）
  if (!formData.value.plantCode) {
    ElMessage.warning('请先生成种植批号')
    return
  }

  submitting.value = true
  try {
    // 2026-07-24: 优先用表单中已生成的 plantCode（用户可点击"生成"按钮提前生成）
    const plantCode = formData.value.plantCode || `ZZ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

    // 溯源码
    const traceabilityCode = 'TR' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + formData.value.cropName.substring(0, 2)

    // 生成作物编码 - 1:1 翻译 V1.1 cropVarietyService.getCropCodeInfo
    let cropCode = ''
    try {
      cropCode = await getStandardCropCode(formData.value.cropVariety || formData.value.cropName)
    } catch (err) {
       
      console.warn('[AddModal] getStandardCropCode 失败:', err)
    }
    if (!cropCode) {
      // 降级
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
      unit: formData.value.unit || '株',
      plantingDate: formData.value.plantingDate,
      soilPH: formData.value.soilPH,
      soilEC: formData.value.soilEC,
      // 2026-07-24: 新增目标产量与单位（对齐 V1.1）
      targetYield: formData.value.targetYield || 0,
      targetYieldUnit: formData.value.targetYieldUnit || '克',
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
      productionPlanCode: formData.value.productionPlanCode || undefined,
      // 2026-07-24: 育种模式 + 种植留种（对齐 V1.1）
      isBreeding: formData.value.isBreeding,
      parentMaleCode: formData.value.parentMaleCode || undefined,
      parentFemaleCode: formData.value.parentFemaleCode || undefined,
      generation: formData.value.generation || undefined,
      breedingMethod: formData.value.breedingMethod || undefined,
      breedingLocation: formData.value.breedingLocation || undefined,
      targetTraits: formData.value.targetTraits || undefined,
      isSeedSaving: formData.value.isSeedSaving,
      seedPlantMarker: formData.value.seedPlantMarker || undefined,
      // 品种路径 4 段
      categoryName: formData.value.categoryName || undefined,
      typeName: formData.value.typeName || undefined,
      varietyName: formData.value.varietyName || undefined,
      subVarietyName: formData.value.subVarietyName || undefined
    }

    // ============== 1:1 翻译 V1.1 usePlantingStore.getState().addItem() ==============
    // V1.1 (AddModal.tsx L130-157): 直接调用 store 的 addItem 把数据写入 store
    // V2.0 之前版本只 emit('submit') 但父组件未监听 submit，导致数据丢失（"列表数据缺失" 根因）
    // 修复：内部直接调用 plantingStore.addPlanting 写入 store
    try {
      await plantingStore.addPlanting(submitData)
    } catch (err) {
       
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
         
        console.error('更新作物实例数量失败:', err)
      })
    }
  } finally {
    submitting.value = false
  }
}
</script>

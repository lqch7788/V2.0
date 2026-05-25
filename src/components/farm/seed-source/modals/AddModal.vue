<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">新增种源</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6">
        <el-form :model="form" label-width="110px" ref="formRef">
          <!-- 入库方式选择（占两列） -->
          <el-form-item class="col-span-2">
            <template #label><div class="text-sm font-medium text-gray-900">入库方式</div></template>
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="opt in propagationOptions"
                :key="opt.value"
                @click="handlePropagationTypeChange(opt.value)"
                :class="[
                  'p-3 border-2 cursor-pointer rounded-lg text-left transition-all',
                  form.propagationType === opt.value
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200 hover:bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-white'
                ]"
              >
                <div class="flex items-center gap-1.5 mb-0.5">
                  <el-icon :size="16" :class="form.propagationType === opt.value ? 'text-emerald-600' : 'text-gray-500'">
                    <component :is="opt.icon" />
                  </el-icon>
                  <span class="text-sm font-medium text-gray-900">{{ opt.label }}</span>
                </div>
                <div class="text-xs text-gray-500">{{ opt.desc }}</div>
              </div>
            </div>
          </el-form-item>

          <!-- 种源批号 -->
          <el-form-item label="种源批号">
            <div class="flex gap-2 w-full">
              <el-input v-model="form.seedCode" placeholder="点击生成按钮获取批号" readonly class="flex-1 bg-gray-50 font-mono" />
              <el-button type="primary" @click="handleGenerateSeedCode">
                <el-icon><Refresh /></el-icon>
                生成
              </el-button>
            </div>
            <span class="text-xs text-gray-400 mt-1">格式：ZZ + 年月日(8位) + "-" + 流水号(3位)</span>
          </el-form-item>

          <!-- 作物选择 - 可搜索的下拉选择 -->
          <el-form-item label="作物选择" required>
            <el-select
              v-model="form.cropCode"
              filterable
              remote
              reserve-keyword
              placeholder="搜索或选择作物品种..."
              :remote-method="searchCrops"
              :loading="cropLoading"
              class="w-full"
              @change="handleCropChange"
            >
              <el-option
                v-for="item in cropOptions"
                :key="item.cropCode"
                :label="item.label"
                :value="item.cropCode"
              >
                <div class="py-1">
                  <div class="text-sm font-medium">{{ item.cropCode }} - {{ item.varietyName }}</div>
                  <div class="text-xs text-gray-500">{{ item.categoryName }} > {{ item.typeName }} > {{ item.varietyName }}</div>
                </div>
              </el-option>
            </el-select>
            <!-- 显示选中作物的详细信息 -->
            <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <div class="text-emerald-700">
                {{ selectedCrop.categoryName }} > {{ selectedCrop.typeName }} > {{ selectedCrop.varietyName }}
                <span v-if="selectedCrop.subVariety1Name"> > {{ selectedCrop.subVariety1Name }}</span>
              </div>
            </div>
          </el-form-item>

          <!-- 种源类型 -->
          <el-form-item label="种源类型">
            <el-select v-model="form.sourceType" placeholder="请选择" class="w-full" @change="handleSourceTypeChange">
              <el-option label="种子" value="seed" />
              <el-option label="种苗/实生苗" value="seedling" />
              <el-option label="扦插苗" value="cutting" />
              <el-option label="嫁接苗" value="grafting" />
              <el-option label="组培苗" value="tissue_culture" />
              <el-option label="分株苗" value="split" />
              <el-option label="种球/球根" value="bulb" />
              <el-option label="其他" value="other" />
            </el-select>
            <!-- 选择"其他"时显示补充说明输入框 -->
            <div v-if="form.sourceType === 'other'" class="mt-2">
              <el-input
                v-model="form.remarks"
                type="text"
                placeholder="请输入其他种源类型的详细说明"
                class="border-red-300"
              />
              <p class="mt-1 text-xs text-red-500">必填：选择"其他"时必须填写详细说明</p>
            </div>
          </el-form-item>

          <!-- 来源途径 -->
          <el-form-item label="来源途径">
            <el-select v-model="form.sourceOrigin" placeholder="请选择" class="w-full">
              <el-option label="外部采购" value="external_purchase" />
              <el-option label="自产" value="self_produced" />
              <el-option label="其他" value="other" />
            </el-select>
            <p v-if="form.sourceOrigin === 'other'" class="mt-1 text-xs text-gray-400">请在备注中说明具体来源</p>
          </el-form-item>

          <!-- ===== 育种计划产出字段 ===== -->
          <template v-if="form.propagationType === 'breeding'">
            <el-form-item label="育种方法">
              <el-select v-model="form.breedingMethod" placeholder="选择育种方法" class="w-full">
                <el-option label="杂交育种" value="crossbreeding" />
                <el-option label="选择育种" value="selection" />
                <el-option label="回交育种" value="backcross" />
                <el-option label="杂交优势" value="hybrid" />
                <el-option label="开放授粉" value="open_pollination" />
                <el-option label="诱变育种" value="mutation" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item label="父本编号">
              <el-input v-model="form.parentMaleCode" placeholder="♂ 父本种源批号" />
            </el-form-item>
            <el-form-item label="母本编号">
              <el-input v-model="form.parentFemaleCode" placeholder="♀ 母本种源批号" />
            </el-form-item>
            <el-form-item label="世代">
              <el-select v-model="form.generation" placeholder="选择世代" class="w-full">
                <el-option label="F1" value="F1" />
                <el-option label="F2" value="F2" />
                <el-option label="F3" value="F3" />
                <el-option label="BC1" value="BC1" />
                <el-option label="BC2" value="BC2" />
              </el-select>
            </el-form-item>
            <el-form-item label="育种地点">
              <el-input v-model="form.breedingLocation" placeholder="育种基地/温室" />
            </el-form-item>
            <el-form-item label="目标性状">
              <el-input v-model="form.targetTraits" placeholder="如：抗病、高产、早熟" />
            </el-form-item>
            <el-form-item label="预计采收日期">
              <el-date-picker
                v-model="form.expectedHarvestDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </el-form-item>
          </template>

          <!-- ===== 种植留种字段 ===== -->
          <template v-if="form.propagationType === 'seed_saving'">
            <el-form-item label="关联种植记录">
              <el-input v-model="form.linkedPlantingCode" placeholder="种植批次号" />
            </el-form-item>
            <el-form-item label="留种株标识">
              <el-input v-model="form.linkedPlantingId" placeholder="留种株编号" />
            </el-form-item>
            <el-form-item label="预计采收日期">
              <el-date-picker
                v-model="form.expectedHarvestDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </el-form-item>
          </template>

          <!-- ===== 无性繁殖字段 ===== -->
          <template v-if="form.propagationType === 'asexual'">
            <el-form-item label="繁殖方式">
              <el-select v-model="form.asexualMethod" placeholder="选择繁殖方式" class="w-full">
                <el-option label="扦插" value="cutting" />
                <el-option label="嫁接" value="grafting" />
                <el-option label="分株" value="division" />
                <el-option label="组培" value="tissue_culture" />
                <el-option label="种球/球根" value="bulb" />
                <el-option label="压条" value="layering" />
              </el-select>
            </el-form-item>
            <el-form-item label="母株编号">
              <el-input v-model="form.motherPlantCode" placeholder="母株种源批号" />
            </el-form-item>
            <el-form-item label="母株ID">
              <el-input v-model="form.motherPlantId" placeholder="母株记录ID" />
            </el-form-item>
            <el-form-item label="预计产出种苗数">
              <el-input-number v-model="form.expectedSeedlingCount" :min="0" class="w-full" />
            </el-form-item>
          </template>

          <!-- 供应商（外购时必填，其他来源可选） -->
          <el-form-item :label="form.propagationType === 'external' ? '供应商 *' : '供应商'">
            <el-select
              v-model="form.supplierId"
              :placeholder="form.propagationType === 'external' ? '搜索供应商...' : '内部自留/无需填写'"
              class="w-full"
              filterable
              :disabled="form.propagationType !== 'external'"
              @change="handleSupplierChange"
            >
              <el-option
                v-for="item in filteredSuppliers"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <div class="py-1">
                  <div class="text-sm font-medium">{{ item.name }}</div>
                  <div class="text-xs text-gray-500">{{ item.code }} · {{ item.contact }} · {{ item.mobilePhone }}</div>
                </div>
              </el-option>
              <template #empty>
                <div v-if="form.propagationType === 'external'" class="px-4 py-2 text-gray-500 text-sm">
                  {{ filteredSuppliers.length === 0 && supplierSearchKeyword ? '未找到匹配的供应商' : '当前种源类型下无匹配供应商' }}
                </div>
                <div v-else class="px-4 py-2 text-gray-500 text-sm">
                  内部自留/无需填写
                </div>
              </template>
            </el-select>
          </el-form-item>

          <!-- 关联生产计划（仅育种计划类型显示） -->
          <el-form-item v-if="form.propagationType === 'breeding'" label="关联生产计划">
            <el-select v-model="form.productionPlanId" placeholder="不关联" clearable class="w-full" @change="handlePlanChange">
              <el-option
                v-for="item in breedingPlans"
                :key="item.id"
                :label="`[${item.planTypeName || '育种计划'}] ${item.batchCode} - ${item.cropName}`"
                :value="item.id"
              />
            </el-select>
            <span class="text-xs text-gray-400 mt-1">只显示育种计划类型的生产批次</span>
          </el-form-item>

          <!-- 采购/入库日期 - 根据来源途径动态显示标签 -->
          <el-form-item :label="form.sourceOrigin === 'external_purchase' ? '采购日期' : '入库日期'">
            <el-date-picker
              v-model="form.purchaseDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </el-form-item>

          <!-- 登记数量 -->
          <el-form-item label="登记数量">
            <div class="flex gap-2 w-full">
              <el-input-number v-model="form.quantity" :min="0" class="flex-1" />
              <el-select v-model="form.unit" placeholder="单位" class="w-32">
                <el-option label="粒" value="粒" />
                <el-option label="株" value="株" />
                <el-option label="kg" value="kg" />
                <el-option label="g" value="g" />
                <el-option label="袋" value="袋" />
              </el-select>
            </div>
          </el-form-item>

          <!-- 单价 -->
          <el-form-item label="单价（元）">
            <el-input-number v-model="form.unitPrice" :min="0" :precision="2" class="w-full" />
          </el-form-item>

          <!-- 图片上传 -->
          <el-form-item label="图片上传" class="col-span-2">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full">
              <div v-if="form.pictures && form.pictures.length > 0" class="flex flex-wrap gap-2 mb-3">
                <div v-for="(pic, index) in form.pictures" :key="index" class="relative group">
                  <img :src="pic" alt="" class="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  <el-button
                    link
                    type="danger"
                    size="small"
                    class="absolute -top-2 -right-2"
                    @click="removePicture(index)"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                multiple
                @change="handlePictureChange"
              >
                <el-button type="default">
                  <el-icon><Upload /></el-icon>
                  点击上传图片
                </el-button>
              </el-upload>
            </div>
          </el-form-item>

          <!-- 备注 -->
          <el-form-item label="备注" class="col-span-2">
            <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>

          <!-- 是否补录 -->
          <el-form-item class="col-span-2">
            <template #label><div class="text-sm font-medium text-gray-900">是否补录</div></template>
            <el-select v-model="form.isSupplementary" placeholder="选择是否补录" class="w-full">
              <el-option label="否" :value="false" />
              <el-option label="是" :value="true" />
            </el-select>
            <p class="mt-1 text-xs text-amber-500">选择"是"时，该入库记录将提交审批审核</p>
          </el-form-item>

          <!-- 补录原因 -->
          <el-form-item v-if="form.isSupplementary" label="补录原因" class="col-span-2" required>
            <el-input
              v-model="form.supplementaryReason"
              type="textarea"
              :rows="2"
              placeholder="请输入补录原因，说明为什么需要补录此入库记录"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Refresh, Upload, ShoppingCart, Promotion, Sunny, Collection } from '@element-plus/icons-vue'
import { useSeedSourceStore } from '@/stores'
import { enhancedApiClient } from '@/lib/apiClient'

// 种源类型 → 供应商类型 级联映射
const SOURCE_TYPE_TO_SUPPLIER_TYPE = {
  seed: 'SP',
  seedling: 'SP',
  cutting: 'SP',
  grafting: 'SP',
  tissue_culture: 'SP',
  split: 'SP',
  bulb: 'SP',
  other: null
}

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'success'])

const seedSourceStore = useSeedSourceStore()

const formRef = ref()
const submitting = ref(false)

// 繁殖途径选项
const propagationOptions = [
  { value: 'external', label: '外购入库', desc: '从供应商采购入库', icon: ShoppingCart },
  { value: 'breeding', label: '育种计划产出', desc: '育种计划产出的种子', icon: Promotion },
  { value: 'seed_saving', label: '种植留种', desc: '从种植作物上留种', icon: Sunny },
  { value: 'asexual', label: '无性繁殖', desc: '扦插/嫁接/分株/组培', icon: Collection }
]

// 作物选择相关
const cropOptions = ref([])
const selectedCrop = ref(null)
const cropLoading = ref(false)

// 供应商列表
const suppliers = ref([])

// 育种计划列表
const breedingPlans = ref([])

// 过滤后的供应商（根据种源类型级联过滤）
const filteredSuppliers = computed(() => {
  const targetType = SOURCE_TYPE_TO_SUPPLIER_TYPE[form.value.sourceType]
  if (!targetType) return suppliers.value // null = 展示全部
  return suppliers.value.filter(s => s.supplierType === targetType)
})

// 表单数据
const form = ref({
  propagationType: 'external',
  seedCode: '',
  sourceType: 'seed',
  sourceOrigin: 'external_purchase',
  cropCategory: '',
  typeName: '',
  varietyName: '',
  cropName: '',
  cropVariety: '',
  cropCode: '',
  supplierId: '',
  supplierName: '',
  purchaseDate: '',
  quantity: 0,
  unit: '袋',
  unitPrice: 0,
  pictures: [],
  remarks: '',
  createBy: '管理员', // TODO: 动态获取当前用户
  productionPlanId: '',
  productionPlanCode: '',
  status: 'sufficient',
  traceabilityCode: '',
  printCount: 0,
  // 繁殖途径字段
  breedingMethod: '',
  parentMaleCode: '',
  parentFemaleCode: '',
  generation: '',
  breedingLocation: '',
  targetTraits: '',
  expectedHarvestDate: '',
  asexualMethod: '',
  motherPlantCode: '',
  motherPlantId: '',
  expectedSeedlingCount: 0,
  linkedPlantingCode: '',
  linkedPlantingId: '',
  // 补录相关
  isSupplementary: false,
  supplementaryReason: ''
})

// 搜索作物
const searchCrops = async (query) => {
  if (!query) {
    cropOptions.value = []
    return
  }
  cropLoading.value = true
  try {
    const res = await enhancedApiClient.get('/crop-varieties/search', { keyword: query })
    cropOptions.value = (res || []).map(item => ({
      cropCode: item.cropCode || item.code || '',
      label: `${item.detailVarietyCode || item.cropCode || ''} - ${item.varietyName || ''}`,
      categoryName: item.categoryName || '',
      typeName: item.typeName || '',
      varietyName: item.varietyName || '',
      subVariety1Name: item.subVariety1Name || ''
    }))
  } catch {
    cropOptions.value = []
  } finally {
    cropLoading.value = false
  }
}

// 处理作物选择变化
const handleCropChange = (cropCode) => {
  const crop = cropOptions.value.find(c => c.cropCode === cropCode)
  if (crop) {
    selectedCrop.value = crop
    form.value.cropCategory = crop.categoryName
    form.value.typeName = crop.typeName
    form.value.varietyName = crop.varietyName
    form.value.cropName = crop.subVariety1Name || crop.varietyName
    form.value.cropVariety = crop.subVariety1Name || ''
  }
}

// 处理种源类型变化 - 清空不匹配的供应商
const handleSourceTypeChange = () => {
  if (form.value.supplierId) {
    const targetType = SOURCE_TYPE_TO_SUPPLIER_TYPE[form.value.sourceType]
    if (targetType) {
      const currentSupplier = suppliers.value.find(s => String(s.id) === form.value.supplierId)
      if (currentSupplier && currentSupplier.supplierType !== targetType) {
        form.value.supplierId = ''
        form.value.supplierName = ''
      }
    }
  }
}

// 处理供应商变化
const handleSupplierChange = (supplierId) => {
  const supplier = suppliers.value.find(s => s.id === supplierId)
  if (supplier) {
    form.value.supplierName = supplier.name
  } else {
    form.value.supplierName = ''
  }
}

// 处理生产计划变化
const handlePlanChange = (planId) => {
  if (planId) {
    const plan = breedingPlans.value.find(p => p.id === planId)
    if (plan) {
      form.value.productionPlanCode = plan.batchCode
    }
  } else {
    form.value.productionPlanCode = ''
  }
}

// 加载供应商列表
const loadSuppliers = async () => {
  try {
    const res = await enhancedApiClient.get('/suppliers', { page: 1, pageSize: 1000 })
    suppliers.value = (res?.list || res?.data || []).map(item => ({
      id: String(item.id),
      name: item.name,
      code: item.code,
      contact: item.contact || item.contactName || '',
      mobilePhone: item.mobilePhone || item.phone || '',
      supplierType: item.supplierType || item.type
    }))
  } catch {
    suppliers.value = []
  }
}

// 加载育种计划列表
const loadBreedingPlans = async () => {
  try {
    const res = await enhancedApiClient.get('/crop-batch', { page: 1, pageSize: 1000, planType: 'seed_breeding' })
    breedingPlans.value = (res?.list || res?.data || []).map(item => ({
      id: String(item.id),
      batchCode: item.batchCode || '',
      batchStatus: item.batchStatus || item.status,
      planType: item.planType,
      planTypeName: item.planTypeName || '育种计划',
      cropName: item.cropName || ''
    })).filter(p => p.batchStatus === 'published' || p.batchStatus === 'in_progress')
  } catch {
    breedingPlans.value = []
  }
}

// 繁殖途径变化
const handlePropagationTypeChange = (value) => {
  form.value.propagationType = value
  form.value.sourceOrigin = value === 'external' ? 'external_purchase' : 'self_produced'
  // 清空繁殖途径相关字段
  form.value.breedingMethod = ''
  form.value.parentMaleCode = ''
  form.value.parentFemaleCode = ''
  form.value.generation = ''
  form.value.breedingLocation = ''
  form.value.targetTraits = ''
  form.value.expectedHarvestDate = ''
  form.value.asexualMethod = ''
  form.value.motherPlantCode = ''
  form.value.motherPlantId = ''
  form.value.expectedSeedlingCount = 0
  form.value.linkedPlantingCode = ''
  form.value.linkedPlantingId = ''
}

// 生成种源批号
const handleGenerateSeedCode = async () => {
  const dateStr = form.value.purchaseDate
    ? form.value.purchaseDate.replace(/-/g, '')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '')
  // 调用API获取序列号
  try {
    const res = await enhancedApiClient.get('/seed-sources/generate-code', { date: dateStr })
    form.value.seedCode = res?.code || `ZZ${dateStr}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  } catch {
    form.value.seedCode = `ZZ${dateStr}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  }
}

// 移除图片
const removePicture = (index) => {
  form.value.pictures.splice(index, 1)
}

// 图片变化
const handlePictureChange = (uploadFile) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target && e.target.result) {
      form.value.pictures.push(e.target.result)
    }
  }
  reader.readAsDataURL(uploadFile.raw)
}

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val) {
    loadSuppliers()
    loadBreedingPlans()
  }
})

// 重置表单
const resetForm = () => {
  form.value = {
    propagationType: 'external',
    seedCode: '',
    sourceType: 'seed',
    sourceOrigin: 'external_purchase',
    cropCategory: '',
    typeName: '',
    varietyName: '',
    cropName: '',
    cropVariety: '',
    cropCode: '',
    supplierId: '',
    supplierName: '',
    purchaseDate: '',
    quantity: 0,
    unit: '袋',
    unitPrice: 0,
    pictures: [],
    remarks: '',
    createBy: '管理员',
    productionPlanId: '',
    productionPlanCode: '',
    status: 'sufficient',
    traceabilityCode: '',
    printCount: 0,
    breedingMethod: '',
    parentMaleCode: '',
    parentFemaleCode: '',
    generation: '',
    breedingLocation: '',
    targetTraits: '',
    expectedHarvestDate: '',
    asexualMethod: '',
    motherPlantCode: '',
    motherPlantId: '',
    expectedSeedlingCount: 0,
    linkedPlantingCode: '',
    linkedPlantingId: '',
    isSupplementary: false,
    supplementaryReason: ''
  }
  selectedCrop.value = null
  cropOptions.value = []
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
}

// 提交表单
const handleSubmit = async () => {
  // 验证必填项
  if (!form.value.seedCode) {
    ElMessage.warning('请先生成种源批号')
    return
  }
  if (!form.value.cropCode) {
    ElMessage.warning('请选择作物')
    return
  }
  // 外部采购时供应商必填
  if (form.value.sourceOrigin === 'external_purchase' && !form.value.supplierId) {
    ElMessage.warning('请选择供应商')
    return
  }
  // 选择"其他"种源类型时备注必填
  if (form.value.sourceType === 'other' && !form.value.remarks.trim()) {
    ElMessage.warning('选择"其他"种源类型时，备注为必填项，请输入详细说明')
    return
  }
  // 补录时补录原因必填
  if (form.value.isSupplementary && !form.value.supplementaryReason.trim()) {
    ElMessage.warning('请输入补录原因')
    return
  }

  submitting.value = true
  try {
    // 计算总金额
    const totalAmount = (form.value.quantity || 0) * (form.value.unitPrice || 0)
    const initialCount = form.value.quantity || 0
    const availableCount = initialCount

    // 判断库存状态
    let status = 'sufficient'
    if (availableCount === 0) {
      status = 'depleted'
    } else if (availableCount < initialCount * 0.2) {
      status = 'low'
    }

    // 生成溯源码
    const traceabilityCode = 'TR' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + (form.value.cropName?.substring(0, 2) || 'XX')

    // 构建提交数据
    const submitData = {
      seedCode: form.value.seedCode,
      sourceType: form.value.sourceType,
      sourceOrigin: form.value.sourceOrigin,
      cropCategory: form.value.cropCategory,
      typeName: form.value.typeName,
      varietyName: form.value.varietyName,
      cropName: form.value.cropName,
      cropVariety: form.value.cropVariety,
      cropCode: form.value.cropCode,
      supplierId: form.value.supplierId,
      supplierName: form.value.supplierName,
      purchaseDate: form.value.purchaseDate,
      quantity: form.value.quantity,
      unit: form.value.unit,
      unitPrice: form.value.unitPrice,
      totalAmount,
      initialCount,
      availableCount,
      pictures: form.value.pictures,
      remarks: form.value.remarks,
      status,
      traceabilityCode,
      printCount: 0,
      createBy: form.value.createBy,
      productionPlanId: form.value.productionPlanId,
      productionPlanCode: form.value.productionPlanCode,
      // 繁殖途径字段
      propagationType: form.value.propagationType,
      propagationStatus: 'planned'
    }

    // 根据繁殖途径添加相应字段
    if (form.value.propagationType === 'breeding') {
      submitData.breedingMethod = form.value.breedingMethod
      submitData.parentMaleCode = form.value.parentMaleCode
      submitData.parentFemaleCode = form.value.parentFemaleCode
      submitData.generation = form.value.generation
      submitData.breedingLocation = form.value.breedingLocation
      submitData.targetTraits = form.value.targetTraits
      submitData.expectedHarvestDate = form.value.expectedHarvestDate
    } else if (form.value.propagationType === 'seed_saving') {
      submitData.linkedPlantingCode = form.value.linkedPlantingCode
      submitData.linkedPlantingId = form.value.linkedPlantingId
      submitData.expectedHarvestDate = form.value.expectedHarvestDate
    } else if (form.value.propagationType === 'asexual') {
      submitData.asexualMethod = form.value.asexualMethod
      submitData.motherPlantCode = form.value.motherPlantCode
      submitData.motherPlantId = form.value.motherPlantId
      submitData.expectedSeedlingCount = form.value.expectedSeedlingCount
    }

    await seedSourceStore.addItem(submitData)

    // 如果是补录，发送补录申请（这里暂时打印，实际应该调用审批API）
    if (form.value.isSupplementary) {
      console.log('补录申请数据:', {
        seedCode: form.value.seedCode,
        reason: form.value.supplementaryReason,
        quantity: form.value.quantity,
        unit: form.value.unit,
        cropName: form.value.cropName
      })
    }

    ElMessage.success('创建成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('创建种源失败:', error)
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}
</script>

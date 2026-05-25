<template>
  <el-dialog
    :model-value="visible"
    title="新增作物"
    width="1000px"
    @close="handleClose"
  >
    <div class="grid grid-cols-2 gap-x-6 gap-y-4">
      <!-- 分类标题 -->
      <div class="col-span-2 -mt-2">
        <span class="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium">编码分类</span>
      </div>

      <!-- 类别 -->
      <div>
        <label class="block text-sm font-bold text-blue-700 mb-1">
          类别 <span class="text-red-500">*</span>
        </label>
        <el-select
          v-model="formData.categoryCode"
          placeholder="请选择类别"
          class="w-full"
          @change="handleCategoryChange"
        >
          <el-option
            v-for="opt in categoryOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <!-- 类型 -->
      <div>
        <label class="block text-sm font-bold text-blue-700 mb-1">
          类型 <span class="text-red-500">*</span>
        </label>
        <el-select
          v-model="formData.typeCode"
          placeholder="请选择类型"
          class="w-full"
          :disabled="!formData.categoryCode"
          @change="handleTypeChange"
        >
          <el-option
            v-for="opt in typeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <!-- 品种 -->
      <div>
        <label class="block text-sm font-bold text-blue-700 mb-1">
          品种 <span class="text-red-500">*</span>
        </label>
        <el-select
          v-model="formData.varietyCode"
          placeholder="请选择品种"
          class="w-full"
          :disabled="!formData.typeCode"
          @change="handleVarietyChange"
        >
          <el-option
            v-for="opt in varietyOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <!-- 子品种 -->
      <div>
        <label class="block text-sm text-gray-600 mb-1">子品种</label>
        <el-select
          v-model="formData.subVariety1Code"
          placeholder="请选择子品种"
          class="w-full"
          :disabled="!formData.varietyCode || subVariety1Options.length === 0"
          @change="handleSubVariety1Change"
        >
          <el-option
            v-for="opt in subVariety1Options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <p v-if="subVariety1Options.length === 0 && formData.varietyCode" class="mt-1 text-xs text-gray-400">
          该品种暂无子品种分类
        </p>
      </div>

      <!-- 作物品种 -->
      <div class="col-span-2">
        <label class="block text-sm text-gray-600 mb-1">
          作物品种 <span class="text-xs text-gray-400">(可选，不填则使用子品种名称)</span>
        </label>
        <el-input
          v-model="formData.detailVarietyName"
          placeholder="输入作物品种"
          @input="handleDetailVarietyNameChange"
        />
      </div>

      <!-- 分类标题 -->
      <div class="col-span-2">
        <span class="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium">编码生成</span>
      </div>

      <!-- 作物编码 -->
      <div class="col-span-2">
        <label class="block text-sm font-bold text-emerald-700 mb-1">
          作物编码 <span class="text-red-500">*</span>
          <span class="text-xs text-gray-400 ml-2">(点击生成按钮自动生成)</span>
        </label>
        <div class="flex gap-2">
          <el-input
            v-model="cropCode"
            placeholder="点击生成按钮获取编码"
            class="flex-1"
            @input="cropCode = cropCode.toUpperCase()"
          />
          <el-button
            type="primary"
            :disabled="!formData.categoryCode || !formData.typeCode || !formData.varietyCode"
            @click="handleGenerateCode"
          >
            <el-icon><RefreshRight /></el-icon>
            生成
          </el-button>
          <el-button
            type="primary"
            :disabled="!cropCode"
            @click="handleCheckDuplicate"
          >
            <el-icon><Search /></el-icon>
            查重
          </el-button>
        </div>
        <div
          v-if="duplicateCheckResult"
          :class="duplicateCheckResult.hasDuplicate ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'"
          class="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg"
        >
          <el-icon :class="duplicateCheckResult.hasDuplicate ? 'text-red-500' : 'text-green-500'">
            <Check v-if="!duplicateCheckResult.hasDuplicate" />
            <Close v-else />
          </el-icon>
          <span :class="duplicateCheckResult.hasDuplicate ? 'text-red-700' : 'text-green-700'" class="text-sm">
            {{ duplicateCheckResult.message }}
          </span>
        </div>
        <p class="mt-1 text-xs text-gray-400">
          格式：类别(2位) + 类型(2位) + 品种(2位) + 子品种(3位) + 详细品种(2位) = 11位
        </p>
        <p v-if="formData.subVariety1Code" class="mt-1 text-xs text-blue-600">
          当前子品种「{{ formData.subVariety1Name }}」下已有详细品种，系统将自动分配下一个序号
          {{ detailVarietyCode && `（当前序号：${detailVarietyCode}）` }}
        </p>
      </div>

      <!-- 分类标题 -->
      <div class="col-span-2">
        <span class="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium">品种信息</span>
      </div>

      <!-- 别名 -->
      <div>
        <label class="block text-sm text-amber-700 mb-1">
          别名 <span class="text-xs text-gray-400">(多个用逗号分隔)</span>
        </label>
        <el-input
          v-model="formData.alias"
          placeholder="如：西红柿、洋柿子"
        />
      </div>

      <!-- 图片 -->
      <div>
        <label class="block text-sm text-amber-700 mb-1">图片</label>
        <div class="flex items-center gap-3">
          <div v-if="formData.image" class="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-200 flex-shrink-0">
            <img :src="formData.image" alt="预览" class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col gap-1">
            <el-button size="small" @click="triggerImageUpload">
              {{ formData.image ? '更换图片' : '上传图片' }}
            </el-button>
            <input
              ref="imageInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageUpload"
            />
            <el-button v-if="formData.image" size="small" type="danger" @click="formData.image = ''">
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 特性描述 -->
      <div class="col-span-2">
        <label class="block text-sm text-amber-700 mb-1">特性描述</label>
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="简要描述该作物品种的主要特性..."
        />
      </div>

      <!-- 作物生长周期 -->
      <div class="col-span-2">
        <label class="block text-sm font-bold text-amber-700 mb-2">作物生长周期</label>
        <div class="grid grid-cols-5 gap-3">
          <div>
            <label class="block text-xs text-amber-600 mb-1">发芽期(天)</label>
            <el-input-number
              v-model="formData.germinationPeriod"
              :min="0"
              controls-position="right"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-xs text-amber-600 mb-1">育苗期(天)</label>
            <el-input-number
              v-model="formData.seedlingPeriod"
              :min="0"
              controls-position="right"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-xs text-amber-600 mb-1">开花期(天)</label>
            <el-input-number
              v-model="formData.floweringPeriod"
              :min="0"
              controls-position="right"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-xs text-amber-600 mb-1">结果期(天)</label>
            <el-input-number
              v-model="formData.fruitingPeriod"
              :min="0"
              controls-position="right"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-xs text-amber-600 mb-1">摘收期(天)</label>
            <el-input-number
              v-model="formData.harvestPeriod"
              :min="0"
              controls-position="right"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- 作物适宜环境参数 -->
      <div class="col-span-2">
        <label class="block text-sm font-bold text-cyan-700 mb-2">作物适宜环境参数</label>
        <div class="grid grid-cols-4 gap-3">
          <div>
            <label class="block text-xs text-cyan-600 mb-1">空气温度(℃)</label>
            <el-input-number v-model="formData.airTemperature" :precision="2" :step="0.1" controls-position="right" class="w-full" />
          </div>
          <div>
            <label class="block text-xs text-cyan-600 mb-1">空气湿度(%)</label>
            <el-input-number v-model="formData.airHumidity" :precision="2" :step="0.1" controls-position="right" class="w-full" />
          </div>
          <div>
            <label class="block text-xs text-cyan-600 mb-1">CO₂含量(ppm)</label>
            <el-input-number v-model="formData.co2Content" :precision="2" :step="0.1" controls-position="right" class="w-full" />
          </div>
          <div>
            <label class="block text-xs text-cyan-600 mb-1">光照度(lx)</label>
            <el-input-number v-model="formData.lightIntensity" :precision="2" :step="0.1" controls-position="right" class="w-full" />
          </div>
          <div>
            <label class="block text-xs text-cyan-600 mb-1">土壤温度(℃)</label>
            <el-input-number v-model="formData.soilTemperature" :precision="2" :step="0.1" controls-position="right" class="w-full" />
          </div>
          <div>
            <label class="block text-xs text-cyan-600 mb-1">土壤湿度(%)</label>
            <el-input-number v-model="formData.soilHumidity" :precision="2" :step="0.1" controls-position="right" class="w-full" />
          </div>
          <div>
            <label class="block text-xs text-cyan-600 mb-1">土壤PH值</label>
            <el-input-number v-model="formData.soilPh" :precision="2" :step="0.1" controls-position="right" class="w-full" />
          </div>
          <div>
            <label class="block text-xs text-cyan-600 mb-1">土壤EC值</label>
            <el-input-number v-model="formData.soilEc" :precision="2" :step="0.1" controls-position="right" class="w-full" />
          </div>
        </div>
      </div>

      <!-- 备注 -->
      <div class="col-span-2">
        <label class="block text-sm text-gray-500 mb-1">备注</label>
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息..."
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认新增</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshRight, Search, Check, Close } from '@element-plus/icons-vue'
import { useCropVarietyStore } from '@/stores'
import {
  getCategoryOptions,
  getTypeOptionsByCategory,
  getVarietyOptionsByType,
  getSubVariety1Options,
  generateCropCode,
  getMaxDetailVarietyCode,
  getAllVarieties
} from '@/services/cropVarietyService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  prefillData: {
    type: Object,
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const store = useCropVarietyStore()
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 图片上传相关
const imageInputRef = ref(null)

const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const handleImageUpload = (event) => {
  const target = event.target
  const file = target.files?.[0]
  if (!file) return

  // 使用 FileReader 将图片转为 base64
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.image = e.target?.result
  }
  reader.readAsDataURL(file)

  // 清空input以便重复选择同一文件
  target.value = ''
}

// 表单数据
const formData = reactive({
  categoryCode: '',
  categoryName: '',
  typeCode: '',
  typeName: '',
  varietyCode: '',
  varietyName: '',
  subVariety1Code: '',
  subVariety1Name: '',
  detailVarietyName: '',
  alias: '',
  image: '',
  description: '',
  germinationPeriod: undefined,
  seedlingPeriod: undefined,
  floweringPeriod: undefined,
  fruitingPeriod: undefined,
  harvestPeriod: undefined,
  airTemperature: undefined,
  airHumidity: undefined,
  co2Content: undefined,
  lightIntensity: undefined,
  soilTemperature: undefined,
  soilHumidity: undefined,
  soilPh: undefined,
  soilEc: undefined,
  remarks: ''
})

// 作物编码
const cropCode = ref('')
const detailVarietyCode = ref('')
const duplicateCheckResult = ref(null)
const codeGenerated = ref(false)

// 选项数据
const categoryOptions = ref([])
const typeOptions = ref([])
const varietyOptions = ref([])
const subVariety1Options = ref([])

// 监听 prefillData 变化
watch(() => props.prefillData, (newData) => {
  if (newData) {
    formData.categoryCode = newData.categoryCode || ''
    formData.categoryName = newData.categoryName || ''
    formData.typeCode = newData.typeCode || ''
    formData.typeName = newData.typeName || ''
    formData.varietyCode = newData.varietyCode || ''
    formData.varietyName = newData.varietyName || ''
    formData.subVariety1Code = newData.subVariety1Code || ''
    formData.subVariety1Name = newData.subVariety1Name || ''
    formData.detailVarietyName = ''

    // 加载对应的选项
    categoryOptions.value = getCategoryOptions()
    typeOptions.value = getTypeOptionsByCategory(formData.categoryCode)
    varietyOptions.value = getVarietyOptionsByType(formData.categoryCode, formData.typeCode)
    subVariety1Options.value = getSubVariety1Options(formData.categoryCode, formData.typeCode, formData.varietyCode)

    // 自动获取下一个详细品种序号
    if (formData.subVariety1Code) {
      detailVarietyCode.value = getMaxDetailVarietyCode(
        formData.categoryCode,
        formData.typeCode,
        formData.varietyCode,
        formData.subVariety1Code
      )
    }

    // 自动生成编码
    cropCode.value = generateCropCode(
      formData.categoryCode,
      formData.typeCode,
      formData.varietyCode,
      formData.subVariety1Code,
      formData.subVariety1Code ? detailVarietyCode.value : undefined
    )
    codeGenerated.value = true
  }
}, { immediate: true })

// 类别变化
function handleCategoryChange() {
  const category = categoryOptions.value.find(c => c.value === formData.categoryCode)
  formData.categoryName = category?.label || ''
  formData.typeCode = ''
  formData.typeName = ''
  formData.varietyCode = ''
  formData.varietyName = ''
  formData.subVariety1Code = ''
  formData.subVariety1Name = ''
  formData.detailVarietyName = ''

  typeOptions.value = formData.categoryCode ? getTypeOptionsByCategory(formData.categoryCode) : []
  varietyOptions.value = []
  subVariety1Options.value = []
  cropCode.value = ''
  detailVarietyCode.value = ''
  codeGenerated.value = false
  duplicateCheckResult.value = null
}

// 类型变化
function handleTypeChange() {
  const type = typeOptions.value.find(t => t.value === formData.typeCode)
  formData.typeName = type?.label || ''
  formData.varietyCode = ''
  formData.varietyName = ''
  formData.subVariety1Code = ''
  formData.subVariety1Name = ''
  formData.detailVarietyName = ''

  varietyOptions.value = formData.categoryCode && formData.typeCode
    ? getVarietyOptionsByType(formData.categoryCode, formData.typeCode)
    : []
  subVariety1Options.value = []
  cropCode.value = ''
  detailVarietyCode.value = ''
  codeGenerated.value = false
  duplicateCheckResult.value = null
}

// 品种变化
function handleVarietyChange() {
  const variety = varietyOptions.value.find(v => v.value === formData.varietyCode)
  formData.varietyName = variety?.label || ''
  formData.subVariety1Code = ''
  formData.subVariety1Name = ''
  formData.detailVarietyName = ''

  subVariety1Options.value = formData.categoryCode && formData.typeCode && formData.varietyCode
    ? getSubVariety1Options(formData.categoryCode, formData.typeCode, formData.varietyCode)
    : []
  cropCode.value = ''
  detailVarietyCode.value = ''
  codeGenerated.value = false
  duplicateCheckResult.value = null
}

// 子品种变化
function handleSubVariety1Change() {
  const sub = subVariety1Options.value.find(s => s.value === formData.subVariety1Code)
  formData.subVariety1Name = sub?.label || ''
  formData.detailVarietyName = formData.subVariety1Name

  if (formData.subVariety1Code) {
    detailVarietyCode.value = getMaxDetailVarietyCode(
      formData.categoryCode,
      formData.typeCode,
      formData.varietyCode,
      formData.subVariety1Code
    )
  } else {
    detailVarietyCode.value = ''
  }
  duplicateCheckResult.value = null
}

// 详细品种名称变化
function handleDetailVarietyNameChange() {
  duplicateCheckResult.value = null
}

// 生成编码
function handleGenerateCode() {
  if (!formData.categoryCode || !formData.typeCode || !formData.varietyName) {
    ElMessage.warning('请先选择完整的类别、类型和品种')
    return
  }

  if (formData.subVariety1Code && !detailVarietyCode.value) {
    detailVarietyCode.value = getMaxDetailVarietyCode(
      formData.categoryCode,
      formData.typeCode,
      formData.varietyCode,
      formData.subVariety1Code
    )
  }

  cropCode.value = generateCropCode(
    formData.categoryCode,
    formData.typeCode,
    formData.varietyCode,
    formData.subVariety1Code || undefined,
    formData.subVariety1Code ? detailVarietyCode.value : undefined
  )
  codeGenerated.value = true
  duplicateCheckResult.value = null
}

// 查重
function handleCheckDuplicate() {
  if (!cropCode.value && !formData.detailVarietyName && !formData.varietyName) {
    duplicateCheckResult.value = {
      hasDuplicate: false,
      message: '请先生成编码或输入品种名称'
    }
    return
  }

  const allVarieties = getAllVarieties()
  const duplicates = []

  // 检查编码是否重复
  if (cropCode.value) {
    const existingByCode = allVarieties.find(v => v.cropCode === cropCode.value)
    if (existingByCode) {
      duplicates.push(`编码 ${cropCode.value} 已存在，对应品种：${existingByCode.varietyName}`)
    }
  }

  // 检查详细品种名称是否重复
  if (formData.detailVarietyName && formData.subVariety1Code) {
    const existingByName = allVarieties.find(v =>
      v.subVariety1Code === formData.subVariety1Code &&
      v.varietyName === formData.detailVarietyName
    )
    if (existingByName) {
      duplicates.push(`品种名称 "${formData.detailVarietyName}" 已存在于该子品种下，对应编码：${existingByName.cropCode}`)
    }
  }

  if (duplicates.length > 0) {
    duplicateCheckResult.value = {
      hasDuplicate: true,
      message: duplicates.join('；')
    }
  } else {
    duplicateCheckResult.value = {
      hasDuplicate: false,
      message: '可以使用'
    }
  }
}

// 解析别名
function parseAlias(aliasStr) {
  if (!aliasStr.trim()) return []
  return aliasStr.split(/[,，;；]/).map(s => s.trim()).filter(s => s)
}

// 提交
async function handleSubmit() {
  try {
    if (!formData.categoryCode || !formData.typeCode || !formData.varietyName) {
      ElMessage.warning('请选择完整的类别、类型和品种')
      return
    }
    if (!cropCode.value) {
      ElMessage.warning('请先生成作物编码')
      return
    }
    if (duplicateCheckResult.value?.hasDuplicate) {
      ElMessage.warning('存在重复的品种，请修改后重试')
      return
    }

    const finalDetailVarietyName = formData.detailVarietyName.trim() || formData.subVariety1Name || ''
    const finalDetailCode = formData.detailVarietyName.trim() ? detailVarietyCode.value : '00'

    await store.addItem({
      cropCode: cropCode.value,
      categoryCode: formData.categoryCode,
      categoryName: formData.categoryName,
      typeCode: formData.typeCode,
      typeName: formData.typeName,
      varietyCode: formData.varietyCode,
      varietyName: formData.varietyName,
      subVariety1Code: formData.subVariety1Code || undefined,
      subVariety1Name: formData.subVariety1Name || undefined,
      detailVarietyCode: finalDetailCode || undefined,
      detailVarietyName: finalDetailVarietyName || undefined,
      alias: parseAlias(formData.alias),
      image: formData.image || undefined,
      description: formData.description || undefined,
      germinationPeriod: formData.germinationPeriod,
      seedlingPeriod: formData.seedlingPeriod,
      floweringPeriod: formData.floweringPeriod,
      fruitingPeriod: formData.fruitingPeriod,
      harvestPeriod: formData.harvestPeriod,
      airTemperature: formData.airTemperature,
      airHumidity: formData.airHumidity,
      co2Content: formData.co2Content,
      lightIntensity: formData.lightIntensity,
      soilTemperature: formData.soilTemperature,
      soilHumidity: formData.soilHumidity,
      soilPh: formData.soilPh,
      soilEc: formData.soilEc,
      status: 'active',
      remarks: formData.remarks
    })

    emit('success')
    handleClose()
  } catch (error) {
    console.error('保存品种失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 关闭弹窗
function handleClose() {
  visible.value = false
  resetForm()
}

function resetForm() {
  Object.assign(formData, {
    categoryCode: '',
    categoryName: '',
    typeCode: '',
    typeName: '',
    varietyCode: '',
    varietyName: '',
    subVariety1Code: '',
    subVariety1Name: '',
    detailVarietyName: '',
    alias: '',
    image: '',
    description: '',
    germinationPeriod: undefined,
    seedlingPeriod: undefined,
    floweringPeriod: undefined,
    fruitingPeriod: undefined,
    harvestPeriod: undefined,
    airTemperature: undefined,
    airHumidity: undefined,
    co2Content: undefined,
    lightIntensity: undefined,
    soilTemperature: undefined,
    soilHumidity: undefined,
    soilPh: undefined,
    soilEc: undefined,
    remarks: ''
  })
  cropCode.value = ''
  detailVarietyCode.value = ''
  codeGenerated.value = false
  duplicateCheckResult.value = null
  typeOptions.value = []
  varietyOptions.value = []
  subVariety1Options.value = []
}
</script>

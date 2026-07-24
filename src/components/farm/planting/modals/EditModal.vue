<template>
  <!-- 编辑种植记录弹窗 - 与V1.1 EditModal.tsx完全一致 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" tabindex="-1" @click.self="onClose" @keydown.esc="onClose">
    <div class="bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><Edit /></el-icon>
          编辑种植记录
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 表单内容 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="grid grid-cols-2 gap-6">
          <!-- 作物品种选择 -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">作物品种 *</label>
            <el-select
              v-model="formData.selectedCropCode"
              placeholder="搜索或选择作物品种..."
              filterable
              clearable
              class="w-full"
              @change="handleCropCodeChange"
            >
              <el-option
                v-for="crop in cropVarietyOptions"
                :key="crop.value"
                :label="`${crop.category || ''} > ${crop.typeName || ''} > ${crop.label}`"
                :value="crop.value"
              >
                <div class="flex items-center gap-2">
                  <span>{{ crop.category }}</span>
                  <span class="text-gray-400">></span>
                  <span>{{ crop.typeName }}</span>
                  <span class="text-gray-400">></span>
                  <span>{{ crop.label }}</span>
                  <span class="text-xs text-gray-400 font-mono">{{ crop.value }}</span>
                </div>
              </el-option>
            </el-select>
          </div>

          <!-- 作物名称（自动填充） -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">作物名称</label>
            <el-input v-model="formData.cropName" disabled placeholder="选择品种后自动填充" />
          </div>

          <!-- 品种（自动填充） -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">品种</label>
            <el-input v-model="formData.cropVariety" disabled placeholder="选择品种后自动填充" />
          </div>

          <!-- 种植区域 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植区域 *</label>
            <el-select v-model="formData.areaId" placeholder="请选择" class="w-full">
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
            <label class="block text-gray-700 text-sm mb-2 font-medium">种植日期</label>
            <el-date-picker
              v-model="formData.plantingDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="w-full"
              disabled
            />
          </div>

          <!-- 损耗率 -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">损耗率(%)</label>
            <el-input-number v-model="formData.attritionRate" :min="0" :max="100" :precision="1" class="w-full" />
          </div>

          <!-- 土壤PH -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">土壤PH</label>
            <el-input-number v-model="formData.soilPH" :min="0" :max="14" :precision="1" class="w-full" />
          </div>

          <!-- 土壤EC -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">土壤EC</label>
            <el-input-number v-model="formData.soilEC" :min="0" :precision="2" class="w-full" />
          </div>

          <!-- 已定植数量 + 日期（对齐 V1.1 EditModal L50-51） -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">已定植数量</label>
            <el-input-number v-model="formData.transplantCount" :min="0" class="w-full" />
          </div>
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">已定植日期</label>
            <el-date-picker
              v-model="formData.transplantDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              class="w-full"
            />
          </div>

          <!-- 目标产量 + 单位（对齐 V1.1 L52-53） -->
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
            </el-select>
          </div>

          <!-- 损耗数量 + 补苗数量（对齐 V1.1 L64-65） -->
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">损耗数量</label>
            <el-input-number v-model="formData.lossCount" :min="0" class="w-full" />
          </div>
          <div>
            <label class="block text-gray-700 text-sm mb-2 font-medium">补苗数量</label>
            <el-input-number v-model="formData.supplementCount" :min="0" class="w-full" />
          </div>

          <!-- 育种模式（对齐 V1.1 L55-61） -->
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

          <!-- 留种模式（对齐 V1.1 L62-63） -->
          <div class="col-span-2">
            <el-checkbox v-model="formData.isSeedSaving">种植留种（勾选后填写种子标识）</el-checkbox>
          </div>
          <div v-if="formData.isSeedSaving" class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">种子植株标识</label>
            <el-input v-model="formData.seedPlantMarker" placeholder="留种植株的标记/编号" />
          </div>

          <!-- 关联生产计划（对齐 V1.1 L66-67） -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">关联生产计划</label>
            <el-input v-model="formData.productionPlanCode" placeholder="关联生产计划批次号（只读）" disabled />
          </div>

          <!-- 备注 - 跨两列 -->
          <div class="col-span-2">
            <label class="block text-gray-700 text-sm mb-2 font-medium">备注</label>
            <el-input v-model="formData.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Edit, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isOpen: Boolean,
  record: Object,
  cropVarietyOptions: {
    type: Array,
    default: () => []
  },
  areaOptions: {
    type: Array,
    default: () => [
      { value: '1号棚', label: '1号棚' },
      { value: '2号棚', label: '2号棚' },
      { value: '3号棚', label: '3号棚' },
      { value: '4号棚', label: '4号棚' }
    ]
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  plantCode: '',
  selectedCropCode: '',
  cropName: '',
  cropVariety: '',
  categoryName: '',
  typeName: '',
  varietyName: '',
  subVarietyName: '',
  areaId: '',
  areaName: '',
  unit: '株',
  plantingCount: 0,
  plantingDate: '',
  attritionRate: 0,
  soilPH: null,
  soilEC: null,
  transplantCount: 0,
  transplantDate: '',
  targetYield: 0,
  targetYieldUnit: '克',
  lossCount: 0,
  supplementCount: 0,
  isBreeding: false,
  parentMaleCode: '',
  parentFemaleCode: '',
  generation: '',
  breedingMethod: '',
  breedingLocation: '',
  targetTraits: '',
  isSeedSaving: false,
  seedPlantMarker: '',
  productionPlanId: '',
  productionPlanCode: '',
  remarks: ''
})

// 处理作物品种选择变化
const handleCropCodeChange = (cropCode) => {
  if (cropCode) {
    const crop = props.cropVarietyOptions.find(c => c.value === cropCode)
    if (crop) {
      // cropName 使用 category，cropVariety 使用 label (即 varietyName)
      formData.value.cropName = crop.category || ''
      formData.value.cropVariety = crop.label || ''
    }
  } else {
    formData.value.cropName = ''
    formData.value.cropVariety = ''
  }
}

// 监听打开状态和记录数据
watch(() => [props.isOpen, props.record], ([val, record]) => {
  if (val && record) {
    formData.value = {
      plantCode: record.plantCode || '',
      selectedCropCode: record.cropCode || '',
      cropName: record.cropName || '',
      cropVariety: record.cropVariety || '',
      categoryName: record.categoryName || '',
      typeName: record.typeName || '',
      varietyName: record.varietyName || '',
      subVarietyName: record.subVarietyName || '',
      areaId: record.areaId || '',
      areaName: record.areaName || '',
      unit: record.unit || '株',
      plantingCount: record.plantingCount || 0,
      plantingDate: record.plantingDate || '',
      attritionRate: record.attritionRate ?? 0,
      soilPH: record.soilPH || null,
      soilEC: record.soilEC || null,
      transplantCount: record.transplantCount || 0,
      transplantDate: record.transplantDate || '',
      targetYield: record.targetYield || 0,
      targetYieldUnit: record.targetYieldUnit || '克',
      lossCount: record.lossCount || 0,
      supplementCount: record.supplementCount || 0,
      isBreeding: record.isBreeding || false,
      parentMaleCode: record.parentMaleCode || '',
      parentFemaleCode: record.parentFemaleCode || '',
      generation: record.generation || '',
      breedingMethod: record.breedingMethod || '',
      breedingLocation: record.breedingLocation || '',
      targetTraits: record.targetTraits || '',
      isSeedSaving: record.isSeedSaving || false,
      seedPlantMarker: record.seedPlantMarker || '',
      productionPlanId: record.productionPlanId || '',
      productionPlanCode: record.productionPlanCode || '',
      remarks: record.remarks || ''
    }
  }
}, { immediate: true })

const onClose = () => {
  emit('close')
}

const handleSubmit = () => {
  if (!formData.value.selectedCropCode) {
    ElMessage.warning('请选择作物品种')
    return
  }
  if (!formData.value.areaId) {
    ElMessage.warning('请选择种植区域')
    return
  }
  if (!formData.value.plantingCount || formData.value.plantingCount <= 0) {
    ElMessage.warning('请输入正确的种植数量')
    return
  }

  // 构建提交数据 - 1:1 对齐 V1.1 EditModal.tsx 含育种/留种/目标产量等
  const submitData = {
    cropCode: formData.value.selectedCropCode,
    cropName: formData.value.cropName,
    cropVariety: formData.value.cropVariety,
    categoryName: formData.value.categoryName || undefined,
    typeName: formData.value.typeName || undefined,
    varietyName: formData.value.varietyName || undefined,
    subVarietyName: formData.value.subVarietyName || undefined,
    areaId: formData.value.areaId,
    areaName: formData.value.areaName,
    unit: formData.value.unit || '株',
    plantingCount: formData.value.plantingCount,
    plantingDate: formData.value.plantingDate,
    soilPH: formData.value.soilPH,
    soilEC: formData.value.soilEC,
    attritionRate: formData.value.attritionRate,
    // 2026-07-24: 新增 13 字段
    transplantCount: formData.value.transplantCount,
    transplantDate: formData.value.transplantDate || '',
    targetYield: formData.value.targetYield || 0,
    targetYieldUnit: formData.value.targetYieldUnit || '克',
    lossCount: formData.value.lossCount || 0,
    supplementCount: formData.value.supplementCount || 0,
    isBreeding: formData.value.isBreeding,
    parentMaleCode: formData.value.parentMaleCode || undefined,
    parentFemaleCode: formData.value.parentFemaleCode || undefined,
    generation: formData.value.generation || undefined,
    breedingMethod: formData.value.breedingMethod || undefined,
    breedingLocation: formData.value.breedingLocation || undefined,
    targetTraits: formData.value.targetTraits || undefined,
    isSeedSaving: formData.value.isSeedSaving,
    seedPlantMarker: formData.value.seedPlantMarker || undefined,
    productionPlanId: formData.value.productionPlanId || undefined,
    productionPlanCode: formData.value.productionPlanCode || undefined,
    remarks: formData.value.remarks
  }

  emit('submit', submitData)
}
</script>

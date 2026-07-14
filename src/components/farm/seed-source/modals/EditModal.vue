<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">编辑种源</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6">
        <el-form :model="form" label-width="100px" ref="formRef">
          <!-- 种源批号 - 只读显示 -->
          <el-form-item label="种源批号">
            <el-input :model-value="record.seedCode" disabled class="bg-gray-50 font-mono" />
          </el-form-item>

          <!-- 作物选择 - V1.1 CropCodeSelector（4级联动） -->
          <el-form-item label="作物选择" required>
            <CropCodeSelector
              :model-value="form.cropCode"
              @update:model-value="(val) => { form.cropCode = val; handleCropChange(val) }"
              placeholder="搜索或选择作物品种..."
              :show-full-path="true"
            />
            <!-- 兼容保留旧el-select以备回退 -->
            <el-select
              v-show="false"
              v-model="form.cropCode"
              filterable
              remote
              reserve-keyword
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
                  <div class="text-sm font-medium">{{ item.detailVarietyCode }} - {{ item.varietyName }}</div>
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

          <!-- 供应商 - 外部采购时必填 -->
          <el-form-item label="供应商">
            <el-select
              v-model="form.supplierId"
              placeholder="请选择"
              class="w-full"
              filterable
              @change="handleSupplierChange"
            >
              <el-option
                v-for="item in filteredSuppliers"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
              <template #empty>
                <div v-if="form.sourceOrigin === 'external_purchase'" class="px-4 py-2 text-gray-500 text-sm">
                  当前种源类型下无匹配供应商，请切换种源类型
                </div>
                <div v-else class="px-4 py-2 text-gray-500 text-sm">
                  内部自留/无需填写
                </div>
              </template>
            </el-select>
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

          <!-- 图片上传 - 占两列 -->
          <el-form-item label="图片上传" class="col-span-2">
            <div class="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer">
              <div class="text-gray-500 text-sm">
                点击上传或拖拽图片到此处
              </div>
            </div>
          </el-form-item>

          <!-- 备注 - 占两列 -->
          <el-form-item label="备注" class="col-span-2">
            <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
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
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { useSeedSourceStore } from '@/stores'
import CropCodeSelector from '@/components/farm/common/CropCodeSelector.vue'
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
  visible: Boolean,
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const seedSourceStore = useSeedSourceStore()

const formRef = ref()
const submitting = ref(false)

// 作物选择相关
const cropOptions = ref([])
const selectedCrop = ref(null)
const cropLoading = ref(false)

// 供应商列表
const suppliers = ref([])

// 过滤后的供应商（根据种源类型级联过滤）
const filteredSuppliers = computed(() => {
  const targetType = SOURCE_TYPE_TO_SUPPLIER_TYPE[form.value.sourceType]
  if (!targetType) return suppliers.value // null = 展示全部
  return suppliers.value.filter(s => s.supplierType === targetType)
})

const form = ref({
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
  unit: '粒',
  unitPrice: 0,
  pictures: [],
  remarks: '',
  status: 'sufficient'
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

// 加载供应商列表
const loadSuppliers = async () => {
  try {
    const res = await enhancedApiClient.get('/suppliers', { page: 1, pageSize: 1000 })
    suppliers.value = (res?.list || res?.data || []).map(item => ({
      id: String(item.id),
      name: item.name,
      code: item.code,
      supplierType: item.supplierType || item.type
    }))
  } catch {
    suppliers.value = []
  }
}

// 监听 visible 和 record 变化，确保每次打开都能正确加载数据
watch([() => props.visible, () => props.record], ([val, record]) => {
  if (val && record) {
    form.value = {
      seedCode: record.seedCode || '',
      sourceType: record.sourceType || 'seed',
      sourceOrigin: record.sourceOrigin || 'external_purchase',
      cropCategory: record.cropCategory || '',
      typeName: record.typeName || '',
      varietyName: record.varietyName || '',
      cropName: record.cropName || '',
      cropVariety: record.cropVariety || '',
      cropCode: record.cropCode || '',
      supplierId: record.supplierId || '',
      supplierName: record.supplierName || '',
      purchaseDate: record.purchaseDate || '',
      quantity: record.quantity || 0,
      unit: record.unit || '粒',
      unitPrice: record.unitPrice || 0,
      pictures: record.pictures || [],
      remarks: record.remarks || '',
      status: record.status || 'sufficient'
    }
    // 如果有cropCode，加载作物信息
    if (record.cropCode) {
      searchCrops(record.cropCode).then(() => {
        const crop = cropOptions.value.find(c => c.cropCode === record.cropCode)
        if (crop) {
          selectedCrop.value = crop
        }
      })
    }
  }
}, { deep: true })

// 监听弹窗打开，加载供应商
watch(() => props.visible, (val) => {
  if (val) {
    loadSuppliers()
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  // 验证：选择"其他"时备注必填
  if (form.value.sourceType === 'other' && !form.value.remarks.trim()) {
    ElMessage.warning('选择"其他"种源类型时，备注为必填项，请输入详细说明')
    return
  }
  // 外部采购时供应商必填
  if (form.value.sourceOrigin === 'external_purchase' && !form.value.supplierId) {
    ElMessage.warning('请选择供应商')
    return
  }
  // 作物必填
  if (!form.value.cropCode) {
    ElMessage.warning('请选择作物')
    return
  }

  submitting.value = true
  try {
    // 计算总金额
    const totalAmount = (form.value.quantity || 0) * (form.value.unitPrice || 0)

    // 判断库存状态 - 使用 record.initialCount（原始数量）
    let status = props.record.status
    if (form.value.quantity === 0) {
      status = 'depleted'
    } else if (form.value.quantity < (props.record.initialCount || 0) * 0.2) {
      status = 'low'
    } else {
      status = 'sufficient'
    }

    await seedSourceStore.updateItem(props.record.id, {
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
      pictures: form.value.pictures,
      remarks: form.value.remarks,
      status
    })
    ElMessage.success('更新成功')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('更新失败')
  } finally {
    submitting.value = false
  }
}
</script>

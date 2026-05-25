<template>
  <!-- 批量编辑弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">批量编辑种源</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 提示信息 -->
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
          <p class="text-sm text-blue-800">
            已选择 <strong>{{ selectedRows.length }}</strong> 个种源进行批量编辑，已编辑 <strong>{{ editedCount }}</strong> 个
          </p>
        </div>

        <!-- 选择种源批号下拉 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">选择种源</label>
          <el-select
            v-model="currentRecordId"
            placeholder="请选择要编辑的种源"
            class="w-full"
            @change="handleRecordChange"
          >
            <el-option
              v-for="record in selectedRecordsList"
              :key="record.id"
              :label="`${record.seedCode} - ${record.cropName}`"
              :value="record.id"
            >
              <div class="py-1">
                <div class="text-sm font-medium">{{ record.seedCode }} - {{ record.cropName }}</div>
                <div class="text-xs text-gray-500">
                  {{ record.supplierName || '无供应商' }} |
                  数量: {{ record.quantity }}{{ record.unit }} |
                  <span :class="getStatusClass(record.status)">{{ getStatusText(record.status) }}</span>
                  <span v-if="batchEditedRecords[record.id]" class="text-emerald-600 ml-2">✅ 已编辑</span>
                </div>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 当前编辑记录信息 -->
        <div v-if="currentRecord" class="space-y-4">
          <el-divider content-position="left">编辑记录</el-divider>

          <el-form :model="currentForm" label-width="100px" ref="formRef">
            <!-- 种源批号 - 只读显示 -->
            <el-form-item label="种源批号">
              <el-input v-model="currentRecord.seedCode" disabled class="bg-gray-50 font-mono" />
            </el-form-item>

            <!-- 作物选择 - 可搜索的下拉选择 -->
            <el-form-item label="作物选择">
              <el-select
                v-model="currentForm.cropCode"
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
              <el-select v-model="currentForm.sourceType" placeholder="请选择" class="w-full">
                <el-option label="种子" value="seed" />
                <el-option label="种苗/实生苗" value="seedling" />
                <el-option label="扦插苗" value="cutting" />
                <el-option label="嫁接苗" value="grafting" />
                <el-option label="组培苗" value="tissue_culture" />
                <el-option label="分株苗" value="split" />
                <el-option label="种球/球根" value="bulb" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>

            <!-- 来源途径 -->
            <el-form-item label="来源途径">
              <el-select v-model="currentForm.sourceOrigin" placeholder="请选择" class="w-full">
                <el-option label="外部采购" value="external_purchase" />
                <el-option label="自产" value="self_produced" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>

            <!-- 供应商 -->
            <el-form-item label="供应商">
              <el-select
                v-model="currentForm.supplierId"
                placeholder="请选择"
                class="w-full"
                filterable
                @change="handleSupplierChange"
              >
                <el-option
                  v-for="item in suppliers"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <div class="py-1">
                    <div class="text-sm font-medium">{{ item.name }}</div>
                    <div class="text-xs text-gray-500">{{ item.code }} · {{ item.contact }} · {{ item.mobilePhone }}</div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <!-- 采购/入库日期 -->
            <el-form-item :label="currentForm.sourceOrigin === 'external_purchase' ? '采购日期' : '入库日期'">
              <el-date-picker
                v-model="currentForm.purchaseDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </el-form-item>

            <!-- 登记数量 -->
            <el-form-item label="登记数量">
              <div class="flex gap-2 w-full">
                <el-input-number v-model="currentForm.quantity" :min="0" class="flex-1" />
                <el-select v-model="currentForm.unit" placeholder="单位" class="w-32">
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
              <el-input-number v-model="currentForm.unitPrice" :min="0" :precision="2" class="w-full" />
            </el-form-item>

            <!-- 备注 -->
            <el-form-item label="备注">
              <el-input v-model="currentForm.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 无记录时 -->
        <div v-else class="text-center py-8 text-gray-500">
          请从上方选择一个种源进行编辑
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
        <div class="flex gap-3">
          <el-button @click="handleClose">取消</el-button>
        </div>
        <div class="flex gap-3">
          <el-button @click="handlePrev" :disabled="currentIndex <= 0">
            上一个
          </el-button>
          <el-button @click="handleNext" :disabled="currentIndex >= selectedRows.length - 1">
            {{ currentIndex < selectedRows.length - 1 ? '确认并下一个' : '已最后一条' }}
          </el-button>
          <el-button type="primary" @click="handleSaveAll" :loading="saving">
            保存全部 ({{ editedCount }} 个)
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { useSeedSourceStore } from '@/stores'
import { enhancedApiClient } from '@/lib/apiClient'

const props = defineProps({
  visible: Boolean,
  selectedRows: {
    type: Array,
    default: () => []
  },
  allRecords: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 状态
const saving = ref(false)
const currentIndex = ref(0)
const batchEditedRecords = ref({}) // 存储每条记录的编辑状态
const currentForm = ref({}) // 当前编辑的表单

// 作物选择相关
const cropOptions = ref([])
const selectedCrop = ref(null)
const cropLoading = ref(false)

// 供应商列表
const suppliers = ref([])

// 获取选中的记录列表
const selectedRecordsList = computed(() => {
  return props.allRecords.filter(r => props.selectedRows.includes(r.id))
})

// 当前选中的记录ID
const currentRecordId = computed({
  get: () => {
    if (selectedRecordsList.value.length === 0) return ''
    return selectedRecordsList.value[currentIndex.value]?.id || ''
  },
  set: (val) => {
    const idx = selectedRecordsList.value.findIndex(r => r.id === val)
    if (idx >= 0) {
      currentIndex.value = idx
    }
  }
})

// 当前编辑的记录
const currentRecord = computed(() => {
  if (selectedRecordsList.value.length === 0) return null
  return selectedRecordsList.value[currentIndex.value] || null
})

// 已编辑数量
const editedCount = computed(() => {
  return Object.keys(batchEditedRecords.value).length
})

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    sufficient: '充足',
    low: '偏低',
    depleted: '耗尽'
  }
  return map[status] || status
}

// 获取状态样式
const getStatusClass = (status) => {
  const map = {
    sufficient: 'text-emerald-600',
    low: 'text-amber-600',
    depleted: 'text-red-600'
  }
  return map[status] || ''
}

// 加载供应商
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
    currentForm.value.cropCategory = crop.categoryName
    currentForm.value.typeName = crop.typeName
    currentForm.value.varietyName = crop.varietyName
    currentForm.value.cropName = crop.subVariety1Name || crop.varietyName
    currentForm.value.cropVariety = crop.subVariety1Name || ''
  }
  // 标记为已编辑
  markAsEdited()
}

// 处理供应商变化
const handleSupplierChange = (supplierId) => {
  const supplier = suppliers.value.find(s => s.id === supplierId)
  if (supplier) {
    currentForm.value.supplierName = supplier.name
  }
  markAsEdited()
}

// 标记当前记录为已编辑
const markAsEdited = () => {
  if (currentRecord.value) {
    batchEditedRecords.value[currentRecord.value.id] = {
      ...currentForm.value
    }
  }
}

// 处理记录切换
const handleRecordChange = (recordId) => {
  const idx = selectedRecordsList.value.findIndex(r => r.id === recordId)
  if (idx >= 0) {
    currentIndex.value = idx
    loadCurrentRecordForm()
  }
}

// 加载当前记录的表单数据
const loadCurrentRecordForm = () => {
  if (!currentRecord.value) return

  const record = currentRecord.value
  const edited = batchEditedRecords.value[record.id]

  if (edited) {
    // 使用已编辑的数据
    currentForm.value = { ...edited }
    // 同时加载作物信息
    if (edited.cropCode) {
      searchCrops(edited.cropCode).then(() => {
        const crop = cropOptions.value.find(c => c.cropCode === edited.cropCode)
        if (crop) {
          selectedCrop.value = crop
        }
      })
    }
  } else {
    // 使用原始数据
    currentForm.value = {
      cropCode: record.cropCode || '',
      sourceType: record.sourceType || 'seed',
      sourceOrigin: record.sourceOrigin || 'external_purchase',
      supplierId: record.supplierId || '',
      supplierName: record.supplierName || '',
      purchaseDate: record.purchaseDate || '',
      quantity: record.quantity || 0,
      unit: record.unit || '袋',
      unitPrice: record.unitPrice || 0,
      remarks: record.remarks || ''
    }
    selectedCrop.value = null
  }
}

// 监听当前记录变化
watch(currentRecord, () => {
  loadCurrentRecordForm()
}, { immediate: true })

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val) {
    currentIndex.value = 0
    batchEditedRecords.value = {}
    loadSuppliers()
    loadCurrentRecordForm()
  }
})

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
}

// 上一个
const handlePrev = () => {
  if (currentIndex.value > 0) {
    // 保存当前编辑
    if (currentRecord.value) {
      batchEditedRecords.value[currentRecord.value.id] = { ...currentForm.value }
    }
    currentIndex.value--
    loadCurrentRecordForm()
  }
}

// 下一个
const handleNext = () => {
  // 保存当前编辑
  if (currentRecord.value) {
    batchEditedRecords.value[currentRecord.value.id] = { ...currentForm.value }
  }

  if (currentIndex.value < selectedRows.value.length - 1) {
    currentIndex.value++
    loadCurrentRecordForm()
  }
}

// 保存全部
const handleSaveAll = async () => {
  if (editedCount.value === 0) {
    ElMessage.warning('没有修改任何记录')
    return
  }

  saving.value = true
  try {
    const seedSourceStore = useSeedSourceStore()

    for (const [recordId, formData] of Object.entries(batchEditedRecords.value)) {
      const record = props.allRecords.find(r => r.id == recordId)
      if (!record) continue

      // 计算总金额
      const totalAmount = (formData.quantity || 0) * (formData.unitPrice || 0)

      // 判断库存状态
      let status = record.status
      if (formData.quantity === 0) {
        status = 'depleted'
      } else if (formData.quantity < (record.initialCount || 0) * 0.2) {
        status = 'low'
      } else {
        status = 'sufficient'
      }

      await seedSourceStore.updateItem(recordId, {
        sourceType: formData.sourceType,
        sourceOrigin: formData.sourceOrigin,
        supplierId: formData.supplierId,
        supplierName: formData.supplierName,
        purchaseDate: formData.purchaseDate,
        quantity: formData.quantity,
        unit: formData.unit,
        unitPrice: formData.unitPrice,
        totalAmount,
        remarks: formData.remarks,
        status,
        // 作物信息
        cropCode: formData.cropCode,
        cropCategory: formData.cropCategory,
        typeName: formData.typeName,
        varietyName: formData.varietyName,
        cropName: formData.cropName,
        cropVariety: formData.cropVariety
      })
    }

    ElMessage.success(`成功保存 ${editedCount.value} 个种源记录`)
    emit('success')
    handleClose()
  } catch (error) {
    console.error('批量保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>
